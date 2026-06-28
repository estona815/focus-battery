import { ACTIVITY_TYPE_META } from "../constants";
import { Activity, DailyProfile, OnboardingProfile, PlannerSeedData, UserEnergySettings } from "../types";
import { addDays, buildRangeFromTimes, toDateKey } from "../utils/dateTime";

function createActivity(params: {
  id: string;
  date: string;
  title: string;
  type: keyof typeof ACTIVITY_TYPE_META;
  startTime: string;
  endTime: string;
  overrides?: Partial<Activity>;
}): Activity {
  const meta = ACTIVITY_TYPE_META[params.type];
  const { startAt, endAt } = buildRangeFromTimes(params.date, params.startTime, params.endTime);
  const createdAt = new Date().toISOString();

  return {
    id: params.id,
    date: params.date,
    title: params.title,
    startAt,
    endAt,
    type: params.type,
    locationType: "mixed",
    isFlexible: params.type === "rest" || params.type === "hobby" || params.type === "chores" || params.type === "chore",
    isRequired: params.type !== "rest",
    notes: "",
    actualDifficultyFeedback: undefined,
    createdAt,
    updatedAt: createdAt,
    ...meta.defaultLoads,
    ...params.overrides,
  };
}

function createDailyProfile(date: string, values: Partial<DailyProfile>): DailyProfile {
  return {
    date,
    sleepHours: 7.2,
    sleepQuality: 3,
    morningEnergy: 3,
    stressLevel: 3,
    carryoverFatigue: 2,
    baselineCapacity: 100,
    notes: "",
    ...values,
  };
}

export function createDefaultSettings(): UserEnergySettings {
  return {
    themeMode: "dark",
    defaultTransitionBuffer: 15,
    cognitiveSensitivity: 1,
    physicalSensitivity: 1,
    socialSensitivity: 1,
    sensorySensitivity: 1,
    emotionalSensitivity: 1,
    urgencySensitivity: 1,
    recoverySensitivity: 1,
    lowStimMode: false,
    reduceMotion: false,
    notificationStyle: "gentle",
    privacyMode: false,
  };
}

export function createDefaultOnboardingProfile(): OnboardingProfile {
  return {
    usualEnergyPeak: "morning",
    sleepSensitivity: 3,
    socialSensitivity: 3,
    sensorySensitivity: 3,
    transitionDifficulty: 2,
    defaultTransitionBufferMinutes: 15,
    preferredNotificationStyle: "quiet",
    lowStimMode: false,
    peakWindow: "morning",
    sleepImpact: 3,
    socialDrainLevel: 3,
    sensorySensitivityLevel: 3,
    preferredBuffer: 15,
  };
}

export function buildPlannerSeedData(referenceDate = new Date()): PlannerSeedData {
  const today = toDateKey(referenceDate);
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const threeDaysAgo = addDays(today, -3);
  const fourDaysAgo = addDays(today, -4);
  const fiveDaysAgo = addDays(today, -5);
  const sixDaysAgo = addDays(today, -6);

  const activities: Activity[] = [
    createActivity({
      id: "today-1",
      date: today,
      title: "집중 작업 블록",
      type: "focus",
      startTime: "09:00",
      endTime: "10:30",
      overrides: {
        urgencyLoad: 3,
        notes: "보고서 정리",
      },
    }),
    createActivity({
      id: "today-2",
      date: today,
      title: "산만함 정리 휴식",
      type: "rest",
      startTime: "10:35",
      endTime: "10:55",
      overrides: {
        isRequired: false,
      },
    }),
    createActivity({
      id: "today-3",
      date: today,
      title: "이동",
      type: "commute",
      startTime: "11:10",
      endTime: "11:50",
    }),
    createActivity({
      id: "today-4",
      date: today,
      title: "점심",
      type: "meal",
      startTime: "12:00",
      endTime: "12:40",
      overrides: {
        isRequired: false,
      },
    }),
    createActivity({
      id: "today-5",
      date: today,
      title: "회의/대화",
      type: "meeting",
      startTime: "13:00",
      endTime: "14:00",
      overrides: {
        socialLoad: 5,
        sensoryLoad: 4,
      },
    }),
    createActivity({
      id: "today-6",
      date: today,
      title: "행정 처리",
      type: "admin",
      startTime: "14:05",
      endTime: "14:35",
      overrides: {
        urgencyLoad: 4,
      },
    }),
    createActivity({
      id: "today-7",
      date: today,
      title: "조용한 취미",
      type: "hobby",
      startTime: "20:30",
      endTime: "21:15",
      overrides: {
        isRequired: false,
      },
    }),
    createActivity({
      id: "today-8",
      date: today,
      title: "수면",
      type: "sleep",
      startTime: "23:20",
      endTime: "07:10",
      overrides: {
        isFlexible: false,
        isRequired: true,
      },
    }),
    createActivity({
      id: "yesterday-1",
      date: yesterday,
      title: "집중 작업",
      type: "focus",
      startTime: "09:20",
      endTime: "11:00",
      overrides: {
        urgencyLoad: 2,
      },
    }),
    createActivity({
      id: "yesterday-2",
      date: yesterday,
      title: "휴식",
      type: "rest",
      startTime: "11:00",
      endTime: "11:25",
      overrides: {
        isRequired: false,
      },
    }),
    createActivity({
      id: "yesterday-3",
      date: yesterday,
      title: "회의/대화",
      type: "meeting",
      startTime: "13:00",
      endTime: "14:10",
      overrides: {
        socialLoad: 4,
      },
    }),
    createActivity({
      id: "two-1",
      date: twoDaysAgo,
      title: "공부",
      type: "study",
      startTime: "08:40",
      endTime: "10:40",
    }),
    createActivity({
      id: "two-2",
      date: twoDaysAgo,
      title: "산책",
      type: "rest",
      startTime: "17:50",
      endTime: "18:20",
      overrides: {
        notes: "짧은 산책",
        physicalLoad: 1,
      },
    }),
    createActivity({
      id: "three-1",
      date: threeDaysAgo,
      title: "감정 소모 큰 통화",
      type: "emotional",
      startTime: "19:00",
      endTime: "20:10",
      overrides: {
        socialLoad: 3,
        emotionalLoad: 5,
      },
    }),
    createActivity({
      id: "four-1",
      date: fourDaysAgo,
      title: "운동",
      type: "exercise",
      startTime: "18:10",
      endTime: "18:55",
    }),
    createActivity({
      id: "five-1",
      date: fiveDaysAgo,
      title: "집안일",
      type: "chore",
      startTime: "10:00",
      endTime: "11:00",
    }),
    createActivity({
      id: "six-1",
      date: sixDaysAgo,
      title: "행정/잡무",
      type: "admin",
      startTime: "15:00",
      endTime: "16:10",
      overrides: {
        urgencyLoad: 3,
      },
    }),
  ];

  const dailyProfiles: DailyProfile[] = [
    createDailyProfile(today, {
      sleepHours: 6.7,
      sleepQuality: 3,
      morningEnergy: 3,
      stressLevel: 3,
      carryoverFatigue: 3,
      notes: "오전엔 괜찮지만 오후 회의가 길면 빨리 지치는 편",
    }),
    createDailyProfile(yesterday, {
      sleepHours: 7.5,
      sleepQuality: 4,
      morningEnergy: 4,
      stressLevel: 2,
      carryoverFatigue: 2,
    }),
    createDailyProfile(twoDaysAgo, {
      sleepHours: 6.1,
      sleepQuality: 2,
      morningEnergy: 3,
      stressLevel: 4,
      carryoverFatigue: 3,
    }),
    createDailyProfile(threeDaysAgo, {
      sleepHours: 7.8,
      sleepQuality: 4,
      morningEnergy: 4,
      stressLevel: 3,
      carryoverFatigue: 2,
    }),
    createDailyProfile(fourDaysAgo, {
      sleepHours: 7,
      sleepQuality: 3,
      morningEnergy: 3,
      stressLevel: 2,
      carryoverFatigue: 2,
    }),
    createDailyProfile(fiveDaysAgo, {
      sleepHours: 6.4,
      sleepQuality: 3,
      morningEnergy: 2,
      stressLevel: 3,
      carryoverFatigue: 3,
    }),
    createDailyProfile(sixDaysAgo, {
      sleepHours: 7.2,
      sleepQuality: 4,
      morningEnergy: 4,
      stressLevel: 2,
      carryoverFatigue: 2,
    }),
  ];

  return {
    activities,
    dailyProfiles,
    settings: createDefaultSettings(),
    onboardingProfile: createDefaultOnboardingProfile(),
  };
}
