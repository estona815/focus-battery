import React from "react";
import { Pressable, Text, View } from "react-native";

import { ACTIVITY_TYPE_META, BATTERY_STATE_LABELS, ENERGY_WINDOW_LABELS } from "../constants";
import { BatteryGauge } from "../components/BatteryGauge";
import {
  AppCard,
  AppScrollScreen,
  PrimaryButton,
  ScreenTitle,
  SectionHeader,
  SecondaryButton,
  WarningCard,
} from "../components/PlannerPrimitives";
import { getStatusMessage } from "../domain/energyCalculator";
import { AppTheme, DayEnergySummary, LearningReport } from "../types";
import { getRangeLabel } from "../utils/dateTime";

function getNowAnchor(summary: DayEnergySummary) {
  const now = Date.now();
  const currentOrUpcoming = summary.activities.find(
    (entry) => new Date(entry.activity.endAt).getTime() >= now,
  );
  if (currentOrUpcoming) {
    return { entry: currentOrUpcoming, isRecap: false };
  }

  const lastActivity = summary.activities.at(-1);
  if (!lastActivity) {
    return undefined;
  }

  return { entry: lastActivity, isRecap: true };
}

function getLearningStateCopy(report: LearningReport) {
  if (report.state === "ready") {
    return {
      label: `패턴 감지 ${report.confidencePct}%`,
      title: report.topPatternTitle,
      body: report.topPatternBody,
    };
  }

  if (report.state === "learning") {
    return {
      label: `학습 중 ${report.confidencePct}%`,
      title: "최근 48시간에서 흐름을 읽는 중이에요",
      body: report.checkInPrompt,
    };
  }

  return {
    label: "학습 시작",
    title: "정확하게 적지 않아도 괜찮아요",
    body: "활동 하나나 체크인 한 번만 있어도 배터리 흐름을 배우기 시작해요.",
  };
}

export function TodayScreen({
  theme,
  summary,
  learningReport,
  dateLabel,
  privacyMode,
  onOpenReplan,
  onOpenAddActivity,
  onOpenQuickCheckIn,
  onOpenRoughPlan,
  onOpenTimeline,
  onOpenPatterns,
  onOpenActivityDetail,
}: {
  theme: AppTheme;
  summary: DayEnergySummary;
  learningReport: LearningReport;
  dateLabel: string;
  privacyMode: boolean;
  onOpenReplan: () => void;
  onOpenAddActivity: () => void;
  onOpenQuickCheckIn: () => void;
  onOpenRoughPlan: () => void;
  onOpenTimeline: () => void;
  onOpenPatterns: () => void;
  onOpenActivityDetail: (activityId: string) => void;
}) {
  const anchor = getNowAnchor(summary);
  const warningCount = summary.warnings?.length ?? 0;
  const learningCopy = getLearningStateCopy(learningReport);

  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="오늘 배터리"
        subtitle={`${dateLabel} · 완성된 시간표보다 지금 결부터 보고, 하루는 필요한 만큼만 맞춰봐요.`}
        theme={theme}
      />

      <AppCard theme={theme} subtle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {[
            `학습 ${learningCopy.label}`,
            `활동 ${summary.activities.length}개`,
            `체크인 ${learningReport.quickCheckInCount}번`,
          ].map((label) => (
            <View
              key={label}
              style={{
                borderRadius: theme.radius.pill,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>{label}</Text>
            </View>
          ))}
        </View>
        <BatteryGauge
          batteryPct={summary.currentBatteryPct}
          state={summary.state}
          theme={theme}
          privacyMode={privacyMode}
        />
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          {getStatusMessage(summary.state)}
        </Text>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typeScale.body,
            lineHeight: 24,
          }}
        >
          지금 결은 {BATTERY_STATE_LABELS[summary.state]} 쪽이에요. 많이 해내는 날보다, 흐름이 덜 끊기는 날을 먼저 만드는 편이 더 오래 가요.
        </Text>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: 4,
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>지금 우선</Text>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
              {warningCount > 0 ? "회복 먼저" : "한 가지만 밀기"}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: 4,
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>최근 결</Text>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
              {learningReport.state === "ready" ? "패턴 읽힘" : "아직 배우는 중"}
            </Text>
          </View>
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="지금 넣기"
          subtitle="긴 기록보다 10초 입력이나 한 줄 로그부터 먼저 열어둘게요."
          theme={theme}
        />
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="지금 체크"
              accessibilityHint="지금 상태를 10초 안에 남겨요."
              onPress={onOpenQuickCheckIn}
              theme={theme}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SecondaryButton
              label="한 줄 로그"
              accessibilityHint="거친 문장으로 오늘 흐름을 활동 블록으로 바꿔요."
              onPress={onOpenRoughPlan}
              theme={theme}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <SecondaryButton
              label="직접 입력"
              accessibilityHint="활동 추가 화면에서 직접 세부 입력해요."
              onPress={onOpenAddActivity}
              theme={theme}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SecondaryButton
              label="다시 맞추기"
              accessibilityHint="지금 배터리에 맞는 재정리 제안을 열어요."
              onPress={onOpenReplan}
              theme={theme}
            />
          </View>
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="최근 48시간 로그"
          subtitle={learningReport.state === "ready" ? "확정 아님 · 최근 입력 기준 보조 추정이에요." : "조금만 더 쌓이면 흐름 문장이 더 또렷해져요."}
          actionLabel="전체 패턴"
          onPress={onOpenPatterns}
          theme={theme}
        />
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          {learningCopy.title}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          {learningCopy.body}
        </Text>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>집중 보호</Text>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
              {ENERGY_WINDOW_LABELS[learningReport.protectWindow]}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>급락 주의</Text>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
              {ENERGY_WINDOW_LABELS[learningReport.dipWindow]}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>회복 신호</Text>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
              {ENERGY_WINDOW_LABELS[learningReport.recoveryWindow]}
            </Text>
          </View>
        </View>
      </AppCard>

      <AppCard theme={theme} subtle>
        <SectionHeader title="오늘 하나만" subtitle="전부 정리하지 않아도 돼요. 하나만 지켜도 충분해요." theme={theme} />
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          {learningReport.protectTitle}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          {learningReport.protectBody}
        </Text>
        <View
          style={{
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
            {learningReport.suggestedRecoveryTitle}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 20 }}>
            {learningReport.suggestedRecoveryBody}
          </Text>
        </View>
      </AppCard>

      {summary.warnings?.length ? (
        <WarningCard
          title="오늘 먼저 볼 신호"
          subtitle="망한 일정표가 아니라, 흐름 덜 끊기게 만드는 힌트예요. 가장 가벼운 수정 하나만 골라도 충분해요."
          warnings={summary.warnings}
          theme={theme}
        />
      ) : null}

      {anchor?.entry ? (
        <AppCard theme={theme}>
          <SectionHeader
            title={anchor.isRecap ? "방금 지나간 흐름" : "다음 결"}
            subtitle={anchor.isRecap ? "오늘 마무리 결을 짧게 확인해봐요." : "왜 내려가거나 회복되는지 한 번에 볼 수 있어요."}
            theme={theme}
          />
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
            {anchor.entry.activity.title}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
            {getRangeLabel(anchor.entry.activity.startAt, anchor.entry.activity.endAt)} · {ACTIVITY_TYPE_META[anchor.entry.activity.type].label}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
            {anchor.entry.explanation}
          </Text>
          <PrimaryButton
            label="상세 보기"
            accessibilityHint="현재 활동의 배터리 변화를 자세히 열어봐요."
            onPress={() => onOpenActivityDetail(anchor.entry.activity.id)}
            theme={theme}
          />
        </AppCard>
      ) : null}

      <AppCard theme={theme}>
        <SectionHeader
          title="오늘 로그 미리보기"
          subtitle={warningCount > 0 ? `조정 포인트 ${warningCount}개가 보여요.` : "지금은 비교적 차분하게 이어질 가능성이 보여요."}
          actionLabel="전체 흐름"
          onPress={onOpenTimeline}
          theme={theme}
        />
        {summary.activities.slice(0, 3).map((entry) => (
          <View
            key={entry.activity.id}
            style={{
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: "hidden",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${entry.activity.title} 상세 보기`}
              accessibilityHint="시간대와 배터리 변화 이유를 확인해요."
              onPress={() => onOpenActivityDetail(entry.activity.id)}
              style={({ pressed }) => ({
                gap: 4,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.md,
                opacity: pressed ? 0.82 : 1,
              })}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                {entry.activity.title}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
                {getRangeLabel(entry.activity.startAt, entry.activity.endAt)} · {Math.round(entry.startBatteryPct)}% → {Math.round(entry.endBatteryPct)}%
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 20 }}>
                {entry.explanation}
              </Text>
            </Pressable>
          </View>
        ))}
        {summary.activities.length === 0 ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
            아직 일정이 없어도 괜찮아요. 빠른 체크인이나 대충 적기부터 먼저 시작할 수 있어요.
          </Text>
        ) : null}
      </AppCard>
    </AppScrollScreen>
  );
}
