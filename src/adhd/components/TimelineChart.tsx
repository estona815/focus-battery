import React from "react";
import { Text, View } from "react-native";

import { ACTIVITY_TYPE_META } from "../constants";
import { AppTheme, ComputedActivity } from "../types";

function getSegmentColor(theme: AppTheme, value: number): string {
  if (value >= 80) {
    return theme.colors.batteryPlenty;
  }
  if (value >= 60) {
    return theme.colors.batterySteady;
  }
  if (value >= 40) {
    return theme.colors.batteryCare;
  }
  if (value >= 20) {
    return theme.colors.batteryCaution;
  }
  return theme.colors.batteryRecover;
}

export function TimelineChart({
  activities,
  theme,
}: {
  activities: ComputedActivity[];
  theme: AppTheme;
}) {
  if (activities.length === 0) {
    return (
      <View
        style={{
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>
          오늘 일정이 아직 없어요. 하나만 넣어도 배터리 흐름을 볼 수 있어요.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {activities.map((entry) => (
        <View key={entry.activity.id} style={{ gap: 6 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.sm,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.typeScale.body,
                fontWeight: "600",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {ACTIVITY_TYPE_META[entry.activity.type].label}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
              {Math.round(entry.startBatteryPct)}% → {Math.round(entry.endBatteryPct)}%
            </Text>
          </View>
          <View
            style={{
              height: 16,
              borderRadius: 999,
              backgroundColor: theme.colors.backgroundAlt,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${entry.endBatteryPct}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: getSegmentColor(theme, entry.endBatteryPct),
              }}
            />
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 18 }}>
            {entry.explanation}
          </Text>
        </View>
      ))}
    </View>
  );
}
