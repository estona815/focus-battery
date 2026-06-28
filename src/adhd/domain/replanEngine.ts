import { ACTIVITY_TYPE_META, canonicalizeActivityType } from "../constants";
import { Activity, DayEnergySummary, ReplanSuggestion, UserEnergySettings } from "../types";
import { buildRangeFromTimes, differenceInMinutes, getTimeLabel, round, toDateKey } from "../utils/dateTime";

function cloneActivity(activity: Activity, overrides: Partial<Activity>): Activity {
  return {
    ...activity,
    ...overrides,
    updatedAt: new Date().toISOString(),
  };
}

export function buildReplanSuggestions(
  summary: DayEnergySummary,
  settings: UserEnergySettings,
): ReplanSuggestion[] {
  const suggestions: ReplanSuggestion[] = [];
  const heavyActivities = summary.activities.filter(
    (entry) => entry.activity.cognitiveLoad + entry.activity.emotionalLoad + entry.activity.socialLoad >= 7,
  );
  const lowBatteryEntry = summary.activities.find((entry) => entry.endBatteryPct <= 35);

  if (lowBatteryEntry) {
    suggestions.push({
      id: `recover-before-${lowBatteryEntry.activity.id}`,
      kind: "insert-recovery",
      title: "30분 회복 시간을 먼저 넣기",
      description: `${ACTIVITY_TYPE_META[lowBatteryEntry.activity.type].label} 전에 숨 고를 시간을 먼저 확보해요.`,
      impact: "급격한 하강을 완만하게 만들 수 있어요.",
      activityIds: [lowBatteryEntry.activity.id],
    });
  }

  const splitCandidate = summary.activities.find(
    (entry) => {
      const canonicalType = canonicalizeActivityType(entry.activity.type);
      return (canonicalType === "focus_work" || canonicalType === "study") && entry.durationMinutes >= 80;
    },
  );
  if (splitCandidate) {
    suggestions.push({
      id: `split-${splitCandidate.activity.id}`,
      kind: "split-focus",
      title: "집중 작업을 25~45분 단위로 쪼개기",
      description: `${splitCandidate.activity.title} 사이에 짧은 휴식을 넣어 전환 비용을 줄여요.`,
      impact: "집중 유지 부담을 낮추고 회복 구간을 만들어요.",
      activityIds: [splitCandidate.activity.id],
    });
  }

  const quietBufferCandidate = summary.activities.find(
    (entry, index) => {
      const previous = index > 0 ? summary.activities[index - 1] : undefined;
      return (
        previous !== undefined &&
        (entry.gapBeforeMinutes ?? settings.defaultTransitionBuffer) < settings.defaultTransitionBuffer &&
        previous.activity.sensoryLoad >= 4 &&
        (["focus_work", "study"].includes(canonicalizeActivityType(entry.activity.type)))
      );
    },
  );
  if (quietBufferCandidate) {
    suggestions.push({
      id: `quiet-${quietBufferCandidate.activity.id}`,
      kind: "quiet-buffer",
      title: "조용한 버퍼 넣기",
      description: "감각 자극이 큰 일정 뒤에는 바로 몰입 작업을 붙이지 않는 편이 좋아요.",
      impact: "감각 전환 비용을 줄여요.",
      activityIds: [quietBufferCandidate.activity.id],
    });
  }

  const deferCandidate = heavyActivities.find(
    (entry) => entry.activity.isFlexible && entry.endBatteryPct <= 45,
  );
  if (deferCandidate) {
    suggestions.push({
      id: `defer-${deferCandidate.activity.id}`,
      kind: "defer-flex",
      title: "유연한 일정 하나 뒤로 보내기",
      description: `${deferCandidate.activity.title}는 덜 지친 시간대로 옮길 수 있어요.`,
      impact: "오늘 꼭 해야 하는 일만 남기기 쉬워져요.",
      activityIds: [deferCandidate.activity.id],
    });
  }

  const bufferCandidate = summary.activities.find(
    (entry) => entry.transitionCostPoints >= 3 && entry.activity.isFlexible,
  );
  if (bufferCandidate) {
    suggestions.push({
      id: `buffer-${bufferCandidate.activity.id}`,
      kind: "add-buffer",
      title: "다음 준비 시간 확보하기",
      description: `${bufferCandidate.activity.title} 앞의 준비 시간을 조금 더 늘려요.`,
      impact: "전환 비용을 줄이고 시작 문턱을 낮춰요.",
      activityIds: [bufferCandidate.activity.id],
    });
  }

  return suggestions.slice(0, 4);
}

export function applySuggestion(activities: Activity[], suggestion: ReplanSuggestion): Activity[] {
  switch (suggestion.kind) {
    case "insert-recovery": {
      const target = activities.find((activity) => activity.id === suggestion.activityIds[0]);
      if (!target) {
        return activities;
      }
      const startLabel = getTimeLabel(target.startAt);
      const startDate = new Date(target.startAt);
      const recoveryStart = new Date(startDate.getTime() - 30 * 60000);
      const recoveryDate = target.date;
      const recoveryRange = buildRangeFromTimes(
        recoveryDate,
        getTimeLabel(recoveryStart.toISOString()),
        startLabel,
      );
      const restActivity: Activity = {
        id: `recovery-${target.id}`,
        date: target.date,
        title: "회복 시간",
        type: "rest",
        ...ACTIVITY_TYPE_META.rest.defaultLoads,
        startAt: recoveryRange.startAt,
        endAt: recoveryRange.endAt,
        locationType: "home",
        isFlexible: false,
        isRequired: false,
        notes: "재정리 추천으로 추가됨",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return [...activities, restActivity].sort(
        (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
      );
    }
    case "split-focus": {
      const target = activities.find((activity) => activity.id === suggestion.activityIds[0]);
      if (!target) {
        return activities;
      }
      const duration = differenceInMinutes(target.startAt, target.endAt);
      const firstHalf = Math.floor(duration / 2);
      const secondHalf = duration - firstHalf - 15;
      if (secondHalf < 20) {
        return activities;
      }

      const start = new Date(target.startAt);
      const middleBreakStart = new Date(start.getTime() + firstHalf * 60000);
      const secondStart = new Date(middleBreakStart.getTime() + 15 * 60000);
      const firstEnd = middleBreakStart;
      const secondEnd = new Date(secondStart.getTime() + secondHalf * 60000);
      const now = new Date().toISOString();

      const first = cloneActivity(target, {
        id: `${target.id}-a`,
        title: `${target.title} 1차`,
        startAt: start.toISOString(),
        endAt: firstEnd.toISOString(),
      });
      const breakActivity: Activity = {
        id: `${target.id}-break`,
        date: target.date,
        title: "짧은 회복",
        type: "rest",
        ...ACTIVITY_TYPE_META.rest.defaultLoads,
        startAt: middleBreakStart.toISOString(),
        endAt: secondStart.toISOString(),
        locationType: target.locationType,
        isFlexible: false,
        isRequired: false,
        notes: "재정리 추천으로 추가됨",
        createdAt: now,
        updatedAt: now,
      };
      const second = cloneActivity(target, {
        id: `${target.id}-b`,
        title: `${target.title} 2차`,
        startAt: secondStart.toISOString(),
        endAt: secondEnd.toISOString(),
      });

      return activities
        .filter((activity) => activity.id !== target.id)
        .concat(first, breakActivity, second)
        .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime());
    }
    case "quiet-buffer":
    case "add-buffer": {
      const target = activities.find((activity) => activity.id === suggestion.activityIds[0]);
      if (!target) {
        return activities;
      }
      const shiftMinutes = suggestion.kind === "quiet-buffer" ? 15 : 10;
      const duration = differenceInMinutes(target.startAt, target.endAt);
      const shiftedStart = new Date(new Date(target.startAt).getTime() + shiftMinutes * 60000);
      const shiftedEnd = new Date(shiftedStart.getTime() + duration * 60000);
      return activities.map((activity) =>
        activity.id === target.id
          ? cloneActivity(activity, {
              startAt: shiftedStart.toISOString(),
              endAt: shiftedEnd.toISOString(),
            })
          : activity,
      );
    }
    case "defer-flex": {
      const target = activities.find((activity) => activity.id === suggestion.activityIds[0]);
      if (!target) {
        return activities;
      }
      const duration = differenceInMinutes(target.startAt, target.endAt);
      const tomorrow = new Date(target.startAt);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const deferredEnd = new Date(tomorrow.getTime() + duration * 60000);
      return activities.map((activity) =>
        activity.id === target.id
          ? cloneActivity(activity, {
              date: toDateKey(tomorrow),
              startAt: tomorrow.toISOString(),
              endAt: deferredEnd.toISOString(),
            })
          : activity,
      );
    }
    case "protect-one": {
      return activities.map((activity, index) =>
        index > 0 && activity.isFlexible
          ? cloneActivity(activity, {
              isRequired: false,
              notes: `${activity.notes}\n오늘은 보류 추천`,
            })
          : activity,
      );
    }
  }
}

export function describeSuggestionPreview(summary: DayEnergySummary, suggestion: ReplanSuggestion): string {
  const target = summary.activities.find((entry) => entry.activity.id === suggestion.activityIds[0]);
  if (!target) {
    return suggestion.impact;
  }

  return `${target.activity.title} 전후 흐름을 부드럽게 만들어 ${round(Math.abs(target.netDeltaPct), 1)}% 급락을 완화하는 쪽을 노려요.`;
}
