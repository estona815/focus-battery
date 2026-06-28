import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildDayEnergySummary,
  calculateDailyCapacity,
} from "../src/adhd/domain/energyCalculator";
import { createAppTheme } from "../src/adhd/theme";
import { Activity, CalibrationEvent, DailyProfile, OnboardingProfile, UserEnergySettings } from "../src/adhd/types";
import { buildRangeFromTimes } from "../src/adhd/utils/dateTime";

const defaultSettings: UserEnergySettings = {
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

const defaultOnboarding: OnboardingProfile = {
  usualEnergyPeak: "morning",
  sleepSensitivity: 4,
  socialSensitivity: 3,
  sensorySensitivity: 3,
  transitionDifficulty: 2,
  defaultTransitionBufferMinutes: 15,
  preferredNotificationStyle: "gentle",
  lowStimMode: false,
  peakWindow: "morning",
  sleepImpact: 4,
  socialDrainLevel: 3,
  sensorySensitivityLevel: 3,
  preferredBuffer: 15,
};

const defaultProfile: DailyProfile = {
  date: "2026-06-28",
  sleepHours: 7,
  sleepQuality: 3,
  morningEnergy: 3,
  stressLevel: 3,
  carryoverFatigue: 2,
  baselineCapacity: 100,
  notes: "",
};

function makeActivity(params: {
  id: string;
  date?: string;
  title: string;
  type: Activity["type"];
  startTime: string;
  endTime: string;
  loads?: Partial<Pick<Activity, "cognitiveLoad" | "physicalLoad" | "socialLoad" | "sensoryLoad" | "emotionalLoad" | "urgencyLoad">>;
}): Activity {
  const date = params.date ?? defaultProfile.date;
  const { startAt, endAt } = buildRangeFromTimes(date, params.startTime, params.endTime);
  const timestamp = new Date("2026-06-28T00:00:00.000Z").toISOString();

  return {
    id: params.id,
    date,
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

function summarize(activities: Activity[], calibrationEvents: CalibrationEvent[] = [], profile = defaultProfile) {
  return buildDayEnergySummary({
    date: profile.date,
    activities,
    dailyProfiles: [profile],
    settings: defaultSettings,
    calibrationEvents,
    onboardingProfile: defaultOnboarding,
  });
}

describe("adhd energy calculator", () => {
  it("reduces battery after adding a demanding activity", () => {
    const summary = summarize([
      makeActivity({
        id: "focus-1",
        title: "깊은 집중",
        type: "focus",
        startTime: "09:00",
        endTime: "10:30",
        loads: { cognitiveLoad: 4, urgencyLoad: 3 },
      }),
    ]);

    assert.ok(summary.currentBatteryPct < 100);
    assert.equal(summary.activities.length, 1);
    const onlyActivity = summary.activities[0];
    assert.ok(onlyActivity);
    assert.ok(onlyActivity.drainPoints > 0);
  });

  it("recovers battery during a rest block after a draining activity", () => {
    const summary = summarize([
      makeActivity({
        id: "focus-1",
        title: "공부",
        type: "study",
        startTime: "09:00",
        endTime: "10:00",
        loads: { cognitiveLoad: 4 },
      }),
      makeActivity({
        id: "rest-1",
        title: "숨 고르기",
        type: "rest",
        startTime: "10:15",
        endTime: "10:45",
        loads: { cognitiveLoad: 0, physicalLoad: 0, socialLoad: 0, sensoryLoad: 0, emotionalLoad: 0, urgencyLoad: 0 },
      }),
    ]);

    assert.equal(summary.activities.length, 2);
    const restEntry = summary.activities[1];
    assert.ok(restEntry);
    assert.ok(restEntry.endBatteryPct > restEntry.startBatteryPct);
    assert.ok(restEntry.recoveryPoints > 0);
  });

  it("drains more for a high-social meeting than for a low-social meeting", () => {
    const lowSocial = summarize([
      makeActivity({
        id: "meeting-low",
        title: "짧은 대화",
        type: "meeting",
        startTime: "13:00",
        endTime: "14:00",
        loads: { socialLoad: 1, sensoryLoad: 1 },
      }),
    ]);
    const highSocial = summarize([
      makeActivity({
        id: "meeting-high",
        title: "긴 회의",
        type: "meeting",
        startTime: "13:00",
        endTime: "14:00",
        loads: { socialLoad: 5, sensoryLoad: 4, emotionalLoad: 3 },
      }),
    ]);

    const lowEntry = lowSocial.activities[0];
    const highEntry = highSocial.activities[0];
    assert.ok(lowEntry);
    assert.ok(highEntry);
    assert.ok(highEntry.drainPoints > lowEntry.drainPoints);
  });

  it("adds transition cost when the buffer is too short", () => {
    const roomy = summarize([
      makeActivity({
        id: "meeting-1",
        title: "회의",
        type: "meeting",
        startTime: "11:00",
        endTime: "12:00",
      }),
      makeActivity({
        id: "focus-1",
        title: "집중",
        type: "focus",
        startTime: "12:30",
        endTime: "13:30",
      }),
    ]);
    const cramped = summarize([
      makeActivity({
        id: "meeting-1",
        title: "회의",
        type: "meeting",
        startTime: "11:00",
        endTime: "12:00",
        loads: { sensoryLoad: 4, socialLoad: 4 },
      }),
      makeActivity({
        id: "focus-1",
        title: "집중",
        type: "focus",
        startTime: "12:05",
        endTime: "13:05",
      }),
    ]);

    const roomySecond = roomy.activities[1];
    const crampedSecond = cramped.activities[1];
    assert.ok(roomySecond);
    assert.ok(crampedSecond);
    assert.ok(crampedSecond.transitionCostPoints > roomySecond.transitionCostPoints);
  });

  it("increases future similar estimates after harder-than-expected feedback", () => {
    const activity = makeActivity({
      id: "admin-1",
      title: "행정 처리",
      type: "admin",
      startTime: "15:00",
      endTime: "15:40",
      loads: { cognitiveLoad: 3, urgencyLoad: 3, emotionalLoad: 2 },
    });
    const baseline = summarize([activity]);
    const calibration: CalibrationEvent = {
      id: "cal-1",
      activityId: "old-admin",
      activityType: "admin",
      predictedCost: 10,
      userReportedCost: 12.5,
      correctionDirection: "harder",
      createdAt: new Date("2026-06-27T00:00:00.000Z").toISOString(),
    };
    const calibrated = summarize([activity], [calibration]);

    const baselineEntry = baseline.activities[0];
    const calibratedEntry = calibrated.activities[0];
    assert.ok(baselineEntry);
    assert.ok(calibratedEntry);
    assert.ok(calibratedEntry.personalMultiplier > baselineEntry.personalMultiplier);
    assert.ok(calibratedEntry.drainPoints > baselineEntry.drainPoints);
  });

  it("clamps battery between 0 and 100", () => {
    const drainingSummary = summarize([
      makeActivity({
        id: "emotional-1",
        title: "감정 소모 큰 일",
        type: "emotional",
        startTime: "08:00",
        endTime: "20:00",
        loads: {
          cognitiveLoad: 4,
          physicalLoad: 2,
          socialLoad: 4,
          sensoryLoad: 4,
          emotionalLoad: 5,
          urgencyLoad: 5,
        },
      }),
    ]);
    const recoverySummary = summarize([
      makeActivity({
        id: "sleep-1",
        title: "수면",
        type: "sleep",
        startTime: "22:00",
        endTime: "08:00",
        loads: {
          cognitiveLoad: 0,
          physicalLoad: 0,
          socialLoad: 0,
          sensoryLoad: 0,
          emotionalLoad: 0,
          urgencyLoad: 0,
        },
      }),
    ]);

    assert.ok(drainingSummary.currentBatteryPct >= 0);
    assert.ok(recoverySummary.currentBatteryPct <= 100);
  });

  it("handles activities that cross midnight", () => {
    const summary = summarize([
      makeActivity({
        id: "sleep-1",
        title: "수면",
        type: "sleep",
        startTime: "23:30",
        endTime: "01:00",
        loads: {
          cognitiveLoad: 0,
          physicalLoad: 0,
          socialLoad: 0,
          sensoryLoad: 0,
          emotionalLoad: 0,
          urgencyLoad: 0,
        },
      }),
    ]);

    const overnightEntry = summary.activities[0];
    assert.ok(overnightEntry);
    assert.equal(overnightEntry.durationMinutes, 90);
    assert.ok(overnightEntry.recoveryPoints > 0);
  });

  it("recalculates the timeline after an activity is removed", () => {
    const activities = [
      makeActivity({
        id: "focus-1",
        title: "집중",
        type: "focus",
        startTime: "09:00",
        endTime: "10:30",
      }),
      makeActivity({
        id: "meeting-1",
        title: "회의",
        type: "meeting",
        startTime: "11:00",
        endTime: "12:00",
      }),
    ];
    const full = summarize(activities);
    const trimmed = summarize(activities.filter((activity) => activity.id !== "meeting-1"));

    assert.equal(full.activities.length, 2);
    assert.equal(trimmed.activities.length, 1);
    assert.notEqual(full.currentBatteryPct, trimmed.currentBatteryPct);
  });

  it("reflects low-stimulation mode in the generated theme", () => {
    const standard = createAppTheme("light", false, false);
    const lowStim = createAppTheme("light", true, false);

    assert.notEqual(standard.colors.background, lowStim.colors.background);
    assert.notEqual(standard.colors.shadow, lowStim.colors.shadow);
  });

  it("derives daily capacity from sleep, stress, and carryover fatigue", () => {
    const rested = calculateDailyCapacity({
      ...defaultProfile,
      sleepHours: 8,
      sleepQuality: 4,
      morningEnergy: 4,
      stressLevel: 2,
      carryoverFatigue: 1,
    });
    const depleted = calculateDailyCapacity({
      ...defaultProfile,
      sleepHours: 5,
      sleepQuality: 2,
      morningEnergy: 2,
      stressLevel: 5,
      carryoverFatigue: 5,
    });

    assert.ok(rested > depleted);
    assert.ok(rested <= 115);
    assert.ok(depleted >= 60);
  });
});
