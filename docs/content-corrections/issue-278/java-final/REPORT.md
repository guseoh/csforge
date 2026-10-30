# Issue #278 Java 최종 로컬 검증

2026-10-29, `refactor`, 검증 기준 부모 HEAD `e411fb8b2c145032f45833cfcce9d47d3144d184`.

**로컬 필수 gate PASS.** 이 문서는 commit 전 검증 snapshot이다. 원격 결과는 push된 정확한 HEAD의 GitHub **Repository Validation** run과 최종 응답에 기록한다. PR·merge·Production 배포는 하지 않는다.

## 구현과 최소 교정

기존 97 Concept·565 Question 교정과 51개 inline 도식 구현, Functional·Streams 변경을 보존했다. 전체 Java 범위는 **18 Topic·145 Concept·843 Question**이다. #270의 로컬 파일과 `backend/bin/`은 변경·stage 대상에서 제외한다.

- D2의 실제 공식 `postHtml` 원문을 읽고 Java 25 공식 문서와 대조했다. 현재 canonical은 **고유 글 10개·Concept Reference 배치 14개**다. 이전 “11개” 집계를 정정했다. GC 글 연도와 Thread 상태·Unicode/charset의 역사적 한계를 3개 Reference 주석에서 교정했다. URL/anchor 검사로 원문 검토를 대체하지 않았다.
- NONE 원본 구조 블록 26개 중 그대로 남아 있던 **20개·14개 파일**을 문장으로 옮겼다. 코드·비교 값·실행 결과는 유지했다. 새 inventory/key/중복 전수 검사는 반복하지 않았다.
- 실제 Java 25 관측값과 도식 snapshot을 비교하는 `JavaFinalExamples.java`와 `java-final-semantic.test.ts`를 추가했다. 자원 종료·실패 원자성·DST·CAS·allOf·join·큐/래치/세마포어·거부 정책·ScopedValue·초기화·실제 javac/javap를 대조한다. GC 시점·JIT 시점·carrier 배정의 비결정성은 보장으로 취급하지 않는다.
- Import 검사를 한 독립 PostgreSQL에 18 Topic이 누적되도록 보완하고 빠졌던 `concept_view_history`를 포함했다. JDBC는 기존 테스트 fixture에만 사용했다.
- 5초 제한에 걸린 두 Markdown 묶음 렌더링 검사를 파일별 `it.each`로 분리했다. 전체 Backend에서 발견한 과거 Reference fixture의 현재 문자열 3개를 새 주석에 맞췄다. **과거 입력은 보존**했다.

## 최종 검증

| 검사 | 결과 |
| --- | --- |
| 이전 Backend 전체 결과 확인 | PASS: 54 suites·193 tests·failure/error 0·환경 skip 1 |
| 이번 Backend 전체 `test build` | 54 suites·193 tests 중 stale fixture **1 fail**, error 0·skip 1. 53m26s. 실패를 숨기지 않음 |
| 원인 교정 후 최종 focused `test ... build` | **5 suites·14 tests PASS**, failure/error/skip 0, BUILD SUCCESSFUL 13m28s. 위 실패와 마지막 콘텐츠 delta의 Import·bootstrap·도식 계약을 재검증 |
| Frontend `npm.cmd run build` | **PASS**: TypeScript·Vite·PWA. lint가 같은 TypeScript 명령이므로 중복 실행하지 않음 |
| Frontend `npm.cmd test` | **80 files·698 tests PASS**, Java 25 실제 예제·승인된 도식 tier 대조 포함 |
| Compose CI 동등 config | **PASS**: local, dummy secret을 준 production, secret 누락 거부. 배포 없음 |
| D2 원문·공식 문서 대조 | **PASS**, `d2-source-evidence.json`. 기존 208 URL/anchor PASS는 유지하고 재실행하지 않음 |
| 최종 Import 멱등성·이력 | **PASS**, 아래 참조 |
| 실제 브라우저 | **PASS**, 아래의 명시적 검사 범위 |
| Git diff | `git diff --check` PASS; stage 직전 최종 delta도 확인 |

Backend 원래 전체 결과는 `backend-full-results.json`, 원인 교정 후 결과는 `backend-delta-results.json`에 보존했다. 테스트 실패를 수정한 뒤 직접 관련 범위를 재검증했고, 무관한 전체 suite를 또 반복하지 않았다. 최종 CI는 전체 suite를 push된 HEAD에서 다시 실행한다.

## Import 멱등성과 개인 이력

PostgreSQL Testcontainers에서 이전 본문·해설 baseline에 개인 이력을 넣은 뒤, **18 Topic을 같은 DB에 순서대로 누적**했다. Preview 오류 0 → Apply → 재Preview 전부 UNCHANGED → 재Apply를 확인했다. 최종 145 Concept·843 Question, Topic 18개와 Concept/Question ID·choice ID/key/order·answer·Concept 연결·Question type/difficulty/status를 보존했다.

`concept_progress`(bookmark 포함), `personal_note`, `concept_view_history`, `quiz_session`, `quiz_question`, `attempt`, `wrong_note`, `review_schedule`, `review_history` **9개 테이블의 전체 행 내용**을 update/reimport 전후 비교했고 최종 각 145행을 보존했다. 마지막 prose 교정 후 최종 14-test 실행에도 이 검사가 포함돼 통과했다. 실제 개인 DB에는 적용하지 않았다.

실제 QA 앱에서도 최신 원본 18 Topic·145 Concept·843 Question을 multipart Preview/Apply/UNCHANGED/reapply했다. `qa2-java-import.json`과 고정 loopback 전용 재현기 `qa_import_java.py`가 근거다.

## 브라우저 검사 범위와 복구

실제 앱 `http://127.0.0.1:5178/learning/java`와 `/concepts/{id}`, backend `127.0.0.1:8188`, 독립 무볼륨 PostgreSQL을 사용했다. 최종 판정에 mock Reader를 사용하지 않았다.

- **145 Reader**의 본문·fallback·가로 넘침을 확인했다. 최초 73개 뒤 최종 원본으로 나머지 72개, 앞부분 도식과 마지막 변경 페이지를 추가 확인했다. 최종 QA2 116개와 변경 없는 NONE 29개가 합쳐진 범위다.
- **85개 도식 × light/dark × 1440/1280/390px = 510개 화면 검사**에서 미해결 경계 오류 0. V2 정방향 **107회**, 역방향 **107회**, 각 초기화를 라이트 1440px에서 확인했다. 테마/폭 매트릭스는 초기화 상태에서 확인했으며 모든 상태×테마×폭을 전수 순열로 검사한 것은 아니다.
- PriorityQueue `offer(-5)` 5회 전진, `poll()` 4회 전진·4회 후진, `abc` 입력 거부, Enter 초기화를 확인했다. Buffer Enter 단계 이동과 모바일 키보드 가로 스크롤 **0→40px**, 페이지 넘침 없음도 확인했다. 실제 Record·Buffer light/dark 모바일과 신규 CAS 관계도 화면을 시각 확인했다.
- Buffer의 의도된 외부 인덱스를 node 내부로 오인한 검사 오탐은 SVG 좌표·화면 대조로 해소하고 재검사했다. 외부 인덱스도 canvas 경계 검사는 유지한다.
- Chrome 제어 30초 timeout과 IAB 긴 batch·재연결 15초 timeout이 있었다. 당시 가용 물리 메모리 34,040 KiB/8,217,940 KiB를 관측했다. QA 프로세스 종료 후 752,156 KiB로 회복했고 **같은 IAB가 다시 작동**했다. 작은 batch와 제한 heap의 QA2에서 검사를 완료했다. 메모리를 유일한 원인으로 단정하지 않는다.
- 임시 viewport reset, QA 탭 종료, QA 전용 Vite/backend·PostgreSQL 종료를 완료했다. 사용자 컨테이너·볼륨은 변경하지 않았다.

상세 결과는 `browser-qa2-results.json`, 전체 gate는 `validation-results.json`, 전체 변경 파일은 `stage-paths.txt`를 참조한다. GitHub CI 결과는 이 snapshot 이후 생성되는 검증 커밋의 정확한 SHA로 확인한다.
