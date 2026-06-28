import React from "react";
import { Text, View } from "react-native";

import { ACTIVITY_TYPE_META, ENERGY_WINDOW_LABELS } from "../constants";
import { AppCard, AppScrollScreen, MetricRow, ScreenTitle, SectionHeader } from "../components/PlannerPrimitives";
import { AppTheme, LearningReport, WeeklyInsight } from "../types";

export function InsightScreen({
  theme,
  insight,
  learningReport,
}: {
  theme: AppTheme;
  insight: WeeklyInsight;
  learningReport: LearningReport;
}) {
  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="패턴"
        subtitle="최근 48시간 기준으로 읽은 흐름을 먼저 보여주고, 그 아래에서 주간 리듬을 가볍게 돌아봐요."
        theme={theme}
      />

      <AppCard theme={theme} subtle>
        <SectionHeader
          title="최근 48시간"
          subtitle="확정 진단이 아니라 최근 입력 기반 보조 추정이에요."
          theme={theme}
        />
        <MetricRow
          label="패턴 신뢰도"
          value={`${learningReport.confidencePct}%`}
          hint={learningReport.checkInPrompt}
          theme={theme}
        />
        <MetricRow
          label="보호 시간대"
          value={ENERGY_WINDOW_LABELS[learningReport.protectWindow]}
          hint={learningReport.protectBody}
          theme={theme}
        />
        <MetricRow
          label="회복 신호"
          value={ENERGY_WINDOW_LABELS[learningReport.recoveryWindow]}
          hint={learningReport.suggestedRecoveryBody}
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          {learningReport.topPatternTitle}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          {learningReport.topPatternBody}
        </Text>
        <View style={{ gap: theme.spacing.sm }}>
          {learningReport.overloadedTypes.slice(0, 2).map((type) => (
            <View
              key={type}
              style={{
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceMuted,
                padding: theme.spacing.md,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                {ACTIVITY_TYPE_META[type].label}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 20 }}>
                최근 입력에서 소모가 크게 붙은 편이에요.
              </Text>
            </View>
          ))}
          {learningReport.helpfulTypes.slice(0, 2).map((type) => (
            <View
              key={`helpful-${type}`}
              style={{
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceMuted,
                padding: theme.spacing.md,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                {ACTIVITY_TYPE_META[type].label}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 20 }}>
                회복 흐름이나 안정 신호로 더 자주 잡히고 있어요.
              </Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="주간 리듬"
          subtitle="최근 48시간보다 넓게 보면 이런 흐름이 있었어요."
          theme={theme}
        />
        <MetricRow
          label="가장 안정적인 시간대"
          value={ENERGY_WINDOW_LABELS[insight.strongestWindow]}
          hint="중요한 일정은 이 시간대에 더 쉽게 버틴 편이에요."
          theme={theme}
        />
        <MetricRow
          label="주간 종료 평균"
          value={`${Math.round(insight.averageEndBattery)}%`}
          hint={insight.note}
          theme={theme}
        />
        <MetricRow
          label="회복 도움률"
          value={`${Math.round(insight.recoveryWinRate)}%`}
          hint="휴식이나 식사가 실제 회복으로 이어진 비율이에요."
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          시간대별 마무리 배터리
        </Text>
        <View style={{ gap: theme.spacing.sm }}>
          {insight.windowAverages.map((item) => (
            <MetricRow
              key={item.window}
              label={ENERGY_WINDOW_LABELS[item.window]}
              value={`${Math.round(item.averageEndBattery)}%`}
              theme={theme}
            />
          ))}
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
          버퍼가 짧았던 구간은 이번 주에 {insight.bufferStressCount}번 있었어요.
        </Text>
      </AppCard>
    </AppScrollScreen>
  );
}
