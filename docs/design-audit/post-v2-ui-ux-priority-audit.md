# Post-V2 CSForge UI/UX priority audit

Issue [#169](https://github.com/guseoh/csforge/issues/169) · 2026-09-25 · 기준 `main` `d55215dd7d45970364f730c9b673b05acb0e1768`

## Executive summary

핵심 학습 흐름은 데스크톱과 390×844 모바일에서 끝까지 수행할 수 있었다. Dashboard에서 학습 영역과 개념을 열고, Quiz를 제출하고, Result에서 자기채점을 마친 뒤 Wrong Note와 Review 일정으로 이동했다. 답안과 개인 노트의 저장 상태가 표시됐고, 복습 답안은 새로고침 뒤에도 유지됐다. 전체 경로를 막는 보편적 `BLOCKER`는 확인하지 못했다.

최종 우선순위는 Issue #169의 review 결정을 반영한다. 다음 구현 후보는 **Quiz Result와 Dashboard의 정확도 의미 통일**, 그다음 **Search Question 목적지와 palette keyboard 접근성**, 세 번째는 **token foundation을 포함한 dark theme**다. Auth recovery와 deep-link 복귀가 뒤따른다.

Login과 dark mode도 같은 기준으로 평가했다. Cloud Login은 실제 배포에서 확인했으며 CTA는 명확하지만 제품 설명과 실패 회복은 약하다. Dark theme는 MVP_V1에 명시된 사용성 요구이므로 accuracy와 Search 다음 우선순위로 올린다. 첫 theme 작업 안에 semantic token ownership, 필요한 직접 색상 정리, 대비 검증을 함께 둔다.

## 기준, 방법, 재현 한계

- 계약: `AGENTS.md`, `docs/MVP_V1.md`, Issue #169. 판단 순서: `daily usable loop → task completion/recovery → readability/clarity → accessibility/responsive → consistency → visual polish`.
- 코드: `frontend/src/router.tsx`, 모든 `frontend/src/pages/*.tsx`, 관련 `components`, `lib` 상태·API helper, `frontend/src/main.tsx`의 CSS import 순서와 주요 공유·route CSS를 확인했다. 필요한 경우 결과 정확도 계산의 직접 backend caller만 대조했다.
- 브라우저: 최신 main의 Vite 프런트엔드 + 해당 main의 local backend, 기존 PostgreSQL 학습 데이터를 Chrome에서 실제 조작했다. 기본 데스크톱 약 1900px 폭과 모바일 390×844을 확인했다. Chrome의 실제 DOM, 접근성 트리, 화면 캡처와 계산된 스타일을 사용했다. 저장소에 스크린샷은 추가하지 않았다.
- Cloud: main SHA의 성공한 production 배포 `https://csforge-ghy5wr95r-guseoh.vercel.app`에서 `/login`의 데스크톱·모바일, 미인증 `/` → `/login`을 확인했다. 허용된 Google 계정이 없으므로 OAuth 성공, 403 계정 거부와 로그아웃 회복은 코드 근거로 평가했다.
- Local DB는 깨끗한 첫 설치가 아니다. 15개 영역 중 일부는 문제 0개이고 Learning은 canonical bootstrap이 아직 필요하다고 알렸다. `Concept /concepts/232`의 0문항과 동명 Concept 이동은 이 데이터셋에서 재현됐지만, 후속 clean canonical bootstrap 검증에서 재현되지 않았다. 후속 canonical bootstrap Testcontainers 검증은 15개 영역의 721개 PUBLISHED Concept 모두에 대해 연결된 PUBLISHED Question과 Quiz availability가 일치하고 0문항이 없음을 확인했다. previous/next도 LearningArea 안의 Topic→Concept 정렬 계약과 일치했다. 따라서 F01/F02는 `NOT_REPRODUCED_ON_CANONICAL`로 기록하며 product issue 우선순위에서 제외한다.
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
| 3 Learning Area→Topic→Concept | 영역 15개와 Topic rail로 이동 가능. 모바일에서는 rail을 접어 읽기 공간을 보존한다. 초기 partial DB에서는 F02가 보였지만 canonical 순차 정렬 검증 후에는 제품 결함으로 재현되지 않았다. |
| 4 Concept 읽기→note/bookmark/learned→관련 Quiz | 본문과 note, 완료/복습 필요/bookmark가 분리돼 있다. note 저장 중·저장됨과 새로고침 보존 확인. 초기 partial DB에서 `/concepts/232`의 Quiz CTA가 0문항이었으나 clean canonical 검증에서는 모든 PUBLISHED Concept에 유효한 문제 수가 확인됐다(F01: `NOT_REPRODUCED_ON_CANONICAL`). |
| 5–6 Quiz 조건→시작→이동/자동 저장→제출 | preset은 한 번 선택 후 하나의 시작 버튼으로 이어진다. 복습 Quiz의 선택·입력→저장됨→reload 보존, 직접 문항 목록, 일반 시간 만료 세션의 read-only 제출까지 수행했다. 모바일 입력·문항 목록도 작동했다. |
| 7–8 Result→원인 확인→retry/Concept/Review, Wrong Note→detail→retry | 오답 답 비교와 관련 Concept 이동, retry CTA가 있다. 자기채점은 먼저 완료해야 retry가 열린다는 이유를 설명한다. 같은 Quiz의 정확도 표기가 Dashboard와 달랐다(F03). |
| 9 Review 탐색→시작→완료 | overdue 4문항으로 Review Quiz를 시작했고 자기채점 후 due 0건, 24시간 내 5건/7일 내 2건으로 갱신됐다. wrong/right에 따른 일정 방향은 화면에서 구분됐다. |
| 10 Search→filter→실제 학습 화면 | DNS 검색에서 Concept 결과는 열렸다. Question 결과는 카드만 있고 동작이 없어 다음 학습으로 이어지지 않았다. Palette의 Question 제안도 동일하다(F04). |
| 11 중단 Quiz resume | Dashboard·Quiz setup에 resume CTA가 보였다. 모바일 Quiz `#4`를 나가자 setup에 0/5 resume가 나타났다. Review 답안은 reload 뒤 그대로였다. |
| 12 Import select→validate→preview/diff→confirm→result | 첫 단계와 상태 구분은 browser, 나머지는 code. Chrome 확장의 upload 권한 때문에 파일 선택 이후의 UX는 미검증이다. 이 route로 가는 제품 내 링크도 찾지 못했다(F08). |
| 13 Cloud login→failure/recovery→진입 | 배포의 미인증 root는 Login으로 보냈다. 성공·403은 계정 부재로 미검증. 코드에서는 허용 계정 403은 logout 후 재시도 가능하지만 일반 auth 오류에는 실행 가능한 retry가 없다(F06). |
| 14 Mobile 핵심 flow | 390×844에서 1–11의 화면/CTA를 실제 사용했고 가로 페이지 overflow는 관찰하지 못했다. 필터의 밀도, menu의 열린 상태 유지, 낮은 대비 메타데이터가 남았다(F07/F09/F10). |

## Severity findings

전반적 `BLOCKER`는 없음. 아래 severity는 구현 순서와 별개다. F01/F02의 `HIGH`는 초기 partial DB에서 재현된 경우의 사용자 영향이며, clean canonical 검증에서는 재현되지 않아 구현 후보에서 제외한다. 특정 DB·계정 상태에서만 나타난 현상은 범위를 명시한다.

| ID | Severity | Finding / browser evidence | Code evidence / 사용자 영향 |
| --- | --- | --- | --- |
| F01 | **HIGH** | 초기 partial DB에서 `/concepts/232` “이 개념 문제 풀기”가 0문항으로 도착하고 시작이 disabled였다. clean canonical 검증에서는 721개 PUBLISHED Concept 모두 출제 가능 Question이 있었고 Quiz availability와 연결 수가 일치했다. `NOT_REPRODUCED_ON_CANONICAL`; 현재는 데이터 bootstrap 상태 관찰이지 검증된 product defect가 아니다. | `ConceptPage.tsx:155-162`, `QuizSetupPage.tsx:212-229,362-382`; clean bootstrap Testcontainers integration test. |
| F02 | **HIGH** | 초기 partial DB에서 동명 Concept의 이전 이동이 다른 Topic으로 보였다. clean canonical 검증에서 previous/next는 LearningArea 내부의 `topic.displayOrder → concept.displayOrder → id` 계약과 일치했고 Topic 경계 이동은 정상 계약이다. `NOT_REPRODUCED_ON_CANONICAL`; 동명 콘텐츠가 섞인 초기 DB에서만 혼동 가능성이 관찰됐다. | `ConceptPage.tsx:224-225`; canonical navigation integration test. |
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

아래 구현 순서는 Issue #169의 final review 결정을 반영한다. Severity는 문제가 재현될 때의 영향이고, 순서는 canonical 재현 여부와 일상 흐름 영향을 함께 고려한다. 빈도는 측정 트래픽이 아니라 해당 경로의 예상 반복성이다.

### NEXT

**C02 — Quiz 성과 지표의 동일한 의미 (F03, HIGH).** 문제/flow: 제출→Result→Dashboard에서 같은 Quiz가 50%/25%로 다르게 보인다. 근거: Quiz #2 browser 관찰; QuizResultCalculator.java:75, DashboardQueryService.java:208-222, QuizResultPage.tsx:311-317, DashboardPage.tsx:222. 빈도: Quiz 종료와 최근 기록 확인 때마다. 영향: 학습 성과와 재도전 판단의 신뢰를 떨어뜨려 daily loop 피드백을 왜곡한다. 방향/범위: 기존 #170의 정확도 계약을 사용해 finalizedCount = correct + wrong + unanswered = total - selfCheckPending, accuracy = correct / finalizedCount로 Result와 Dashboard 의미·라벨을 일치시킨다. 의존: 이미 정해진 unanswered 및 self-check 정책. Responsive/a11y: 작은 화면에도 분모와 pending 의미를 텍스트로 제공하고 색만으로 구분하지 않는다. 회귀 위험: 기존 통계·heatmap 및 API 소비자. 수용: partial, unanswered, pending, all-pending 사례에서 두 화면의 정확도와 설명이 계약대로 같다. **NEXT 1순위 이유:** 실제 재현된 완료 피드백의 correctness 문제다.

**C03 — Search actionability와 palette keyboard 접근성 (F04/F05, HIGH).** 문제/flow: Search→Question hit에서 학습 위치로 갈 수 없고, palette에서 Shift+Tab이 modal 밖으로 이동한다. 근거: DNS 114건 Question 카드와 palette 제안, 390×844 Chrome keyboard 재현; search-ui.ts:46-56, SearchPage.tsx:260-268, SearchPalette.tsx:110-230. 빈도: Question hit가 있는 검색마다; keyboard 사용자는 palette 접근 때마다. 영향: 발견한 콘텐츠를 학습으로 잇지 못하고 keyboard 사용자가 배경 UI로 이탈한다. 방향/범위: Search page와 palette의 같은 destination policy, 유효 목적지 없는 항목의 action 표시 금지, open focus·Tab 순환·Escape close·trigger 복원·배경 비활성화를 함께 정의한다. 의존: 명시적 Question destination/fallback과 palette의 dialog/focus contract. Responsive/a11y: desktop/mobile 모두 keyboard와 touch로 검증하고 modal semantics에 맞는 focus containment를 제공한다. 회귀 위험: 기존 Wrong Note/Concept 우선순위, 최근 검색, arrow/Enter, Escape, backdrop. 수용: 각 검색 유형은 유효 목적지로 이동하거나 action이 아니며, modal focus는 안에 머물고 닫으면 trigger로 돌아온다. **NEXT 2순위 이유:** 매일 쓰는 공통 발견 경로의 실행·접근성 결함이다.

**C08 — Theme/token foundation과 dark mode (F12/F09, MEDIUM).** 문제/flow: OS가 dark를 선호해도 login·Concept·Quiz 등 주요 화면은 light이고 일부 작은 보조 텍스트 대비가 AA 미달이다. 근거: dark preference의 color-scheme: light, 31 CSS의 386 hex 표기/20 !important/4 :root, text-faint 대비 계산 3.42–3.66:1; main.tsx:8-38, foundation.css:7-33, styles.css, ui-refresh.css, density.css. 빈도: dark 선호자의 매 세션, 낮은 대비 텍스트를 읽을 때 반복. 영향: 긴 학습 본문과 상태를 읽는 편의·가독성을 낮추며 MVP_V1의 dark UI 요구를 충족하지 않는다. 방향/범위: theme 작업의 첫 단계로 foundation.css의 semantic token ownership을 확립하고 실제 적용에 필요한 직접 색만 정리한 뒤 system/light/dark, persistence, 초기 paint, Markdown/code/table/status/skeleton/native controls를 검증한다. 대규모 CSS rewrite는 범위 밖이다. 의존: token별 의미와 status contrast 기준. Responsive/a11y: light/dark 양쪽의 일반 텍스트 4.5:1, focus, reduced motion 및 mobile layout 확인. 회귀 위험: route별 override, native controls, syntax blocks, table/overlay, flash. 수용: OS preference와 수동 선택·새로고침 뒤 모든 주요 route에서 대비와 상태 구분이 유지된다. **NEXT 3순위 이유:** 명시된 제품 요구와 장시간 읽기 사용성을 충족하면서 앞선 correctness·Search를 선행한다.

**C05A — Cloud auth retry와 deep-link recovery (F06, HIGH).** 문제/flow: transient session 오류에 실행 가능한 retry가 없고, 보호 경로에서 Login을 거치면 성공 뒤 root로 이동한다. 근거: local auth 500의 텍스트 전용 상태, production 미인증 redirect; AuthGate.tsx:22-50, LoginPage.tsx:16-54, router.tsx:38. 빈도: cloud session 만료·일시 장애·deep-link 첫 진입 때. 영향: 학습하던 Concept/Result로 복귀하지 못해 cloud daily loop를 중단한다. 방향/범위: session 재조회 retry, 안전한 내부 return path 보존·소비, 403 recovery와 logout 상태 정합성. 의존: 기존 OAuth callback contract와 안전한 redirect validation. Responsive/a11y: 오류 안내와 retry에 명시적 이름·focus·announcement를 제공한다. 회귀 위험: auth loop, open redirect, logout 후 stale return path. 수용: 401/403/일반 오류/성공에 각각 다음 행동이 있고 안전한 deep link는 성공 후 복원된다. **NEXT 4순위 이유:** Login 화면의 polish보다 실제 task recovery 계약을 먼저 해결한다.

### LATER

**C06A — Mobile navigation lifecycle (F07, MEDIUM).** 문제/flow: mobile menu를 펼친 채 logo로 Dashboard 이동하면 열린 menu가 새 화면을 덮는다. 근거: 390px browser 관찰; router.tsx:46-68에서 route nav만 menu를 닫는다. 빈도: mobile menu에서 logo/다른 route를 선택할 때. 영향: 새 화면의 첫 내용을 가리고 현재 위치 파악을 늦춘다. 방향/범위: shell route transition마다 menu close를 일관되게 처리한다. 의존: 없음. Responsive/a11y: menu state와 focus 복귀가 같은 화면 전환에 맞아야 한다. 회귀 위험: nav target, keyboard focus, browser back. 수용: logo와 nav link 등 어느 경로로 이동해도 이전 menu가 새 route 위에 남지 않고 focus 순서가 유효하다. **LATER 5순위 묶음:** 핵심 flow는 가능하며 작은 shell 수정으로 처리한다.

**C06B — Quiz setup filter density (F10, MEDIUM).** 문제/flow: Quiz 상세 설정에서 15개 영역 선택지가 긴 스크롤을 만들고 빈 영역도 선택지로 노출된다. 근거: 390px Quiz setup browser; QuizSetupPage.tsx:270-354, quiz-setup-guide.css. 빈도: 범위를 직접 설정하는 mobile 사용 때. 영향: 반복 조건 선택의 시간·인지 부담을 높이나 preset으로 시작할 수 있다. 방향/범위: 사용자가 고르는 단계와 기본값을 유지하면서 filter grouping/disclosure 또는 0문항 안내를 개선한다. 의존: C01은 canonical에서 재현되지 않아 dependency로 두지 않는다. Responsive/a11y: label, expanded state, keyboard/touch target을 확인한다. 회귀 위험: query string, availability count, preset semantics. 수용: 좁은 화면에서 현재 선택과 가능한 문항 수를 읽고 조건을 잃지 않고 시작한다. **LATER 5순위 묶음:** 직접 설정을 자주 쓰는 사용자에게 한정된 밀도 개선이다.

**C06C — Review period filter layout (F10, MEDIUM).** 문제/flow: Review의 다섯 기간 filter가 390px에서 빽빽하게 한 줄로 모인다. 근거: 390×844 Review browser; ReviewPage.tsx, step8-review.css:246+. 빈도: due 범위를 좁혀 복습할 때. 영향: 기간 구분을 늦추지만 목록과 날짜는 정상 확인 가능하다. 방향/범위: small viewport에서 period controls를 읽기 쉬운 줄바꿈/그룹으로 배치한다. 의존: due status의 의미는 변경하지 않는다. Responsive/a11y: focus order, label, touch target과 200% 확대를 확인한다. 회귀 위험: 선택 상태와 URL search sync. 수용: 다섯 선택지를 겹침·가로 overflow 없이 식별하고 기존 선택/필터 동작을 유지한다. **LATER 5순위 묶음:** 사용성은 유지되며 좁은 route polish로 해결한다.

**C06D — Due/overdue state wording (F11, MEDIUM).** 문제/flow: Review는 “기한 지남”을 표시하지만 Wrong Note는 같은 시점의 날짜만 보여 우선순위 의미가 다르다. 근거: mobile/desktop Review와 Wrong Notes 관찰; WrongNotesPage.tsx, ReviewPage.tsx. 빈도: due 항목을 확인할 때 반복. 영향: 다음 복습 대상을 고르는 데 혼동을 더하지만 문제를 열고 복습하는 길은 남아 있다. 방향/범위: 날짜·due filter의 도메인 조건을 먼저 구분하고 같은 상태일 때만 공통 용어/배지를 사용한다. 의존: DUE와 DUE_NOW의 실제 범위를 보존한다. Responsive/a11y: 상태를 텍스트로 식별하고 배지 대비·좁은 목록을 확인한다. 회귀 위험: timezone, overdue 경계, 서로 다른 filter 의미를 같게 만드는 오류. 수용: 같은 상태는 route 간 같은 표현이고 다른 범위는 설명이 명확하다. **LATER 5순위 묶음:** 공유 status semantics를 좁게 정렬하며 공통 component를 강제하지 않는다.

**C06E — Markdown literal URL과 한글 조사 (F14, MEDIUM).** 문제/flow: www.example.com을의 조사가 외부 링크에 포함되어 잘못된 목적지가 된다. 근거: browser Quiz #3와 Result; MarkdownContent.tsx의 remark-gfm literal autolink. 빈도: URL 뒤 조사가 오는 문제를 읽을 때; corpus 전체 빈도는 미측정. 영향: 학습 본문에서 원치 않는 외부 이동이 가능하다. 방향/범위: canonical content를 고치지 말고 renderer boundary에서 GFM literal autolink만 분리한다. 의존: explicit Markdown·angle link와 Korean URL을 보존하는 parser rule. Responsive/a11y: 링크 이름과 조사 텍스트가 읽기 순서에서 분리되지 않게 한다. 회귀 위험: URL punctuation, percent-encoding, explicit/angle link, inline/fenced code. 수용: 대표 조사와 정상 URL/link fixture에서 href에는 URL만 남고 화면 문장은 보존된다. **LATER 5순위 묶음:** 정확도·Search·theme/auth 이후 별도 rendering fix로 처리한다.
**C05B — Login first-entry presentation (F13, LOW).** 문제/flow: Cloud Login이 제품 목적보다 배포 내부의 단일 Google account 설명을 먼저 전달한다. 근거: production /login desktop/mobile, LoginPage.tsx:44-54. 빈도: 신규 cloud 사용자의 첫 진입. 영향: 제품 이해와 첫인상을 낮추지만 CTA와 기존 로그인 경로는 명확하다. 방향/범위: 학습 목적을 한 문장으로 소개하고 Google CTA를 중심으로 보조 안내를 재배치한다. Signup/password/member는 추가하지 않는다. 의존: C05A의 auth recovery와 현재 Google contract 유지. Responsive/a11y: existing mobile card, heading hierarchy, nested main landmark를 함께 확인한다. 회귀 위험: auth messaging·pending/error/403 hierarchy. 수용: 첫 화면에서 제품 목적·로그인 action을 이해하고 모든 auth 상태가 읽기 가능하다. **LATER 6순위:** 별도 presentation polish는 recovery 뒤에 둔다.

**C07 — Import 발견성과 단계별 오류 회복 (F08, MEDIUM).** 문제/flow: /settings/import로 가는 제품 내 진입점이 없고 Preview/Diff 이후의 파일 workflow를 browser에서 확인하지 못했다. 근거: Import 첫 화면 desktop/mobile, router.tsx:177, ImportPage.tsx:49-151; Chrome 확장 파일 접근 제한. 빈도: 저빈도 bulk content 관리. 영향: 콘텐츠 준비·오류 수리 시간을 늘리지만 평소 daily loop 영향은 낮다. 방향/범위: 낮은 빈도 utility 진입점과 valid/unchanged/invalid/stale/apply-failure/retry 상태를 실제 파일로 검증한다. 의존: 업로드 가능한 격리 테스트 환경과 sample files. Responsive/a11y: long diff, item error, file selection을 mobile/keyboard로 확인한다. 회귀 위험: idempotency, digest, selected-file preservation, import discoverability. 수용: 사용자는 진입점과 현재 단계·다음 행동을 알고 오류 후 파일 재선택 없이 회복할 수 있다. **LATER 7순위:** 관리 작업은 중요하지만 반복 daily learning보다 빈도가 낮고 flow evidence가 제한됐다.

### HOLD

**C01 — Concept→practice availability/navigation observation (F01/F02, HIGH if reproduced; NOT_REPRODUCED_ON_CANONICAL).** 초기 partial DB에서 0문항과 동명 Concept 이동이 보였지만 후속 clean canonical Testcontainers 검증에서 15개 영역·721개 PUBLISHED Concept의 Question link/Quiz availability가 일치했고 ordering도 현재 LearningArea 계약과 일치했다. 영향을 받는 flow는 Area→Concept→Quiz→next Concept이며 초기 browser에서는 시작 불가·위치 혼동 영향이 컸다. 현재 canonical에서 관찰 빈도는 0/721이다. 해당 검증은 app code 변경 없이 content/bootstrap·query 계약을 점검했다. 별도 product scope나 dependency를 만들지 않는다. responsive/a11y 구현도 현재 필요하지 않다. 회귀 위험은 future canonical content 변경에서의 0문항 또는 ordering mismatch다. 기존 통합 검증을 유지하고 clean canonical browser evidence가 다시 나오면 재분류한다. **HOLD 이유:** initial finding은 실제 화면 관찰이지만 clean canonical에서 재현되지 않아 지금 product behavior를 바꾸면 잘못된 계약 변경일 수 있다.

**C09 — 광범위한 route별 visual polish (LOW).** 문제/flow: 세부 spacing/card/radius를 더 다듬을 수 있으나 browser에서 완료를 막는 visual defect는 확인하지 못했다. 근거: Dashboard, Concept, Quiz, Result, Wrong Note, Review, Search, Login 비교와 main.tsx:8-38의 correction CSS. 노출은 상시지만 완료 시간 개선 근거는 없다. 구체적 사용성 증거 없이 route 전체를 재설계하지 않는다. 의존: C02/C03/C08 이후 정리되는 상태·theme 계약. Responsive/a11y: 향후 좁은 scope에서 contrast·zoom 회귀를 확인한다. 회귀 위험: cascade 우발 변경. 수용: 특정 task의 관찰 가능한 개선 근거가 있을 때만 해당 route를 한정한다. **HOLD 이유:** 지금은 visual taste 외에 비용 대비 효과를 입증하지 못했다.

## Issue #169 Special Decisions

| # | 결정 |
| --- | --- |
| 1 | **Login은 두 문제로 나눈다.** Auth retry/deep-link recovery는 C05A, LATER의 first-entry visual polish는 C05B다. Google single-user contract는 유지하며 Signup/password/member를 추가하지 않는다. |
| 2 | **Dark mode/theme은 다음 우선순위 안에 둔다 (C08, NEXT 3순위).** MVP_V1에 dark UI가 명시되어 있고 현재 light 고정이므로 단순 미적 취향으로 미루지 않는다. Accuracy와 Search 뒤, auth recovery 앞에 둔다. |
| 3 | **Theme/token foundation은 같은 theme 작업의 첫 단계다.** 별도 대규모 CSS 정리보다 semantic ownership, 필요한 direct-color migration, contrast acceptance를 함께 수행한다. |
| 4 | **가장 큰 재현 가능한 daily-loop 마찰은 Quiz 성과 피드백의 정확도 의미 차이(F03)**다. Concept/Quiz F01/F02는 partial DB에서만 관찰되고 clean canonical에서 재현되지 않았다. |
| 5 | **가장 큰 가시적 state inconsistency는 같은 Quiz 정확도의 Result/Dashboard 차이(F03)**이며 due/overdue 표현 차이(F11)가 뒤따른다. Pure spacing 차이는 우선순위가 낮다. |
| 6 | **우선순위는 correctness/trust → Search actionability/accessibility → theme/token/dark mode → auth recovery → targeted mobile/state/rendering → login visual polish → Import discoverability → broad visual polish HOLD** 순서다. 각 수정은 책임이 작은 issue scope로 나눈다. |
| 7 | **모바일 전체 loop BLOCKER는 관찰되지 않았다.** 다만 HIGH인 palette keyboard focus escape(F05)는 모바일에서 재현됐다. filter 밀도·menu lifecycle·대비는 MEDIUM이며 F01/F02는 canonical 미재현이다. |
| 8 | **즉시 다룰 접근성 HIGH는 검색 dialog focus escape (F05)**다. 작은 보조 텍스트 대비(F09)는 MEDIUM이고 C08 theme acceptance에서 재측정한다. |
| 9 | **Loading/error/recovery는 공통으로 다음 행동을 이해할 수 있어야 한다.** AsyncStates retry가 있어도 auth 일반 오류와 0문항 대체 행동은 부족하다. 모든 상태 UI를 한 component로 강제하지 않고 원인·retry·복구 의미를 통일한다. |
| 10 | **Quiz setup→session→result 기본 task는 이어지지만 정확도 의미가 어긋난다.** preset, autosave/resume, self-check 순서는 관찰됐고 F03이 결과 신뢰를 떨어뜨린다. |
| 11 | **Concept→Question→Wrong Note→Review 연결은 부분적으로 유지된다.** Result/Wrong Note의 retry·Concept·Review 이동은 작동한다. F01/F02는 초기 partial DB의 관찰이며 clean canonical 검증 후 구현 결함으로 보지 않는다. |
| 12 | **Search는 Concept 외 Question 결과에서 학습 흐름으로 이어지지 않는다 (F04).** palette focus 문제(F05)와 함께 C03에서 다룬다. |
| 13 | **Dashboard는 metric보다 “오늘 무엇을 할지” 안내하는 화면에 가깝고 제품 목적에 맞다.** active Quiz/due Review/최근 Concept 우선 hierarchy는 유지하되 F03 성과 수치는 수정한다. |
| 14 | **다음 구현 후보는 기존 #170의 Quiz Result↔Dashboard 정확도 계약 (C02)**이다. F01/F02는 clean canonical에서 `NOT_REPRODUCED_ON_CANONICAL`이며 재현될 때까지 구현 후보에서 HOLD한다. 이 audit에서 구현 Issue를 생성하지 않는다. |

## Recommended next Issue scope and non-goals

가장 먼저 다룰 범위는 기존 #170의 **Quiz Result↔Dashboard accuracy semantics**다. Correct, wrong, unanswered, self-check-pending의 분모 계약과 두 화면의 라벨을 함께 검증한다. 후속 순서는 Search Question destination+palette focus, theme/token foundation+dark mode+contrast, auth recovery, 좁은 mobile/state/rendering fixes, login first-entry polish, Import discoverability다. F01/F02는 clean canonical에서 다시 재현되지 않는 한 product change를 하지 않는다.

이번 audit의 non-goals: UI/UX 구현, dark mode, CSS/component refactor, backend/auth 변경, dependency 추가, 기능·콘텐츠 변경, 구현 Issue/PR 생성. 이 문서와 Issue #169 결과 comment만 산출한다.
