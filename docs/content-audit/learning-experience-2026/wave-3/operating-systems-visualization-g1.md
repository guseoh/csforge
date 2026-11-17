# Operating Systems 도식화 G1 — 전수 평가 및 검증 기록

- 기준일: 2026-11-15
- 저장소: `guseoh/csforge`
- 출발점: `refactor` / `997393f8663c080dee4cf76818d0aa7ec7db855d`
- 작업 브랜치: `viz/os-g1` (병합 금지)
- 평가 기준: 루트 `AGENTS.md`, `content/AGENTS.md`, `content/README.md`, `content/curriculum/operating-systems.yaml`, `cs-learning-visualization` 품질 기준

## 전수 평가 요약

- 전체 Concept: **97** / 12 Topic
- Curriculum 시각화 계약: **DIAGRAM 47 / TEXT 50**
- 기존 SVG 자산: **33개**. 기존 34개 Concept이 33개 SVG를 참조하며 파일 디스크립터/열린 파일 상태 두 Concept이 SVG 하나를 공유
- G1 신규 자산: **13개**. 모든 `DIAGRAM` Concept에 이미지 연결, 최종 고유 SVG **46개**
- 분류: KEEP **62**, POLISH **15**, REWORK **5**, REBUILD **2**, ADD **13**
- 파일 시스템·IPC·격리 등의 TEXT Concept에 장식용 도식을 억지로 추가하지 않음. 시각화가 필요한 경우만 선택

판정 기준: KEEP은 의미상 유지 가능, POLISH는 기존 내용과 구조를 유지하고 접근성·표현 일부 보완, REWORK는 상태·시간축을 다시 설계, REBUILD는 핵심 구조를 처음부터 다시 모델링, ADD는 Curriculum이 지정한 SVG 부재를 해소한다. 목록은 Concept 기준이며, REBUILD 2건은 SVG 1개를 공유한다.

## G1 변경과 기술 모델 검증 사항

- 커널 경계·프로세스 6개: 모드 전환과 문맥 전환 구분, 대기 해제 후 준비 상태 복귀, fork 이후 가상 주소 공간과 열린 파일 상태 경계
- 스레드 5개: 프로세스별 주소 공간과 스레드별 PC/스택, 작업당 스레드 비용·대기열의 가정, JDK 25 가상 스레드 운반자 관계와 JEP 491
- 경쟁·임계 구역 2개: 읽기-수정-쓰기 교차가 갱신 손실을 일으킬 수 있는 *가능한 실행*, 잠금 소유권과 대기 구분
- 기존 다섯 그림 재설계: 문맥 저장/복원, RR 10 ms 간트 차트(전환 비용 생략), 4 KiB 페이지의 VPN 3 → PFN 9 (0x3100 → 0x9100), 세마포어 허가 인계, 조건 변수의 wait/reacquire/while 재검사
- 공유 열린 파일 상태 재설계: `dup`한 디스크립터가 하나의 open file description과 파일 오프셋을 공유함을 도식화
- 기존 15개 SVG 접근성 보강: `role="img"`, `aria-labelledby`, `title`, `desc` 제공. 기존 내부 영문 레이블의 전면 한국어화는 별도 시각 검토 대상으로 남음

## 수행한 정적 QA

| 검증 | 결과 | 근거 |
| --- | --- | --- |
| Curriculum과 97개 Concept 목록 대조 | PASS | 전체 12 Topic/97 Concept 조사, DIAGRAM 47/TEXT 50 |
| DIAGRAM 본문 및 파일 링크 | PASS | 47/47 이미지 연결과 OS SVG 경로 존재 확인 |
| SVG 접근성·자원 안전 기본 검사 | PASS | 46/46 `viewBox`, `role`, `title`, `desc`, 외부 실행 요소 부재 검사 |
| Canonical 식별자 | PASS (변경 파일) | 13개 Concept 본문에 그림 링크만 추가, 기존 frontmatter 불변 |
| 수정 범위 분리 | PASS | OS Concept 본문과 OS 전용 SVG만 변경. 공통 컴포넌트 변경 없음 |
| 기술 의미 검토 | PARTIAL | 대표 상태 전이·페이지 주소 계산·가상 스레드 및 동기화 의미를 모델 수준에서 확인 |
| XML 스키마·실제 SVG 렌더링 | 미실행 | 로컬 작업 트리/실제 브라우저 미연결. 본 검증을 렌더 QA로 주장하지 않음 |
| Reader 라이트/다크·900/1280px 시각 QA | 미실행 | 실제 Reader 미리보기와 시각적 글자 겹침·대비 검증 필요 |
| 전체 테스트·실제 Import/재import | 미실행 | 실행 환경·격리 DB가 없어 CLI/DB 검증 수행하지 않음 |

**병합 판단:** 위 미실행 검증이 있으므로 PR은 Draft로 두고 자동 병합하지 않는다. 이 기록은 구조·계약의 정적 QA 결과이며 모든 그림의 시각적 합격 판정을 의미하지 않는다.

## Concept 전수 분류

### 커널 경계 (6개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `kernel-boundary/os-resource-manager` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `kernel-boundary/user-kernel-mode` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `kernel-boundary/privilege-protection` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `kernel-boundary/system-call` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `kernel-boundary/system-call-flow` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `kernel-boundary/interrupt-exception-system-call` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 프로세스 (8개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `process/program-vs-process` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `process/process-address-space` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `process/pcb` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `process/process-state` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `process/process-create` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `process/process-terminate` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `process/parent-child` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `process/wait-reap` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 스케줄링 (9개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `scheduling/context-switch` | DIAGRAM | **REWORK** | 기존 표현의 상태·순서·시간축 교정 |
| `scheduling/timer-interrupt-preemption` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `scheduling/scheduler-goals` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `scheduling/fcfs` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `scheduling/sjf` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `scheduling/round-robin` | DIAGRAM | **REWORK** | 기존 표현의 상태·순서·시간축 교정 |
| `scheduling/priority-scheduling` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `scheduling/starvation-aging` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `scheduling/multicore-affinity` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 스레드 (10개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `threads/process-vs-thread` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `threads/thread-shared-state` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `threads/thread-private-state` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `threads/kernel-thread` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `threads/user-level-thread` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `threads/thread-create-switch-cost` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `threads/concurrency-vs-parallelism` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `threads/thread-count-workload` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `threads/thread-pool` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `threads/java-virtual-thread-boundary` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |

### 경쟁 상태·임계 구역 (6개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `race-critical-section/shared-mutable-state` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `race-critical-section/interleaving` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `race-critical-section/race-condition` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `race-critical-section/critical-section` | DIAGRAM | **ADD** | 기존 텍스트 흐름만 존재 → SVG 신규 연결 |
| `race-critical-section/atomic-operation` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `race-critical-section/spin-vs-block` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 동기화 (7개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `synchronization/mutex` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `synchronization/semaphore` | DIAGRAM | **REWORK** | 기존 표현의 상태·순서·시간축 교정 |
| `synchronization/condition-variable` | DIAGRAM | **REWORK** | 기존 표현의 상태·순서·시간축 교정 |
| `synchronization/monitor` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `synchronization/read-write-lock` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `synchronization/lock-granularity` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `synchronization/contention` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 교착·기아 (8개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `deadlock/deadlock` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/coffman-conditions` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/resource-allocation-graph` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/deadlock-prevention` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/deadlock-avoidance` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/deadlock-detection-recovery` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/livelock` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `deadlock/starvation` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 가상 메모리 (10개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `virtual-memory/virtual-address-space` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/page-frame` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/page-table` | DIAGRAM | **REWORK** | 기존 표현의 상태·순서·시간축 교정 |
| `virtual-memory/page-fault` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/demand-paging` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/page-replacement` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/locality-working-set` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/thrashing` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/copy-on-write` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `virtual-memory/stack-heap-mapping` | DIAGRAM | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 파일 시스템 (10개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `filesystem/file-abstraction` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `filesystem/file-descriptor` | DIAGRAM | **REBUILD** | 공유 열린 파일 상태의 식별·참조 재설계 |
| `filesystem/open-file-table` | DIAGRAM | **REBUILD** | 공유 열린 파일 상태의 식별·참조 재설계 |
| `filesystem/directory-path` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `filesystem/inode` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `filesystem/filesystem-block` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `filesystem/allocation` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `filesystem/page-cache` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `filesystem/buffering` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `filesystem/write-flush-fsync` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |

### 입출력 (9개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `io/device-io-kernel-path` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `io/blocking-io` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `io/non-blocking-io` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `io/readiness-vs-completion` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `io/select-poll` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `io/epoll` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `io/async-io` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `io/mmap` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `io/sendfile-zero-copy` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |

### 프로세스 간 통신 (7개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `ipc/pipe` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `ipc/signal` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `ipc/shared-memory` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `ipc/message-queue` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `ipc/unix-domain-socket` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `ipc/network-socket-ipc` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `ipc/ipc-tradeoff` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |

### 격리 (7개)

| Concept | Curriculum | 판정 | 근거 / 적용 |
| --- | --- | --- | --- |
| `isolation/process-isolation` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `isolation/user-group-permission` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `isolation/namespace` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `isolation/cgroup` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `isolation/resource-limit` | TEXT | **KEEP** | 기존 설명·텍스트/도식으로 학습 목표 달성 |
| `isolation/container-process-model` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |
| `isolation/host-kernel-sharing` | DIAGRAM | **POLISH** | 기존 SVG 접근성 이름·설명 정비 |

## 공식 기술 근거 및 검증 참고

- OSTEP 공식 원본: https://pages.cs.wisc.edu/~remzi/OSTEP/ (프로세스·CPU 스케줄링·스레드·가상 메모리)
- JEP 491: https://openjdk.org/jeps/491 (JDK 24부터 일반적인 `synchronized` 구간 pinning 제거)
- JEP 444: https://openjdk.org/jeps/444 (가상 스레드의 런타임 스케줄링)
- Linux `dup(2)`: https://man7.org/linux/man-pages/man2/dup.2.html (열린 파일 설명·오프셋 공유)

대표 코드·도식에서 보장·구현·교육적 단순화를 구분했다. 언급한 자료는 고유 도식 설계의 사실 확인용이며 다른 자료의 그림을 복제하지 않는다.


## 컨트롤 타워 리뷰 후속 조치 (2026-11-15)

리뷰: [PR #302 코멘트](https://github.com/guseoh/csforge/pull/302#issuecomment-6892848155)

### 적용 결과

- **P1 의미 경계:** `user-kernel-mode.svg`의 모호한 '직접 장치 접근 / 권한 검사로 제한'을 '특권 장치 제어 불가 / 커널 서비스에 요청'으로 교체했다.
- **P1 테마:** OS SVG 46개 전부에 독립적인 `@media (prefers-color-scheme: light)` 밝은 팔레트를 추가했다. 원래의 어두운 팔레트는 그대로 유지했다. 각 SVG가 외부 이미지 `<img>`로 로드되므로 `html[data-theme]` 앱 수동 테마 강제값을 상속하지 못한다. **브라우저 시스템 테마와 앱 수동 테마가 불일치할 때까지 해결됐다는 뜻은 아니다.**
- **P2 학습 중복:** ASCII 상태 도식과 새 SVG가 바로 이어지던 11개 Concept에서 중복 ASCII만 삭제했다. 별개의 원인/대안 비교, 코드 실행 예제 및 설명형 문단은 유지했다.
- **P2 fd 정확성:** `file-descriptor-open-state.svg`에 `dup2(3, 7)`을 명시하여 최저 미사용 fd를 고르는 `dup()`과 구별했다. 공식 근거: https://man7.org/linux/man-pages/man2/dup.2.html
- **P2 가독성:** Container·epoll·IPC 주요 영문 레이블을 한국어로 개선하고, 장치 I/O·호스트 커널·inode·namespace·mmap·process isolation·shared memory 등 7개 SVG에서 폭을 넘기던 긴 설명을 줄였다.

### 검증 현황과 증거 범위

- **정적 링크/무결성 PASS:** Curriculum `DIAGRAM 47/47`의 canonical Markdown 경로·`contentKey`·SVG 존재 확인. 기존 33개 및 신규 13개 = 총 고유 SVG 46개.
- **원격 자산 응답 PASS:** Vercel Preview의 46개 SVG를 각각 `GET`하여 `200`, `<svg>`, `role=img`, `aria-labelledby`, 밝은 팔레트 CSS 존재를 확인했다. 후속으로 문구를 바꾼 7개도 최종 배포에서 각각 `200`을 확인했다.
- **정적 SVG 기초 검사 PASS:** 46개 SVG 태그 균형, `viewBox` 양수 여부, 접근성 이름·설명, 기본 외부 실행 요소 부재, 테마 스타일 존재를 확인했다. 출처와 육안 렌더는 별도다.
- **Frontend Build PASS:** 후속 변경 커밋 `98179b24fcfe0f1768f07b7750e4905d335bac04`의 Vercel Preview 배포 `dpl_68U67qQ9fYmHjEMp3y5rR6iQWGZX`가 READY. 빌드 로그에서 `tsc -b && vite build`, 601 modules transformed, build 성공을 확인했다.
- **GitHub CI 미수행:** 위 커밋의 GitHub Actions 조회 결과 workflow run 0건. 별도 `npm run test` 및 실행 환경의 `npm run lint` 명령은 실행하지 않았다 (빌드 과정의 `tsc -b`만 확인).
- **시각 QA 미완료:** 실제 브라우저의 Reader에서 47개 Concept을 900/1280px, 앱 라이트/다크에서 직접 열어 스크린샷을 비교·검수하는 단계는 수행하지 못했다. 자산 200 응답이나 좌표 기반 텍스트 점검을 Reader 육안 QA로 대체하지 않는다.
- **격리 Import 미완료:** Preview ERROR=0 → Apply → 동일 Pack 재import UNCHANGED 및 학습 이력 보존 검증을 실제 격리 DB/백엔드로 실행하지 않았다. 운영 DB는 수정하지 않았다.

**판정: P1 의미 수정 완료, P1 앱 수동 테마 일치와 실제 Reader QA는 잔여 리스크. Draft 유지 및 병합 보류.** 공통 컴포넌트/다른 LearningArea 변경 금지 조건을 지킨다.
