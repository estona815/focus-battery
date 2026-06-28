import React, { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { ACTIVITY_TYPE_META } from "../constants";
import { AppCard, AppScrollScreen, PillButton, PrimaryButton, ScreenTitle, SecondaryButton } from "../components/PlannerPrimitives";
import { buildRoughActivitySuggestions } from "../domain/roughPlanner";
import { ActivityInput, AppTheme } from "../types";

const QUICK_PROMPTS = [
  "오전엔 회의 두 개, 점심 뒤엔 멍할 듯, 저녁엔 운동",
  "오후엔 이동 많고 사람 많이 만남",
  "아침엔 집중 작업, 저녁엔 산책하고 쉬기",
];

export function RoughPlanScreen({
  theme,
  dateLabel,
  date,
  onClose,
  onApply,
  onOpenDetailedAdd,
}: {
  theme: AppTheme;
  dateLabel: string;
  date: string;
  onClose: () => void;
  onApply: (date: string, text: string) => ActivityInput[];
  onOpenDetailedAdd: () => void;
}) {
  const [text, setText] = useState("");
  const suggestions = useMemo(() => buildRoughActivitySuggestions(text), [text]);
  const hasInput = text.trim().length > 0;

  return (
    <AppScrollScreen theme={theme}>
      <ScreenTitle
        title="한 줄 로그"
        subtitle={`${dateLabel} · 세부 폼보다 거친 한 줄부터 받아서 활동 블록으로 바꿔볼게요.`}
        theme={theme}
      />

      <AppCard theme={theme} subtle>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          오늘 흐름을 편하게 적어봐요
        </Text>
        <TextInput
          accessibilityLabel="거친 일정 입력"
          value={text}
          onChangeText={setText}
          placeholder="예: 오전엔 회의 두 개 있고, 점심 뒤엔 멍할 것 같고, 저녁엔 운동"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          style={{
            minHeight: 150,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            color: theme.colors.text,
            fontSize: theme.typeScale.body,
            lineHeight: 24,
            textAlignVertical: "top",
          }}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {QUICK_PROMPTS.map((prompt) => (
            <PillButton
              key={prompt}
              label={prompt}
              selected={text === prompt}
              accessibilityLabel={prompt}
              onPress={() => setText(prompt)}
              theme={theme}
            />
          ))}
        </View>
      </AppCard>

      <AppCard theme={theme}>
        <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.section, fontWeight: "700" }}>
          자동으로 읽은 블록
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
          정확히 안 맞아도 괜찮아요. 저장 후 타임라인에서 한두 개만 손봐도 충분해요.
        </Text>
        {suggestions.length > 0 ? (
          <View style={{ gap: theme.spacing.sm }}>
            {suggestions.map((suggestion, index) => (
              <View
                key={`${suggestion.title}-${index}`}
                style={{
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceMuted,
                  padding: theme.spacing.md,
                  gap: 4,
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                  {suggestion.title}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
                  {suggestion.startTime} - {suggestion.endTime} · {ACTIVITY_TYPE_META[suggestion.type].label}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption, lineHeight: 20 }}>
                  {suggestion.note}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>
            문장을 한 줄 적으면 여기에서 자동 블록을 바로 보여줄게요.
          </Text>
        )}
      </AppCard>

      <PrimaryButton
        label="이 흐름으로 하루 만들기"
        accessibilityHint="현재 문장을 활동 블록으로 저장해요."
        onPress={() => onApply(date, text)}
        theme={theme}
      />
      <SecondaryButton
        label="직접 세밀하게 적기"
        accessibilityHint="활동 추가 화면으로 이동해 수동 입력해요."
        onPress={onOpenDetailedAdd}
        theme={theme}
      />
      <SecondaryButton
        label="닫기"
        accessibilityHint="저장하지 않고 이전 화면으로 돌아가요."
        onPress={onClose}
        theme={theme}
      />

      {!hasInput ? null : (
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.caption }}>
          완벽하게 읽히지 않는 문장은 직접 입력으로 하나씩 이어 붙여도 괜찮아요.
        </Text>
      )}
    </AppScrollScreen>
  );
}
