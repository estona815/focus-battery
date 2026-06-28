export type CanonicalActivityType =
  | "focus_work"
  | "study"
  | "meeting"
  | "conversation"
  | "commute"
  | "chores"
  | "exercise"
  | "admin"
  | "emotional_task"
  | "meal"
  | "rest"
  | "sleep"
  | "hobby"
  | "recovery_walk"
  | "custom";

export type LegacyActivityType = "focus" | "chore" | "emotional";

export type ActivityType = CanonicalActivityType | LegacyActivityType;

export type LoadField =
  | "cognitiveLoad"
  | "physicalLoad"
  | "sensoryLoad"
  | "socialLoad"
  | "emotionalLoad"
  | "urgencyLoad";

export type EnergyWindow = "morning" | "afternoon" | "evening" | "night" | "varies";
export type ThemeMode = "system" | "light" | "dark";
export type NotificationStyle = "silent" | "gentle" | "active" | "minimal" | "quiet";
export type CalibrationFeedback =
  | "much_harder"
  | "harder"
  | "accurate"
  | "easier"
  | "recovered";
export type LegacyDifficultyFeedback = "same";
export type DifficultyFeedback = CalibrationFeedback | LegacyDifficultyFeedback;
export type LocationType = "home" | "outside" | "online" | "mixed";
export type BatteryState = "plenty" | "steady" | "care" | "caution" | "recover";
export type AppTab = "today" | "timeline" | "insights" | "settings";
export type SnapshotKind = "drain" | "recovery" | "adjustment" | "forecast";
export type QuickCheckInState = "steady" | "heavy" | "drained" | "recovering";
export type LearningState = "starting" | "learning" | "ready";

export interface Activity {
  id: string;
  date: string;
  title: string;
  startAt: string;
  endAt: string;
  type: ActivityType;
  cognitiveLoad: number;
  physicalLoad: number;
  socialLoad: number;
  sensoryLoad: number;
  emotionalLoad: number;
  urgencyLoad: number;
  locationType: LocationType;
  isFlexible: boolean;
  isRequired: boolean;
  notes: string;
  actualDifficultyFeedback?: DifficultyFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityInput {
  id?: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  type: ActivityType;
  cognitiveLoad: number;
  physicalLoad: number;
  socialLoad: number;
  sensoryLoad: number;
  emotionalLoad: number;
  urgencyLoad: number;
  locationType: LocationType;
  isFlexible: boolean;
  isRequired: boolean;
  notes: string;
}

export interface EnergySnapshot {
  id: string;
  timestamp: string;
  batteryPct: number;
  delta: number;
  reason: string;
  activityId?: string;
  kind: SnapshotKind;
}

export interface DailyProfile {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  morningEnergy: number;
  stressLevel: number;
  carryoverFatigue: number;
  baselineCapacity: number;
  notes: string;
}

export interface UserEnergySettings {
  themeMode: ThemeMode;
  defaultTransitionBuffer: number;
  cognitiveSensitivity: number;
  physicalSensitivity: number;
  socialSensitivity: number;
  sensorySensitivity: number;
  emotionalSensitivity: number;
  urgencySensitivity: number;
  recoverySensitivity: number;
  lowStimMode: boolean;
  reduceMotion: boolean;
  notificationStyle: NotificationStyle;
  privacyMode: boolean;
}

export interface OnboardingProfile {
  usualEnergyPeak: EnergyWindow;
  sleepSensitivity: number;
  socialSensitivity: number;
  sensorySensitivity: number;
  transitionDifficulty: number;
  defaultTransitionBufferMinutes: number;
  preferredNotificationStyle: NotificationStyle;
  lowStimMode: boolean;
  peakWindow?: EnergyWindow;
  sleepImpact?: number;
  socialDrainLevel?: number;
  sensorySensitivityLevel?: number;
  preferredBuffer?: number;
  completedAt?: string;
}

export interface CalibrationEvent {
  id: string;
  activityId: string;
  activityType: ActivityType;
  predictedCost: number;
  userReportedCost: number;
  userReportedDirection?: DifficultyFeedback;
  correctionDirection?: DifficultyFeedback;
  createdAt: string;
}

export interface QuickCheckIn {
  id: string;
  date: string;
  state: QuickCheckInState;
  note: string;
  createdAt: string;
}

export interface QuickCheckInInput {
  date: string;
  state: QuickCheckInState;
  note: string;
}

export interface ComputedActivity {
  activity: Activity;
  durationMinutes: number;
  startBatteryPct: number;
  endBatteryPct: number;
  netDeltaPct: number;
  netPoints: number;
  drainPoints: number;
  recoveryPoints: number;
  transitionCostPoints: number;
  overloadPenaltyPoints: number;
  overlapPenaltyPoints: number;
  intensityMultiplier: number;
  personalMultiplier: number;
  timeWindowMultiplier: number;
  gapBeforeMinutes?: number;
  overlapMinutes: number;
  explanation: string;
  flags: string[];
}

export interface DayEnergySummary {
  date: string;
  capacity: number;
  currentEnergyPoints: number;
  currentBatteryPct: number;
  state: BatteryState;
  snapshots: EnergySnapshot[];
  activities: ComputedActivity[];
  warnings?: string[];
}

export interface ReplanSuggestion {
  id: string;
  kind:
    | "insert-recovery"
    | "split-focus"
    | "defer-flex"
    | "quiet-buffer"
    | "protect-one"
    | "add-buffer";
  title: string;
  description: string;
  impact: string;
  activityIds: string[];
}

export interface WeeklyInsight {
  strongestWindow: EnergyWindow;
  mostDrainingType?: ActivityType;
  recoveryWinRate: number;
  bufferStressCount: number;
  averageEndBattery: number;
  note: string;
  drainsByType: Array<{ type: ActivityType; average: number }>;
  windowAverages: Array<{ window: EnergyWindow; averageEndBattery: number }>;
}

export interface LearningReport {
  state: LearningState;
  confidencePct: number;
  activityDays: number;
  quickCheckInCount: number;
  dipWindow: EnergyWindow;
  protectWindow: EnergyWindow;
  recoveryWindow: EnergyWindow;
  topPatternTitle: string;
  topPatternBody: string;
  protectTitle: string;
  protectBody: string;
  suggestedRecoveryTitle: string;
  suggestedRecoveryBody: string;
  overloadedTypes: ActivityType[];
  helpfulTypes: ActivityType[];
  checkInPrompt: string;
}

export interface RoughActivitySuggestion {
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  note: string;
}

export interface PlannerSeedData {
  activities: Activity[];
  dailyProfiles: DailyProfile[];
  settings: UserEnergySettings;
  onboardingProfile: OnboardingProfile;
}

export type AddActivityMode = "create" | "edit" | "duplicate";

export type OverlayState =
  | { kind: "none" }
  | { kind: "add"; activityId?: string; mode?: AddActivityMode }
  | { kind: "quick-check-in" }
  | { kind: "rough-plan" }
  | { kind: "detail"; activityId: string }
  | { kind: "replan" };

export interface AppTheme {
  isDark: boolean;
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentSoft: string;
    success: string;
    caution: string;
    warning: string;
    danger: string;
    batteryPlenty: string;
    batterySteady: string;
    batteryCare: string;
    batteryCaution: string;
    batteryRecover: string;
    shadow: string;
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  typeScale: {
    caption: number;
    body: number;
    bodyStrong: number;
    section: number;
    title: number;
    hero: number;
  };
  motion: {
    quick: number;
    normal: number;
  };
}
