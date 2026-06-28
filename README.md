# Focus Battery

Focus Battery는 ADHD 사용자를 위한 모바일 시간표 · 에너지 흐름 보조 추정 앱입니다.
하루 일정을 입력하면 활동별 소모, 회복, 전환 비용을 계산해 0~100% 체력 배터리 흐름으로 보여줍니다.

의료, 진단, 치료 도구가 아니라 자기보고 기반의 보조 추정 도구를 목표로 합니다.

## 현재 포함 범위

- Expo + React Native + TypeScript 앱
- 온보딩, 오늘, 흐름, 활동 추가/수정, 에너지 상세, 자동 조정, 패턴, 설정 화면
- Zustand + AsyncStorage 기반 로컬 상태 저장
- ADHD 친화적 문구와 저자극/다크/개인정보 보호 모드
- 에너지 계산기, 재계획 엔진, 48시간 학습 리포트 로직

## 실행

```bash
pnpm install
pnpm dev
```

## 검증

```bash
pnpm typecheck
pnpm test
pnpm doctor
pnpm web:export
```

## GitHub Pages 배포

```bash
pnpm deploy
```

배포 기준 주소:

- `https://estona815.github.io/focus-battery/`

## 주요 경로

- `App.tsx`: 앱 진입점
- `src/adhd/EnergyPlannerApp.tsx`: 앱 셸
- `src/adhd/domain`: 계산, 재계획, 인사이트, 학습 로직
- `src/adhd/screens`: 주요 화면
- `__tests__`: ADHD 배터리 로직 테스트

## 메모

- 이 저장소는 `Focus Battery`만 따로 분리한 전용 레포입니다.
- 기존 워크스페이스에 섞여 있던 다른 앱 파일은 의도적으로 제외했습니다.
