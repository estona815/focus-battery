import {
  ActivityType,
  BatteryState,
  CalibrationFeedback,
  CanonicalActivityType,
  EnergyWindow,
  LegacyActivityType,
  LoadField,
  NotificationStyle,
  QuickCheckInState,
} from "./types";

export const CANONICAL_ACTIVITY_TYPE_ORDER: CanonicalActivityType[] = [
  "focus_work",
  "study",
  "meeting",
  "conversation",
  "commute",
  "chores",
  "exercise",
  "admin",
  "emotional_task",
  "meal",
  "rest",
  "sleep",
  "hobby",
  "recovery_walk",
  "custom",
];

export const LEGACY_ACTIVITY_TYPE_MAP: Record<LegacyActivityType, CanonicalActivityType> = {
  focus: "focus_work",
  chore: "chores",
  emotional: "emotional_task",
};

export const ACTIVITY_TYPE_ORDER: CanonicalActivityType[] = [...CANONICAL_ACTIVITY_TYPE_ORDER];

export const LOAD_FIELDS: LoadField[] = [
  "cognitiveLoad",
  "physicalLoad",
  "socialLoad",
  "sensoryLoad",
  "emotionalLoad",
  "urgencyLoad",
];

export const LOAD_LABELS: Record<LoadField, string> = {
  cognitiveLoad: "인지 부담",
  physicalLoad: "신체 부담",
  socialLoad: "사회적 부담",
  sensoryLoad: "감각 자극",
  emotionalLoad: "감정 소모",
  urgencyLoad: "마감 압박",
};

export const ENERGY_WINDOW_LABELS: Record<EnergyWindow, string> = {
  morning: "아침",
  afternoon: "오후",
  evening: "저녁",
  night: "밤",
  varies: "가변",
};

export const NOTIFICATION_STYLE_LABELS: Record<NotificationStyle, string> = {
  silent: "아주 조용히",
  gentle: "부드럽게",
  active: "또렷하게",
  minimal: "짧게 톡",
  quiet: "조용히",
};

export const BATTERY_STATE_LABELS: Record<BatteryState, string> = {
  plenty: "여유 있음",
  steady: "안정적",
  care: "관리 필요",
  caution: "과부하 주의",
  recover: "회복 우선",
};

export const BATTERY_STATE_COPY: Record<BatteryState, string> = {
  plenty: "지금은 중요한 일 하나를 밀어도 괜찮아요.",
  steady: "리듬을 유지하면 무난하게 흘러갈 수 있어요.",
  care: "중간중간 숨 고를 시간을 먼저 챙겨두면 좋아요.",
  caution: "다음 일정보다 회복 여지를 먼저 잡아보는 편이 좋아요.",
  recover: "지금은 많이 하기보다 하나만 남기고 가볍게 가도 괜찮아요.",
};

export const QUICK_CHECK_IN_LABELS: Record<QuickCheckInState, string> = {
  steady: "버틸 만함",
  heavy: "살짝 눌림",
  drained: "많이 빠짐",
  recovering: "다시 올라오는 중",
};

export const QUICK_CHECK_IN_HINTS: Record<QuickCheckInState, string> = {
  steady: "지금 결은 아직 이어갈 만해요.",
  heavy: "다음 전환 전에 숨 고르기가 있으면 좋아요.",
  drained: "지금은 회복 먼저가 더 안전할 수 있어요.",
  recovering: "조금씩 올라오고 있으니 무리만 덜어두면 돼요.",
};

type ActivityMeta = {
  label: string;
  baseDrainRatePerMinute: number;
  recoveryRatePerMinute: number;
  defaultLoads: Record<LoadField, number>;
  detailHint: string;
};

const CANONICAL_ACTIVITY_META: Record<CanonicalActivityType, ActivityMeta> = {
  focus_work: {
    label: "집중 작업",
    baseDrainRatePerMinute: 0.12,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 4,
      physicalLoad: 1,
      socialLoad: 0,
      sensoryLoad: 1,
      emotionalLoad: 1,
      urgencyLoad: 2,
    },
    detailHint: "깊게 몰입하는 작업은 길어질수록 소모가 커져요.",
  },
  study: {
    label: "공부",
    baseDrainRatePerMinute: 0.1,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 3,
      physicalLoad: 0,
      socialLoad: 0,
      sensoryLoad: 1,
      emotionalLoad: 1,
      urgencyLoad: 1,
    },
    detailHint: "짧게 끊어가면 체력 하강을 덜 가파르게 만들 수 있어요.",
  },
  meeting: {
    label: "회의",
    baseDrainRatePerMinute: 0.11,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 2,
      physicalLoad: 0,
      socialLoad: 4,
      sensoryLoad: 3,
      emotionalLoad: 2,
      urgencyLoad: 2,
    },
    detailHint: "사회적 부담과 감각 자극이 함께 높아지기 쉬워요.",
  },
  conversation: {
    label: "대화/면담",
    baseDrainRatePerMinute: 0.09,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 1,
      physicalLoad: 0,
      socialLoad: 3,
      sensoryLoad: 2,
      emotionalLoad: 1,
      urgencyLoad: 1,
    },
    detailHint: "대화가 길수록 사회적/감정 소모가 누적될 수 있어요.",
  },
  commute: {
    label: "이동",
    baseDrainRatePerMinute: 0.09,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 1,
      physicalLoad: 3,
      socialLoad: 1,
      sensoryLoad: 3,
      emotionalLoad: 1,
      urgencyLoad: 1,
    },
    detailHint: "이동은 전환 비용과 감각 자극이 함께 붙기 쉬워요.",
  },
  chores: {
    label: "집안일",
    baseDrainRatePerMinute: 0.08,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 1,
      physicalLoad: 2,
      socialLoad: 1,
      sensoryLoad: 2,
      emotionalLoad: 1,
      urgencyLoad: 1,
    },
    detailHint: "짧아 보여도 전환 비용이 누적될 수 있어요.",
  },
  exercise: {
    label: "운동",
    baseDrainRatePerMinute: 0.09,
    recoveryRatePerMinute: 0.012,
    defaultLoads: {
      cognitiveLoad: 1,
      physicalLoad: 4,
      socialLoad: 0,
      sensoryLoad: 1,
      emotionalLoad: 0,
      urgencyLoad: 1,
    },
    detailHint: "피곤할 수 있지만 이후 회복에 도움을 줄 때도 있어요.",
  },
  admin: {
    label: "행정/잡무",
    baseDrainRatePerMinute: 0.095,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 3,
      physicalLoad: 1,
      socialLoad: 1,
      sensoryLoad: 1,
      emotionalLoad: 2,
      urgencyLoad: 2,
    },
    detailHint: "작아 보여도 전환과 인지 부담이 크게 느껴질 수 있어요.",
  },
  emotional_task: {
    label: "감정 소모 큰 일",
    baseDrainRatePerMinute: 0.11,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 2,
      physicalLoad: 1,
      socialLoad: 2,
      sensoryLoad: 2,
      emotionalLoad: 4,
      urgencyLoad: 3,
    },
    detailHint: "감정 소모가 높을수록 회복 버퍼를 더 넉넉히 잡는 편이 좋아요.",
  },
  meal: {
    label: "식사",
    baseDrainRatePerMinute: 0.015,
    recoveryRatePerMinute: 0.04,
    defaultLoads: {
      cognitiveLoad: 0,
      physicalLoad: 0,
      socialLoad: 0,
      sensoryLoad: 0,
      emotionalLoad: 0,
      urgencyLoad: 0,
    },
    detailHint: "가벼운 유지 또는 약한 회복으로 계산돼요.",
  },
  rest: {
    label: "휴식",
    baseDrainRatePerMinute: 0.01,
    recoveryRatePerMinute: 0.09,
    defaultLoads: {
      cognitiveLoad: 0,
      physicalLoad: 0,
      socialLoad: 0,
      sensoryLoad: 0,
      emotionalLoad: 0,
      urgencyLoad: 0,
    },
    detailHint: "방해가 적을수록 회복이 잘 쌓여요.",
  },
  sleep: {
    label: "수면",
    baseDrainRatePerMinute: 0,
    recoveryRatePerMinute: 0.12,
    defaultLoads: {
      cognitiveLoad: 0,
      physicalLoad: 0,
      socialLoad: 0,
      sensoryLoad: 0,
      emotionalLoad: 0,
      urgencyLoad: 0,
    },
    detailHint: "가장 큰 회복 이벤트지만 무한히 채워지진 않아요.",
  },
  hobby: {
    label: "취미",
    baseDrainRatePerMinute: 0.03,
    recoveryRatePerMinute: 0.03,
    defaultLoads: {
      cognitiveLoad: 1,
      physicalLoad: 1,
      socialLoad: 0,
      sensoryLoad: 1,
      emotionalLoad: 0,
      urgencyLoad: 0,
    },
    detailHint: "조용한 취미는 완만한 회복으로 작동할 수 있어요.",
  },
  recovery_walk: {
    label: "회복 산책",
    baseDrainRatePerMinute: 0.03,
    recoveryRatePerMinute: 0.045,
    defaultLoads: {
      cognitiveLoad: 1,
      physicalLoad: 2,
      socialLoad: 0,
      sensoryLoad: 2,
      emotionalLoad: 0,
      urgencyLoad: 0,
    },
    detailHint: "몸이 풀리는 정도와 회복 시작점을 만들기 좋아요.",
  },
  custom: {
    label: "직접 입력",
    baseDrainRatePerMinute: 0.08,
    recoveryRatePerMinute: 0,
    defaultLoads: {
      cognitiveLoad: 2,
      physicalLoad: 1,
      socialLoad: 1,
      sensoryLoad: 1,
      emotionalLoad: 1,
      urgencyLoad: 1,
    },
    detailHint: "개인적인 활동은 기본값을 출발점으로 조정해보세요.",
  },
};

export const ACTIVITY_TYPE_META: Record<ActivityType, ActivityMeta> = {
  ...CANONICAL_ACTIVITY_META,
  focus: CANONICAL_ACTIVITY_META.focus_work,
  chore: CANONICAL_ACTIVITY_META.chores,
  emotional: CANONICAL_ACTIVITY_META.emotional_task,
};

export const ACTIVITY_TYPE_LABELS = {
  focus_work: "집중 작업",
  study: "공부",
  meeting: "회의",
  conversation: "대화/면담",
  commute: "이동",
  chores: "집안일",
  exercise: "운동",
  admin: "행정/잡무",
  emotional_task: "감정 소모 큰 일",
  meal: "식사",
  rest: "휴식",
  sleep: "수면",
  hobby: "취미",
  recovery_walk: "회복 산책",
  custom: "직접 입력",
  focus: "집중 작업",
  chore: "집안일",
  emotional: "감정 소모 큰 일",
};

export const ACTIVITY_FEEDBACK_FACTORS: Record<CalibrationFeedback | "same", number> = {
  much_harder: 1.22,
  harder: 1.12,
  accurate: 1,
  easier: 0.9,
  recovered: 0.78,
  same: 1,
};

export const QUICK_MESSAGE_BY_TAB = {
  today: "지금 상태를 먼저 보고 다음 한 걸음을 고를 수 있어요.",
  timeline: "오늘 흐름과 전환 구간을 함께 확인해요.",
  insights: "최근 48시간 안에서 읽은 패턴을 부드럽게 돌아봐요.",
  settings: "무엇을 배우고 어떻게 지우는지 투명하게 조절해요.",
} as const;

export function canonicalizeActivityType(type: ActivityType): CanonicalActivityType {
  return LEGACY_ACTIVITY_TYPE_MAP[type as LegacyActivityType] ?? type;
}
