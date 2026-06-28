import { DayEnergySummary, WeeklyInsight } from "../types";
import { round } from "../utils/dateTime";

export function buildWeeklyInsight(summaries: DayEnergySummary[]): WeeklyInsight {
  const relevant = summaries.filter((summary) => summary.activities.length > 0);
  const drainsByType = new Map<string, number[]>();
  const windowAverages = new Map<string, number[]>();
  let recoveryHits = 0;
  let recoveryCount = 0;
  let bufferStressCount = 0;

  relevant.forEach((summary) => {
    summary.activities.forEach((entry) => {
      const netDrain = Math.max(0, -entry.netDeltaPct);
      const current = drainsByType.get(entry.activity.type) ?? [];
      current.push(netDrain);
      drainsByType.set(entry.activity.type, current);

      const hour = new Date(entry.activity.startAt).getHours();
      const window = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
      const windowValues = windowAverages.get(window) ?? [];
      windowValues.push(entry.endBatteryPct);
      windowAverages.set(window, windowValues);

      if (entry.recoveryPoints > 0) {
        recoveryCount += 1;
        if (entry.recoveryPoints >= entry.drainPoints * 0.3) {
          recoveryHits += 1;
        }
      }

      if (entry.transitionCostPoints >= 3) {
        bufferStressCount += 1;
      }
    });
  });

  const drainRows = [...drainsByType.entries()]
    .map(([type, values]) => ({
      type,
      average: round(values.reduce((sum, value) => sum + value, 0) / values.length, 1),
    }))
    .sort((left, right) => right.average - left.average);

  const windowRows = ["morning", "afternoon", "evening"].map((window) => {
    const values = windowAverages.get(window) ?? [60];
    return {
      window,
      averageEndBattery: round(values.reduce((sum, value) => sum + value, 0) / values.length, 1),
    };
  });

  const strongestWindow =
    [...windowRows].sort((left, right) => right.averageEndBattery - left.averageEndBattery)[0]
      ?.window ?? "afternoon";
  const averageEndBattery =
    relevant.length > 0
      ? round(
          relevant.reduce((sum, summary) => sum + summary.currentBatteryPct, 0) / relevant.length,
          1,
        )
      : 62;

  const mostDrainingType = drainRows[0]?.type;
  const recoveryWinRate = recoveryCount > 0 ? round((recoveryHits / recoveryCount) * 100, 1) : 0;

  let note = "이번 주는 일정 사이 숨 고를 여지를 조금만 더 잡아도 훨씬 편해질 수 있어요.";
  if (averageEndBattery >= 65) {
    note = "전체적으로 리듬이 안정적인 편이에요. 강한 일정은 잘 버티는 시간대로 모아도 괜찮아요.";
  } else if (bufferStressCount >= 4) {
    note = "과한 양보다 빠른 전환이 더 지치게 만들고 있어요. 버퍼를 먼저 확보해봐요.";
  }

  return {
    strongestWindow: strongestWindow as WeeklyInsight["strongestWindow"],
    mostDrainingType: mostDrainingType as WeeklyInsight["mostDrainingType"],
    recoveryWinRate,
    bufferStressCount,
    averageEndBattery,
    note,
    drainsByType: drainRows as WeeklyInsight["drainsByType"],
    windowAverages: windowRows as WeeklyInsight["windowAverages"],
  };
}
