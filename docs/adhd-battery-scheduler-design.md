# 배터리 시간표 앱 설계서

## A. 제품 컨셉 요약

`배터리 시간표`는 ADHD 사용자가 하루 일정을 기록하고, 활동별 예상 체력 소모와 회복을 휴대폰 배터리처럼 0~100%로 확인할 수 있게 돕는 로컬 우선 모바일 앱이다. 이 앱은 일정 관리보다 "과부하 예방"에 더 집중한다. 사용자의 일정, 활동 전환, 감각 자극, 사회적 부담, 수면 상태를 바탕으로 하루 흐름을 예측하고, 배터리가 낮아질 때는 비난 대신 회복 중심 재계획을 제안한다.

핵심 원칙은 세 가지다.

- 의료적 판단 대신 자기보고 기반 보조 추정만 제공한다.
- 입력은 빠르게, 설명은 짧고 친절하게, 결정은 되돌릴 수 있게 만든다.
- 오늘 해야 할 전부가 아니라 지금 감당 가능한 다음 한 걸음을 보여준다.

## B. 핵심 사용자 시나리오

1. 사용자는 첫 실행에서 아침/오후/밤 에너지 패턴과 소음·사람·수면 민감도를 1분 안에 설정한다.
2. 오늘 화면에서 현재 배터리, 다음 일정 전 회복 필요 여부, 가장 먼저 챙길 일 1개를 바로 확인한다.
3. 활동 추가 화면에서 제목, 시간, 활동 유형만 빠르게 넣고 자동 기본 부담도로 저장한다.
4. 타임라인 화면에서 일정 사이 버퍼 부족, 이동, 감각 자극이 겹치는 구간을 미리 본다.
5. 활동 상세에서 "실제로 더 힘들었음 / 비슷함 / 덜 힘들었음"을 눌러 계산을 개인화한다.
6. 배터리가 낮아지면 재정리 화면에서 휴식 삽입, 집중 작업 쪼개기, 유연 일정 뒤로 미루기 같은 제안을 적용한다.
7. 주간 인사이트 화면에서 언제 에너지가 높았는지, 어떤 활동이 많이 소모됐는지, 어떤 휴식이 실제 회복에 도움이 됐는지 부드럽게 본다.

## C. 전체 기능 목록

### 일정/배터리

- 오늘 배터리 카드
- 시간순 타임라인
- 활동 추가, 수정, 삭제
- 활동별 예상 소모량/회복량
- 전환 비용 계산
- 버퍼 부족/겹침 경고
- 배터리 스냅샷 히스토리

### 개인화

- 온보딩 기반 민감도 초기 설정
- 활동 난이도 피드백
- EMA 기반 활동 유형 보정
- 체력 계산 민감도 조절

### 지원 경험

- 재정리 추천 규칙 엔진
- 저자극 모드
- 다크/라이트/시스템 테마
- 개인정보 보호 모드
- 데이터 공유 내보내기
- 빈 상태/오류 상태/회복 중심 카피

### 분석

- 주간 소모 상위 활동 유형
- 시간대별 강점 창구
- 회복 활동 효율
- 버퍼 부족 빈도

## D. MVP 범위와 v2 범위

### MVP

- 온보딩
- 오늘 배터리
- 타임라인
- 활동 추가/수정/삭제
- 활동 상세 피드백
- 재정리 제안과 즉시 적용
- 주간 인사이트
- 설정
- 로컬 저장
- 샘플 데이터
- 계산 로직 테스트

### v2

- 실제 로컬 알림 스케줄링
- 캘린더 가져오기
- 위젯
- 다국어
- 선택적 기기 간 동기화
- 반복 일정 템플릿
- 회복 루틴 추천 고도화

## E. 화면별 UX 설계

### 1. 온보딩

- 목적: 사용자를 진단하지 않고, "내 패턴 맞추기" 설정을 짧게 받는다.
- 구조: 소개 카드 1개 + 선택형 질문 4개 + 기본 버퍼 선택
- 질문: 에너지 피크 시간, 수면 영향, 사람과의 일정 피로도, 소음/빛 민감도
- 카피: "정답은 없어요. 지금 몸 패턴에 가까운 쪽을 고르면 돼요."

### 2. 오늘 배터리

- 상단에 날짜, 오늘 상태 문구, 현재 배터리
- 큰 배터리 카드와 상태 레이블
- "지금 할 것 1개" 카드
- 회복 추천 또는 다음 일정 준비 카드
- 오늘 일정 3개 미리보기
- 배터리가 25% 이하이면 단순 모드 레이아웃으로 전환

### 3. 타임라인

- 날짜 이동 칩
- 시간순 활동 리스트
- 활동별 배터리 변화, 전환 경고, 겹침 경고
- 상단의 작은 배터리 추이 그래프
- 활동 카드 탭 시 상세 열기

### 4. 활동 추가

- 기본 입력: 제목, 시작, 종료, 유형
- 기본 부담도 자동 세팅
- 고급 부담도는 접기/펼치기
- 0~5 단계 칩 입력
- "기본값으로 채우기" 지원

### 5. 에너지 상세

- 배터리 변화 숫자와 설명 문장
- 어떤 요소가 영향이 컸는지 3줄 이하 설명
- 사용자의 체감 피드백 3종 버튼
- 활동 수정/삭제 버튼

### 6. 재정리

- 현재 상태 요약
- 규칙 기반 제안 카드 리스트
- 적용 시 바뀌는 일정과 배터리 미리보기
- 사용자를 재촉하지 않는 문구 사용

### 7. 주간 인사이트

- 가장 많이 소모된 활동 유형
- 가장 안정적인 시간대
- 도움이 된 회복 유형
- 버퍼 부족 경향
- 카드형 간단 막대 시각화

### 8. 설정

- 저자극 모드
- 테마
- 알림 강도
- 기본 전환 시간
- 개인정보 보호 모드
- 민감도 조절
- 데이터 공유
- 데이터 초기화

## F. 데이터 모델

### Activity

- `id`
- `date`
- `title`
- `startAt`
- `endAt`
- `type`
- `cognitiveLoad`
- `physicalLoad`
- `socialLoad`
- `sensoryLoad`
- `emotionalLoad`
- `urgencyLoad`
- `locationType`
- `isFlexible`
- `isRequired`
- `notes`
- `actualDifficultyFeedback`
- `createdAt`
- `updatedAt`

### EnergySnapshot

- `id`
- `timestamp`
- `batteryPct`
- `delta`
- `reason`
- `activityId?`
- `kind`

### DailyProfile

- `date`
- `sleepHours`
- `sleepQuality`
- `morningEnergy`
- `stressLevel`
- `carryoverFatigue`
- `baselineCapacity`
- `notes`

### UserEnergySettings

- `themeMode`
- `defaultTransitionBuffer`
- `cognitiveSensitivity`
- `physicalSensitivity`
- `socialSensitivity`
- `sensorySensitivity`
- `emotionalSensitivity`
- `urgencySensitivity`
- `recoverySensitivity`
- `lowStimMode`
- `reduceMotion`
- `notificationStyle`
- `privacyMode`

### CalibrationEvent

- `id`
- `activityId`
- `activityType`
- `predictedCost`
- `userReportedCost`
- `correctionDirection`
- `createdAt`

## G. 체력 배터리 계산 알고리즘

### 하루 capacity

내부 에너지 포인트는 `60~115` 범위로 관리하고, 화면에는 `현재 포인트 / capacity * 100`을 보여준다.

```ts
capacity =
  clamp(
    baselineCapacity
      + (sleepHours - 7) * 4
      + (sleepQuality - 3) * 3
      + (morningEnergy - 3) * 5
      - (stressLevel - 3) * 4
      - (carryoverFatigue - 3) * 5,
    60,
    115,
  );
```

### 활동 소모

```ts
durationCost = durationMinutes * baseDrainRateByType;

intensityMultiplier =
  1
  + cognitiveLoad * 0.1 * cognitiveSensitivity
  + physicalLoad * 0.08 * physicalSensitivity
  + socialLoad * 0.09 * socialSensitivity
  + sensoryLoad * 0.09 * sensorySensitivity
  + emotionalLoad * 0.12 * emotionalSensitivity
  + urgencyLoad * 0.07 * urgencySensitivity;

netDrain =
  durationCost * intensityMultiplier * personalMultiplier * timeWindowMultiplier
  + transitionCost
  + overlapPenalty
  + lowBatteryPenalty
  - recoveryGain;
```

### 전환 비용

- 버퍼가 기본 전환 시간보다 짧으면 증가
- 활동 유형이 크게 바뀌면 증가
- 감각 자극 높은 활동 뒤 집중 작업이면 증가
- 일정이 겹치면 별도 패널티
- 충분한 버퍼/휴식이 있으면 감소

### 회복

- `rest`, `sleep`, `meal`, `hobby`는 회복 가능 활동
- 회복도는 활동 길이, 방해 부담도, 사용자 회복 민감도에 비례
- 회복량은 capacity 상한을 넘지 않음

### 개인화

- 사용자가 피드백을 남기면 활동 유형별 `predicted → reported` 비율을 EMA로 누적
- 너무 급격히 바뀌지 않게 `0.78~1.35` 범위에서 clamp

## H. 디자인 시스템

### 색상

- 배경: 따뜻한 아이보리 / 어두운 딥 올리브
- 표면: 밝은 종이색 / 어두운 카드색
- 텍스트: 진한 차콜 / 밝은 아이보리
- 강조: 세이지 그린, 슬레이트 블루, 뮤트 코랄, 소프트 앰버
- 배터리 상태:
  - `80~100`: sage
  - `60~79`: blue
  - `40~59`: amber
  - `20~39`: coral
  - `0~19`: plum-gray

### 타이포

- 큰 숫자: 40~48
- 화면 제목: 28
- 섹션 제목: 18
- 본문: 15~16
- 캡션: 13

### 스페이싱

- 4 / 8 / 12 / 16 / 20 / 24 / 32

### 컴포넌트 규칙

- 카드 radius 24
- 큰 탭 타깃 최소 높이 44
- 명확한 그림자, 저자극 모드에서는 그림자 축소
- 상태는 색상 + 텍스트 함께 전달

## I. 앱 아키텍처

- `App.tsx`: 루트 엔트리
- `src/adhd/EnergyPlannerApp.tsx`: 앱 셸, 화면 전환, 오버레이 관리
- `src/adhd/store`: Zustand persisted store
- `src/adhd/domain`: 계산 로직, 재계획, 주간 인사이트
- `src/adhd/data`: 샘플 데이터, 기본값
- `src/adhd/utils`: 날짜/시간 변환
- `src/adhd/components`: 공용 UI 프리미티브와 시각화
- `src/adhd/screens`: 화면 단위 조합

원칙:

- 계산 로직은 순수 함수로 분리
- 저장소는 데이터와 UI 상태만 관리
- 화면은 파생 데이터 조회와 이벤트 전달만 담당
- 모든 저장은 로컬 AsyncStorage 우선
- 외부 서버 전송 없음

## J. 폴더 구조

```text
docs/
  adhd-battery-scheduler-design.md
src/
  adhd/
    EnergyPlannerApp.tsx
    constants.ts
    theme.ts
    types.ts
    components/
      BatteryGauge.tsx
      PlannerPrimitives.tsx
      TimelineChart.tsx
    data/
      samplePlannerData.ts
    domain/
      energyCalculator.ts
      insights.ts
      replanEngine.ts
    screens/
      AddActivityScreen.tsx
      EnergyDetailScreen.tsx
      InsightScreen.tsx
      OnboardingScreen.tsx
      SettingsScreen.tsx
      TimelineScreen.tsx
      TodayScreen.tsx
      ReplanScreen.tsx
    store/
      useEnergyPlannerStore.ts
    utils/
      dateTime.ts
```

## K. 주요 컴포넌트 목록

- `BatteryGauge`: 오늘 배터리 시각화
- `TimelineChart`: 활동별 배터리 하강/회복 추이
- `AppCard`: 표면 카드 래퍼
- `PillButton`: 선택 칩
- `SectionHeader`: 화면 섹션 제목
- `MetricRow`: 레이블+값 행
- `LoadScaleRow`: 0~5 부담도 입력
- `ActivityCard`: 타임라인 활동 카드
- `RecommendationCard`: 재정리 제안 카드

## L. 테스트 전략

단위 테스트는 계산 로직과 순수 유틸리티 위주로 구성한다.

- 활동 추가 시 소모 증가
- 회복 활동 시 배터리 회복
- 사회 부담이 높을수록 소모 증가
- 버퍼 부족 시 전환 비용 증가
- 피드백 보정 후 유사 활동 소모 증가
- 배터리 하한/상한 clamp
- 자정 넘김 처리
- 일정 변경 후 재계산 결과 변경
- 저자극 모드에서 테마 출력이 바뀜

## M. 접근성/개인정보/안전 가이드

- 의료, 진단, 치료 표현 금지
- VoiceOver/TalkBack용 레이블 제공
- 상태는 숫자와 문장으로 함께 제공
- 작은 글자 금지, 최소 본문 15
- 모션 축소 설정 반영
- 개인정보 보호 모드에서는 자세한 노트와 정확한 수치를 최소 노출
- 기본 구조는 온디바이스 저장만 사용
- 데이터 공유는 사용자가 직접 실행할 때만 수행

## N. 구현 순서

1. 타입, 기본 상수, 날짜 유틸 설계
2. 샘플 데이터와 기본 설정 설계
3. 에너지 계산기, 재정리 엔진, 인사이트 엔진 구현
4. Zustand store와 로컬 저장 연결
5. 오늘/타임라인/모달 UI 구현
6. 인사이트/설정/내보내기 구현
7. 계산 테스트 작성
8. 타입체크와 테스트 검증

## 구현 메모

- 권장 스택 중 현재 레포에 이미 있는 Expo + TypeScript + Zustand + AsyncStorage를 그대로 활용한다.
- 네비게이션은 의존성 추가 없이 커스텀 탭/오버레이 구조로 시작해도 충분히 유지보수 가능하도록 설계한다.
- 실제 알림 스케줄링은 v2로 분리하고, MVP는 알림 톤과 카피 구조를 먼저 갖춘다.

## 실행 명령어

```bash
pnpm dev
pnpm ios
pnpm android
pnpm web
pnpm typecheck
pnpm test
pnpm check
```
