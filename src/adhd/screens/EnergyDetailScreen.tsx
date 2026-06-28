import React from "react";
import { Alert, Text, View } from "react-native";

import { ACTIVITY_TYPE_META, LOAD_LABELS } from "../constants";
import {
  AppCard,
  AppScrollScreen,
  MetricRow,
  PillButton,
  PrimaryButton,
  ScreenTitle,
  SecondaryButton,
} from "../components/PlannerPrimitives";
import { AppTheme, ComputedActivity, DifficultyFeedback } from "../types";
import { getRangeLabel } from "../utils/dateTime";

const feedbackOptions: Array<{ id: DifficultyFeedback; label: string }> = [
  { id: "much_harder", label: "예상보다 훨씬 힘들었음" },
  { id: "harder", label: "예상보다 좀 더 힘들었음" },
  { id: "accurate", label: "거의 같았음" },
  { id: "easier", label: "예상보다 덜 힘들었음" },
  { id: "recovered", label: "거의 회복됐음" },
];

export function EnergyDetailScreen({
  theme,
  activity,
  privacyMode,
  onClose,
  onFeedback,
  onEdit,
  onDelete,
}: {
  theme: AppTheme;
  activity: ComputedActivity;
  privacyMode: boolean;
  onClose: () => void;
  onFeedback: (feedback: DifficultyFeedback) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="에너지 상세"
        subtitle="왜 줄었는지, 그리고 실제 체감이 어땠는지 짧게 남길 수 있어요."
        theme={theme}
      />

      <AppCard theme={theme}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          {activity.activity.title}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>
          {getRangeLabel(activity.activity.startAt, activity.activity.endAt)} · {ACTIVITY_TYPE_META[activity.activity.type].label}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          {activity.explanation}
        </Text>
        {activity.flags.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
            {activity.flags.map((flag) => (
              <View
                key={flag}
                style={{
                  borderRadius: theme.radius.pill,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  backgroundColor: theme.colors.surfaceMuted,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
                  {flag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <MetricRow
          label="배터리 변화"
          value={`${Math.round(activity.startBatteryPct)}% → ${Math.round(activity.endBatteryPct)}%`}
          theme={theme}
        />
        <MetricRow
          label="전환 비용"
          value={`${activity.transitionCostPoints.toFixed(1)}pt`}
          hint={activity.gapBeforeMinutes !== undefined ? `앞 일정과 간격 ${activity.gapBeforeMinutes}분` : "첫 일정이라 전환 비용이 적어요."}
          theme={theme}
        />
        <MetricRow
          label="회복량"
          value={`${activity.recoveryPoints.toFixed(1)}pt`}
          hint={ACTIVITY_TYPE_META[activity.activity.type].detailHint}
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme} subtle>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
          어떤 요소가 컸나요
        </Text>
        <View style={{ gap: theme.spacing.sm }}>
          {Object.entries(LOAD_LABELS).map(([field, label]) => (
            <MetricRow
              key={field}
              label={label}
              value={`${activity.activity[field as keyof typeof activity.activity] as number}/5`}
              theme={theme}
            />
          ))}
        </View>
        {privacyMode ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
            개인정보 보호 모드에서는 메모 노출을 줄였어요.
          </Text>
        ) : activity.activity.notes ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>
            메모: {activity.activity.notes}
          </Text>
        ) : null}
      </AppCard>

      <AppCard theme={theme}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
          실제 체감 보정
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          남긴 피드백은 다음 비슷한 활동 예측에 조금씩 반영돼요.
        </Text>
        <View style={{ gap: theme.spacing.xs }}>
          {feedbackOptions.map((option) => (
            <PillButton
              key={option.id}
              label={option.label}
              selected={activity.activity.actualDifficultyFeedback === option.id}
              accessibilityLabel={option.label}
              accessibilityHint="이 활동이 실제로 얼마나 힘들었는지 남겨 다음 예측에 반영해요."
              onPress={() => onFeedback(option.id)}
              theme={theme}
            />
          ))}
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <SecondaryButton
            label="닫기"
            accessibilityHint="에너지 상세 화면을 닫고 이전 화면으로 돌아가요."
            onPress={onClose}
            theme={theme}
          />
        </View>
        <View style={{ flex: 1 }}>
          <SecondaryButton
            label="수정"
            accessibilityHint="이 활동의 시간이나 부담도를 다시 조정해요."
            onPress={onEdit}
            theme={theme}
          />
        </View>
      </View>

      <PrimaryButton
        label="활동 삭제"
        accessibilityHint="현재 활동을 일정에서 제거해요."
        onPress={() =>
          Alert.alert("활동 삭제", "이 활동을 일정에서 지울까요?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: onDelete },
          ])
        }
        theme={theme}
      />
    </AppScrollScreen>
  );
}
