import React, { PropsWithChildren } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { AppTab, AppTheme } from "../types";

type ButtonProps = {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const WARNING_COPY: Record<string, string> = {
  "전환 시간이 부족해요": "일정 사이에 짧은 숨 고르기만 남겨도 다음 활동 진입이 훨씬 부드러워질 수 있어요.",
  "회복 시간이 거의 없어요": "휴식이나 식사 블록을 하나만 확보해도 하루 흐름이 덜 가팔라질 가능성이 있어요.",
  "고소모 일정이 연속되어 있어요": "힘이 많이 드는 일정 사이에 가벼운 활동 하나를 끼워 넣는 방식이 도움이 될 수 있어요.",
  "배터리가 낮은 시간대에 집중 작업이 있어요": "중요한 일은 더 작은 시작 단위로 나누거나, 보호할 한 가지만 남겨도 충분해요.",
  "오늘 필수 일정이 많아요": "오늘은 다 해내는 목표보다 꼭 지키고 싶은 일정 하나를 먼저 고르는 쪽이 더 안전할 수 있어요.",
};

export function AppScrollScreen({
  children,
  theme,
}: PropsWithChildren<{ theme: AppTheme }>) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -88,
          right: -44,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: theme.colors.accent,
          opacity: theme.isDark ? 0.12 : 0.14,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 164,
          left: -70,
          width: 190,
          height: 190,
          borderRadius: 999,
          backgroundColor: theme.colors.backgroundAlt,
          opacity: theme.isDark ? 0.46 : 0.72,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl,
            flexGrow: 1,
          }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: "100%", maxWidth: 560, alignSelf: "center", gap: theme.spacing.lg }}>
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function AppCard({
  children,
  theme,
  subtle = false,
}: PropsWithChildren<{ theme: AppTheme; subtle?: boolean }>) {
  return (
    <View
      style={{
        overflow: "hidden",
        backgroundColor: subtle ? theme.colors.surfaceMuted : theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: subtle ? theme.colors.backgroundAlt : theme.colors.border,
        gap: theme.spacing.sm,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: theme.isDark ? 0.34 : 0.09,
        shadowRadius: 28,
        elevation: theme.isDark ? 12 : 5,
        boxShadow: `0px 18px 42px ${theme.colors.shadow}`,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: subtle ? theme.colors.border : theme.colors.accent,
          opacity: theme.isDark ? 0.82 : 0.48,
        }}
      />
      {children}
    </View>
  );
}

export function ScreenTitle({
  title,
  subtitle,
  theme,
}: {
  title: string;
  subtitle: string;
  theme: AppTheme;
}) {
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: theme.colors.accent,
          }}
        />
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typeScale.caption,
            fontWeight: "700",
            letterSpacing: 0.6,
          }}
        >
          FOCUS BATTERY LOG
        </Text>
      </View>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typeScale.title,
          fontWeight: "800",
          letterSpacing: -0.6,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: theme.typeScale.body,
          lineHeight: 24,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onPress,
  theme,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPress?: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typeScale.section,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typeScale.caption,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onPress}
          hitSlop={10}
          style={({ pressed }) => ({
            minHeight: 42,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radius.pill,
            backgroundColor: pressed ? theme.colors.backgroundAlt : theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: theme.typeScale.caption,
              fontWeight: "700",
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PillButton({
  label,
  selected,
  onPress,
  theme,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps & {
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        minHeight: 46,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        opacity: pressed ? 0.82 : 1,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <Text
        style={{
          color: selected ? theme.colors.accent : theme.colors.text,
          fontSize: theme.typeScale.body,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  theme,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.accent,
        borderWidth: 1,
        borderColor: theme.colors.accent,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        opacity: pressed ? 0.86 : 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: theme.isDark ? 0.18 : 0.08,
        shadowRadius: 18,
        elevation: theme.isDark ? 8 : 3,
        boxShadow: `0px 10px 22px ${theme.colors.shadow}`,
      })}
    >
      <Text
        style={{
          color: theme.isDark ? theme.colors.background : "#fffdf8",
          fontSize: theme.typeScale.bodyStrong,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  theme,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        opacity: pressed ? 0.82 : 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typeScale.bodyStrong,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MetricRow({
  label,
  value,
  hint,
  theme,
}: {
  label: string;
  value: string;
  hint?: string;
  theme: AppTheme;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.metricRow}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>{label}</Text>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
          {value}
        </Text>
      </View>
      {hint ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function WarningCard({
  title = "먼저 살펴볼 신호",
  subtitle = "한 번에 다 바꾸지 않아도 괜찮아요. 가장 부담이 적은 조정 하나만 골라도 충분해요.",
  warnings,
  theme,
}: {
  title?: string;
  subtitle?: string;
  warnings: string[];
  theme: AppTheme;
}) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityLabel={`주의할 흐름 ${warnings.length}개`}
      style={{
        overflow: "hidden",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.warning,
        gap: theme.spacing.sm,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: theme.isDark ? 0.2 : 0.05,
        shadowRadius: 20,
        elevation: theme.isDark ? 7 : 3,
        boxShadow: `0px 12px 24px ${theme.colors.shadow}`,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: theme.colors.warning,
          opacity: 0.84,
        }}
      />
      <View style={{ gap: theme.spacing.xs }}>
        <Text
          style={{
            color: theme.colors.warning,
            fontSize: theme.typeScale.caption,
            fontWeight: "800",
            letterSpacing: 0.8,
          }}
        >
          SOFT WARNING
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typeScale.section,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typeScale.body,
            lineHeight: 22,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        {warnings.map((warning) => (
          <View
            key={warning}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: theme.spacing.sm,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                marginTop: 6,
                backgroundColor: theme.colors.warning,
              }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.typeScale.bodyStrong,
                  fontWeight: "700",
                }}
              >
                {warning}
              </Text>
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.typeScale.caption,
                  lineHeight: 20,
                }}
              >
                {WARNING_COPY[warning] ??
                  "조금만 순서를 바꾸거나 회복 시간을 더해도 흐름이 부드러워질 수 있어요."}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function LoadScaleRow({
  label,
  value,
  onChange,
  theme,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  theme: AppTheme;
}) {
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.body }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: theme.spacing.xs, flexWrap: "wrap" }}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <PillButton
            key={`${label}-${item}`}
            label={`${item}`}
            selected={item === value}
            onPress={() => onChange(item)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
  theme,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.metricRow, { alignItems: "flex-start" }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "600" }}>
          {label}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>{hint}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.accentSoft }}
        thumbColor={value ? theme.colors.accent : theme.colors.surface}
      />
    </View>
  );
}

export function BottomTabBar({
  activeTab,
  onChange,
  theme,
}: {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
  theme: AppTheme;
}) {
  const tabs: Array<{ id: AppTab; label: string }> = [
    { id: "today", label: "오늘" },
    { id: "timeline", label: "흐름" },
    { id: "insights", label: "패턴" },
    { id: "settings", label: "설정" },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: theme.spacing.md,
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xl,
          paddingHorizontal: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          gap: theme.spacing.xs,
          backgroundColor: theme.colors.surface,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: theme.isDark ? 0.2 : 0.06,
          shadowRadius: 18,
          elevation: theme.isDark ? 8 : 3,
          boxShadow: `0px 10px 22px ${theme.colors.shadow}`,
        }}
      >
        {tabs.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              onPress={() => onChange(tab.id)}
              hitSlop={8}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                borderRadius: theme.radius.md,
                paddingVertical: theme.spacing.sm,
                backgroundColor: selected ? theme.colors.accentSoft : "transparent",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: selected ? theme.colors.accent : theme.colors.textMuted,
                  fontSize: theme.typeScale.caption,
                  fontWeight: selected ? "700" : "600",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
