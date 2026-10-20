# Issue #201 — Operating Systems P0/P1 교정 checkpoint

최신 기준: `main 4dc4dd2989a3aefbddeaf3610c20f2162d5cc2a2` / Draft PR [#251](https://github.com/guseoh/csforge/pull/251). 검증 중인 작업 문서이며 **이 자체가 PR 승인 또는 병합 증거는 아니다**.

## 변경 범위

[Wave 3 Operating Systems 정밀 감사](../../content-audit/learning-experience-2026/wave-3/operating-systems.json)의 **97 Concept / 331 Question**를 기준으로 [Wave 3 findings](../../content-audit/learning-experience-2026/wave-3-findings.json)에서 Issue #201에 연결된 35건을 분리했다. 이번 1차 교정은 P0 15건과 P1 8건, **23건의 알려진 문제**에 대한 코드/문구 조정을 포함한다. 원본 findings와 감사 시점의 해시는 변경하지 않는다.

| 심각도 | Finding ID | 변경 내용 | 대상 |
| --- | --- | --- | --- |
| P0 | W3-OS-001 | `준비`, `준비 상태` 단답 허용 | process-state.q1 |
| P0 | W3-OS-002 | `waitid()`와 API 계열 정답 허용 | wait-reap.q1 |
| P0 | W3-OS-005 | `선착순 스케줄링` 정답 허용 | round-robin.q1 |
| P0 | W3-OS-008 | carrier thread의 정식 표현 허용 | java-virtual-thread-boundary.q1 |
| P0 | W3-OS-009 | 단일 물리 코어 ≠ 단일 논리 CPU; SMT 없는 단일 논리 CPU로 질문 한정 | concurrency-vs-parallelism.q1 |
| P0 | W3-OS-013 | CPU 사이클·CPU 시간 한국어 정답 허용 | spin-vs-block.q1 |
| P0 | W3-OS-018 | page fault를 storage I/O로 단정하는 선택지 전제 제거, zswap in-memory 경로 명시 | page-fault.q1 |
| P0 | W3-OS-019 | 작업 집합을 오름차순으로 쓰도록 문제에 명시 | locality-working-set.q1 |
| P0 | W3-OS-021 | inode/link 및 파일 block 한글 단답 허용 | inode.q4, filesystem-block.q2 |
| P0 | W3-OS-025 | 소켓·파이프의 O_NONBLOCK과 regular file/block device의 예외 경계 | non-blocking-io.md |
| P0 | W3-OS-026 | read would-block / EOF / 오류, readiness와 HTTP 완성 분리 | non-blocking-io.q1, readiness-vs-completion.q2 |
| P0 | W3-OS-028 | 파이프 EOF = 모든 writer 참조 닫힘 + 남은 버퍼 소진 | pipe.q2 |
| P0 | W3-OS-029 | SIGSEGV 등 명령 실행 중 동기 생성 시그널 포함 | signal.md |
| P0 | W3-OS-030 | reset/timeout은 local socket에도 가능한 공통 오류, remote 실패와 구분 | network-socket-ipc.md |
| P0 | W3-OS-034 | Linux fsuid/fsgid vs 일반 Unix effective IDs 구분 | user-group-permission.md |
| P1 | W3-OS-003 | VMA-backed mapping metadata vs page table translation 분리 | process-address-space.md |
| P1 | W3-OS-004 | context switch의 단위 = 논리 CPU, SMT 물리 코어 구분 | context-switch.md |
| P1 | W3-OS-006 | FCFS 세 문항 각각 도착 시각0·단일 CPU·전환비용 무시 독립 전제 | fcfs.q1/q2/q3 |
| P1 | W3-OS-012 | spin 대기 단일 논리 CPU 조건; 물리 core SMT 오해 제거 | spin-vs-block.q3 |
| P1 | W3-OS-015 | T1 waits A와 T2 holds R 원 관측을 보존하는 자원 그래프 예시 | resource-allocation-graph.q4 |
| P1 | W3-OS-020 | dup 공유 오프셋 초기 0, 정확히 100byte read 전제·한국어 답안 | open-file-table.q2 |
| P1 | W3-OS-027 | Linux sendfile zero-copy 경로에서 상대 소비 전 원본 데이터 변경 금지 | sendfile-zero-copy.md |
| P1 | W3-OS-035 | namespace PID1 종료 후 SIGKILL과 종료 전 signal/reap 순서 분리 | container-process-model.q3 |

추가로 교육 효과가 명확한 P2 **9건(W3-OS-007/010/011/014/017/022/023/031/033)**을 최소 보강했다. Round Robin 독립 전제, worker 시작 시점, 가변 상태 용어, 자기 교착, page-table 권한 오해, 0-based 오프셋, `write`/`flush`의 비순차 경계, IPC 선택 기준과 mode bit distractor가 해당한다.

현재까지 **26개 Question의 prompt/model/explanation/accepted/choice-rationale 및 10개 Concept 본문**을 최소 교정했다. `signal.md`의 summary도 본문 정의와 맞게 업데이트했다. 새로운 Question/Concept/SVG/Reference 추가 또는 key 변경 없음.

### 외부 1차 근거 (읽은 원문)

- [Linux open(2)](https://man7.org/linux/man-pages/man2/open.2.html) — regular file/block device의 `O_NONBLOCK` 비적용
- [Linux pipe(7)](https://man7.org/linux/man-pages/man7/pipe.7.html) — 모든 write end closed 및 잔여 byte EOF 조건
- [Linux zswap](https://docs.kernel.org/admin-guide/mm/zswap.html) — RAM compressed swap cache 및 page fault에서 압축 해제
- [Linux pid_namespaces(7)](https://man7.org/linux/man-pages/man7/pid_namespaces.7.html) — namespace init 종료 시 SIGKILL
- [Linux credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html) — fsuid/fsgid vs effective ID
- [Linux signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html) — 동기 hardware exception의 thread-directed signal
- [Linux sendfile(2)](https://man7.org/linux/man-pages/man2/sendfile.2.html) — zero-copy 출력 대상이 데이터를 소비할 때까지 source 부분 불변
- deadlock 실행 방향과 스케줄링 수치·단답은 기존 Wave3 전체 감사 근거를 재사용한다.

### 변경 무결성 및 후속 검증

- Changed JSON 파일의 Concept/Question count와 순서·contentKey 유지, 각 Question의 `questionType`, `difficulty`, `status`, `conceptKeys`, `correctChoiceKey` 전후 일치(현재 branch vs base 파일 직접 비교).
- JSON 한 줄 한 Question인 저장소 포맷 유지.
- MD 10개 중 signal 외 YAML frontmatter 무변경, fenced 코드 경계 보존.
- **전체 구조 검사**: OS 97 Concept Markdown과 331 Question JSON(12파일)을 branch HEAD에서 재조회. 모든 Concept의 Reference 존재·이미지 경로·코드 펜스 균형, Question key 중복·유형별 정답/해설/선택지 rationale/acceptedAnswers의 구조 이상 0. 기존 main과 전체 Question을 key 순서·type·difficulty·status·conceptKeys·correctChoiceKey 기준 대조해 차이 0. 수정 문항 26건의 prompt/answer/rationale 의미 별도 확인.
- **P2 SVG 2건 교정**: W3-OS-024(`block-allocation-tradeoff.svg`)에 indexed entry[0..2] → B7/B20/B9 대상 블록과 명시적 연결선 추가. W3-OS-032(`ipc-tradeoff.svg`)에서 근거 없는 좌→우 격리·공유상태 서열 continuum 제거, 방식별 계약 주석으로 교체. 기존 문서 이미지 경로 유지 및 두 SVG에 접근성 title/desc 추가.
- **자동 검증**: 코드+SVG HEAD `3e7b5ffc348b71e0f500a8a7a4e2192ab1983c30`의 [Repository Validation #39374308356](https://github.com/guseoh/csforge/actions/runs/39374308356) SUCCESS. Backend tests/build, Frontend lint/test/build, Compose validation 성공. 기존 Testcontainers `CanonicalBootstrapIdempotencyIntegrationTest`는 PostgreSQL 전체 canonical bootstrap, preview ERROR0 및 identical reimport UNCHANGED, 학습 이력 보존을 검증하며 이번 test 단계가 통과함. 다만 별도의 *main 이전 OS snapshot → 이번 36개 canonical 교정* 시나리오를 직접 Import한 것은 아님.
- **Vercel Preview**: 동일 HEAD deployment `dpl_P9umv5NcBj7Dryi3woSWJHgpLWSA` READY 확인. [Preview](https://csforge-git-content-issue-201-os-corrections-guseoh.vercel.app).
- **미완료 게이트**: 실제 Preview Reader에서 OS 두 SVG의 375px 모바일/desktop 및 light/dark, zoom/dialog와 삽입 위치를 직접 조작·시각 확인하지 못함. 이전 Wave3 수기 감사와 이번 97C/331Q 구조 및 변경 26Q의 검토는 완료했지만 수정본 **전체 331문항을 한 줄씩 새로 독립 수기 재채점**한 것처럼 주장하지 않음. Production DB Apply 없음. 따라서 아직 완료/merge PASS 아님.

### 다음 작업 / 병합 게이트

1. 남은 W3-OS-016은 **Issue #222 Reference-only** 범위로 유지. 기존 SVG 두 건 W3-OS-024/032는 소스 교정까지 완료.
2. Preview Reader의 **실제 화면**에서 파일 시스템 블록 할당 및 IPC Concept의 두 그림을 desktop/mobile 375px, dark/light, 이미지 dialog/zoom로 Human Usage Check. 소스 검증·Vercel READY를 화면 테스트와 혼동하지 말 것.
3. 필요 시 변경된 OS canonical 데이터로 격리 PostgreSQL에서 **기존 OS 데이터/개인 학습 이력 생성 → corrected pack Preview ERROR0 → Apply → exact reimport UNCHANGED → history digest 동일**을 별도 재현. 기존 전체 Testcontainers 통합 검증과 구분해 기록.
4. 최종 commit CI, PR HEAD/main·리뷰 대화·미해결 thread를 다시 확인하고 사용자 사전 승인이 유효한 조건에서만 squash merge. 그 후 Computer Architecture Slice 착수.


## 최종 OS Import · Reader 검증 증거 (2026-10-20)

- **Historical Import:** [OS correction import regression #39378824445](https://github.com/guseoh/csforge/actions/runs/39378824445)의 `historical-os-import` **SUCCESS**. 최초 full canonical bootstrap 후, 합쳐진 이전 main `4dc4dd2989a3aefbddeaf3610c20f2162d5cc2a2`의 실제 Operating Systems 20개 pack 원본을 `git archive`로 가져와 10 Concept·26 Question(36건)을 이전 값으로 복구한 뒤, 같은 20개 파일을 교정본으로 다시 Preview→Apply하고 36건 UPDATED를 확인했다. 이후 동일 20개 pack exact reimport의 전 항목 UNCHANGED, 전체 canonical exact bootstrap UNCHANGED, Concept/Question/선택지 ID와 personal_note/attempt/wrong_note/review_schedule/review_history/quiz_session의 변경 전후 스냅샷 불변을 검증했다. 격리 PostgreSQL Testcontainers이며 Production DB는 미변경.
- **실제 Reader 브라우저:** 같은 run의 `reader-browser` **SUCCESS**. GitHub Actions Ubuntu Chromium에서 React/Vite의 **실제 `/concepts/:id` Reader route**에 저장소의 두 canonical Markdown 본문을 API fixture로 주입해 (OS Reader 관련 백엔드 HTTP는 모킹), block allocation과 IPC 도식 각각 `375px/1280px × light/dark` **8개 조건** 확인. SVG 다운로드·디코딩, 본문 영역 수평 삐져나옴 방지, 이미지 클릭 → native dialog 열기, body scroll lock, ESC 종료·포커스 복구, 닫기 버튼 검증. 각 경우 일반/확대 screenshot 총 16장 artifact 보존.
- **시각 검토에서 추가 발견/수정:** 첫 브라우저 screenshot에서 375px 확대 이미지가 원본 960px 그림을 축소한 채 보여 세부 글자를 읽기 어려웠다. CSS/MarkdownImage에서 컨트롤·설명 영역과 SVG 전용 가로 pan을 분리했고, 재검증에서 확대 원본 폭 ≥900px, 독립 scroll width와 실제 scrollLeft 이동 ≥150px, 안내 문구 표시를 확인했다. 375px 확대 screenshot도 직접 눈으로 확인했다.
- **검증 경계:** Reader route는 실제 컴포넌트/스타일/두 SVG를 사용하지만, API 데이터는 테스트 fixture이며 운영 DB나 로그인 사용자 상태를 변경하거나 실제 Cloud Run 생산 데이터를 호출하지 않았다. 브라우저 자동화와 스크린샷 점검을 수행했으며 사용자 개인의 수동 클릭 검증을 했다고 주장하지 않는다.
- **임시 검증 구현:** `OsCorrectionSnapshotIntegrationTest.java`, `os-reader-browser-qa.mjs`, `os-correction-regression.yml`은 고정 이전 main SHA 기반 이번 PR 전용 검증 수단이다. 향후 일반 CI와 합치지 않으며 성공 증거를 기록한 뒤 PR에서 제거해 본래 Content Slice와 Reader zoom 최소 패치만 남긴다.
