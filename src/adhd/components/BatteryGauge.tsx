import React from "react";
import { Text, View } from "react-native";

import { BATTERY_STATE_LABELS } from "../constants";
import { AppTheme, BatteryState } from "../types";

function getStateColor(theme: AppTheme, state: BatteryState): string {
  switch (state) {
    case "plenty":
      return theme.colors.batteryPlenty;
    case "steady":
      return theme.colors.batterySteady;
    case "care":
      return theme.colors.batteryCare;
    case "caution":
      return theme.colors.batteryCaution;
    case "recover":
      return theme.colors.batteryRecover;
  }
}

export function BatteryGauge({
  batteryPct,
  state,
  theme,
  privacyMode,
}: {
  batteryPct: number;
  state: BatteryState;
  theme: AppTheme;
  privacyMode: boolean;
}) {
  const fillHeight = `${Math.max(8, Math.round(batteryPct))}%` as `${number}%`;
  const stateColor = getStateColor(theme, state);
  const visiblePct = privacyMode ? `${Math.round(batteryPct / 10) * 10}%` : `${Math.round(batteryPct)}%`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`오늘 배터리 ${visiblePct}, ${BATTERY_STATE_LABELS[state]}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.lg,
      }}
    >
      <View
        style={{
          width: 112,
          height: 212,
          borderRadius: 32,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 10,
          backgroundColor: theme.colors.surface,
          justifyContent: "flex-end",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: theme.isDark ? 0.24 : 0.06,
          shadowRadius: 18,
          elevation: theme.isDark ? 8 : 2,
          boxShadow: `0px 10px 20px ${theme.colors.shadow}`,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -10,
            alignSelf: "center",
            width: 40,
            height: 10,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            backgroundColor: theme.colors.backgroundAlt,
          }}
        />
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            overflow: "hidden",
            justifyContent: "flex-end",
            backgroundColor: theme.colors.backgroundAlt,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              right: 14,
              height: 1,
              backgroundColor: theme.colors.border,
              opacity: 0.8,
            }}
          />
          <View
            style={{
              height: fillHeight,
              borderRadius: 24,
              backgroundColor: stateColor,
              padding: theme.spacing.md,
              justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.isDark ? theme.colors.background : "#fffdf8",
                  fontSize: theme.typeScale.caption,
                  fontWeight: "700",
                  letterSpacing: 0.4,
                }}
              >
              LOG
            </Text>
            <Text
              style={{
                color: theme.isDark ? theme.colors.background : "#fffdf8",
                fontSize: theme.typeScale.bodyStrong,
                fontWeight: "800",
              }}
            >
              {visiblePct}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, gap: theme.spacing.sm }}>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typeScale.caption,
            fontWeight: "800",
            letterSpacing: 0.7,
          }}
        >
          TODAY STATUS
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typeScale.hero,
            fontWeight: "800",
            letterSpacing: -1,
          }}
        >
          {visiblePct}
        </Text>
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceMuted,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
          }}
        >
          <Text
            style={{
              color: stateColor,
              fontSize: theme.typeScale.bodyStrong,
              fontWeight: "700",
            }}
          >
            {BATTERY_STATE_LABELS[state]}
          </Text>
        </View>
      </View>
    </View>
  );
}
