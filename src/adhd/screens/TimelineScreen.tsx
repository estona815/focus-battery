import React from "react";
import { Pressable, Text, View } from "react-native";

import { ACTIVITY_TYPE_META } from "../constants";
import {
  AppCard,
  AppScrollScreen,
  MetricRow,
  PrimaryButton,
  SecondaryButton,
  ScreenTitle,
  SectionHeader,
  WarningCard,
} from "../components/PlannerPrimitives";
import { TimelineChart } from "../components/TimelineChart";
import { AppTheme, DayEnergySummary } from "../types";
import { getRangeLabel } from "../utils/dateTime";

export function TimelineScreen({
  theme,
  summary,
  dateLabel,
  onPrevDay,
  onNextDay,
  onOpenAddActivity,
  onOpenActivityDetail,
  onDuplicateActivity,
}: {
  theme: AppTheme;
  summary: DayEnergySummary;
  dateLabel: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenAddActivity: () => void;
  onOpenActivityDetail: (activityId: string) => void;
  onDuplicateActivity: (activityId: string) => void;
}) {
  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="배터리 로그"
        subtitle="하루가 어디서 무거워지고 어디서 풀리는지, 전환 구간까지 차분하게 따라가 볼 수 있어요."
        theme={theme}
      />

      <AppCard theme={theme}>
        <SectionHeader
          title={dateLabel}
          subtitle="전날과 다음날 결까지 넘겨보며 비교할 수 있어요."
          actionLabel="새 활동"
          onPress={onOpenAddActivity}
          theme={theme}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {[
            { label: "활동 수", value: `${summary.activities.length}개` },
            { label: "마지막 예상", value: `${Math.round(summary.currentBatteryPct)}%` },
            {
              label: "주의 신호",
              value: summary.warnings?.length ? `${summary.warnings.length}개` : "안정적",
            },
          ].map((item) => (
            <View
              key={item.label}
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
                {item.label} · {item.value}
              </Text>
            </View>
          ))}
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          일정이 많아도 다 손볼 필요는 없어요. 갑자기 꺾이는 구간 하나만 먼저 보면 돼요.
        </Text>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="이전 로그"
              accessibilityHint="하루 전 타임라인으로 이동해요."
              onPress={onPrevDay}
              theme={theme}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="다음 로그"
              accessibilityHint="하루 뒤 타임라인으로 이동해요."
              onPress={onNextDay}
              theme={theme}
            />
          </View>
        </View>
      </AppCard>

      {summary.warnings?.length ? (
        <WarningCard
          title="타임라인에서 먼저 볼 신호"
          subtitle="전부 해결하려고 하지 않아도 괜찮아요. 일정 사이 숨 고르기부터 하나씩 보면 충분해요."
          warnings={summary.warnings}
          theme={theme}
        />
      ) : null}

      <AppCard theme={theme}>
        <SectionHeader title="배터리 흐름" subtitle="갑자기 꺾이는 구간은 전환 비용과 부담도를 같이 봐요." theme={theme} />
        <TimelineChart activities={summary.activities} theme={theme} />
        <MetricRow
          label="마지막 배터리"
          value={`${Math.round(summary.currentBatteryPct)}%`}
          hint="낮은 구간이 반복되면 회복 블록이나 전환 버퍼를 먼저 끼워 넣는 편이 좋아요."
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader title="일정 카드" subtitle="카드를 누르면 왜 내려갔는지, 어디서 풀렸는지 자세히 볼 수 있어요." theme={theme} />
        {summary.activities.map((entry) => (
          <View
            key={entry.activity.id}
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: theme.spacing.xs,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${entry.activity.title} 상세 보기`}
              accessibilityHint="활동별 배터리 변화 이유를 확인해요."
              onPress={() => onOpenActivityDetail(entry.activity.id)}
              style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1, gap: theme.spacing.xs })}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.sm }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                    {entry.activity.title}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
                    {getRangeLabel(entry.activity.startAt, entry.activity.endAt)} · {ACTIVITY_TYPE_META[entry.activity.type].label}
                  </Text>
                </View>
                <Text
                  style={{
                    color: entry.netDeltaPct <= 0 ? theme.colors.text : theme.colors.success,
                    fontSize: theme.typeScale.bodyStrong,
                    fontWeight: "700",
                  }}
                >
                  {entry.netDeltaPct > 0 ? "+" : ""}
                  {Math.round(entry.netDeltaPct)}%
                </Text>
              </View>
            </Pressable>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 20 }}>
              {entry.explanation}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
              {entry.flags.map((flag) => (
                <View
                  key={`${entry.activity.id}-${flag}`}
                  style={{
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
                    {flag}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  label="복제해서 수정"
                  accessibilityLabel={`${entry.activity.title} 복제 후 수정`}
                  accessibilityHint="복사본을 열어 시간을 바로 바꾼 뒤 새 활동으로 저장해요."
                  onPress={() => onDuplicateActivity(entry.activity.id)}
                  theme={theme}
                />
              </View>
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  label="열기"
                  accessibilityLabel={`${entry.activity.title} 열기`}
                  accessibilityHint="활동 상세 화면을 열어요."
                  onPress={() => onOpenActivityDetail(entry.activity.id)}
                  theme={theme}
                />
              </View>
            </View>
          </View>
        ))}
        {summary.activities.length === 0 ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>
            아직 일정이 없어요. 활동을 하나 추가하면 이 화면이 채워져요.
          </Text>
        ) : null}
      </AppCard>
    </AppScrollScreen>
  );
}
