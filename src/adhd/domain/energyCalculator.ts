import {
  ACTIVITY_TYPE_META,
  ACTIVITY_FEEDBACK_FACTORS,
  BATTERY_STATE_COPY,
  canonicalizeActivityType,
} from "../constants";
import {
  Activity,
  ActivityType,
  BatteryState,
  CalibrationEvent,
  ComputedActivity,
  DailyProfile,
  DayEnergySummary,
  EnergySnapshot,
  OnboardingProfile,
  UserEnergySettings,
} from "../types";
import {
  clamp,
  differenceInMinutes,
  formatDurationMinutes,
  getWindowFromIso,
  round,
  sortByStartAt,
} from "../utils/dateTime";

function getDefaultProfile(date: string): DailyProfile {
  return {
    date,
    sleepHours: 7,
    sleepQuality: 3,
    morningEnergy: 3,
    stressLevel: 3,
    carryoverFatigue: 2,
    baselineCapacity: 100,
    notes: "",
  };
}

export function calculateDailyCapacity(profile: DailyProfile, _settings?: UserEnergySettings): number {
  return clamp(
    profile.baselineCapacity +
      (profile.sleepHours - 7) * 4 +
      (profile.sleepQuality - 3) * 3 +
      (profile.morningEnergy - 3) * 5 -
      (profile.stressLevel - 3) * 4 -
      (profile.carryoverFatigue - 3) * 5,
    60,
      115,
  );
}

export function clampBattery(value: number) {
  return clamp(value, 0, 100);
}

function buildPersonalizationMap(calibrationEvents: CalibrationEvent[]) {
  const byType = new Map<ActivityType, number>();

  calibrationEvents.forEach((event) => {
    const ratio = clamp(event.userReportedCost / Math.max(1, event.predictedCost), 0.5, 1.8);
    const prev = byType.get(event.activityType) ?? 1;
    const next = prev * 0.65 + ratio * 0.35;
    byType.set(event.activityType, clamp(next, 0.5, 1.8));
  });

  return byType;
}

function getWindowFromProfile(profile: OnboardingProfile) {
  return profile.usualEnergyPeak ?? profile.peakWindow ?? "morning";
}

function isDemandingActivity(activity: Activity) {
  const canonicalType = canonicalizeActivityType(activity.type);
  return (
    canonicalType === "focus_work" ||
    canonicalType === "study" ||
    canonicalType === "admin" ||
    canonicalType === "meeting" ||
    canonicalType === "conversation"
  );
}

function getPeakWindowMultiplier(activity: Activity, onboardingProfile: OnboardingProfile): number {
  const activityWindow = getWindowFromIso(activity.startAt);
  const demanding = isDemandingActivity(activity);
  const preferredWindow = getWindowFromProfile(onboardingProfile);

  if (!demanding) {
    return 1;
  }

  if (activityWindow === preferredWindow) {
    return 0.94;
  }

  if (
    (preferredWindow === "morning" && activityWindow === "evening") ||
    (preferredWindow === "evening" && activityWindow === "morning")
  ) {
    return 1.08;
  }

  return 1.03;
}

function getIntensityMultiplier(activity: Activity, settings: UserEnergySettings): number {
  return (
    1 +
    activity.cognitiveLoad * 0.1 * settings.cognitiveSensitivity +
    activity.physicalLoad * 0.08 * settings.physicalSensitivity +
    activity.socialLoad * 0.09 * settings.socialSensitivity +
    activity.sensoryLoad * 0.09 * settings.sensorySensitivity +
    activity.emotionalLoad * 0.12 * settings.emotionalSensitivity +
    activity.urgencyLoad * 0.07 * settings.urgencySensitivity
  );
}

function getRecoveryQualityMultiplier(activity: Activity, settings: UserEnergySettings): number {
  const friction =
    activity.sensoryLoad * 0.08 +
    activity.emotionalLoad * 0.1 +
    activity.urgencyLoad * 0.05 +
    activity.socialLoad * 0.05;

  return clamp(1.18 - friction, 0.55, 1.2) * settings.recoverySensitivity;
}

export function calculateTransitionCost(
  activity: Activity,
  previousActivity: Activity | undefined,
  settings: UserEnergySettings,
) {
  return getTransitionCost(previousActivity, activity, settings.defaultTransitionBuffer);
}

export function calculateRecoveryGain(activity: Activity, settings: UserEnergySettings) {
  const durationMinutes = differenceInMinutes(activity.startAt, activity.endAt);
  const meta = ACTIVITY_TYPE_META[activity.type];
  return round(
    durationMinutes * meta.recoveryRatePerMinute * getRecoveryQualityMultiplier(activity, settings),
    2,
  );
}

export function calculateActivityEnergyDelta(params: {
  activity: Activity;
  previousActivity?: Activity;
  currentEnergyPoints: number;
  capacity: number;
  settings: UserEnergySettings;
  profile: DailyProfile;
  onboardingProfile: OnboardingProfile;
  calibrationEvents?: CalibrationEvent[];
}) {
  const durationMinutes = differenceInMinutes(params.activity.startAt, params.activity.endAt);
  const intensityMultiplier = getIntensityMultiplier(params.activity, params.settings);
  const personalMultiplier = buildPersonalizationMap(params.calibrationEvents ?? []).get(params.activity.type) ?? 1;
  const timeWindowMultiplier = getPeakWindowMultiplier(params.activity, params.onboardingProfile);
  const { transitionCost } = getTransitionCost(
    params.previousActivity,
    params.activity,
    params.settings.defaultTransitionBuffer,
  );
  const overlapPenaltyPoints = 0;
  const overloadPenaltyPoints = getOverloadPenalty(
    params.currentEnergyPoints,
    params.capacity,
    params.activity,
    params.previousActivity,
  );
  const meta = ACTIVITY_TYPE_META[params.activity.type];
  const baseDrainPoints = durationMinutes * meta.baseDrainRatePerMinute;
  const drainPoints = baseDrainPoints * intensityMultiplier * personalMultiplier * timeWindowMultiplier;
  const recoveryPoints = calculateRecoveryGain(params.activity, params.settings);
  return round(
    drainPoints + transitionCost + overlapPenaltyPoints + overloadPenaltyPoints - recoveryPoints,
    2,
  );
}

function getTransitionCost(
  previous: Activity | undefined,
  activity: Activity,
  defaultTransitionBuffer: number,
): { transitionCost: number; gapBeforeMinutes?: number; overlapMinutes: number } {
  if (!previous) {
    return {
      transitionCost: 0,
      overlapMinutes: 0,
    };
  }

  const gapBeforeMinutes = Math.round(
    (new Date(activity.startAt).getTime() - new Date(previous.endAt).getTime()) / 60000,
  );
  const overlapMinutes = Math.max(0, gapBeforeMinutes * -1);
  const effectiveGap = Math.max(0, gapBeforeMinutes);
  const missingBuffer = Math.max(defaultTransitionBuffer - effectiveGap, 0);
  let transitionCost = missingBuffer > 0 ? (missingBuffer / defaultTransitionBuffer) * 3.8 : 0;

  if (previous.type !== activity.type) {
    transitionCost += 1.2;
  }

  if (
    previous.type === "meeting" &&
    previous.sensoryLoad >= 4 &&
    isDemandingActivity(activity)
  ) {
    transitionCost += 1.8;
  }

  if (previous.type === "commute" || activity.type === "commute") {
    transitionCost += 1;
  }

  if (effectiveGap >= defaultTransitionBuffer + 10) {
    transitionCost -= 0.8;
  }

  if (overlapMinutes > 0) {
    transitionCost += 2.2;
  }

  return {
    transitionCost: clamp(transitionCost, 0, 10),
    gapBeforeMinutes: effectiveGap,
    overlapMinutes,
  };
}

function getOverloadPenalty(
  currentEnergyPoints: number,
  capacity: number,
  activity: Activity,
  previousActivity: Activity | undefined,
): number {
  const batteryRatio = currentEnergyPoints / capacity;
  let penalty = 0;

  if (batteryRatio < 0.4 && activity.type !== "rest" && activity.type !== "meal" && activity.type !== "sleep") {
    penalty += (0.4 - batteryRatio) * 12;
  }

  if (
    previousActivity &&
    previousActivity.cognitiveLoad >= 4 &&
    activity.cognitiveLoad >= 4 &&
    previousActivity.type !== "rest"
  ) {
    penalty += 1.4;
  }

  return round(penalty, 2);
}

function toBatteryPct(points: number, capacity: number): number {
  return round((points / capacity) * 100, 1);
}

function getBatteryState(pct: number): BatteryState {
  if (pct >= 80) {
    return "plenty";
  }
  if (pct >= 60) {
    return "steady";
  }
  if (pct >= 40) {
    return "care";
  }
  if (pct >= 20) {
    return "caution";
  }
  return "recover";
}

function buildExplanation(params: {
  activity: Activity;
  durationMinutes: number;
  transitionCost: number;
  intensityMultiplier: number;
  recoveryPoints: number;
  overlapMinutes: number;
  netDeltaPct: number;
}) {
  const meta = ACTIVITY_TYPE_META[params.activity.type];
  const parts = [`${formatDurationMinutes(params.durationMinutes)} ${meta.label}`];

  if (params.activity.cognitiveLoad >= 4) {
    parts.push("높은 인지 부담");
  }
  if (params.activity.socialLoad >= 4) {
    parts.push("사회적 부담");
  }
  if (params.activity.emotionalLoad >= 4) {
    parts.push("감정 소모");
  }
  if (params.transitionCost >= 2.5) {
    parts.push("전환 시간 부족");
  }
  if (params.overlapMinutes > 0) {
    parts.push("겹치는 일정");
  }

  if (params.recoveryPoints > 0.8) {
    return `${parts.join(" + ")} 덕분에 약 ${Math.abs(params.netDeltaPct)}% 회복 흐름이 잡혀요.`;
  }

  if (parts.length === 1 && params.intensityMultiplier > 1.35) {
    parts.push("누적 부담");
  }

  return `${parts.join(" + ")} 때문에 약 ${Math.abs(params.netDeltaPct)}% 변화가 예상돼요.`;
}

export function buildDayEnergySummary(params: {
  date: string;
  activities: Activity[];
  dailyProfiles: DailyProfile[];
  settings: UserEnergySettings;
  calibrationEvents: CalibrationEvent[];
  onboardingProfile: OnboardingProfile;
}): DayEnergySummary {
  const profile =
    params.dailyProfiles.find((candidate) => candidate.date === params.date) ??
    getDefaultProfile(params.date);
  const capacity = calculateDailyCapacity(profile);
  const personalization = buildPersonalizationMap(params.calibrationEvents);
  const dayActivities = sortByStartAt(params.activities.filter((activity) => activity.date === params.date));
  const warnings = new Set<string>();
  let requiredCount = 0;
  let consecutiveDemandingCount = 0;
  let noRecoveryWindowMinutes = 0;

  let currentEnergyPoints = capacity;
  let previousActivity: Activity | undefined;
  const snapshots: EnergySnapshot[] = [
    {
      id: `snapshot-${params.date}-start`,
      timestamp: new Date(`${params.date}T06:00:00`).toISOString(),
      batteryPct: 100,
      delta: 0,
      reason: "하루 시작 기준",
      kind: "forecast",
    },
  ];

  const activities: ComputedActivity[] = dayActivities.map((activity) => {
    const startBatteryPct = toBatteryPct(currentEnergyPoints, capacity);
    const durationMinutes = differenceInMinutes(activity.startAt, activity.endAt);
    const intensityMultiplier = getIntensityMultiplier(activity, params.settings);
    const personalMultiplier = personalization.get(activity.type) ?? 1;
    const timeWindowMultiplier = getPeakWindowMultiplier(activity, params.onboardingProfile);
    const { transitionCost, gapBeforeMinutes, overlapMinutes } = getTransitionCost(
      previousActivity,
      activity,
      params.settings.defaultTransitionBuffer,
    );
    const overlapPenaltyPoints = overlapMinutes * 0.08;
    const overloadPenaltyPoints = getOverloadPenalty(
      currentEnergyPoints,
      capacity,
      activity,
      previousActivity,
    );
    const meta = ACTIVITY_TYPE_META[activity.type];
    const baseDrainPoints = durationMinutes * meta.baseDrainRatePerMinute;
    const drainPoints =
      baseDrainPoints * intensityMultiplier * personalMultiplier * timeWindowMultiplier;
    const recoveryPoints =
      durationMinutes * meta.recoveryRatePerMinute * getRecoveryQualityMultiplier(activity, params.settings);
    const netPoints = round(
      drainPoints + transitionCost + overlapPenaltyPoints + overloadPenaltyPoints - recoveryPoints,
      2,
    );
    currentEnergyPoints = clamp(currentEnergyPoints - netPoints, 0, capacity);
    const endBatteryPct = toBatteryPct(currentEnergyPoints, capacity);
    const netDeltaPct = round(endBatteryPct - startBatteryPct, 1);
    const explanation = buildExplanation({
      activity,
      durationMinutes,
      transitionCost,
      intensityMultiplier,
      recoveryPoints,
      overlapMinutes,
      netDeltaPct,
    });
    const flags: string[] = [];
    const canonicalType = canonicalizeActivityType(activity.type);
    const isRecoveryActivity =
      canonicalType === "rest" || canonicalType === "meal" || canonicalType === "sleep" || canonicalType === "hobby";
    const isHighDrain = canonicalType === "focus_work" || canonicalType === "meeting" || canonicalType === "study";

    if (gapBeforeMinutes !== undefined && gapBeforeMinutes < params.settings.defaultTransitionBuffer) {
      flags.push("전환 시간이 부족해요");
      warnings.add("전환 시간이 부족해요");
    }
    if (overlapMinutes > 0) {
      flags.push("일정이 겹쳐요");
      warnings.add("회복 시간이 거의 없어요");
    }

    if (isHighDrain) {
      consecutiveDemandingCount += 1;
      if (consecutiveDemandingCount >= 2) {
        warnings.add("고소모 일정이 연속되어 있어요");
      }
    } else {
      consecutiveDemandingCount = 0;
    }

    if (isRecoveryActivity) {
      noRecoveryWindowMinutes = 0;
      if (recoveryPoints > 1) {
        flags.push("회복 흐름");
      }
    } else {
      noRecoveryWindowMinutes += durationMinutes + (gapBeforeMinutes ?? params.settings.defaultTransitionBuffer);
      if (noRecoveryWindowMinutes >= 180) {
        warnings.add("회복 시간이 거의 없어요");
      }
    }
    if (activity.isRequired) {
      requiredCount += 1;
    }
    if ((canonicalType === "focus_work" || canonicalType === "study" || canonicalType === "admin") && endBatteryPct <= 35) {
      warnings.add("배터리가 낮은 시간대에 집중 작업이 있어요");
    }

    snapshots.push({
      id: `snapshot-${activity.id}`,
      timestamp: activity.endAt,
      batteryPct: endBatteryPct,
      delta: netDeltaPct,
      reason: explanation,
      activityId: activity.id,
      kind: netPoints > 0 ? "drain" : "recovery",
    });

    previousActivity = activity;

    return {
      activity,
      durationMinutes,
      startBatteryPct,
      endBatteryPct,
      netDeltaPct,
      netPoints,
      drainPoints: round(drainPoints, 2),
      recoveryPoints: round(recoveryPoints, 2),
      transitionCostPoints: round(transitionCost, 2),
      overloadPenaltyPoints,
      overlapPenaltyPoints: round(overlapPenaltyPoints, 2),
      intensityMultiplier: round(intensityMultiplier, 2),
      personalMultiplier: round(personalMultiplier, 2),
      timeWindowMultiplier: round(timeWindowMultiplier, 2),
      gapBeforeMinutes,
      overlapMinutes,
      explanation,
      flags,
    };
  });

  const currentBatteryPct = activities.at(-1)?.endBatteryPct ?? 100;
  if (requiredCount >= 5) {
    warnings.add("오늘 필수 일정이 많아요");
  }

  return {
    date: params.date,
    capacity,
    currentEnergyPoints,
    currentBatteryPct,
    state: getBatteryState(currentBatteryPct),
    snapshots,
    activities,
    warnings: [...warnings],
  };
}

export function findComputedActivity(
  summary: DayEnergySummary,
  activityId: string,
): ComputedActivity | undefined {
  return summary.activities.find((activity) => activity.activity.id === activityId);
}

export function calculateBatteryTimeline(
  activities: Activity[],
  profile: DailyProfile,
  settings: UserEnergySettings,
  onboardingProfile: OnboardingProfile,
  calibrationEvents: CalibrationEvent[],
): DayEnergySummary {
  return buildDayEnergySummary({
    date: profile.date,
    activities,
    dailyProfiles: [profile],
    settings,
    calibrationEvents,
    onboardingProfile,
  });
}

export function applyCalibration(
  settings: UserEnergySettings,
  activity: Activity,
  feedback: keyof typeof ACTIVITY_FEEDBACK_FACTORS,
) {
  const reaction = clamp(1 + (ACTIVITY_FEEDBACK_FACTORS[feedback] - 1) * 0.35, 0.85, 1.25);
  const axisAdjustments: Array<{ key: keyof Pick<UserEnergySettings, "cognitiveSensitivity" | "physicalSensitivity" | "socialSensitivity" | "sensorySensitivity" | "emotionalSensitivity" | "urgencySensitivity">; load: number }> = [
    { key: "cognitiveSensitivity", load: activity.cognitiveLoad },
    { key: "physicalSensitivity", load: activity.physicalLoad },
    { key: "socialSensitivity", load: activity.socialLoad },
    { key: "sensorySensitivity", load: activity.sensoryLoad },
    { key: "emotionalSensitivity", load: activity.emotionalLoad },
    { key: "urgencySensitivity", load: activity.urgencyLoad },
  ];

  const boosted = { ...settings } as UserEnergySettings;
  const activeLoads = axisAdjustments.filter((axis) => axis.load > 0);
  if (activeLoads.length === 0) {
    return boosted;
  }

  const total = activeLoads.reduce((sum, axis) => sum + axis.load, 0);
  for (const axis of activeLoads) {
    const weight = axis.load / total;
    const next = boosted[axis.key] * (1 + (reaction - 1) * weight);
    boosted[axis.key] = clamp(round(next, 3), 0.5, 1.8);
  }

  return boosted;
}

export function getStatusMessage(state: BatteryState): string {
  return BATTERY_STATE_COPY[state];
}

export function estimateReportedCost(predictedCost: number, feedback: keyof typeof ACTIVITY_FEEDBACK_FACTORS) {
  return round(predictedCost * ACTIVITY_FEEDBACK_FACTORS[feedback], 2);
}
