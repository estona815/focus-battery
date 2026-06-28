import React, { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { QUICK_CHECK_IN_HINTS, QUICK_CHECK_IN_LABELS } from "../constants";
import {
  AppCard,
  AppScrollScreen,
  PillButton,
  PrimaryButton,
  ScreenTitle,
  SecondaryButton,
  SectionHeader,
} from "../components/PlannerPrimitives";
import { AppTheme, QuickCheckInInput, QuickCheckInState } from "../types";

const CHECK_IN_ORDER: QuickCheckInState[] = ["steady", "heavy", "drained", "recovering"];

export function QuickCheckInScreen({
  theme,
  dateLabel,
  date,
  onClose,
  onSave,
}: {
  theme: AppTheme;
  dateLabel: string;
  date: string;
  onClose: () => void;
  onSave: (input: QuickCheckInInput) => void;
}) {
  const [state, setState] = useState<QuickCheckInState>("steady");
  const [note, setNote] = useState("");

  const helperCopy = useMemo(() => QUICK_CHECK_IN_HINTS[state], [state]);

  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="빠른 체크인"
        subtitle={`${dateLabel} · 길게 적지 않아도 괜찮아요. 지금 결만 남겨도 다음 추천이 훨씬 빨라져요.`}
        theme={theme}
      />

      <AppCard theme={theme} subtle>
        <SectionHeader
          title="지금 상태"
          subtitle="가장 가까운 결 하나만 골라도 충분해요."
          theme={theme}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {CHECK_IN_ORDER.map((checkInState) => (
            <PillButton
              key={checkInState}
              label={QUICK_CHECK_IN_LABELS[checkInState]}
              selected={state === checkInState}
              accessibilityLabel={QUICK_CHECK_IN_LABELS[checkInState]}
              accessibilityHint={QUICK_CHECK_IN_HINTS[checkInState]}
              onPress={() => setState(checkInState)}
              theme={theme}
            />
          ))}
        </View>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typeScale.body,
            lineHeight: 22,
          }}
        >
          {helperCopy}
        </Text>
      </AppCard>

      <AppCard theme={theme}>
        <SectionHeader
          title="한 줄 메모"
          subtitle="선택이에요. 나중에 패턴 문장을 더 자연스럽게 보여주는 데만 써요."
          theme={theme}
        />
        <TextInput
          accessibilityLabel="빠른 체크인 메모"
          value={note}
          onChangeText={setNote}
          placeholder="예: 회의 뒤엔 바로 집중 시작이 잘 안 됨"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          style={{
            minHeight: 120,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            color: theme.colors.text,
            fontSize: theme.typeScale.body,
            textAlignVertical: "top",
          }}
        />
      </AppCard>

      <PrimaryButton
        label="10초 체크 저장"
        accessibilityHint="현재 상태를 저장하고 오늘 화면으로 돌아가요."
        onPress={() =>
          onSave({
            date,
            state,
            note,
          })
        }
        theme={theme}
      />
      <SecondaryButton
        label="닫기"
        accessibilityHint="저장하지 않고 이전 화면으로 돌아가요."
        onPress={onClose}
        theme={theme}
      />
    </AppScrollScreen>
  );
}
