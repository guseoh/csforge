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

현재까지 **20개 Question의 prompt/model/explanation/accepted/choice-rationale 및 7개 Concept 본문**을 최소 교정했다. `signal.md`의 summary도 본문 정의와 맞게 업데이트했다. 새로운 Question/Concept/SVG/Reference 추가 또는 key 변경 없음.

### 외부 1차 근거 (읽은 원문)

- [Linux open(2)](https://man7.org/linux/man-pages/man2/open.2.html) — regular file/block device의 `O_NONBLOCK` 비적용
- [Linux pipe(7)](https://man7.org/linux/man-pages/man7/pipe.7.html) — 모든 write end closed 및 잔여 byte EOF 조건
- [Linux zswap](https://docs.kernel.org/admin-guide/mm/zswap.html) — RAM compressed swap cache 및 page fault에서 압축 해제
- [Linux pid_namespaces(7)](https://man7.org/linux/man-pages/man7/pid_namespaces.7.html) — namespace init 종료 시 SIGKILL
- [Linux credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html) — fsuid/fsgid vs effective ID
- [Linux signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html) — 동기 hardware exception의 thread-directed signal
- [Linux sendfile(2)](https://man7.org/linux/man-pages/man2/sendfile.2.html) — zero-copy 출력 대상이 데이터를 소비할 때까지 source 부분 불변
- deadlock 실행 방향과 스케줄링 수치·단답은 기존 Wave3 전체 감사 근거를 재사용한다.

### 변경 무결성 사전 점검

- Changed JSON 파일의 Concept/Question count와 순서·contentKey 유지, 각 Question의 `questionType`, `difficulty`, `status`, `conceptKeys`, `correctChoiceKey` 전후 일치(현재 branch vs base 파일 직접 비교).
- JSON 한 줄 한 Question인 저장소 포맷 유지.
- MD 7개 중 signal 외 YAML frontmatter 무변경, fenced 코드 경계 보존.
- **미실시**: 97C/331Q 수정본 전체 의미 재검토, 모든 단답 조합 수기 검수, 실제 Import Preview→Apply→exact reimport/history 비교, SVG/Reader QA, 최종 repo CI. 전 항목 PASS 주장이 아님.

### 다음 작업

1. P2 12건에서 reference-only/이미 해결된 항목 격리, 교육 효과가 분명한 최소 항목만 적용.
2. OS 전수 변경 영향(97C/331Q/Reader/Reference) 확인 및 공식 자료 고위험 대조.
3. validator/test/build 및 **격리 PostgreSQL** Import ERROR0→Apply→exact UNCHANGED/기존 history digest.
4. ChatGPT Full Content Review + Human Usage Check → 승인된 squash merge. Production DB 직접 Apply는 이 PR 범위 밖.

기존 Issue #222의 Reference 수정은 본 PR에서 중복하지 않음.
