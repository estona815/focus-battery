import React from "react";
import { Alert, Text, View } from "react-native";

import { NOTIFICATION_STYLE_LABELS } from "../constants";
import {
  AppCard,
  AppScrollScreen,
  MetricRow,
  PillButton,
  PrimaryButton,
  ScreenTitle,
  SectionHeader,
  SecondaryButton,
  ToggleRow,
} from "../components/PlannerPrimitives";
import { AppTheme, NotificationStyle, ThemeMode, UserEnergySettings } from "../types";

const themeModes: Array<{ id: ThemeMode; label: string }> = [
  { id: "system", label: "자동" },
  { id: "light", label: "낮" },
  { id: "dark", label: "새벽" },
];

const sensitivityPresets = [
  { value: 0.9, label: "낮게" },
  { value: 1, label: "기본" },
  { value: 1.15, label: "높게" },
];

const sensitivityKeys: Array<
  [
    "cognitiveSensitivity" | "socialSensitivity" | "sensorySensitivity" | "recoverySensitivity",
    string,
  ]
> = [
  ["cognitiveSensitivity", "집중 민감도"],
  ["socialSensitivity", "사회 민감도"],
  ["sensorySensitivity", "감각 민감도"],
  ["recoverySensitivity", "회복 민감도"],
];

export function SettingsScreen({
  theme,
  settings,
  quickCheckInCount,
  onUpdateSettings,
  onShareData,
  onResetCalibration,
  onResetQuickCheckIns,
  onReset,
}: {
  theme: AppTheme;
  settings: UserEnergySettings;
  quickCheckInCount: number;
  onUpdateSettings: (patch: Partial<UserEnergySettings>) => void;
  onShareData: () => void;
  onResetCalibration: () => void;
  onResetQuickCheckIns: () => void;
  onReset: () => void;
}) {
  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="설정"
        subtitle="무드를 바꾸고, 배우는 범위를 줄이고, 언제든 다시 비울 수 있는지를 먼저 보여줄게요."
        theme={theme}
      />

      <AppCard theme={theme} subtle>
        <SectionHeader
          title="지금 배우는 범위"
          subtitle="민감한 기록을 길게 남기지 않아도 흐름을 읽을 수 있게 설계했어요."
          theme={theme}
        />
        <MetricRow
          label="빠른 체크인"
          value={`${quickCheckInCount}개`}
          hint="현재 상태를 짧게 남긴 기록이에요. 최근 48시간 패턴 문장에만 사용돼요."
          theme={theme}
        />
        <MetricRow
          label="개인정보 보호"
          value={settings.privacyMode ? "보호 중" : "일반 보기"}
          hint="민감한 순간에는 메모와 수치 노출을 더 줄일 수 있어요."
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="화면 무드"
          subtitle="밝기와 자극 강도를 지금 컨디션에 맞춰 바로 낮출 수 있어요."
          theme={theme}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {themeModes.map((mode) => (
            <PillButton
              key={mode.id}
              label={mode.label}
              selected={settings.themeMode === mode.id}
              accessibilityLabel={`${mode.label} 화면 모드`}
              onPress={() => onUpdateSettings({ themeMode: mode.id })}
              theme={theme}
            />
          ))}
        </View>
        <ToggleRow
          label="저자극 모드"
          hint="배경 대비와 그림자, 장식 강도를 낮춰요."
          value={settings.lowStimMode}
          onValueChange={(value) => onUpdateSettings({ lowStimMode: value })}
          theme={theme}
        />
        <ToggleRow
          label="동작 줄이기"
          hint="모션을 거의 사용하지 않는 쪽으로 맞춰요."
          value={settings.reduceMotion}
          onValueChange={(value) => onUpdateSettings({ reduceMotion: value })}
          theme={theme}
        />
        <ToggleRow
          label="개인정보 보호 모드"
          hint="정확한 수치와 메모 노출을 조금 더 줄여요."
          value={settings.privacyMode}
          onValueChange={(value) => onUpdateSettings({ privacyMode: value })}
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="전환과 알림"
          subtitle="일정 사이 숨 고르기와 알림 결을 지금 상태에 맞춰둘 수 있어요."
          theme={theme}
        />
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>기본 전환 시간</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {[10, 15, 20, 30].map((value) => (
            <PillButton
              key={value}
              label={`${value}분`}
              selected={settings.defaultTransitionBuffer === value}
              accessibilityLabel={`기본 전환 시간 ${value}분`}
              onPress={() => onUpdateSettings({ defaultTransitionBuffer: value })}
              theme={theme}
            />
          ))}
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>알림 강도</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {(Object.keys(NOTIFICATION_STYLE_LABELS) as NotificationStyle[]).map((style) => (
            <PillButton
              key={style}
              label={NOTIFICATION_STYLE_LABELS[style]}
              selected={settings.notificationStyle === style}
              accessibilityLabel={`${NOTIFICATION_STYLE_LABELS[style]} 알림 강도`}
              onPress={() => onUpdateSettings({ notificationStyle: style })}
              theme={theme}
            />
          ))}
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="민감도"
          subtitle="특히 잘 흔들리는 축만 먼저 조절해도 충분해요."
          theme={theme}
        />
        {sensitivityKeys.map(([key, label]) => (
          <View key={key} style={{ gap: theme.spacing.xs }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "600" }}>
              {label}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
              {sensitivityPresets.map((preset) => (
                <PillButton
                  key={`${key}-${preset.value}`}
                  label={preset.label}
                  selected={settings[key as keyof UserEnergySettings] === preset.value}
                  accessibilityLabel={`${label} ${preset.label}`}
                  onPress={() => onUpdateSettings({ [key]: preset.value } as Partial<UserEnergySettings>)}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard theme={theme} subtle>
        <SectionHeader
          title="데이터"
          subtitle="기본 구조는 기기 안에서만 저장돼요. 원할 때만 직접 꺼내고 다시 비울 수 있어요."
          theme={theme}
        />
        <SecondaryButton
          label="빠른 체크인 초기화"
          accessibilityHint="짧게 남긴 상태 기록만 지워요."
          onPress={() =>
            Alert.alert("빠른 체크인 초기화", "최근 상태 기록을 모두 지울까요?", [
              { text: "취소", style: "cancel" },
              { text: "초기화", style: "destructive", onPress: onResetQuickCheckIns },
            ])
          }
          theme={theme}
        />
        <SecondaryButton
          label="체력 보정 초기화"
          accessibilityHint="지난 체감 피드백으로 쌓인 보정값만 지워요."
          onPress={() =>
            Alert.alert("보정 초기화", "지난 체감 보정 값을 모두 지울까요?", [
              { text: "취소", style: "cancel" },
              { text: "초기화", style: "destructive", onPress: onResetCalibration },
            ])
          }
          theme={theme}
        />
        <PrimaryButton
          label="데이터 내보내기"
          accessibilityHint="현재 저장된 일정과 설정을 JSON으로 공유해요."
          onPress={onShareData}
          theme={theme}
        />
        <SecondaryButton
          label="앱 데이터 초기화"
          accessibilityHint="샘플 일정과 기본 설정으로 다시 시작해요."
          onPress={() =>
            Alert.alert("데이터 초기화", "샘플 일정과 설정으로 다시 시작할까요?", [
              { text: "취소", style: "cancel" },
              { text: "초기화", style: "destructive", onPress: onReset },
            ])
          }
          theme={theme}
        />
      </AppCard>
    </AppScrollScreen>
  );
}
