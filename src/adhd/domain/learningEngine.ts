import { ACTIVITY_TYPE_META } from "../constants";
import {
  ActivityType,
  DayEnergySummary,
  EnergyWindow,
  LearningReport,
  QuickCheckIn,
} from "../types";
import { clamp, getWindowFromIso, round } from "../utils/dateTime";

type WindowStat = {
  endBatteryValues: number[];
  drainSignals: number[];
  recoverySignals: number[];
  stabilitySignals: number[];
  bufferStressCount: number;
};

const WINDOW_ORDER: EnergyWindow[] = ["morning", "afternoon", "evening"];

function createWindowStat(): WindowStat {
  return {
    endBatteryValues: [],
    drainSignals: [],
    recoverySignals: [],
    stabilitySignals: [],
    bufferStressCount: 0,
  };
}

function average(values: number[], fallback: number) {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildTypeRanking(
  summaries: DayEnergySummary[],
  selector: (entry: DayEnergySummary["activities"][number]) => number,
) {
  const rows = new Map<ActivityType, number[]>();

  summaries.forEach((summary) => {
    summary.activities.forEach((entry) => {
      const values = rows.get(entry.activity.type) ?? [];
      values.push(selector(entry));
      rows.set(entry.activity.type, values);
    });
  });

  return [...rows.entries()]
    .map(([type, values]) => ({
      type,
      average: round(average(values, 0), 1),
    }))
    .sort((left, right) => right.average - left.average)
    .map((row) => row.type);
}

export function buildLearningReport({
  summaries,
  quickCheckIns,
}: {
  summaries: DayEnergySummary[];
  quickCheckIns: QuickCheckIn[];
}): LearningReport {
  const recentSummaries = summaries.slice(0, 2);
  const activityDays = recentSummaries.filter((summary) => summary.activities.length > 0).length;
  const recentActivities = recentSummaries.flatMap((summary) => summary.activities);
  const recentCheckIns = quickCheckIns.slice(0, 6);

  const confidencePct = clamp(
    Math.round(
      18 +
        activityDays * 20 +
        Math.min(recentActivities.length, 8) * 4 +
        Math.min(recentCheckIns.length, 4) * 9,
    ),
    18,
    96,
  );

  const state =
    confidencePct >= 72 ? "ready" : confidencePct >= 44 ? "learning" : "starting";

  const windows = new Map<EnergyWindow, WindowStat>();
  WINDOW_ORDER.forEach((window) => windows.set(window, createWindowStat()));

  recentActivities.forEach((entry) => {
    const window = getWindowFromIso(entry.activity.startAt) as EnergyWindow;
    const stat = windows.get(window) ?? createWindowStat();
    stat.endBatteryValues.push(entry.endBatteryPct);
    stat.drainSignals.push(Math.max(0, -entry.netDeltaPct) + entry.transitionCostPoints * 1.5);
    stat.recoverySignals.push(entry.recoveryPoints * 1.6 + Math.max(0, entry.netDeltaPct));
    stat.stabilitySignals.push(entry.startBatteryPct);
    if (entry.transitionCostPoints >= 3) {
      stat.bufferStressCount += 1;
    }
    windows.set(window, stat);
  });

  recentCheckIns.forEach((checkIn) => {
    const window = getWindowFromIso(checkIn.createdAt) as EnergyWindow;
    const stat = windows.get(window) ?? createWindowStat();
    if (checkIn.state === "steady") {
      stat.stabilitySignals.push(74);
    }
    if (checkIn.state === "heavy") {
      stat.drainSignals.push(11);
      stat.bufferStressCount += 1;
    }
    if (checkIn.state === "drained") {
      stat.drainSignals.push(18);
      stat.bufferStressCount += 2;
    }
    if (checkIn.state === "recovering") {
      stat.recoverySignals.push(18);
      stat.stabilitySignals.push(64);
    }
    windows.set(window, stat);
  });

  const dipWindow =
    [...windows.entries()]
      .map(([window, stat]) => ({
        window,
        score:
          average(stat.endBatteryValues, 64) -
          average(stat.drainSignals, 0) -
          stat.bufferStressCount * 4,
      }))
      .sort((left, right) => left.score - right.score)[0]?.window ?? "afternoon";

  const protectWindow =
    [...windows.entries()]
      .map(([window, stat]) => ({
        window,
        score: average(stat.stabilitySignals, 60) + average(stat.endBatteryValues, 60) * 0.45,
      }))
      .sort((left, right) => right.score - left.score)[0]?.window ?? "morning";

  const recoveryWindow =
    [...windows.entries()]
      .map(([window, stat]) => ({
        window,
        score: average(stat.recoverySignals, 0),
      }))
      .sort((left, right) => right.score - left.score)[0]?.window ?? "evening";

  const overloadedTypes = buildTypeRanking(recentSummaries, (entry) =>
    Math.max(0, -entry.netDeltaPct),
  ).slice(0, 2);

  const helpfulTypes = buildTypeRanking(recentSummaries, (entry) =>
    entry.recoveryPoints + Math.max(0, entry.netDeltaPct),
  ).slice(0, 2);

  const dipBufferStress = windows.get(dipWindow)?.bufferStressCount ?? 0;
  const overloadedLabel = overloadedTypes[0]
    ? ACTIVITY_TYPE_META[overloadedTypes[0]].label
    : "집중 작업";
  const helpfulLabel = helpfulTypes[0]
    ? ACTIVITY_TYPE_META[helpfulTypes[0]].label
    : "회복 블록";

  let topPatternTitle = "아직 배우는 중이에요";
  let topPatternBody =
    "일정 하나나 체크인 한 번만 있어도 흐름을 읽기 시작해요. 지금은 거칠게 남겨도 충분해요.";

  if (state !== "starting" && dipBufferStress >= 2) {
    topPatternTitle = "전환 직후가 더 무거워져요";
    topPatternBody =
      "양 자체보다 일정 사이 전환 시간이 짧을 때 급락 폭이 더 커지는 흐름이 보여요. 버퍼부터 챙기는 편이 좋아요.";
  } else if (state !== "starting" && dipWindow === "afternoon") {
    topPatternTitle = "오후 초반 급락이 보여요";
    topPatternBody =
      "최근 48시간 기준으로 점심 뒤나 오후 초반에 배터리가 빨리 내려가는 패턴이 있어요. 중요한 일은 오전 쪽이 더 편할 수 있어요.";
  } else if (state !== "starting") {
    topPatternTitle = `${overloadedLabel} 뒤에는 회복이 필요해요`;
    topPatternBody =
      `최근 입력에서는 ${overloadedLabel} 뒤에 바로 다음 일을 붙일 때 더 무거워지는 흐름이 보여요. 작은 회복 블록을 먼저 넣어보는 편이 좋아요.`;
  }

  let protectTitle = "오늘은 한 구간만 먼저 적어도 괜찮아요";
  let protectBody =
    "오전, 오후, 저녁 중 하나만 적어도 배터리 흐름을 시작할 수 있어요. 완벽한 시간표는 나중에도 늦지 않아요.";

  if (state === "learning") {
    protectTitle = `${protectWindow === "morning" ? "오전" : protectWindow === "afternoon" ? "오후" : "저녁"} 구간 하나를 먼저 보호해봐요`;
    protectBody =
      "최근 흐름상 이 시간대가 비교적 버티기 쉬웠어요. 중요한 일정은 이 구간에 먼저 모아보는 편이 부드러울 수 있어요.";
  } else if (state === "ready") {
    protectTitle = `${protectWindow === "morning" ? "오전" : protectWindow === "afternoon" ? "오후" : "저녁"}이 비교적 안정적이에요`;
    protectBody =
      "최근 48시간에서는 이 시간대가 덜 가파르게 내려갔어요. 오늘 지킬 한 가지는 여기에 놓아두는 편이 좋아 보여요.";
  }

  let suggestedRecoveryTitle = `${helpfulLabel} 쪽이 회복 신호로 잡히고 있어요`;
  let suggestedRecoveryBody =
    "짧은 회복이더라도 반복되면 내일 추천이 더 정확해져요. 길지 않아도 괜찮아요.";

  if (state !== "starting") {
    suggestedRecoveryTitle = `${recoveryWindow === "morning" ? "오전" : recoveryWindow === "afternoon" ? "오후" : "저녁"} 회복이 잘 붙고 있어요`;
    suggestedRecoveryBody =
      `${helpfulLabel} 같은 회복 블록이나 조용한 숨 고르기가 이 시간대에 회복 흐름으로 잡혔어요. 오늘도 같은 위치에 넣어보면 도움이 될 수 있어요.`;
  }

  const checkInPrompt =
    recentCheckIns.length === 0
      ? "점심 뒤 10초 체크인 한 번만 있어도 내일 추천이 훨씬 빨라져요."
      : recentCheckIns.length < 3
        ? "한두 번만 더 남기면 급락 시간대를 더 정확하게 잡을 수 있어요."
        : "지금 정도의 체크인이면 최근 48시간 패턴을 꽤 읽을 수 있어요.";

  return {
    state,
    confidencePct,
    activityDays,
    quickCheckInCount: recentCheckIns.length,
    dipWindow,
    protectWindow,
    recoveryWindow,
    topPatternTitle,
    topPatternBody,
    protectTitle,
    protectBody,
    suggestedRecoveryTitle,
    suggestedRecoveryBody,
    overloadedTypes,
    helpfulTypes,
    checkInPrompt,
  };
}
