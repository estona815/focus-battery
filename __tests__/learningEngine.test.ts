import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDayEnergySummary } from "../src/adhd/domain/energyCalculator";
import { buildLearningReport } from "../src/adhd/domain/learningEngine";
import { buildRoughActivitySuggestions } from "../src/adhd/domain/roughPlanner";
import { Activity, DailyProfile, OnboardingProfile, QuickCheckIn, UserEnergySettings } from "../src/adhd/types";
import { addDays, buildRangeFromTimes } from "../src/adhd/utils/dateTime";

const settings: UserEnergySettings = {
  themeMode: "light",
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

const onboarding: OnboardingProfile = {
  usualEnergyPeak: "morning",
  sleepSensitivity: 3,
  socialSensitivity: 3,
  sensorySensitivity: 3,
  transitionDifficulty: 2,
  defaultTransitionBufferMinutes: 15,
  preferredNotificationStyle: "gentle",
  lowStimMode: false,
  peakWindow: "morning",
  sleepImpact: 3,
  socialDrainLevel: 3,
  sensorySensitivityLevel: 3,
  preferredBuffer: 15,
};

function makeProfile(date: string, overrides: Partial<DailyProfile> = {}): DailyProfile {
  return {
    date,
    sleepHours: 7,
    sleepQuality: 3,
    morningEnergy: 3,
    stressLevel: 3,
    carryoverFatigue: 2,
    baselineCapacity: 100,
    notes: "",
    ...overrides,
  };
}

function makeActivity(params: {
  id: string;
  date: string;
  title: string;
  type: Activity["type"];
  startTime: string;
  endTime: string;
  loads?: Partial<Pick<Activity, "cognitiveLoad" | "physicalLoad" | "socialLoad" | "sensoryLoad" | "emotionalLoad" | "urgencyLoad">>;
}): Activity {
  const { startAt, endAt } = buildRangeFromTimes(params.date, params.startTime, params.endTime);
  const timestamp = new Date("2026-06-28T00:00:00.000Z").toISOString();
  return {
    id: params.id,
    date: params.date,
    title: params.title,
    startAt,
    endAt,
    type: params.type,
    cognitiveLoad: params.loads?.cognitiveLoad ?? 2,
    physicalLoad: params.loads?.physicalLoad ?? 1,
    socialLoad: params.loads?.socialLoad ?? 1,
    sensoryLoad: params.loads?.sensoryLoad ?? 1,
    emotionalLoad: params.loads?.emotionalLoad ?? 1,
    urgencyLoad: params.loads?.urgencyLoad ?? 1,
    locationType: "mixed",
    isFlexible: false,
    isRequired: true,
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe("learning report", () => {
  it("builds a higher-confidence report when recent activities and check-ins exist", () => {
    const today = "2026-06-28";
    const yesterday = addDays(today, -1);
    const activities = [
      makeActivity({
        id: "meeting-1",
        date: today,
        title: "회의",
        type: "meeting",
        startTime: "13:00",
        endTime: "14:10",
        loads: { socialLoad: 4, sensoryLoad: 4 },
      }),
      makeActivity({
        id: "focus-1",
        date: today,
        title: "집중 작업",
        type: "focus_work",
        startTime: "14:15",
        endTime: "15:20",
        loads: { cognitiveLoad: 4, urgencyLoad: 3 },
      }),
      makeActivity({
        id: "rest-1",
        date: yesterday,
        title: "회복 산책",
        type: "recovery_walk",
        startTime: "18:30",
        endTime: "19:00",
      }),
    ];

    const summaries = [today, yesterday].map((date) =>
      buildDayEnergySummary({
        date,
        activities,
        dailyProfiles: [makeProfile(today), makeProfile(yesterday)],
        settings,
        calibrationEvents: [],
        onboardingProfile: onboarding,
      }),
    );

    const quickCheckIns: QuickCheckIn[] = [
      {
        id: "checkin-1",
        date: today,
        state: "heavy",
        note: "회의 뒤 조금 무거움",
        createdAt: new Date("2026-06-28T14:12:00+09:00").toISOString(),
      },
      {
        id: "checkin-2",
        date: yesterday,
        state: "recovering",
        note: "산책 뒤 괜찮음",
        createdAt: new Date("2026-06-27T19:04:00+09:00").toISOString(),
      },
    ];

    const report = buildLearningReport({ summaries, quickCheckIns });

    assert.ok(report.confidencePct >= 60);
    assert.equal(report.activityDays, 2);
    assert.equal(report.quickCheckInCount, 2);
    assert.equal(report.dipWindow, "afternoon");
    assert.equal(report.recoveryWindow, "evening");
  });
});

describe("rough planner", () => {
  it("parses a rough Korean sentence into multiple activity suggestions", () => {
    const suggestions = buildRoughActivitySuggestions(
      "오전엔 회의 두 개 있고, 점심 뒤엔 멍할 것 같고, 저녁엔 운동 가고 싶음",
    );

    assert.equal(suggestions.length, 4);
    assert.equal(suggestions[0]?.type, "meeting");
    assert.equal(suggestions[1]?.type, "meeting");
    assert.equal(suggestions[2]?.type, "rest");
    assert.equal(suggestions[3]?.type, "exercise");
  });

  it("falls back to a direct input block when it cannot infer a known keyword", () => {
    const suggestions = buildRoughActivitySuggestions("뭔가 이것저것 있을 듯");

    assert.equal(suggestions.length, 1);
    assert.equal(suggestions[0]?.type, "custom");
  });
});
