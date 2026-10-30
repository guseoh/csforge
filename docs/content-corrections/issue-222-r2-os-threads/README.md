# Issue #222 R2 — Operating Systems / OSTEP Threads Intro Reference 검수

기준 main: `2862a92d9208153678f3b618df90fafe37cb2e09`. 감사 원본 `docs/content-audit/learning-experience-2026/wave-3-reference-issues.json`의 동일 URL 11관계를 각각 검토한 최소 교정 PR.

## 원문을 직접 확인한 범위

- [OSTEP Threads: An Introduction, Chapter 26](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf) **PDF 직접 열람**: 첫머리의 프로세스 내 공유 주소 공간, 스레드별 PC/레지스터·stack, 문맥 전환·TCB 및 26.1 Why Use Threads(CPU parallelism·I/O wait), 26.2 Thread Creation(실행 순서), 26.3 Why It Gets Worse: Shared Data(lost update)를 확인.
- 같은 파일이 다수 Concept에 연결되어 있더라도 URL 하나의 접근 성공을 전체 학습 의미의 검증으로 자동 전파하지 않았다. 각 Concept의 현재 본문·frontmatter `recommendation`/`relationNote`와 위 각 절을 별도로 대응했다.
- 문서가 모든 구현의 스레드 생성 비용·CPU 최적 스레드 수·Java JMM 원자성을 보장한다고 해석하지 않는다. OSTEP 예제의 C/OS 실행 모델과 Java 언어 규칙은 구별한다.

## 관계별 판정

| 기존 Concept contentKey | 판정 | 실제 읽을 범위 및 경계 |
| --- | --- | --- |
| `operating-systems.core.race-critical-section.critical-section` | KEEP | shared memory/critical section *background* (not mutex correctness) |
| `operating-systems.core.race-critical-section.interleaving` | KEEP | thread creation order and possible traces, shared counter |
| `operating-systems.core.race-critical-section.race-condition` | KEEP | 26.3 shared counter, race-dependent lost update |
| `operating-systems.core.race-critical-section.shared-mutable-state` | KEEP | 26.3 shared data and update interleavings |
| `operating-systems.core.threads.concurrency-vs-parallelism` | KEEP | 26.1 parallelism and hiding I/O waits |
| `operating-systems.core.threads.process-vs-thread` | KEEP | chapter opening PC/register/stack and shared address space |
| `operating-systems.core.threads.thread-count-workload` | KEEP | 26.1 CPU computation vs I/O wait motivation (not sizing formula) |
| `operating-systems.core.threads.thread-create-switch-cost` | KEEP | chapter opening TCB/saved register context and separate stacks (not quantitative cost guarantees) |
| `operating-systems.core.threads.thread-private-state` | KEEP | chapter opening PC/register state and independent stacks |
| `operating-systems.core.threads.thread-shared-state` | KEEP | chapter opening shared address space and 26.3 counter |
| `operating-systems.core.threads.user-level-thread` | **NOTE_FIX** | OSTEP Chapter 26 도입은 일반적인 thread 실행 상태까지만 다룬다. 기존 relationNote의 사용자 런타임 logical thread↔kernel thread 매핑, N:M 스케줄링 및 블로킹 모델이 해당 PDF의 구체적 설명인 것처럼 안내하면 안 된다. |

## 최소 교정

- `content/operating-systems/threads/user-level-thread.md`의 해당 OSTEP **relationNote 한 줄만** 실제 원문 범위로 한정했다.
- PDF URL, 공유 전역 metadata(title/type/language/depth/recommendation), displayOrder, Concept 본문·identity, Question, Curriculum, 그림, 코드는 변경하지 않았다.
- 다른 10개 관계는 현재 해당 chapter와 관계가 있으며, 정확성 설명이 부족하면 이후 별도 UX/R3 과제와 구분한다.
- 감사 원본 ledger는 변경하지 않는다. R2 감사 PR #228의 잔여 후보 집계에서 이 11관계의 개별 검증 상태는 추후 합산한다.

## 병합 전 게이트

- Operating Systems 97 Concept 및 연결 관계의 delta/영향 점검; global URL metadata·중복 order 0.
- 격리 PostgreSQL old→new Concept Preview/Apply, 전체 canonical exact reimport 3,380 UNCHANGED 및 personal/history identity 보존.
- 실제 Reader에서 제한 문구와 외부 링크 표시, 375/1280px × 라이트/다크 사용성.
- **Draft / 미병합**. Production DB Import 및 Cloud Run 배포 금지. #222 전체 R2/R3 완료를 뜻하지 않는다.
