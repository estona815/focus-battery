import { ActivityType, RoughActivitySuggestion } from "../types";

type WindowKey = "morning" | "afternoon" | "evening";

const WINDOW_SLOTS: Record<WindowKey, Array<{ startTime: string; endTime: string }>> = {
  morning: [
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:20", endTime: "11:20" },
    { startTime: "11:30", endTime: "12:10" },
  ],
  afternoon: [
    { startTime: "13:00", endTime: "14:00" },
    { startTime: "14:20", endTime: "15:10" },
    { startTime: "15:30", endTime: "16:20" },
  ],
  evening: [
    { startTime: "18:20", endTime: "19:10" },
    { startTime: "19:30", endTime: "20:20" },
    { startTime: "20:40", endTime: "21:30" },
  ],
};

const TYPE_KEYWORDS: Array<{ keywords: string[]; type: ActivityType; title: string; note: string }> = [
  {
    keywords: ["회의", "미팅", "meeting"],
    type: "meeting",
    title: "회의",
    note: "회의/대화 구간으로 읽었어요. 전환 버퍼가 필요할 수 있어요.",
  },
  {
    keywords: ["통화", "대화", "면담", "상담"],
    type: "conversation",
    title: "대화",
    note: "사람을 만나는 구간으로 읽었어요.",
  },
  {
    keywords: ["집중", "작업", "일", "업무"],
    type: "focus_work",
    title: "집중 작업",
    note: "집중이 필요한 블록으로 읽었어요.",
  },
  {
    keywords: ["공부", "학습"],
    type: "study",
    title: "공부",
    note: "집중 공부 블록으로 읽었어요.",
  },
  {
    keywords: ["이동", "출근", "등원", "외출"],
    type: "commute",
    title: "이동",
    note: "이동은 전환 비용이 붙기 쉬워요.",
  },
  {
    keywords: ["휴식", "쉬", "멍", "회복", "숨 고르기"],
    type: "rest",
    title: "회복 시간",
    note: "회복 후보 구간으로 읽었어요.",
  },
  {
    keywords: ["점심", "식사", "저녁 먹", "아침 먹"],
    type: "meal",
    title: "식사",
    note: "식사/멈춤 구간으로 읽었어요.",
  },
  {
    keywords: ["산책", "걷"],
    type: "recovery_walk",
    title: "회복 산책",
    note: "가벼운 회복 산책 후보로 읽었어요.",
  },
  {
    keywords: ["운동", "헬스", "러닝"],
    type: "exercise",
    title: "운동",
    note: "운동 블록으로 읽었어요.",
  },
  {
    keywords: ["정리", "행정", "서류", "답장", "메일"],
    type: "admin",
    title: "행정/정리",
    note: "작지만 인지 부담이 붙는 정리성 작업으로 읽었어요.",
  },
  {
    keywords: ["집안일", "청소", "빨래", "설거지"],
    type: "chores",
    title: "집안일",
    note: "가벼운 집안일 블록으로 읽었어요.",
  },
];

function detectWindow(text: string): WindowKey | undefined {
  if (/(아침|오전)/.test(text)) {
    return "morning";
  }
  if (/(점심|오후|낮)/.test(text)) {
    return "afternoon";
  }
  if (/(저녁|밤|야간)/.test(text)) {
    return "evening";
  }
  return undefined;
}

function detectCount(text: string) {
  if (/(두|2)\s*개/.test(text)) {
    return 2;
  }
  if (/(세|3)\s*개/.test(text)) {
    return 3;
  }
  return 1;
}

function inferActivity(text: string) {
  return TYPE_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase())),
  );
}

function buildTitle(baseTitle: string, count: number, index: number) {
  if (count <= 1) {
    return baseTitle;
  }

  return `${baseTitle} ${index + 1}`;
}

function nextSlot(window: WindowKey, usedCount: number, type: ActivityType) {
  if (type === "meal" && window === "afternoon") {
    return { startTime: "12:20", endTime: "13:00" };
  }
  if (type === "meal" && window === "evening") {
    return { startTime: "18:00", endTime: "18:40" };
  }

  const slots = WINDOW_SLOTS[window];
  const resolvedSlot = slots[Math.min(usedCount, slots.length - 1)] ?? slots[slots.length - 1];
  return resolvedSlot ?? { startTime: "13:00", endTime: "14:00" };
}

export function buildRoughActivitySuggestions(input: string): RoughActivitySuggestion[] {
  const text = input.trim();
  if (!text) {
    return [];
  }

  const segments = text
    .split(/\n|,|\.|그리고|\/|;/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const suggestions: RoughActivitySuggestion[] = [];
  const usedSlots: Record<WindowKey, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  let currentWindow: WindowKey = "morning";

  segments.forEach((segment) => {
    const detectedWindow = detectWindow(segment);
    if (detectedWindow) {
      currentWindow = detectedWindow;
    }

    const inferred = inferActivity(segment);
    if (!inferred) {
      return;
    }

    const count = detectCount(segment);
    for (let index = 0; index < count; index += 1) {
      const slot = nextSlot(currentWindow, usedSlots[currentWindow], inferred.type);
      usedSlots[currentWindow] += 1;
      suggestions.push({
        title: buildTitle(inferred.title, count, index),
        type: inferred.type,
        startTime: slot.startTime,
        endTime: slot.endTime,
        note: inferred.note,
      });
    }
  });

  if (suggestions.length > 0) {
    return suggestions.slice(0, 6);
  }

  const fallbackWindow = detectWindow(text) ?? "afternoon";
  const slot = nextSlot(fallbackWindow, 0, "custom");
  return [
    {
      title: "직접 입력 블록",
      type: "custom",
      startTime: slot.startTime,
      endTime: slot.endTime,
      note: "아직 정확히 읽히는 키워드가 적어서 직접 입력 블록으로 먼저 만들었어요.",
    },
  ];
}
