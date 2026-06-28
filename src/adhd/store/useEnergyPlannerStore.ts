import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ACTIVITY_TYPE_META } from "../constants";
import { buildPlannerSeedData, createDefaultOnboardingProfile } from "../data/samplePlannerData";
import { buildDayEnergySummary, estimateReportedCost, findComputedActivity } from "../domain/energyCalculator";
import { buildRoughActivitySuggestions } from "../domain/roughPlanner";
import { applySuggestion as applyReplanSuggestionToActivities } from "../domain/replanEngine";
import {
  Activity,
  ActivityInput,
  AppTab,
  CalibrationEvent,
  DailyProfile,
  DifficultyFeedback,
  OnboardingProfile,
  OverlayState,
  QuickCheckIn,
  QuickCheckInInput,
  ReplanSuggestion,
  UserEnergySettings,
} from "../types";
import { buildRangeFromTimes, toDateKey } from "../utils/dateTime";

function buildActivity(input: ActivityInput): Activity {
  const { startAt, endAt } = buildRangeFromTimes(input.date, input.startTime, input.endTime);
  const timestamp = new Date().toISOString();

  return {
    id: input.id ?? `activity-${timestamp}`,
    date: input.date,
    title: input.title.trim(),
    startAt,
    endAt,
    type: input.type,
    cognitiveLoad: input.cognitiveLoad,
    physicalLoad: input.physicalLoad,
    socialLoad: input.socialLoad,
    sensoryLoad: input.sensoryLoad,
    emotionalLoad: input.emotionalLoad,
    urgencyLoad: input.urgencyLoad,
    locationType: input.locationType,
    isFlexible: input.isFlexible,
    isRequired: input.isRequired,
    notes: input.notes.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function mergeActivity(existing: Activity | undefined, input: ActivityInput): Activity {
  const next = buildActivity(input);
  if (!existing) {
    return next;
  }

  return {
    ...existing,
    ...next,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function ensureDailyProfile(dailyProfiles: DailyProfile[], date: string): DailyProfile[] {
  if (dailyProfiles.some((profile) => profile.date === date)) {
    return dailyProfiles;
  }

  return [
    {
      date,
      sleepHours: 7,
      sleepQuality: 3,
      morningEnergy: 3,
      stressLevel: 3,
      carryoverFatigue: 2,
      baselineCapacity: 100,
      notes: "",
    },
    ...dailyProfiles,
  ];
}

function settingsFromOnboarding(
  current: UserEnergySettings,
  onboardingProfile: OnboardingProfile,
): UserEnergySettings {
  const preferredBuffer = onboardingProfile.defaultTransitionBufferMinutes ?? onboardingProfile.preferredBuffer ?? 15;
  const sleepSensitivity = onboardingProfile.sleepSensitivity ?? onboardingProfile.sleepImpact ?? 3;
  const socialSensitivity = onboardingProfile.socialSensitivity ?? onboardingProfile.socialDrainLevel ?? 3;
  const sensorySensitivity = onboardingProfile.sensorySensitivity ?? onboardingProfile.sensorySensitivityLevel ?? 3;
  const transitionDifficulty = onboardingProfile.transitionDifficulty ?? 2;
  const notificationStyle = onboardingProfile.preferredNotificationStyle ?? "gentle";
  return {
    ...current,
    defaultTransitionBuffer: preferredBuffer,
    cognitiveSensitivity: 0.88 + sleepSensitivity * 0.05,
    socialSensitivity: 0.88 + socialSensitivity * 0.06,
    sensorySensitivity: 0.88 + sensorySensitivity * 0.06,
    recoverySensitivity: 0.95 + (6 - transitionDifficulty) * 0.02,
    lowStimMode: onboardingProfile.lowStimMode ?? current.lowStimMode,
    notificationStyle: ["silent", "gentle", "active"].includes(notificationStyle)
      ? notificationStyle
      : current.notificationStyle,
  };
}

const seed = buildPlannerSeedData();

interface EnergyPlannerStoreState {
  onboardingComplete: boolean;
  onboardingProfile: OnboardingProfile;
  activities: Activity[];
  dailyProfiles: DailyProfile[];
  calibrationEvents: CalibrationEvent[];
  quickCheckIns: QuickCheckIn[];
  settings: UserEnergySettings;
  activeDate: string;
  activeTab: AppTab;
  overlay: OverlayState;
  setActiveTab: (tab: AppTab) => void;
  setActiveDate: (date: string) => void;
  completeOnboarding: (profile: OnboardingProfile) => void;
  openAddActivity: (activityId?: string) => void;
  openDuplicateActivity: (activityId: string) => void;
  openQuickCheckIn: () => void;
  openRoughPlan: () => void;
  openActivityDetail: (activityId: string) => void;
  openReplan: () => void;
  closeOverlay: () => void;
  upsertActivity: (input: ActivityInput) => void;
  submitQuickCheckIn: (input: QuickCheckInInput) => void;
  applyRoughPlan: (date: string, text: string) => ActivityInput[];
  deleteActivity: (activityId: string) => void;
  applyDifficultyFeedback: (activityId: string, feedback: DifficultyFeedback) => void;
  applyReplanSuggestion: (suggestion: ReplanSuggestion) => void;
  updateSettings: (patch: Partial<UserEnergySettings>) => void;
  resetPlanner: () => void;
  resetCalibration: () => void;
  resetQuickCheckIns: () => void;
}

export const useEnergyPlannerStore = create<EnergyPlannerStoreState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      onboardingProfile: createDefaultOnboardingProfile(),
      activities: seed.activities,
      dailyProfiles: seed.dailyProfiles,
      calibrationEvents: [],
      quickCheckIns: [],
      settings: seed.settings,
      activeDate: toDateKey(),
      activeTab: "today",
      overlay: { kind: "none" },
      setActiveTab: (activeTab) => set({ activeTab }),
      setActiveDate: (activeDate) =>
        set((state) => ({
          activeDate,
          dailyProfiles: ensureDailyProfile(state.dailyProfiles, activeDate),
        })),
      completeOnboarding: (profile) =>
        set((state) => ({
          onboardingComplete: true,
          onboardingProfile: {
            ...profile,
            preferredBuffer: profile.preferredBuffer ?? profile.defaultTransitionBufferMinutes,
            completedAt: new Date().toISOString(),
          },
          settings: settingsFromOnboarding(state.settings, profile),
        })),
      openAddActivity: (activityId) =>
        set({
          overlay: { kind: "add", activityId, mode: activityId ? "edit" : "create" },
        }),
      openDuplicateActivity: (activityId) => set({ overlay: { kind: "add", activityId, mode: "duplicate" } }),
      openQuickCheckIn: () => set({ overlay: { kind: "quick-check-in" } }),
      openRoughPlan: () => set({ overlay: { kind: "rough-plan" } }),
      openActivityDetail: (activityId) => set({ overlay: { kind: "detail", activityId } }),
      openReplan: () => set({ overlay: { kind: "replan" } }),
      closeOverlay: () => set({ overlay: { kind: "none" } }),
      upsertActivity: (input) =>
        set((state) => {
          const existing = input.id
            ? state.activities.find((activity) => activity.id === input.id)
            : undefined;
          const nextActivity = mergeActivity(existing, input);
          const activities = existing
            ? state.activities.map((activity) =>
                activity.id === existing.id ? nextActivity : activity,
              )
            : [...state.activities, nextActivity];

          return {
            activities,
            dailyProfiles: ensureDailyProfile(state.dailyProfiles, input.date),
            overlay: { kind: "none" },
          };
        }),
      submitQuickCheckIn: (input) =>
        set((state) => ({
          quickCheckIns: [
            {
              id: `checkin-${Date.now()}`,
              date: input.date,
              state: input.state,
              note: input.note.trim(),
              createdAt: new Date().toISOString(),
            },
            ...state.quickCheckIns,
          ].slice(0, 80),
          dailyProfiles: ensureDailyProfile(state.dailyProfiles, input.date),
          overlay: { kind: "none" },
        })),
      applyRoughPlan: (date, text) => {
        const suggestions = buildRoughActivitySuggestions(text);
        const inputs = suggestions.map<ActivityInput>((suggestion) => ({
          date,
          title: suggestion.title,
          startTime: suggestion.startTime,
          endTime: suggestion.endTime,
          type: suggestion.type,
          locationType: "mixed",
          isFlexible:
            suggestion.type === "rest" ||
            suggestion.type === "meal" ||
            suggestion.type === "hobby" ||
            suggestion.type === "recovery_walk",
          isRequired: suggestion.type !== "rest" && suggestion.type !== "recovery_walk",
          notes: suggestion.note,
          ...ACTIVITY_TYPE_META[suggestion.type].defaultLoads,
        }));

        if (inputs.length === 0) {
          return [];
        }

        set((state) => ({
          activities: [
            ...state.activities,
            ...inputs.map((activityInput, index) =>
              buildActivity({
                ...activityInput,
                id: `rough-${Date.now()}-${index}`,
              }),
            ),
          ],
          dailyProfiles: ensureDailyProfile(state.dailyProfiles, date),
          overlay: { kind: "none" },
        }));

        return inputs;
      },
      deleteActivity: (activityId) =>
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== activityId),
          calibrationEvents: state.calibrationEvents.filter((event) => event.activityId !== activityId),
          overlay: { kind: "none" },
        })),
      applyDifficultyFeedback: (activityId, feedback) =>
        set((state) => {
          const activity = state.activities.find((candidate) => candidate.id === activityId);
          if (!activity) {
            return state;
          }

          const summary = buildDayEnergySummary({
            date: activity.date,
            activities: state.activities,
            dailyProfiles: state.dailyProfiles,
            settings: state.settings,
            calibrationEvents: state.calibrationEvents,
            onboardingProfile: state.onboardingProfile,
          });
          const computed = findComputedActivity(summary, activityId);
          if (!computed) {
            return state;
          }

          const predictedCost = Math.max(1, computed.drainPoints + computed.transitionCostPoints);
          const calibrationEvent: CalibrationEvent = {
            id: `calibration-${activityId}-${Date.now()}`,
            activityId,
            activityType: activity.type,
            predictedCost,
            userReportedCost: estimateReportedCost(predictedCost, feedback),
            userReportedDirection: feedback === "same" ? "accurate" : feedback,
            correctionDirection: feedback,
            createdAt: new Date().toISOString(),
          };

          return {
            activities: state.activities.map((candidate) =>
              candidate.id === activityId
                ? {
                    ...candidate,
                    actualDifficultyFeedback: feedback,
                    updatedAt: new Date().toISOString(),
                  }
                : candidate,
            ),
            calibrationEvents: [calibrationEvent, ...state.calibrationEvents].slice(0, 80),
          };
        }),
      applyReplanSuggestion: (suggestion) =>
        set((state) => ({
          activities: applyReplanSuggestionToActivities(state.activities, suggestion),
          overlay: { kind: "none" },
        })),
      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
          },
        })),
      resetCalibration: () => set({ calibrationEvents: [] }),
      resetQuickCheckIns: () => set({ quickCheckIns: [] }),
      resetPlanner: () => {
        const fresh = buildPlannerSeedData();
        set({
          onboardingComplete: false,
          onboardingProfile: createDefaultOnboardingProfile(),
          activities: fresh.activities,
          dailyProfiles: fresh.dailyProfiles,
          calibrationEvents: [],
          quickCheckIns: [],
          settings: fresh.settings,
          activeDate: toDateKey(),
          activeTab: "today",
          overlay: { kind: "none" },
        });
      },
    }),
    {
      name: "adhd-battery-planner-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        onboardingProfile: state.onboardingProfile,
        activities: state.activities,
        dailyProfiles: state.dailyProfiles,
        calibrationEvents: state.calibrationEvents,
        quickCheckIns: state.quickCheckIns,
        settings: state.settings,
        activeDate: state.activeDate,
        activeTab: state.activeTab,
      }),
    },
  ),
);
