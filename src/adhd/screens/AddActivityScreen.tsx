import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { ACTIVITY_TYPE_META, ACTIVITY_TYPE_ORDER, LEGACY_ACTIVITY_TYPE_MAP, LOAD_LABELS } from "../constants";
import {
  AppCard,
  LoadScaleRow,
  PillButton,
  PrimaryButton,
  ScreenTitle,
  SecondaryButton,
} from "../components/PlannerPrimitives";
import { Activity, ActivityInput, AddActivityMode, AppTheme, LegacyActivityType, LocationType } from "../types";
import { getTimeLabel } from "../utils/dateTime";

function isValidTimeInput(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

const locations: Array<{ id: LocationType; label: string }> = [
  { id: "home", label: "집" },
  { id: "outside", label: "외부" },
  { id: "online", label: "온라인" },
  { id: "mixed", label: "섞임" },
];

function resolveInitialType(initialActivity?: Activity) {
  if (!initialActivity) {
    return "focus_work";
  }

  return LEGACY_ACTIVITY_TYPE_MAP[initialActivity.type as LegacyActivityType] ?? initialActivity.type;
}

export function AddActivityScreen({
  theme,
  date,
  initialActivity,
  mode = "create",
  onClose,
  onSave,
}: {
  theme: AppTheme;
  date: string;
  initialActivity?: Activity;
  mode?: AddActivityMode;
  onClose: () => void;
  onSave: (input: ActivityInput) => void;
}) {
  const isEditing = mode === "edit";
  const isDuplicating = mode === "duplicate";
  const fallbackType = resolveInitialType(initialActivity);
  const initialTitle = initialActivity?.title ?? "";
  const [title, setTitle] = useState(
    isDuplicating && initialTitle ? `${initialTitle} 사본` : initialTitle,
  );
  const [type, setType] = useState(fallbackType);
  const [startTime, setStartTime] = useState(initialActivity ? getTimeLabel(initialActivity.startAt) : "09:00");
  const [endTime, setEndTime] = useState(initialActivity ? getTimeLabel(initialActivity.endAt) : "10:00");
  const [locationType, setLocationType] = useState<LocationType>(initialActivity?.locationType ?? "mixed");
  const [isFlexible, setIsFlexible] = useState(initialActivity?.isFlexible ?? false);
  const [isRequired, setIsRequired] = useState(initialActivity?.isRequired ?? true);
  const [notes, setNotes] = useState(initialActivity?.notes ?? "");
  const [showAdvanced, setShowAdvanced] = useState(Boolean(initialActivity) && isEditing);
  const [error, setError] = useState("");
  const [loads, setLoads] = useState({
    cognitiveLoad: initialActivity?.cognitiveLoad ?? ACTIVITY_TYPE_META[fallbackType].defaultLoads.cognitiveLoad,
    physicalLoad: initialActivity?.physicalLoad ?? ACTIVITY_TYPE_META[fallbackType].defaultLoads.physicalLoad,
    socialLoad: initialActivity?.socialLoad ?? ACTIVITY_TYPE_META[fallbackType].defaultLoads.socialLoad,
    sensoryLoad: initialActivity?.sensoryLoad ?? ACTIVITY_TYPE_META[fallbackType].defaultLoads.sensoryLoad,
    emotionalLoad: initialActivity?.emotionalLoad ?? ACTIVITY_TYPE_META[fallbackType].defaultLoads.emotionalLoad,
    urgencyLoad: initialActivity?.urgencyLoad ?? ACTIVITY_TYPE_META[fallbackType].defaultLoads.urgencyLoad,
  });

  const detailHint = ACTIVITY_TYPE_META[type].detailHint;

  const applyDefaults = (nextType: typeof type) => {
    setLoads({ ...ACTIVITY_TYPE_META[nextType].defaultLoads });
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError("활동 제목을 한 줄만 적어도 충분해요.");
      return;
    }
    if (!isValidTimeInput(startTime) || !isValidTimeInput(endTime)) {
      setError("시간은 09:00처럼 입력해 주세요.");
      return;
    }

    setError("");
    onSave({
      id: isEditing ? initialActivity?.id : undefined,
      date,
      title,
      startTime,
      endTime,
      type,
      locationType,
      isFlexible,
      isRequired,
      notes,
      ...loads,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background,
          gap: theme.spacing.lg,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTitle
          title={isDuplicating ? "복제본 다듬기" : isEditing ? "활동 수정" : "활동 추가"}
          subtitle={
            isDuplicating
              ? "복사한 일정이 열렸어요. 제목이나 시간만 손본 뒤 저장하면 새 일정으로 붙어요."
              : "핵심만 먼저 넣고, 세부 부담도는 필요할 때만 펼쳐도 돼요."
          }
          theme={theme}
        />

        <AppCard theme={theme}>
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
            제목
          </Text>
          <TextInput
            accessibilityLabel="활동 제목"
            value={title}
            onChangeText={setTitle}
            placeholder="예: 집중 작업, 이동, 점심"
            placeholderTextColor={theme.colors.textMuted}
            autoCorrect={false}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              color: theme.colors.text,
              fontSize: theme.typeScale.body,
            }}
          />
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                시작
              </Text>
              <TextInput
                accessibilityLabel="시작 시간"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                maxLength={5}
                autoCorrect={false}
                placeholderTextColor={theme.colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.md,
                  color: theme.colors.text,
                  fontSize: theme.typeScale.body,
                }}
              />
            </View>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
                종료
              </Text>
              <TextInput
                accessibilityLabel="종료 시간"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="10:00"
                maxLength={5}
                autoCorrect={false}
                placeholderTextColor={theme.colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.md,
                  color: theme.colors.text,
                  fontSize: theme.typeScale.body,
                }}
              />
            </View>
          </View>
        </AppCard>

        <AppCard theme={theme}>
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
            활동 유형
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
            {ACTIVITY_TYPE_ORDER.map((activityType) => (
              <PillButton
                key={activityType}
                label={ACTIVITY_TYPE_META[activityType].label}
                selected={type === activityType}
                accessibilityLabel={`${ACTIVITY_TYPE_META[activityType].label} 유형`}
                onPress={() => {
                  setType(activityType);
                  applyDefaults(activityType);
                }}
                theme={theme}
              />
            ))}
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body, lineHeight: 22 }}>
            {detailHint}
          </Text>
        </AppCard>

        <AppCard theme={theme}>
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
            위치 느낌
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
            {locations.map((location) => (
              <PillButton
                key={location.id}
                label={location.label}
                selected={locationType === location.id}
                accessibilityLabel={`${location.label} 위치`}
                onPress={() => setLocationType(location.id)}
                theme={theme}
              />
            ))}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.body }}>조정 가능한 일정</Text>
            <Switch
              accessibilityLabel="조정 가능한 일정"
              value={isFlexible}
              onValueChange={setIsFlexible}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentSoft }}
              thumbColor={isFlexible ? theme.colors.accent : theme.colors.surface}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.body }}>오늘 꼭 필요한 일정</Text>
            <Switch
              accessibilityLabel="오늘 꼭 필요한 일정"
              value={isRequired}
              onValueChange={setIsRequired}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentSoft }}
              thumbColor={isRequired ? theme.colors.accent : theme.colors.surface}
            />
          </View>
        </AppCard>

        <AppCard theme={theme}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700", flex: 1 }}>
              부담도
            </Text>
            <View style={{ minWidth: 110 }}>
              <SecondaryButton
                label={showAdvanced ? "접기" : "자세히"}
                accessibilityHint="세부 부담도 조절 항목을 열거나 닫아요."
                onPress={() => setShowAdvanced((current) => !current)}
                theme={theme}
              />
            </View>
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typeScale.body }}>
            모를 땐 기본값으로 시작해도 괜찮아요.
          </Text>
          <PrimaryButton
            label="기본값으로 채우기"
            accessibilityHint="선택한 활동 유형의 기본 부담도로 다시 채워요."
            onPress={() => applyDefaults(type)}
            theme={theme}
          />
          {showAdvanced ? (
            <View style={{ gap: theme.spacing.md }}>
              {Object.entries(LOAD_LABELS).map(([field, label]) => (
                <LoadScaleRow
                  key={field}
                  label={label}
                  value={loads[field as keyof typeof loads]}
                  onChange={(next) => setLoads((current) => ({ ...current, [field]: next }))}
                  theme={theme}
                />
              ))}
            </View>
          ) : null}
        </AppCard>

        <AppCard theme={theme}>
          <Text style={{ color: theme.colors.text, fontSize: theme.typeScale.bodyStrong, fontWeight: "700" }}>
            메모
          </Text>
          <TextInput
            accessibilityLabel="메모"
            value={notes}
            onChangeText={setNotes}
            placeholder="선택 사항"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={{
              minHeight: 100,
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
          {error ? <Text style={{ color: theme.colors.danger, fontSize: theme.typeScale.caption }}>{error}</Text> : null}
        </AppCard>

        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <SecondaryButton
              label="닫기"
              accessibilityHint="변경을 저장하지 않고 이전 화면으로 돌아가요."
              onPress={onClose}
              theme={theme}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={isDuplicating ? "사본 저장" : isEditing ? "변경 저장" : "저장하기"}
              accessibilityHint={
                isDuplicating
                  ? "현재 내용을 새 활동으로 저장해요."
                  : isEditing
                    ? "이 활동의 변경 사항을 저장해요."
                    : "새 활동을 저장해 오늘 일정에 추가해요."
              }
              onPress={handleSave}
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
