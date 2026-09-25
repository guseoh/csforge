# Post-V2 CSForge UI/UX priority audit

Issue [#169](https://github.com/guseoh/csforge/issues/169) · 2026-09-25 · 기준 `main` `d55215dd7d45970364f730c9b673b05acb0e1768`

## Executive summary

핵심 학습 흐름은 데스크톱과 390×844 모바일에서 끝까지 수행할 수 있었다. Dashboard에서 학습 영역과 개념을 열고, Quiz를 제출하고, Result에서 자기채점을 마친 뒤 Wrong Note와 Review 일정으로 이동했다. 답안과 개인 노트의 저장 상태가 표시됐고, 복습 답안은 새로고침 뒤에도 유지됐다. 전체 경로를 막는 보편적 `BLOCKER`는 확인하지 못했다.

다음 개선의 중심은 시각 재설계보다 **학습 맥락을 잃지 않고 다음 행동에 도달하는 것**이다. 실제 데이터에서 Concept의 “이 개념 문제 풀기”가 출제 가능 0문항인 Quiz setup으로 연결됐고, 같은 Concept의 “이전 개념”은 현재 주제가 아닌 별도 주제의 동명 개념으로 이동했다. Search의 Question 결과와 제안은 표시되지만 목적지가 없어 열 수 없었다. 같은 Quiz의 정확도는 Result에서 50%, Dashboard에서 25%로 달랐다. 이 네 가지가 daily loop의 신뢰와 완료 가능성에 직접 영향을 준다.

Login과 dark mode도 같은 기준으로 평가했다. Cloud Login은 실제 배포에서 확인했으며 진입 CTA는 명확하지만 제품 설명과 실패 회복은 약하다. 현재 light UI는 시각적으로 대체로 일관되나 시스템이 dark를 선호해도 `color-scheme: light`가 적용되고 수동 전환이 없다. Dark mode보다 위의 학습 흐름과 접근성 문제를 먼저 다루는 편이 타당하다.

## 기준, 방법, 재현 한계

- 계약: `AGENTS.md`, `docs/MVP_V1.md`, Issue #169. 판단 순서: `daily usable loop → task completion/recovery → readability/clarity → accessibility/responsive → consistency → visual polish`.
- 코드: `frontend/src/router.tsx`, 모든 `frontend/src/pages/*.tsx`, 관련 `components`, `lib` 상태·API helper, `frontend/src/main.tsx`의 CSS import 순서와 주요 공유·route CSS를 확인했다. 필요한 경우 결과 정확도 계산의 직접 backend caller만 대조했다.
- 브라우저: 최신 main의 Vite 프런트엔드 + 해당 main의 local backend, 기존 PostgreSQL 학습 데이터를 Chrome에서 실제 조작했다. 기본 데스크톱 약 1900px 폭과 모바일 390×844을 확인했다. Chrome의 실제 DOM, 접근성 트리, 화면 캡처와 계산된 스타일을 사용했다. 저장소에 스크린샷은 추가하지 않았다.
- Cloud: main SHA의 성공한 production 배포 `https://csforge-ghy5wr95r-guseoh.vercel.app`에서 `/login`의 데스크톱·모바일, 미인증 `/` → `/login`을 확인했다. 허용된 Google 계정이 없으므로 OAuth 성공, 403 계정 거부와 로그아웃 회복은 코드 근거로 평가했다.
- Local DB는 깨끗한 첫 설치가 아니다. 15개 영역 중 일부는 문제 0개이고 Learning은 canonical bootstrap이 아직 필요하다고 알렸다. `Concept /concepts/232`의 0문항과 동명 Concept 중복 이동은 **이 데이터셋에서 재현된 현상**이다. 전체 canonical pack에서의 발생률은 측정하지 않았다.
- Import 파일 선택은 Chrome ChatGPT 확장의 로컬 파일 접근 제한으로 막혔다. 실제 browser에서는 선택 전 단계와 모바일 레이아웃까지 확인했다. Preview/Diff/Confirm/Result는 `ImportPage.tsx` 및 API contract를 검토했으며 브라우저 성공·실패 재현으로 주장하지 않는다.
- 감사 조작으로 로컬 학습 기록이 바뀌었다: 기존 시간 만료 Quiz `#2`를 제출했고, Review Quiz `#3`을 자기채점까지 완료했으며 모바일 점검용 Quiz `#4`가 0/5 답변의 진행 중 상태로 남았다. `/concepts/232` 개인 노트에 넣은 확인 문구는 원래 빈 값으로 복원해 저장을 확인했다. 저장소의 product code/content 파일은 변경하지 않았다.

## Route와 상태 coverage

`B` = browser 조작·관찰, `C` = 코드 확인, `—` = 제한으로 미재현. 주요 route는 모두 데스크톱과 모바일에서 열었다. 일부 상태는 아래처럼 코드 근거다.

| Route / shell | Browser의 normal·interaction·mobile | Loading·empty·error·recovery |
| --- | --- | --- |
| `/` Dashboard | B: 진행 Quiz CTA, 오늘 다음 행동, 최근 Concept·Quiz·약점, 모바일 카드 | B: 진행 세션이 사라진 뒤 추천 변경. C: skeleton, 빈 통계·이력, API retry |
| `/learning` | B: 15개 영역, 최근 Concept, partial bootstrap 안내, 모바일 목록 | C: loading/error/retry, 빈 영역·최근 기록 |
| `/learning/$areaSlug` | B: Topic rail, 현재 Topic, Concept 선택, 필터 disclosure, 모바일 접힌 rail | C: loading/error/retry, 필터 0건 |
| `/concepts/$conceptId` | B: 긴 한·영 혼합 본문, 코드 블록, 목차, bookmark/learned controls, note 저장·복원, 이전/다음, 모바일 읽기 | B: note 저장 중→저장됨. C: note 실패→재시도, API loading/error/retry. Table-heavy canonical 문서는 이 DB에서 동일 내용으로 렌더되지 않아 table은 CSS/renderer만 검토 |
| `/quiz` | B: preset, 상세·고급 필터, 0문항 disabled, 5문항 모바일 설정, resume | B: availability loading·0건. C: 조회 실패 retry, 생성 실패 메시지 |
| `/quiz/$quizId` | B: 일반·복습, 답안 선택·입력, 직접 문항 이동, 저장·새로고침 resume, 시간 종료 read-only 후 제출, 모바일 | B: 저장 중→저장됨, 재개 위치 저장 실패 문구. C: 세션 loading/error/retry, 제출 실패 |
| `/quiz/$quizId/result` | B: 지표, 오답 disclosure, 답 비교, 자기채점, 관련 Concept·retry·Review CTA, 모바일 | B: 자기채점 대기→완료. C: loading/error/retry, 오답 0건 상태 |
| `/wrong-notes` | B: 상태·복습 필터, 정렬, Question 단위 목록, 모바일 밀도 | C: loading/error/retry, 빈 결과·pagination |
| `/wrong-notes/$questionId` | B: 최근 답/정답, 메모, 관련 Concept, retry, AI 미설정 상태, 모바일 | C: 저장 실패·재시도, 상세 loading/error/retry, AI pending/failed |
| `/review` | B: overdue 4건→세션 완료 후 0건, 날짜 그룹과 빈 due CTA, 모바일 | B: due 있음/없음과 일정 갱신. C: loading/error/retry, pagination |
| `/search` + global palette | B: Ctrl/Cmd+K 노출, 제안, 최근 검색, 유형·레벨·영역 필터, 114건·0건 결과, Concept 이동, 모바일 | B: 제안 loading, 0건. C: 제안 실패 시 전체 검색 fallback, 검색 실패 retry |
| `/settings/import` | B: select 전 5단계 표시·dropzone·모바일. 파일 선택 제한 | C: preview/diff/item 오류, digest 만료(409), 적용 실패·결과. 성공적인 upload/apply는 — |
| `/login` + auth shell | B: production Login의 desktop/mobile, 미인증 401 redirect; local auth 장애 문구도 재현 | B: pending, 일반 auth-error 텍스트. C: 403/logout recovery, 로그인 후 `/` 이동; 성공·403 실제 계정은 — |
| Global header | B: desktop nav/search/LOCAL, mobile menu·palette·logo 이동, keyboard focus | C: route pending/error/not-found, cloud account menu. 계정 메뉴 live 사용은 — |

## Task-flow audit

| Issue #169의 flow | 관찰과 판정 |
| --- | --- |
| 1–2 진입→오늘 할 일→학습 시작 | Dashboard는 active Quiz가 있으면 큰 “이어 풀기”, 그다음 due Review·최근 Concept를 보여 행동 우선순위가 명확했다. active Quiz가 사라지면 최근 Concept가 첫 CTA가 됐다. 통계는 아래 접힘 영역에 있어 metric보다 action 중심이다. |
| 3 Learning Area→Topic→Concept | 영역 15개와 Topic rail로 이동 가능. 모바일에서는 rail을 접어 읽기 공간을 보존한다. 다만 현재 Topic에서 “이전 개념”이 다른 Topic의 동명 자료로 이동하는 사례가 있었다(F02). |
| 4 Concept 읽기→note/bookmark/learned→관련 Quiz | 본문과 note, 완료/복습 필요/bookmark가 분리돼 있다. note 저장 중·저장됨과 새로고침 보존 확인. `/concepts/232`의 Quiz CTA는 `/quiz?areas=network-http&concepts=%22232%22...`에 0문항으로 도착해 끝났다(F01). |
| 5–6 Quiz 조건→시작→이동/자동 저장→제출 | preset은 한 번 선택 후 하나의 시작 버튼으로 이어진다. 복습 Quiz의 선택·입력→저장됨→reload 보존, 직접 문항 목록, 일반 시간 만료 세션의 read-only 제출까지 수행했다. 모바일 입력·문항 목록도 작동했다. |
| 7–8 Result→원인 확인→retry/Concept/Review, Wrong Note→detail→retry | 오답 답 비교와 관련 Concept 이동, retry CTA가 있다. 자기채점은 먼저 완료해야 retry가 열린다는 이유를 설명한다. 같은 Quiz의 정확도 표기가 Dashboard와 달랐다(F03). |
| 9 Review 탐색→시작→완료 | overdue 4문항으로 Review Quiz를 시작했고 자기채점 후 due 0건, 24시간 내 5건/7일 내 2건으로 갱신됐다. wrong/right에 따른 일정 방향은 화면에서 구분됐다. |
| 10 Search→filter→실제 학습 화면 | DNS 검색에서 Concept 결과는 열렸다. Question 결과는 카드만 있고 동작이 없어 다음 학습으로 이어지지 않았다. Palette의 Question 제안도 동일하다(F04). |
| 11 중단 Quiz resume | Dashboard·Quiz setup에 resume CTA가 보였다. 모바일 Quiz `#4`를 나가자 setup에 0/5 resume가 나타났다. Review 답안은 reload 뒤 그대로였다. |
| 12 Import select→validate→preview/diff→confirm→result | 첫 단계와 상태 구분은 browser, 나머지는 code. Chrome 확장의 upload 권한 때문에 파일 선택 이후의 UX는 미검증이다. 이 route로 가는 제품 내 링크도 찾지 못했다(F08). |
| 13 Cloud login→failure/recovery→진입 | 배포의 미인증 root는 Login으로 보냈다. 성공·403은 계정 부재로 미검증. 코드에서는 허용 계정 403은 logout 후 재시도 가능하지만 일반 auth 오류에는 실행 가능한 retry가 없다(F06). |
| 14 Mobile 핵심 flow | 390×844에서 1–11의 화면/CTA를 실제 사용했고 가로 페이지 overflow는 관찰하지 못했다. 필터의 밀도, menu의 열린 상태 유지, 낮은 대비 메타데이터가 남았다(F07/F09/F10). |

## Severity findings

전반적 `BLOCKER`는 없음. 아래 severity는 구현 순서와 별개다. 특정 DB·계정 상태에서만 나타난 현상은 범위를 명시한다.

| ID | Severity | Finding / browser evidence | Code evidence / 사용자 영향 |
| --- | --- | --- | --- |
| F01 | **HIGH** | `/concepts/232` “이 개념 문제 풀기” → 영역·개념 조건을 가진 `/quiz`에서 0문항, 시작 disabled. 사용자가 개념을 읽은 직후 문제 풀이를 시작하지 못하며 “10문항보다 적음”은 0문항 이유를 설명하지 않는다. 이 DB의 일부 Concept에서 재현. | `ConceptPage.tsx:155-162`, `QuizSetupPage.tsx:212-229,362-382`. 사전 가능 수·대체 영역/주제 경로 부재. |
| F02 | **HIGH** | `/concepts/232` (Topic `URL to HTTP Request Journey`)의 “← 이전 개념 URL Components”가 `/concepts/585` (Topic `URL to HTTP Request`)로 이동. 같은 화면의 Topic 목록에는 `/concepts/236` “URL Components”가 있다. 중복 제목 환경에서 순차 학습 맥락이 깨진다. | `ConceptPage.tsx:224-225`는 받은 `previous/next`를 그대로 연결. 이전/다음 결정의 데이터 계약 확인 필요. |
| F03 | **HIGH** | 제출한 Quiz `#2`가 Result에서 **50% / 1/4개 정답**, Dashboard 최근 Quiz에서는 **25% / 1/4개 정답**. 같은 학습 성과의 의미를 이해할 수 없다. | `QuizResultPage.tsx:311-317`, `DashboardPage.tsx:222`; `QuizResultCalculator.java:75`는 채점된 답변 2개 중 1개, `DashboardQueryService.java:208-222`는 `finalizedCount` 기준. 분모 계약·라벨 정합성 필요. |
| F04 | **HIGH** | DNS 검색 114건 중 Question 카드에는 “열기” 동작이 없다. Palette에는 `QUESTION` 제안이 버튼으로 보이지만 누를 목적지가 없다. 발견→풀이/복습이 끊긴다. | `SearchPage.tsx:260-268`, `SearchPalette.tsx:110-126,214-224`, `search-ui.ts:46-56`: Question에 `conceptId`/wrong-note가 없으면 destination `null`. |
| F05 | **HIGH** | 모바일 Search palette는 `role=dialog aria-modal=true`이지만 입력에 focus가 있을 때 `Shift+Tab`을 누르자 dialog 밖의 header 검색 trigger로 이동했다. Keyboard-only 사용자가 배경 UI에 들어간다. | `SearchPalette.tsx:145-230`: 열기/닫기와 이전 focus 복귀는 있으나 modal focus containment 또는 background inert 처리 없음. |
| F06 | **HIGH** | 로컬 API가 auth session을 500으로 응답했을 때 본문 전체가 “잠시 후 다시 시도” 텍스트만 보여 실행 가능한 retry가 없었다. Cloud에서 transient auth 확인 실패 시도 동일 경로. 보호된 deep link는 401 뒤 Login으로 이동하며 성공 시 항상 `/`로 간다. | `AuthGate.tsx:22-50`, `LoginPage.tsx:16-24,40-54`: 일반 오류 retry 없음, 원래 URL 복귀 없음. Cloud-only 범위이며 성공 동작은 code 근거. |
| F07 | **MEDIUM** | 모바일 menu를 펼친 채 logo를 눌러 Dashboard로 이동하면 menu가 열린 채 새 화면 상단을 덮었다. Menu 내부 링크는 닫히므로 동작이 일관적이지 않다. | `router.tsx:46-68`: nav 링크에만 `setMobileNavOpen(false)`. |
| F08 | **MEDIUM** | `/settings/import`는 browser에서 직접 URL로 열 수 있지만 header, Dashboard, Learning, 기타 frontend JSX에서 route 링크가 없다. 기존 파일을 관리하려는 사용자가 찾기 어렵다. 업로드 이후 UX 평가는 제한. | `router.tsx:177`, `ImportPage.tsx:100-151`; `rg 'settings/import' frontend/src`에서 route 선언만 검색됨. |
| F09 | **MEDIUM** | mobile Wrong Note의 보조 메타·상태 글씨가 매우 연하고, 여러 화면의 eyebrow/보조 텍스트도 옅다. `--text-faint` `#7b8794`는 white에서 계산 대비 3.66:1, page 배경에서 3.42:1이다. 작은 일반 텍스트의 WCAG AA 4.5:1에 미달한다. 실제 적용 대상별 대비 재측정이 acceptance에 필요. | `foundation.css:22-25,123-131`, `density.css:6,15-17,299-303`. `--text-muted`는 white에서 5.42:1이므로 토큰 용도를 구분해야 한다. |
| F10 | **MEDIUM** | 모바일 Quiz 상세 설정의 15개 영역(0문항 영역 포함)은 길게 스크롤해야 하고, Review의 5개 기간 filter는 390px에서 촘촘히 한 줄에 모인다. 핵심 조작은 가능하나 반복 설정·기간 파악에 시간이 든다. | `QuizSetupPage.tsx:270-354`, `ReviewPage.tsx` 기간 버튼, `quiz-setup-guide.css`, `step8-review.css:246+`. |
| F11 | **MEDIUM** | Review에서는 “기한 지남”을 명확히 표시하지만 Wrong Note 목록의 같은 overdue 항목은 날짜만 보여 우선순위를 바로 읽기 어렵다. Search snippet은 Markdown의 `###` 같은 원문 표기가 남아 결과 요약의 가독성을 떨어뜨린다. | `WrongNotesPage.tsx`, `ReviewPage.tsx`, `SearchPage.tsx:259-265`. 공통 상태 표현과 snippet 변환을 검토해야 한다. |
| F12 | **MEDIUM** | dark 선호 OS에서도 실제 CSS는 `color-scheme: light`, 밝은 page/controls였고 전환·저장 선택지가 없다. 현재 31개 CSS에 hex 색 표기 386건, `!important` 20건, `:root` 정의 4개가 있어 단순 palette 교체로 안전하게 구현하기 어렵다. 수치는 source 출현 건수이며 실제 적용/대비 실패 건수는 아니다. | `main.tsx:8-38` import 순서, `styles.css:1-21`, `ui-refresh.css:2-21`, `foundation.css:7-33`, `density.css:11-20`. `foundation.css`가 최종 light token과 native scheme을 덮어쓴다. |
| F13 | **LOW** | Cloud Login은 CTA와 모바일 카드 배치가 명확하지만 제품이 무엇을 하는지보다 “한 개 Google 계정”이라는 배포 내부 계약을 먼저 설명한다. 기존 로그인 사용자에게는 충분하지만 first-entry의 학습 목적 소개는 부족하다. | Production `/login` desktop/mobile; `LoginPage.tsx:44-54`, `router.tsx:38`에서 중첩 `<main>` landmark도 생성된다. |
| F14 | **MEDIUM** | Quiz `#3` 질문의 `www.example.com을`이 외부 URL `http://www.example.com%EC%9D%84`로 렌더돼 Korean 조사가 링크에 포함됐다. 문제 본문을 읽다가 잘못된 외부 사이트로 이동할 수 있다. | Browser `/quiz/3`와 Result; `MarkdownContent.tsx`의 `remark-gfm` 자동 링크 처리. 다른 URL+조사 패턴 범위는 미측정. |

### Cross-route 판단

- **IA/navigation:** Dashboard의 action hierarchy는 제품 목적에 맞다. Search는 header palette로 발견 가능하지만 결과 중 Question이 종착점이다. Import는 낮은 빈도 기능이어도 진입점이 필요하다. 모바일 기본 메뉴는 학습/문제/오답/복습 네 역할을 유지한다.
- **Task efficiency/cognitive load:** Quiz preset, active-session resume, Result 자기채점 우선 배치, Concept의 note/완료 영역은 유용하다. 현재 큰 마찰은 필터 수 자체보다 F01/F02/F04처럼 **다음 행동으로 넘어갈 때 맥락이 사라지는 것**이다. 0문항 필터와 모바일 15개 영역 선택은 반복 사용 부담을 더한다.
- **Readability/interaction:** Concept 본문은 데스크톱 읽기 폭과 모바일 1열 전환이 적절했고 긴 코드 블록에서 페이지 전체 가로 overflow는 보지 못했다. Result의 내 답/정답 비교도 모바일에서 세로 적층됐다. 작은 메타데이터 대비(F09), 자동 링크 오인(F14), 정확도 수치 충돌(F03)은 학습 내용을 해석하는 데 더 큰 위험이다.
- **Visual consistency:** 강한 blue CTA, 밝은 surface, border, focus outline은 주요 route에서 대체로 통일됐다. 가장 큰 사용자 가시적 불일치는 **같은 due/overdue와 accuracy 의미가 route마다 다르게 표현되는 상태 언어**(F03/F11)다. 가장 큰 구현상 불일치는 순차 CSS correction layer와 hard-coded 색(F12)이다. 미적 카드 교체보다 공통 상태 의미를 먼저 정리해야 한다.
- **Feedback/recovery:** note와 Quiz 저장 중/저장됨, disable/pending, Result 자기채점 안내, Review 일정 갱신은 관찰됐다. Quiz 재개 위치 저장 오류는 문구가 있으나 다음 이동 재시도만 제시한다. auth 오류(F06)는 수동 새로고침을 추론해야 한다. Search 0건은 필터 축소/검색어 변경을 안내하고, availability 0건은 원인·대체 경로가 약하다.
- **Accessibility:** 주요 button/label, focus-visible, `aria-expanded`, semantic `nav`, `role=status/alert`가 있다. 즉시 처리할 HIGH는 modal focus escape(F05), 그다음 작은 메타 텍스트 대비(F09)다. 모바일 menu/검색 icon은 접근성 이름이 있다. Skip link, 200% zoom, screen reader 읽기 순서, 실제 403 계정 상태는 별도 검증이 필요하며 미검증을 통과로 간주하지 않는다.
- **Theme readiness:** semantic token 기반은 이미 있으나 light를 최종 적용하는 `foundation.css`, 여러 dark 잔여 palette와 route별 직접 색이 공존한다. Markdown/code/table, skeleton, overlay, selection, status, heatmap, native controls까지 하나의 token 계약으로 검증해야 한다. 시스템 dark 선호를 읽는 자동 적용, 수동 토글, persistence, 초기 paint의 wrong-theme flash 경로는 현재 없다.

## Priority candidate inventory

모든 후보는 finding severity와 별도로 구현 순서를 매겼다. 빈도는 측정 트래픽이 아닌 해당 경로의 예상 반복성이다. 실제 사용 데이터가 없는 추정은 그렇게 표시했다.

### NEXT

**C01 — Concept→practice 학습 맥락과 0문항 회복 (F01/F02, HIGH).** 문제: 개념을 읽은 직후 Quiz가 0문항이거나 이전/다음이 다른 Topic으로 이동한다. Flow: Area→Concept→Quiz→다음 Concept. 근거: `/concepts/232`→`/quiz` 0건, `/concepts/232`→`/concepts/585` Topic 변경; `ConceptPage.tsx:155-162,224-225`, `QuizSetupPage.tsx:212-229,362-382`. 빈도: 매일 Concept 학습 시 반복될 수 있으나 전체 발생률은 이 DB에서 미측정. 영향: 풀이 시작 실패와 커리큘럼 위치 혼동; daily loop의 첫 handoff를 깨뜨린다. 방향/예상 범위: 해당 Concept 출제 가능 수를 CTA 전에 알리고 0건이면 같은 Area/Topic의 유효한 연습 경로를 제시하며, previous/next 계약을 현재 Topic·정렬 기준과 일치시킨다. 의존: content 중복/연결 데이터와 API의 ordering semantics 확인. Responsive/a11y: 모바일 CTA와 빈 결과에 같은 설명·키보드 경로 제공. 회귀 위험: 실제 문제가 있는 Concept, URL 필터 유지, 전체 커리큘럼 이동. 수용 방향: 0건·소수 문항·중복 제목 fixture에서 클릭 경로가 막히지 않고 현재 Topic 표시와 이전/다음 대상이 일치. **NEXT 이유:** 반복 daily loop의 실제 중단점이며 다음 Issue 한 개를 고른다면 이 문제 영역이다.

**C02 — Quiz 성과 지표의 동일한 의미 (F03, HIGH).** 문제/flow: 제출→Result→Dashboard에서 같은 Quiz의 정확도가 50%/25%로 다르다. 근거: Quiz `#2` browser 화면; `QuizResultCalculator.java:75`, `DashboardQueryService.java:208-222`, `QuizResultPage.tsx:311-317`, `DashboardPage.tsx:222`. 빈도: 매 Quiz 종료·최근 기록 확인. 사용자/daily-loop 영향: 진전도와 재도전 판단의 신뢰 저하. 방향/예상 범위: 공통 분모 계약을 정하고 `정확도`, `1/4 정답`, 미답변·자기채점 대기 라벨을 함께 설계한다; backend read model과 frontend 표시의 직접 경계만 대상. 의존: 미답변 및 pending self-check 정책 결정. Responsive/a11y: 작은 Result 요약에서도 분모를 문자로 제공하고 수치만 색으로 구분하지 않는다. 회귀 위험: 기존 통계/heatmap과 API 소비자. 수용 방향: 부분 답변, 전체 답변, pending self-check 각각에서 Dashboard/Result 동일 수치와 설명. **NEXT 이유:** 완료 직후 핵심 피드백 오류다.

**C03 — Search Question 결과의 실행 가능한 목적지 (F04, HIGH).** 문제/flow: 검색→Question 발견 후 카드를 열거나 풀 수 없다. 근거: DNS 검색 browser 114건의 Question 카드와 Palette 제안; `search-ui.ts:46-56`, `SearchPage.tsx:260-268`, `SearchPalette.tsx:110-126`. 빈도: 매 검색에서 Question hit가 노출될 때. 사용자/daily-loop 영향: 찾은 문제를 학습 행동으로 전환하지 못한다. 방향/예상 범위: Question의 명시적 preview/practice 또는 관련 Concept 경로와 fallback을 정의하고 두 검색 표면에 같은 목적지 정책을 적용. 의존: 단일 Question 풀이/재도전 API 계약 또는 관련 Concept id. Responsive/a11y: 모바일 카드에도 한 개의 선명한 CTA, keyboard option은 유효 목적지만 action으로 노출. 회귀 위험: Wrong Note/Reference/Concept 기존 destination 우선순위. 수용 방향: 모든 문서 유형의 검색 hit가 유효한 학습 위치로 이동하거나, 목적지 없는 항목을 action처럼 표시하지 않음. **NEXT 이유:** Search가 daily loop로 이어져야 한다.

**C04 — Global palette의 실제 modal keyboard 동작 (F05, HIGH).** 문제/flow: Ctrl/Cmd+K 검색 중 `Shift+Tab`이 dialog 밖 header로 빠진다. 근거: 390×844 Chrome keyboard 재현; `SearchPalette.tsx:145-230`. 빈도: keyboard-only/보조기술 사용 때마다. 사용자/daily-loop 영향: 배경 탐색으로 focus 이탈, 위치·결과 선택 혼란. 방향/예상 범위: 열릴 때 focus 진입, 내부 순환, 닫힐 때 원래 focus 복원, 배경 비활성화를 하나의 dialog contract로 검증. 의존: 검색 palette DOM/라우터 focus 처리. Responsive/a11y: 양 viewport 모두 필수. 회귀 위험: Escape, 최근 검색/제안 화살표·Enter, backdrop. 수용 방향: 첫/마지막 focus에서 Tab·Shift+Tab이 dialog 안에 머물고 Escape 후 trigger로 복귀. **NEXT 이유:** 전 route 공통 검색의 반복 접근성 결함이다.

### LATER

**C05 — Cloud Login/first-entry와 auth recovery (F06/F13, HIGH).** 문제/flow: 첫 방문에서 제품 목적보다 배포 내부 제약이 강조되고 transient auth 실패에 retry가 없으며 deep link가 성공 후 `/`로 돌아간다. 근거: production `/login` desktop/mobile, 미인증 root redirect; `LoginPage.tsx:16-54`, `AuthGate.tsx:22-50`, `router.tsx:38`; 403은 코드만 확인. 빈도: cloud 사용자의 첫 진입·세션 만료·장애 때, local 기본 흐름에는 해당 없음. 사용자/daily-loop 영향: 시작 불안과 원래 읽던 Concept/Result로의 복귀 실패. 방향/예상 범위: 단일 사용자 Google 계약은 유지하며 짧은 제품 설명, 상태별 retry/recovery, 의도한 route 복귀와 landmark 정리. 의존: OAuth callback/redirect 검증, 실제 401/403 계정 테스트. Responsive/a11y: mobile 카드와 error announcement/focus 필수. 회귀 위험: 인증 loop·open redirect·로그아웃 403 회복. 수용 방향: 401/403/일반 오류/성공 각각 명확한 다음 행동, 정상 deep link 보존. **LATER 이유:** 별도 redesign 범위는 필요하나 local-first daily loop의 다음 1순위는 아니다.

**C06 — 공유 상태 표현·모바일 필터 밀도·읽기 대비 (F07/F09/F10/F11/F14, MEDIUM).** 문제/flow: overdue 의미와 date의 route별 차이, mobile menu의 logo 이동 후 열린 상태, 빽빽한 필터, 작은 메타 대비, URL+조사 자동 링크가 읽기·탐색을 방해한다. 근거: mobile Dashboard/Review/Wrong Note/Quiz, `/quiz/3`; `router.tsx:46-68`, `foundation.css:22-25`, `QuizSetupPage.tsx:270-354`, `MarkdownContent.tsx`. 빈도: mobile 일상 사용과 Question 본문에서 반복, URL+조사의 전체 빈도는 미측정. 사용자/daily-loop 영향: 터치·인지 부담과 실수 가능성. 방향/예상 범위: due/overdue 공통 문구·배지, menu route-change 닫기, 0문항 filter 접기/안내, 작은 글씨 대비, 자동 링크 boundary 검토. 의존: C01의 0문항 정책과 공유 status token. Responsive/a11y: 핵심 대상; 최소 4.5:1 일반 텍스트와 390px·확대 배치 점검. 회귀 위험: filter URL state, active badge, Markdown 링크/외부 참조. 수용 방향: mobile 핵심 task에서 가로 넘침·가려짐 없이 상태를 문자로 식별하고 Question URL은 조사와 분리. **LATER 이유:** flow 완료는 가능하며 먼저 C01–C04를 해결해야 설계 기준이 안정된다.

**C07 — Import 발견성과 단계별 오류 회복 (F08, MEDIUM).** 문제/flow: 관리 route를 제품 안에서 찾을 수 없다. Preview/Diff 이후 UX는 browser 검증이 필요하다. 근거: `/settings/import` 첫 화면 desktop/mobile, `router.tsx:177`, `ImportPage.tsx:49-151`; Chrome upload 제한 명시. 빈도: 저빈도 bulk content 관리. 사용자/daily-loop 영향: 새 콘텐츠 준비·오류 수리 시간이 늘지만 평소 학습 영향은 낮다. 방향/예상 범위: 낮은 빈도 메뉴 진입점과 preview→diff→confirm→result 단계의 사용성 검증, 오류 후 파일 보존과 재시도 점검. 의존: 업로드 가능한 테스트 환경과 sample files. Responsive/a11y: 파일 선택·diff 긴 줄·item-level 오류 mobile/keyboard 확인. 회귀 위험: 업로드 idempotency/digest, import 권한 노출. 수용 방향: UI에서 route 발견 가능, invalid/unchanged/updated file의 단계·다음 행동을 browser에서 확인. **LATER 이유:** 중요하지만 daily loop 빈도가 낮고 preview 실제 재현 근거가 부족하다.

**C08 — Dark theme와 CSS/token foundation (F12, MEDIUM).** 문제/flow: dark 선호 사용자는 강제 light UI를 보며 여러 CSS correction layer가 theme 변경 위험을 높인다. 근거: dark 선호 OS에서 계산된 `color-scheme: light`, 31 CSS/386 hex/20 `!important`, `main.tsx:8-38`, `styles.css`, `ui-refresh.css`, `foundation.css`, `density.css`. 빈도: dark 선호 사용자의 모든 진입; 실제 불편·사용량은 미측정. 사용자/daily-loop 영향: 장시간 읽기 편의 가능성은 있으나 현재 학습 task 완료를 막지 않는다. 방향/예상 범위: theme를 할 때 첫 단계로 semantic token ownership과 중복 cascade를 필요한 범위에서 정리하고 Markdown/code/table/skeleton/status/heatmap/overlay/native control을 검증한다. system/manual 선택, persistence, initial paint까지 같은 구현 범위에 둔다. 의존: C06의 대비·status 의미와 주요 route visual baseline. Responsive/a11y: 두 viewport, focus/contrast/reduced motion. 회귀 위험: route별 잔여 hard-code와 밝기 전환 flash. 수용 방향: system dark/light 및 수동 선택·새로고침에서 모든 주요 화면의 대비와 상태 의미 유지. **LATER 이유:** user 후보로서 가치가 있으나 먼저 실행·회복·정확성 결함을 해결해야 한다. token 정리를 독립적인 광범위 선행 Issue로 만들지 않고 future theme 작업의 첫 필수 단계로 묶는다.

### HOLD

**C09 — 광범위한 route별 visual polish (LOW).** 문제/flow: 세부 spacing/card/radius 차이를 더 다듬을 여지는 있으나 이번 browser에서 전 route를 가로막는 미적 불일치는 없었다. 근거: Dashboard, Concept, Quiz, Result, Wrong Note, Review, Search, Login의 desktop/mobile 비교; `main.tsx:8-38`의 여러 correction CSS. 빈도/사용자 영향/daily-loop 영향: 노출은 상시지만 실제 완료 시간 개선 근거가 없다. 방향/예상 범위: C01–C08 이후 사용 관찰과 공통 token 기준으로 특정 route만 한정. 의존: 상태 의미와 theme foundation. Responsive/a11y: 수정 때 대비·확대 회귀 방지. 회귀 위험: 넓은 cascade의 우발적 변화. 수용 방향: 구체적 route·task 개선과 전후 사용성 근거가 생길 때만 진행. **HOLD 이유:** 현재는 단순 취향 및 구현 비용 대비 이득을 입증하지 못한다.

## Issue #169 Special Decisions

| # | 결정 |
| --- | --- |
| 1 | **Login/first-entry는 별도 문제 영역으로 다룰 가치가 있다 (C05, LATER).** 시각 재설계만이 아니라 제품 설명, 상태별 회복, deep-link 복귀를 포함해야 한다. Signup/password/member는 범위 밖. |
| 2 | **Dark mode는 지금 NEXT가 아니다 (C08, LATER).** 현재 시스템 dark 선호에서도 light이지만 task 실패보다 편의·읽기 선택의 문제이며 적용된 색의 기반 작업이 필요하다. |
| 3 | **Token/CSS foundation은 theme 구현의 첫 단계로 함께 진행한다.** 사전의 별도 대규모 CSS 정리보다 semantic ownership·직접 색 inventory·contrast 기준을 theme acceptance에 포함한다. |
| 4 | **가장 큰 daily-loop 마찰은 Concept→practice 전환**이다. 0문항 CTA와 Topic 밖 이전/다음 이동이 실제 재현됐다(F01/F02). |
| 5 | **가장 큰 가시적 visual/state inconsistency는 같은 수치·상태의 의미 차이**다. Quiz 정확도 50/25%(F03), overdue의 Review/Wrong Note 차이(F11). Pure spacing 차이는 우선순위가 낮다. |
| 6 | **공통 UX 상태·이동 계약을 먼저**, 필요한 route polish를 그 계약에 맞춰 한다. 광범위 design-system 재작성은 하지 않는다. |
| 7 | **모바일 전체 loop BLOCKER는 보지 못했다.** HIGH인 palette keyboard 문제(F05)는 모바일에서도 재현; F01/F03/F04는 viewport 무관. 필터·menu·대비는 MEDIUM. |
| 8 | **즉시 다룰 접근성 HIGH는 검색 dialog focus escape**다(F05). 작은 메타 대비(F09)는 MEDIUM이지만 여러 route에 걸쳐 측정·개선 필요. |
| 9 | **Loading/error/recovery의 공통 문구·행동 계약은 필요하다.** `AsyncStates` 기반 retry는 있으나 auth 일반 오류에는 retry가 없고, 0문항은 대체 행동이 없다. 모든 상태를 한 UI로 강제하기보다 “무슨 일이 일어났고 다음에 무엇을 할 수 있는가”를 공통 기준으로 둔다. |
| 10 | **Quiz setup→session→result 기본 흐름은 이어진다.** preset, 저장·resume, self-check 우선 배치는 좋다. Concept에서 전달된 0문항과 Result/Dashboard 정확도 충돌은 이 연속성을 손상한다. |
| 11 | **Concept→Question→Wrong Note→Review 맥락은 부분 유지**된다. Wrong Note/Result의 관련 Concept·retry·Review CTA와 일정 갱신은 작동하지만 F01/F02가 첫 연결을 끊는다. |
| 12 | **Search는 일부 결과만 학습 흐름에 연결**된다. Concept는 열리지만 Question은 카드/제안의 목적지가 없다(F04). |
| 13 | **Dashboard는 “오늘 무엇을 할지” 안내하는 화면에 더 가깝고 제품 목적에 맞다.** active Quiz/due Review/최근 Concept를 위에, metric을 아래 접힘 영역에 둔 판단을 유지한다. 성과 수치 계약(F03)은 수정해야 한다. |
| 14 | **다음 UI/UX 구현 Issue 하나는 C01의 문제 영역**: Concept→Quiz handoff의 0문항 회복과 현재 Topic 기준 이전/다음 맥락. 데이터·API 계약 확인을 포함하되 이 audit에서 구현 Issue를 생성하지 않는다. |

## Recommended next Issue scope and non-goals

다음 Issue의 검토 가능한 범위는 **Concept에서 연습으로 이동할 때 유효한 문제 수와 학습 위치를 보장하는 것**이다. `/concepts/$conceptId`, `/quiz`, Concept의 previous/next 계약과 필요한 최소 query/API만 다룬다. 수용 시나리오는 연결 문제 0·1–9·10개 이상, 중복 제목, Topic 전환, 모바일, URL back/forward, 로딩·실패·재시도다. Result 지표, Search Question 목적지, Login, theme는 각각 별도 후보로 유지한다.

이번 audit의 non-goals: UI/UX 구현, dark mode, CSS/component refactor, backend/auth 변경, dependency 추가, 기능·콘텐츠 변경, 구현 Issue/PR 생성. 이 문서와 Issue #169 결과 comment만 산출한다.
