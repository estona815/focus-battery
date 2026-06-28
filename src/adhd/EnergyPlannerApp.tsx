import React from "react";
import { Alert, Appearance, Modal, Platform, Share, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { BottomTabBar } from "./components/PlannerPrimitives";
import { buildWeeklyInsight } from "./domain/insights";
import { buildLearningReport } from "./domain/learningEngine";
import { buildReplanSuggestions } from "./domain/replanEngine";
import { buildDayEnergySummary, findComputedActivity } from "./domain/energyCalculator";
import { AddActivityScreen } from "./screens/AddActivityScreen";
import { EnergyDetailScreen } from "./screens/EnergyDetailScreen";
import { InsightScreen } from "./screens/InsightScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { QuickCheckInScreen } from "./screens/QuickCheckInScreen";
import { ReplanScreen } from "./screens/ReplanScreen";
import { RoughPlanScreen } from "./screens/RoughPlanScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { TimelineScreen } from "./screens/TimelineScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { useEnergyPlannerStore } from "./store/useEnergyPlannerStore";
import { createAppTheme, resolveThemeMode } from "./theme";
import { ActivityInput } from "./types";
import { addDays, getDayLabel } from "./utils/dateTime";

function ModalShell({
  visible,
  children,
  backgroundColor,
}: React.PropsWithChildren<{ visible: boolean; backgroundColor: string }>) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor }}>{children}</View>
    </Modal>
  );
}

export function EnergyPlannerApp() {
  const systemMode = Appearance.getColorScheme();
  const {
    onboardingComplete,
    onboardingProfile,
    activities,
    dailyProfiles,
    calibrationEvents,
    quickCheckIns,
    settings,
    activeDate,
    activeTab,
    overlay,
    setActiveTab,
    setActiveDate,
    completeOnboarding,
    openAddActivity,
    openDuplicateActivity,
    openQuickCheckIn,
    openRoughPlan,
    openActivityDetail,
    openReplan,
    closeOverlay,
    upsertActivity,
    submitQuickCheckIn,
    applyRoughPlan,
    deleteActivity,
    applyDifficultyFeedback,
    applyReplanSuggestion,
    updateSettings,
    resetCalibration,
    resetQuickCheckIns,
    resetPlanner,
  } = useEnergyPlannerStore();

  const resolvedTheme = resolveThemeMode(settings.themeMode, systemMode ?? null);
  const theme = createAppTheme(resolvedTheme, settings.lowStimMode, settings.reduceMotion);

  const summary = buildDayEnergySummary({
    date: activeDate,
    activities,
    dailyProfiles,
    settings,
    calibrationEvents,
    onboardingProfile,
  });
  const weekSummaries = Array.from({ length: 7 }, (_, index) =>
    buildDayEnergySummary({
      date: addDays(activeDate, -index),
      activities,
      dailyProfiles,
      settings,
      calibrationEvents,
      onboardingProfile,
    }),
  );
  const insight = buildWeeklyInsight(weekSummaries);
  const learningReport = buildLearningReport({
    summaries: weekSummaries.slice(0, 2),
    quickCheckIns: quickCheckIns.filter((checkIn) =>
      [activeDate, addDays(activeDate, -1)].includes(checkIn.date),
    ),
  });
  const suggestions = buildReplanSuggestions(summary, settings);
  const editingActivity =
    overlay.kind === "add" && overlay.activityId
      ? activities.find((activity) => activity.id === overlay.activityId)
      : undefined;
  const addActivityMode = overlay.kind === "add" ? overlay.mode ?? "create" : "create";
  const detailActivity =
    overlay.kind === "detail" ? findComputedActivity(summary, overlay.activityId) : undefined;
  const dateLabel = getDayLabel(activeDate);

  const handleSaveActivity = (input: ActivityInput) => {
    upsertActivity(input);
  };

  const handleShareData = async () => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        onboardingProfile,
        settings,
        dailyProfiles,
        activities,
        calibrationEvents,
        quickCheckIns,
      },
      null,
      2,
    );

    try {
      if (Platform.OS === "web" && globalThis.navigator?.clipboard?.writeText) {
        await globalThis.navigator.clipboard.writeText(payload);
        Alert.alert("데이터 복사 완료", "JSON 데이터를 클립보드에 복사했어요.");
        return;
      }

      await Share.share({
        message: payload,
      });
    } catch (error) {
      Alert.alert("공유가 열리지 않았어요", "이 환경에서는 공유 시트 대신 앱 안의 데이터는 그대로 보존돼요.");
    }
  };

  if (!onboardingComplete) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <OnboardingScreen
          theme={theme}
          initialProfile={onboardingProfile}
          onComplete={completeOnboarding}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        {activeTab === "today" ? (
          <TodayScreen
            theme={theme}
            summary={summary}
            learningReport={learningReport}
            dateLabel={dateLabel}
            privacyMode={settings.privacyMode}
            onOpenReplan={openReplan}
            onOpenAddActivity={() => openAddActivity()}
            onOpenQuickCheckIn={openQuickCheckIn}
            onOpenRoughPlan={openRoughPlan}
            onOpenTimeline={() => setActiveTab("timeline")}
            onOpenPatterns={() => setActiveTab("insights")}
            onOpenActivityDetail={openActivityDetail}
          />
        ) : null}
        {activeTab === "timeline" ? (
          <TimelineScreen
            theme={theme}
            summary={summary}
            dateLabel={dateLabel}
            onPrevDay={() => setActiveDate(addDays(activeDate, -1))}
            onNextDay={() => setActiveDate(addDays(activeDate, 1))}
            onOpenAddActivity={() => openAddActivity()}
            onOpenActivityDetail={openActivityDetail}
            onDuplicateActivity={openDuplicateActivity}
          />
        ) : null}
        {activeTab === "insights" ? (
          <InsightScreen
            theme={theme}
            insight={insight}
            learningReport={learningReport}
          />
        ) : null}
        {activeTab === "settings" ? (
          <SettingsScreen
            theme={theme}
            settings={settings}
            quickCheckInCount={quickCheckIns.length}
            onUpdateSettings={updateSettings}
            onResetCalibration={resetCalibration}
            onResetQuickCheckIns={resetQuickCheckIns}
            onShareData={handleShareData}
            onReset={resetPlanner}
          />
        ) : null}
      </View>
      <BottomTabBar activeTab={activeTab} onChange={setActiveTab} theme={theme} />

      <ModalShell visible={overlay.kind === "add"} backgroundColor={theme.colors.background}>
        {overlay.kind === "add" ? (
          <AddActivityScreen
            key={`${addActivityMode}-${editingActivity?.id ?? activeDate}`}
            theme={theme}
            date={editingActivity?.date ?? activeDate}
            initialActivity={editingActivity}
            mode={addActivityMode}
            onClose={closeOverlay}
            onSave={handleSaveActivity}
          />
        ) : null}
      </ModalShell>

      <ModalShell visible={overlay.kind === "quick-check-in"} backgroundColor={theme.colors.background}>
        {overlay.kind === "quick-check-in" ? (
          <QuickCheckInScreen
            theme={theme}
            dateLabel={dateLabel}
            date={activeDate}
            onClose={closeOverlay}
            onSave={submitQuickCheckIn}
          />
        ) : null}
      </ModalShell>

      <ModalShell visible={overlay.kind === "rough-plan"} backgroundColor={theme.colors.background}>
        {overlay.kind === "rough-plan" ? (
          <RoughPlanScreen
            theme={theme}
            dateLabel={dateLabel}
            date={activeDate}
            onClose={closeOverlay}
            onApply={applyRoughPlan}
            onOpenDetailedAdd={() => openAddActivity()}
          />
        ) : null}
      </ModalShell>

      <ModalShell visible={overlay.kind === "detail" && Boolean(detailActivity)} backgroundColor={theme.colors.background}>
        {detailActivity ? (
          <EnergyDetailScreen
            theme={theme}
            activity={detailActivity}
            privacyMode={settings.privacyMode}
            onClose={closeOverlay}
            onFeedback={(feedback) => applyDifficultyFeedback(detailActivity.activity.id, feedback)}
            onEdit={() => openAddActivity(detailActivity.activity.id)}
            onDelete={() => deleteActivity(detailActivity.activity.id)}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: theme.colors.textMuted }}>활동을 찾지 못했어요.</Text>
          </View>
        )}
      </ModalShell>

      <ModalShell visible={overlay.kind === "replan"} backgroundColor={theme.colors.background}>
        <ReplanScreen
          theme={theme}
          summary={summary}
          suggestions={suggestions}
          onClose={closeOverlay}
          onApply={applyReplanSuggestion}
        />
      </ModalShell>
    </View>
  );
}
