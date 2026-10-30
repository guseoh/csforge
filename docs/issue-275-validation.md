# Issue #275 구현·검증 기록

검증일: 2026-10-24 (KST). 기준: `refactor` / `768c1fe8`.

## 범위와 화면 우선순위

영역별 분기 없이 공통 Learning/Area/Concept CSS와 렌더러에 적용한다.
canonical 콘텐츠, DB, 인증 정책, 시각화 엔진은 변경하지 않았다.

| 화면 | 이전 | 적용 후 |
| --- | --- | --- |
| Learning | 최근 학습·영역 선택, 좁은 화면의 중첩 여백 | 기존 이어하기와 상태 의미를 유지하고 좁은 화면의 가용 폭 사용 |
| Area | 200px까지 줄어드는 rail, Topic 제목 2줄 제한, 보조 Quiz CTA의 높은 강조 | 280px rail, 전체 제목 줄바꿈, 다음 읽기 링크 강조, 레벨·집중 학습·Quiz는 보조 행동 |
| Owner Reader | rail 220px track/236px 요소 불일치, 밀도 CSS에 따라 작아지는 본문 | 280px track/요소, 본문 17~17.5px·행간 1.8, 넓은 화면 본문 720px, 중간 폭 최대 760px |
| Guest Reader | 별도 제목 스타일, 글 내부 목차 없음 | 공통 Reader 제목·본문·목차, 공개 읽기 표시, 학습 기능 로그인 요구 유지 |
| 좁은 화면 | 720px 기준 접힘 기본값, 서로 다른 rail 보정 규칙 | 1100px 이하 기본 접힘, 키보드 펼침/접기, 탭 세션의 명시적 선택 유지 |

`learning-workspace.css`와 `concept-reader.css`를 기존 density/correction 다음에 로드하고,
중복된 이전 geometry 및 Area Quiz 강조 규칙을 제거했다. 본문·미디어의 기존 공유 위젯은 유지한다.

## Markdown 원인과 수정 경계

실제 재현 원문:

```text
흔히 **바이트코드(bytecode)**라고 부르는 것은 클래스 파일 안의 JVM 명령 중심 표현입니다.
```

- 원본: `content/java/jvm-runtime/jdk-jvm-classfile.md`.
- 공개 API: `GET /api/public/concepts/335`에서도 같은 문자열을 확인했다.
- Import의 `ContentImportParser.normalizeMarkdown`은 줄바꿈과 앞뒤 공백만 정규화한다.
- 저장·조회 경로는 `contentMarkdown`을 전달하며 Guest/Owner 모두 `MarkdownContent`를 사용한다.
- 기존 remark-parse + remark-gfm으로 위 문자열을 파싱하면 `strong` 대신 문자열 전체가 `text` 노드로 남는다.
  닫는 구두점 `)` 뒤에 한글 조사가 붙는 CommonMark delimiter 경계가 원인이다. CSS나 HTML escaping 문제가 아니다.
- 이슈의 축약 예시인 `**예시**` 자체와 `**예시**를`은 기존 파서도 정상 처리한다. 이 정확한 축약 문자열의 기존 결함을 발견했다고 주장하지 않는다.

`remarkKoreanStrong`은 파싱 후 원본과 같은 text 노드에서, 닫는 구두점/기호 뒤 한글이 붙은
미처리 강조 쌍만 `strong` 노드로 복원한다. 원본/저장/API 값을 바꾸지 않는다.
escape/entity를 디코딩한 노드는 보수적으로 유지하며 code·HTML·이미 처리된 강조는 재해석하지 않는다.
전체 unescape, 별표 일괄 삭제, raw HTML 실행, 콘텐츠 전수 수정은 없다.

회귀 테스트는 실제 입력, 정상 강조, 조사, escape, 의도된 기호, inline/fenced code,
GFM 표·목록·URL·링크 label/destination, HTML 비실행을 확인한다.

## 자동 검증

`frontend`에서 실행:

- `npm.cmd run lint`: 통과 (TypeScript 검사).
- `npm.cmd test`: 67개 파일 / 337개 테스트 통과.
- 이후 추가한 `npm.cmd test -- --run src/components/useLearningRailCollapsed.test.tsx`: 8개 통과.
  기존 337개와 추가 8개를 합쳐 345개 동작 검증이 통과했다.
- `npm.cmd run build`: 최종 소스의 TypeScript·Vite·PWA 빌드 통과.
- `git diff --check`: 통과.

Owner의 학습 상태·이해도 의미, Area 필터, Guest 조회 전용 API 사용, 노트 저장,
Quiz/Review/Search/비교 등 기존 회귀 테스트도 전체 실행에 포함된다.

## Chromium 화면·조작 검증

로컬 Vite + 격리 API fixture를 사용했다. fixture는 공개 `/concepts/723` 본문에
긴 한영 제목, 긴 URL, 넓은 표·텍스트 코드, 이미지, Markdown 경계 사례를 추가했다.
Owner 진행·노트 저장은 메모리 fixture에서만 실행했다. 운영 DB 쓰기나 실제 Google 인증은 수행하지 않았다.

| 검증 | 결과 |
| --- | --- |
| Guest/Owner × Learning/Area/Reader × 320/390/768/1024/1440px × light/dark | 60개 상태에서 페이지 가로 overflow 없음 |
| 최종 CSS의 Owner Area/Reader × 320/390/768/1024/1280/1440px | 12개 상태에서 overflow·숨김 처리된 제목 클립 없음 |
| 긴 rail·현재 Topic·Concept·breadcrumb·글 내부 목차·이전/다음 제목 | 전체 줄바꿈, 컨트롤 및 상태와 분리 |
| 1440px rail 접힘/펼침 | 본문 x좌표 402.5px로 유지, article 위치 이동 없음 |
| 모바일 rail Enter, 글 목차 Enter | aria-expanded 전이, hash 이동, 해당 heading으로 focus 이동 |
| 코드 줄바꿈·복사, 넓은 표 | 줄바꿈 상태·복사 완료 피드백, 내부 스크롤 경계 유지 |
| 이미지 확대·Escape | dialog 표시·닫기, 트리거 focus 복귀 |
| Owner 완료·복습·북마크·노트 | 상태 전이, 노트 autosave 후 새로고침에도 저장 내용 표시 |
| Guest | 개인 textarea 없음, 학습 완료 선택 시 로그인 dialog, 공유 글 목차 정상 이동 |
| 로딩·빈 목록·오류·재시도 | aria-busy skeleton, 빈 목록 안내, 오류 alert, 재시도 후 본문 복구 |
| 본문 대비 | light 약 12.03:1, dark 약 12.58:1 (본문색/표면 토큰 기준) |

스크린샷과 DOM 스냅샷으로 대표 데스크톱/모바일 화면을 직접 확인했다.
전체 운영 데이터·15개 영역의 모든 개념을 브라우저로 전수 점검한 것은 아니다.
공통 코드 적용과 대표 스트레스 fixture를 검증했으며 backend/DB 통합 검증은 이번 UI 변경 범위에 포함하지 않았다.

PR 생성·merge·Production 배포는 수행하지 않는다.
