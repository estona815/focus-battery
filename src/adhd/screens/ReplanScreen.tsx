import React from "react";
import { Text, View } from "react-native";

import { describeSuggestionPreview } from "../domain/replanEngine";
import {
  AppCard,
  AppScrollScreen,
  MetricRow,
  PrimaryButton,
  ScreenTitle,
  SecondaryButton,
  WarningCard,
} from "../components/PlannerPrimitives";
import { AppTheme, DayEnergySummary, ReplanSuggestion } from "../types";

export function ReplanScreen({
  theme,
  summary,
  suggestions,
  onClose,
  onApply,
}: {
  theme: AppTheme;
  summary: DayEnergySummary;
  suggestions: ReplanSuggestion[];
  onClose: () => void;
  onApply: (suggestion: ReplanSuggestion) => void;
}) {
  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="다시 맞추기"
        subtitle="잘못된 하루가 아니라, 지금 배터리에 맞게 흐름을 조금만 다시 맞추는 화면이에요."
        theme={theme}
      />

      <AppCard theme={theme}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          지금 흐름 요약
        </Text>
        <MetricRow
          label="하루 끝 예상치"
          value={`${Math.round(summary.currentBatteryPct)}%`}
          hint="숫자가 낮아도 잘못된 하루라는 뜻은 아니에요. 회복 여지가 더 필요하다는 신호에 가까워요."
          theme={theme}
        />
        <MetricRow
          label="조정 포인트"
          value={summary.warnings?.length ? `${summary.warnings.length}개` : "지금은 안정적"}
          hint="제안은 전부 적용할 필요 없어요. 부담이 가장 적은 하나부터 골라도 충분해요."
          theme={theme}
        />
      </AppCard>

      {summary.warnings?.length ? (
        <WarningCard
          title="재정리 전에 보면 좋은 신호"
          subtitle="지금은 해결 과제가 아니라, 흐름을 덜 거칠게 만드는 힌트로 가볍게 봐도 괜찮아요."
          warnings={summary.warnings}
          theme={theme}
        />
      ) : null}

      {suggestions.length === 0 ? (
        <AppCard theme={theme} subtle>
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
            지금은 큰 재정리가 꼭 필요해 보이진 않아요.
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
            오늘은 일정 사이 버퍼만 조금 챙겨도 충분할 가능성이 높아요.
          </Text>
        </AppCard>
      ) : (
        suggestions.map((suggestion) => (
          <AppCard key={suggestion.id} theme={theme}>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
              {suggestion.title}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
              {suggestion.description}
            </Text>
            <View
              style={{
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
                {describeSuggestionPreview(summary, suggestion)}
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 20 }}>
              {suggestion.impact}
            </Text>
            <PrimaryButton
              label="이 방식으로 맞추기"
              accessibilityLabel={`${suggestion.title} 적용`}
              accessibilityHint="이 제안에 맞춰 활동 흐름을 조정해요."
              onPress={() => onApply(suggestion)}
              theme={theme}
            />
          </AppCard>
        ))
      )}

      <SecondaryButton
        label="닫기"
        accessibilityHint="재정리 화면을 닫고 원래 화면으로 돌아가요."
        onPress={onClose}
        theme={theme}
      />
    </AppScrollScreen>
  );
}
