import React, { useState } from "react";
import { Text, View } from "react-native";

import { ENERGY_WINDOW_LABELS, NOTIFICATION_STYLE_LABELS } from "../constants";
import { AppTheme, NotificationStyle, OnboardingProfile } from "../types";
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

const transitionBufferOptions = [10, 15, 20, 30];
const windows = Object.keys(ENERGY_WINDOW_LABELS) as Array<OnboardingProfile["usualEnergyPeak"]>;
const notificationStyles = ["silent", "gentle", "active"] as NotificationStyle[];

export function OnboardingScreen({
  theme,
  initialProfile,
  onComplete,
}: {
  theme: AppTheme;
  initialProfile: OnboardingProfile;
  onComplete: (profile: OnboardingProfile) => void;
}) {
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);

  const applyProfile = (next: OnboardingProfile) => {
    setProfile(next);
  };

  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="Focus Battery"
        subtitle="정확한 시간표보다, 최근 1~2일 안에 배우는 흐름부터 먼저 만들게요."
        theme={theme}
      />

      <AppCard theme={theme} subtle>
        <SectionHeader
          title="이 앱은 이렇게 시작해요"
          subtitle="처음부터 세밀하게 적지 않아도 괜찮아요."
          theme={theme}
        />
        <MetricRow
          label="1~2일 자동 학습"
          value="ON"
          hint="빠른 체크인과 거친 일정 입력만 있어도 급락 시간대와 회복 흐름을 읽기 시작해요."
          theme={theme}
        />
        <MetricRow
          label="추천 방식"
          value="하나만 먼저"
          hint="전부 바꾸라고 하지 않고, 오늘 지킬 한 가지와 회복 먼저를 먼저 보여줘요."
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader title="보통 괜찮은 시간대" subtitle="중요한 일을 두기 쉬운 시간대를 골라요." theme={theme} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {windows.map((value) => (
            <PillButton
              key={value}
              label={ENERGY_WINDOW_LABELS[value]}
              selected={profile.usualEnergyPeak === value}
              accessibilityLabel={`${ENERGY_WINDOW_LABELS[value]} 시간대`}
              onPress={() =>
                applyProfile({
                  ...profile,
                  usualEnergyPeak: value,
                  peakWindow: value,
                })
              }
              theme={theme}
            />
          ))}
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="기본 전환 버퍼"
          subtitle="일정 사이 숨 고르기 시간을 얼마나 둘지 정해요."
          theme={theme}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {transitionBufferOptions.map((value) => (
            <PillButton
              key={`buffer-${value}`}
              label={`${value}분`}
              selected={profile.defaultTransitionBufferMinutes === value}
              accessibilityLabel={`기본 전환 버퍼 ${value}분`}
              onPress={() =>
                applyProfile({
                  ...profile,
                  defaultTransitionBufferMinutes: value,
                  preferredBuffer: value,
                })
              }
              theme={theme}
            />
          ))}
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader title="알림 톤" subtitle="초반에는 자극이 적은 쪽으로 시작해도 충분해요." theme={theme} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {notificationStyles.map((value) => (
            <PillButton
              key={value}
              label={NOTIFICATION_STYLE_LABELS[value]}
              selected={profile.preferredNotificationStyle === value}
              accessibilityLabel={`${NOTIFICATION_STYLE_LABELS[value]} 알림`}
              onPress={() =>
                applyProfile({
                  ...profile,
                  preferredNotificationStyle: value,
                })
              }
              theme={theme}
            />
          ))}
        </View>
        <ToggleRow
          label="저자극 모드"
          hint="색 대비와 장식 요소를 줄여서 시작할 때 과부하를 낮춰요."
          value={profile.lowStimMode}
          onValueChange={(value) =>
            applyProfile({
              ...profile,
              lowStimMode: value,
            })
          }
          theme={theme}
        />
      </AppCard>

      <AppCard theme={theme} subtle>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
          민감도 세부 조정은 나중에 해도 괜찮아요
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          처음에는 기본값으로 시작하고, 앱이 조금 배운 뒤에 설정에서 천천히 맞춰도 충분해요.
        </Text>
      </AppCard>

      <PrimaryButton
        label="이 흐름으로 시작하기"
        accessibilityHint="지금 고른 설정으로 앱을 시작해요."
        onPress={() => onComplete(profile)}
        theme={theme}
      />
      <SecondaryButton
        label="기본값으로 바로 시작"
        accessibilityHint="추천 기본값으로 앱을 시작해요."
        onPress={() => onComplete(initialProfile)}
        theme={theme}
      />
    </AppScrollScreen>
  );
}
