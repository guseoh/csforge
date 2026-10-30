# Java 잔여 12 Topic 작업 체크포인트

기준 `refactor` HEAD: `e411fb8b2c145032f45833cfcce9d47d3144d184`. 원격 HEAD도 같은 커밋이다.
기존 Functional·Streams 미커밋 변경과 #270의 로컬 파일은 그대로 보존한다.

- 잔여 12 Topic의 감사 항목은 Concept 97개, Question 565개다.
- Java 감사의 Concept 145개에 대해 contentKey의 존재·일치·중복과 references 필드 존재를 확인했다.
- 잔여 565개 Question의 contentKey 중복, Concept key 존재, 객관식 선택지 key·순서 중복 및 정답 key 존재 검사 결과 오류는 0이다. 이는 기술 내용·정답의 정확성 심사가 아니다.
- 감사상 대상 V1/V2 중 `csforge-viz` 선언이 없는 Concept은 51개다. 이 집계는 기존 외부 SVG를 완성된 inline 선언으로 세지 않으며 도식 내용의 적합성을 검증하지 않았다.
- 미완료 선언 수: api-design 1, design-patterns 6, exceptions-resources 6, time-numeric 3, coding-tests 1, concurrency 18, jvm-runtime 11, metadata-compatibility 5. functional·streams의 네 선언은 기존 로컬 작업에 있다.
- Java 25 JLS 17, JVMS 5, Thread 및 AtomicInteger API의 원문을 확인했다. 고위험 Concept·Question 전체의 개별 대조는 아직 하지 않았다.

재개: 위 51개 도식의 감사 행과 기존 SVG 판정을 하나씩 구현하고, 97 Concept/565 Question의 기술·문항 내용을 전수 검토한다. 이어서 Java 예제, 전체 격리 Import와 이력, 화면 매트릭스, 전체 테스트 및 CI를 수행한다. 전체 조건을 통과하기 전까지 커밋·push하거나 완료로 표기하지 않는다.

## 순차 구현 재개 지점

현재 작업은 첫 Topic인 **J-functional 진행 중**이다. 앞선 Functional·Streams 로컬 변경을 보존했다. 초기화 식이 없는 지역 변수는 각 분기에서 최초 대입되어 사실상 final일 수 있지만, 람다에서 사용하기 전에 확정 대입되어야 한다는 JLS 4.12.4/15.27.2 경계를 본문과 `lambda-capture-effectively-final.q1` 해설에 반영했다. 정답·식별자·연결은 바꾸지 않았다. V1은 참조 고정과 같은 List의 내용 변경을 분리해 표시하도록 보완했다.

Java 25 컴파일러 회귀 검사(분기별 대입 허용, 미확정 대입·재대입 거부)와 `functional-streams-pack.test.tsx` 3개 검사는 통과했다. 이 검사는 Topic 전수 기술 리뷰나 화면 QA를 대신하지 않는다.

재개 시: J-functional 문항 전량의 잘린 출력 부분을 포함해 내용 검토를 끝내고 기존 공식 Reference를 확인한다. D2 보조 링크는 웹 도구에서 본문 대신 JavaScript 셸만 반환했으므로 실제 글 내용 확인이 남았다. V1의 실제 테마·좁은 화면 확인도 아직 하지 않았다. 이 Topic 완료 판정 후에만 J-streams로 이동한다. 그 뒤 나머지 Topic과 Java 전체 통합 검증은 모두 미완료다.

## 2026-10-28 후속 실행 — 본문·문항 뒤 도식, 마지막에 통합 검증

위 내용은 이전 중단 시점의 기록이다. 이번 사용자 지시로 Topic별 최종 Reference·Import·브라우저 gate를 뒤로 미뤘다. 기존 Functional·Streams 변경, #270의 로컬 파일, 이 체크포인트의 이전 기록을 보존했다. stage·commit·push·PR·merge·Production 배포는 하지 않았다.

### 실제 구현

- 잔여 12 Topic의 **97 Concept·565 Question**을 전수 읽고 기술 내용과 문항을 대조하는 구현 패스를 마쳤다. 적절한 문장은 유지하고 식별자·정답 key·난이도·Concept 연결은 보존했다. 이는 최종 검증 완료 판정이 아니다.
- SAM/Object 메서드·sealed 제약, 람다의 void 호환성·오버로드, forEachOrdered의 순차 terminal action, Optional·record의 얕은 복사, 자원 종료 실패, DST·SMART 파싱·NaN, EnumMap·EnumSet, Comparator 예제, 프록시 원인 예외, timed join·allOf·CallerRunsPolicy·ScopedValue 검사 예외 등을 실제 본문·선택지·근거·해설에서 교정했다.
- 이어서 #277의 남은 **51 Concept에 inline 도식을 구현**했다. api-design 1 → design-patterns 6 → exceptions-resources 6 → time-numeric 3 → coding-tests 1 → concurrency 18 → jvm-runtime 11 → metadata-compatibility 5 순서다. 기존 deque 모델 1개 재사용, 새 고정 예제 50개다.
- 모델: `frontend/src/lib/java-{pattern,resource,time,concurrency,runtime,metadata}-models.ts`. 기존 JavaApiDiagram에 고정 관계도 렌더링을 추가하고 Java/TypeScript 허용 목록·공유 계약 fixture·Curriculum·도식 계약 문서를 맞췄다. 임의 노드·좌표·코드·외부 URL을 콘텐츠에서 받지 않는다. 기존 외부 SVG 파일은 보존했다.
- Import 통합 검사는 기존 네 Topic 검사 범위를 Java catalog의 **18 Topic 전체**로 확장했다. 메서드명은 `javaTopicBatchPreviewApplyReimportPreservesCanonicalIdentitiesAndHistory`다. PostgreSQL Testcontainers의 격리 DB만 사용하며 실제 개인 DB에는 적용하지 않았다.

### 확인된 검증 결과

- Java 25 focused 실행: Functional/Streams, Modern Language, 예외·자원, 시간·수치, API/Enum, 코딩 테스트, Metadata, 실제 ScopedValue preview 코드, 동시성, JVM 초기화 probe가 최종 통과했다. 추가 DST 도식 probe는 Java 25·tzdb **2026b**에서 Paris gap/overlap, Duration 24h 대 Period 1d, 서울·뉴욕 변환을 확인했다.
- `frontend/npm.cmd run build`: **PASS**. TypeScript와 Vite/PWA 빌드를 포함한다. 같은 TypeScript 검사를 중복 실행하지 않았다.
- `frontend/npm.cmd test`: **79 files / 661 tests PASS**. 로그는 `frontend/test-java-final.log`다.
- 이후 최종 본문 정리 후 관련 6개 pack만 실행: **6 files / 23 tests PASS**, `frontend/test-java-final-content.log`. 새 51개 도식의 실제 canonical Markdown 렌더링과 상태·관계 경계를 검사했다. 브라우저 시각 검증을 대신하지 않는다.
- 변경 범위 `git diff --check`: **PASS**. 기존에 통과한 inventory/구조 검사를 별도로 반복하지 않았다.
- Java 전체 Reference **208 URL의 HTTP/최종 URL/anchor 검사 PASS**. 근거는 `java-final/reference-http-results.json`; 재현기는 `java-final/check_references.py`다. **D2 11개는 HTTP 200이어도 추출 결과가 JavaScript 셸이므로 실제 글 본문·날짜·제목 검증은 미완료**다. URL 통과를 내용 검증으로 승격하지 않는다.

### 중단 지점과 미완료 항목

Computer Use가 Windows의 현재 브라우저 URL을 충분한 신뢰도로 식별하지 못해 이번 턴의 UI 제어를 중단했다. 우회 제어를 시도하지 않는다. 실제 QA 페이지 로드와 첫 Concept DOM 확인까지만 성공했으며 **145 Concept 전체·테마·1440/1280/390 화면·모든 단계 정/역방향·초기화·키보드·가로 스크롤 검증은 미완료**다. viewport override 적용 여부도 확인하지 못했으므로 재개 시 남아 있다면 reset해야 한다.

Backend 전체 `test build --no-daemon --console=plain`은 `backend/backend-java-final.log`에 기록 중이며 **아직 성공 판정을 받지 않았다**. 실행 세션은 `87108`이다. 새 Gradle 실행부터 반복하지 말고 먼저 해당 로그/프로세스의 종료 결과를 확인한다. 실행 중 마지막 본문의 중복 안내 문장과 끊긴 설명을 정리했으므로, 전체 실행이 성공해도 아래 최종 콘텐츠 대상 검사를 한 번 수행해야 한다.

```powershell
# backend/: 기존 전체 실행 종료 결과 확인 후 최종 콘텐츠에 대해 한 번
.\gradlew.bat test --tests '*LearningVisualizationValidationTest' --tests '*ContentImportIntegrationTest.javaTopicBatchPreviewApplyReimportPreservesCanonicalIdentitiesAndHistory' --tests '*CanonicalBootstrapIdempotencyIntegrationTest' build --no-daemon --console=plain
```

**정확한 다음 파일/작업**:

1. `backend/backend-java-final.log`: 전체 검사 결과와 첫 실패를 확인한다. 실패 시 관련 검사만 집중 교정·재검증한다.
2. `docs/content-corrections/issue-278/java-final/prepare_browser_fixture.py`: 현재 145개 canonical 본문과 앱 CSS 40개를 읽는 임시 Vite fixture를 만든다. `python docs/content-corrections/issue-278/java-final/prepare_browser_fixture.py` 후 frontend에서 `npm.cmd run dev -- --host 127.0.0.1 --port 5178`로 열어 `/qa-java-final.html`을 검증한다. 임시 fixture는 영속 API를 호출하지 않는다.
3. `java-final/reference-http-results.json`: `title == NAVER D2`인 11개 글의 실제 렌더링 본문·날짜·제목과 기존 relationNote의 역사적 한계를 확인한다. 나머지 URL의 HTTP 성공을 불필요하게 반복하지 않는다.
4. 18 Topic Import Preview → Apply → 전부 UNCHANGED 재Preview → 재Apply, 모든 ID·정답·연결·8개 개인 이력 테이블 보존의 최종 결과를 확인한다. 테스트를 수정한 사실만으로 통과했다고 기록하지 않는다.
5. Compose/CI 동등 검사와 브라우저 결과를 합쳐 미완료를 해결한다. **모든 구현·검증 성공 전에는 stage/commit/push하지 않는다.** 조건 충족 후 관련 파일만 refactor에 commit/push하고 원격 CI를 확인한다. PR·merge·Production 배포 금지는 유지한다.

현재 전체 완료가 아니며 원격 CI도 실행하지 않았다. #277의 NONE 판정에서 문장/표로 옮겨야 하는 잔여 텍스트 구조와 기존 pack의 디자인 후속 기록도 최종 감사 대조 시 누락 여부를 확인해야 한다.

## 2026-10-29 Java Final Validation 후속 결과

이 절이 현재 재개 기준이다. 위 이전 중단 기록을 보존했다. 기준 HEAD `e411fb8b2c145032f45833cfcce9d47d3144d184`는 그대로이며 stage·commit·push하지 않았다. #270의 두 파일과 `backend/bin/`은 그대로 보존했다.

### 이번에 실제 완료한 교정·검증

- 이전 Backend 전체 실행은 **54 suites·193 tests·failure/error 0·skip 1, BUILD SUCCESSFUL**이었다. 종료 뒤 connection 정리 로그를 테스트 실패로 오인하지 않았다.
- D2의 공식 공개 content API에서 실제 `postHtml` 원문을 읽어 Java 25 공식 문서와 대조했다. **현재 고유 D2 글은 10개, Concept Reference 배치는 14개**다. 이전 “11개” 집계는 정정한다. HTTP/anchor 검사로 본문 검토를 대체하지 않았다. 제목·날짜·본문 hash·검토 결과는 `java-final/d2-source-evidence.json`에 기록했다. GC 보조 글 발행 연도, Thread 상태/OS 상태 혼동, 예전 Unicode·String 표현 설명의 한계를 3개 Reference 주석에 교정했다.
- NONE의 원본 구조 블록 26개를 대조해 그대로 남아 있던 **20개 블록·14개 파일**을 문장으로 교정했다. 남은 원본 hash 일치 블록은 0이다. 비교 결과·코드·데이터는 유지했다. 전체 콘텐츠 재작성이나 이미 통과한 key/중복 inventory 반복은 하지 않았다.
- 실제 Java 25의 자원 종료, 실패 원자성, javac/javap, 초기화, DST, CAS/allOf/래치/세마포어/큐/join/거부 정책, ScopedValue/구조화된 자식 상속 관측값을 고정 도식 상태와 대조하는 harness/test를 추가했다.
- Import 검사를 **18 Topic이 한 격리 PostgreSQL에 누적**되도록 수정했다. 빠져 있던 `concept_view_history`를 포함해 **9개 개인 이력 테이블**을 모든 행 내용으로 비교한다. Concept 145·Question 843, ID/choice/answer/연결 보존, 오류 0 Preview→Apply→전부 UNCHANGED→재Apply와 9개 테이블 각 145행 보존을 확인했다. `backend/java-final-import.log`: **4 suites·13 tests PASS, BUILD SUCCESSFUL 3m48s**. 실제 사용자 DB를 바꾸지 않았다. 이 PASS 뒤 마지막 prose 20개 블록을 교정했으므로 마지막 delta의 재검사는 아래 재개 지점을 따른다.
- Frontend 전체 첫 실행의 두 묶음 렌더링 검사가 5초 제한에 걸렸다. 18개/16개 파일을 개별 `it.each`로 분리했으며 해당 두 파일 **42 tests PASS**, 이어 최종 **80 files·698 tests PASS**, TypeScript/Vite/PWA **build PASS**다. `frontend/java-final-{build,test}-retry.log`에 최종 결과가 있다.
- Compose local config, dummy secret을 준 production config, secret 누락 거부 검사가 모두 PASS다. 배포하지 않았다.

### 브라우저 실제 성공 범위와 미완료

이전 URL 식별 실패와 달리 **실제 앱의 `http://127.0.0.1:5178/learning/java` 접근에 성공**했다. 무볼륨 임시 PostgreSQL(55438), 실제 backend(8188), Vite(5178)를 실행하고 QA DB에 canonical bootstrap을 적용했다. 18 Topic·145 Concept 목차를 확인했다.

내장 브라우저에서 **light·1440×900·73 Reader·41 diagram canvas**까지 본문 로드, fallback 부재, text 경계, 페이지 가로 넘침 오류 0을 확인했다. 실제 확인한 ID는 `java-final/validation-results.json`에 기록했다. 반환되지 않은 배치는 통과로 세지 않았다. 첫 단계 기본 렌더링 검사이며, 전체 도식 단계 시각 검사를 통과했다는 뜻은 아니다.

Chrome 탭/제어 요청은 목록 조회와 달리 30초 내 응답하지 않았다. 내장 브라우저도 긴 navigation 배치 뒤 세션이 초기화됐고, 이후 탭 재연결과 viewport 정리 요청이 15초씩 시간 초과됐다. 10:51:49 KST 가용 물리 메모리 **34,040 KiB / 8,217,940 KiB**를 확인했다. 메모리 압박은 관측 사실이며 단독 원인으로 확정하지 않았다. QA 전용 backend·Vite 세션과 PostgreSQL 컨테이너는 종료했다. viewport reset 응답은 확인하지 못했다.

**브라우저 미검증:** 나머지 72개 Reader, dark, 1280/390px, 모든 단계 정/역방향·초기화, 키보드·가로 스크롤, screenshot 시각 검사. 마지막 prose 교정은 QA jar 생성 뒤이므로 최종 내용으로 재bootstrap한 화면도 필요하다. 이 범위를 PASS로 표시하지 않는다.

### 실행 중 결과와 정확한 다음 위치

1. `backend/java-final-all.log`: 최종 전체 `test build` 실행이 진행 중이다. 세션 **96349**, test worker PID **20772**(이 실행에만 해당). 먼저 종료 결과를 확인한다. 무조건 새 전체 실행을 시작하지 않는다. 지연 진단 시점의 thread dump는 `backend/java-final-thread.log`다. PostgreSQL 활동 조회에서는 대기 lock/blocker가 없었고 connection은 idle/COMMIT 상태였다. 조회 시점의 상태이므로 이후 완료나 무한 대기를 단정하지 않는다.
2. 전체 종료 뒤 마지막 prose 변경을 포함해 아래 콘텐츠 대상 검사를 실행한다. 그 결과가 최종 누적 Import·bootstrap gate다.
3. 브라우저가 응답하는 조건에서 실제 앱을 재시작하고 canonical bootstrap 후 미검증 매트릭스를 끝낸다. 실패한 긴 배치를 반복하지 않고 작은 반환 결과를 즉시 보존한다. 임시 viewport reset 여부도 확인한다.
4. 최종 근거는 `java-final/REPORT.md`와 `java-final/validation-results.json`을 갱신한다. 모든 로컬 필수 gate PASS 전에는 stage/commit/push하지 않는다. 따라서 원격 CI는 아직 미실행이다. 조건 충족 시 Java 관련 파일만 명시적으로 stage하고 refactor에 commit/push한 뒤 그 SHA의 Repository Validation을 확인한다. PR·merge·Production 배포는 금지다.

```powershell
# backend/: 진행 중인 전체 실행이 끝난 뒤, 마지막 prose delta의 검증
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot'
.\gradlew.bat test --tests '*LearningVisualizationValidationTest' --tests '*JavaApiContractTest' --tests '*ContentImportIntegrationTest.javaTopicBatchPreviewApplyReimportPreservesCanonicalIdentitiesAndHistory' --tests '*CanonicalBootstrapIdempotencyIntegrationTest' build --no-daemon --console=plain
```

브라우저 gate가 미완료이므로 **Java 전체 완료가 아니다**. 수정 파일 목록은 `java-final/changed-tracked-files.json`; 새 모델·테스트·근거 파일도 미추적 상태로 보존되어 eventual staging 때 명시적으로 포함해야 한다.


## 2026-10-29 최종 로컬 gate 완료 — 위 실행 중·브라우저 미완료 기록을 대체

- Backend 전체: 54 suites·193 tests 중 과거 Reference fixture 현재 문자열의 stale 실패 1개, error 0·skip 1. 세 주석의 현재 fixture만 고치고 과거 입력을 보존했다. 최종 관련 **5 suites·14 tests와 build PASS**로 실패 및 마지막 prose Import·bootstrap·도식 계약을 재검증했다. 원래 실패와 교정 후 결과를 각각 `java-final/backend-{full,delta}-results.json`에 보존했다. 새 전체 실행을 다시 시작할 필요는 없다.
- Frontend **80 files·698 tests**, TypeScript/Vite/PWA build, Compose config·secret 누락 거부가 모두 PASS다.
- 최종 원본 18 Topic·145 Concept·843 Question의 누적 Preview→Apply→UNCHANGED→재Apply와 **9개 이력 테이블 각 145행 전체 내용 보존 PASS**. 실제 QA 앱의 최신 Java multipart Import도 18 Topic 전부 PASS다.
- IAB는 메모리 회복 후 복구됐다. 실제 **145 Reader·85 도식의 light/dark·1440/1280/390px 510 화면**, V2 전진/후진 각107회·초기화, 힙 음수 입력/poll/잘못된 입력, 키보드 단계/초기화·모바일 가로 스크롤 검사를 완료했다. 모든 상태×테마×폭의 순열 전수 검사는 아니며 정확한 범위는 `java-final/browser-qa2-results.json`에 있다. 최종 미해결 브라우저 오류는 없다. 마지막 변경 14개 파일의 화면도 최종 Import에서 확인했다.
- viewport reset·임시 탭 종료·두 QA 환경의 Vite/backend·무볼륨 PostgreSQL 종료를 완료했다. 기존 사용자 DB/컨테이너/볼륨은 보존했다.
- 실제 D2 10개 글·14개 배치 원문 검토와 3개 주석 교정, 남아 있던 NONE 구조 20개 블록·14파일 교정을 포함해 **로컬 필수 gate가 완료**됐다. GitHub Repository Validation은 Java 파일만 명시적으로 stage하여 refactor에 commit/push한 정확한 HEAD로 확인한다. 이 절은 commit 전 snapshot이며 원격 run·SHA는 GitHub와 최종 응답에 기록한다. PR·merge·Production 배포는 하지 않는다.

현재 재개 필요 시 `java-final/REPORT.md`와 `validation-results.json`의 로컬 완료 근거를 먼저 사용한다. 이전 브라우저 실패나 backend 실행 중 기록만 보고 이미 통과한 검사를 반복하지 않는다. 원격 CI 결과 확인만 남은 상태에서 기록한 snapshot이다.
