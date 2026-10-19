# Issue #222 R2 — UMD 44관계 읽기 자료 교정

기준 main: `e0dbadfbf0691e079b8d2e20d623aceb8bad5103` (#242/#244/#246 병합 후). 2026-10-19 직접 확인.

## 판정 경계

UMD 8개 URL은 [기존 44관계 감사](umd-44-relationship-review.md)의 접근 제한 상태를 유지한다. 이번 원 cache URL도 실제 브라우저와 GET에서 403이었다. 403을 broken·자료 오류 또는 원문 검증 성공으로 바꾸지 않는다. 공식 교육 자료를 학습 목적에 맞게 **39관계 교체**, 이미 연결된 공식 문서로 **5관계 통합**한다. Concept/Question key·본문·정답은 변경하지 않는다.

ledger의 새 44건은 실제로 읽은 **현행 URL 관계**에 대한 DIRECT_CONTENT_VERIFIED KEEP이다. `replacesUrl`은 미검증 UMD 원본 identity를 추적한다. 원본 44건을 VERIFIED로 바꾸지 않는다. 기존 ledger 103건은 그대로 보존한다.

## 원문·버전·접근 근거

- Cornell CS 3410 Spring 2026: Caches, From Switches to Numbers, Stateful Logic, Pipelining and Performance, Virtual Memory, Parallel Performance HTML 본문과 브라우저 열람 성공. 2026 강의 버전을 명시한다. Pipelining 노트의 hazard 설명 범위는 제한되어 있으므로 hazard 관계에는 쓰지 않는다.
- Cornell CS 3410 Spring 2025 Cache Coherency: HTML 본문에서 공유 주소 공간·VI·MSI 상태·invalidation을 확인. 실제 브라우저에서 본문·MSI 절 접근 성공. MESI 전체 명세로 소개하지 않는다.
- Cornell CS 3410 Spring 2011 공식 일정의 PDF 링크를 따라 Numbers and Arithmetic(50p), A Simple CPU(43p), CPU Performance and Pipelines(37p), Virtual Memory 1(61p)을 GET 다운로드하고 페이지 텍스트를 읽었다. Numbers p42 overflow, CPU p13 datapath 도표를 렌더링해 확인했다. 2011 교육용 MIPS 및 2009년 장비 수치를 현대 CPU 보장으로 일반화하지 않는다.
- Cornell CS 3410 Fall 2018 Pipelining PDF: 검색에서 확인된 공식 URL을 GET 다운로드(92p). 이미지 기반 PDF이므로 pp. 36–45, 59–92를 렌더링해 structural/data/control hazard, forwarding, load-use stall, flush와 분기 CPI 계산을 실제로 읽었다. p90의 20% × 5% × 2 = 0.02 추가 CPI를 확인했다.
- Cornell CS 5220 Fall 2024 Single Core Architecture: Act 2의 latency·steady-state bandwidth·locality 본문을 확인. 브라우저는 슬라이드 방식으로 동작하므로 방향키로 이동한다. 이 문서의 p/byte 크기 예시 오타를 canonical에 복제하지 않는다.
- Linux latest Page Tables: 희소 계층·folding·상위 leaf와 MMU/TLB/walk 절; HugeTLB Overview·hugepagesz·연속 메모리 예약 제약; False Sharing의 동일 line 내 write/read 사례 본문을 확인. latest는 고정 kernel 릴리스가 아니며 관측일 기준이다.
- 기존 RISC-V RVWMO URL은 v20260120/rvwmo.html로 이동. v2.0의 Preserved Program Order·Explicit Synchronization을 읽었다. ISA별 순서 제약이며 JMM 또는 모든 CPU의 보장으로 확대하지 않는다.

선정하지 않은 후보: 2011 강의의 일부 링크는 404; 2018 multicore PDF는 검색 도구에서 본문을 읽을 수 있었지만 직접 GET 연결 reset 및 브라우저 빈 화면으로 학습자 접근을 확인하지 못해 사용하지 않았다. CS 5220 2020 공유 메모리 슬라이드의 C volatile·fence 설명은 범위가 과도해 canonical 근거로 선택하지 않았다.

## 관계별 결정

아래 URL은 모두 실제 확인한 원문이다. 전체 기존 URL과 새 URL identity는 [기계 판정표](umd-readable-relations.json), 변경 전 Reference 목록은 테스트 fixture로 보존한다.

| contentKey (computer-architecture.core. 이하) | 결정 | 현행 자료와 직접 확인한 범위 |
|---|---|---|
| cache-organization.cache-friendly-access | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Locality의 배열 순회와 temporal/spatial locality를 확인한다. |
| cache-organization.direct-mapped-cache | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Direct-Mapped Cache의 주소 매핑·충돌을 확인한다. |
| cache-organization.fully-associative-cache | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Fully Associative Cache의 전체 tag 비교와 하드웨어 비용을 확인한다. |
| cache-organization.index-tag-offset | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Larger Blocks의 tag·index·offset 분할 예제를 확인한다. |
| cache-organization.replacement-policy | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Replacement Policies의 LRU·NMRU·FIFO와 비용을 확인한다. |
| cache-organization.set-associative-cache | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Set-Associative Cache의 set 선택과 way 비교를 확인한다. |
| cache-organization.write-allocate | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Handling Stores의 write-allocate와 no write-allocate를 비교한다. |
| cache-organization.write-through-write-back | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Handling Stores의 write-through·write-back과 dirty eviction을 확인한다. |
| data-representation.binary-hex | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/numbers.html) — Binary Numbers와 Some Important Bases의 진법·자릿값을 확인한다. |
| data-representation.bit-byte-word | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2011sp/lecture/06-cpu-i-g.pdf) — pp. 7–9의 MIPS 32-bit register와 byte-addressed word를 확인한다. word 폭은 ISA에 따라 다르다. |
| data-representation.fixed-width-overflow | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2011sp/lecture/03-numbers-and-arithmetic-i-g.pdf) — pp. 33, 38–43의 고정 폭 결과·carry-out·부호 있는 overflow를 비교한다. 언어별 overflow 계약과 구분한다. |
| data-representation.signed-twos-complement | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/numbers.html) — Two’s Complement의 음수 자릿값·범위·비트 반전을 확인한다. |
| datapath-control.alu-datapath | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2011sp/lecture/06-cpu-i-g.pdf) — pp. 4, 8–15의 register file·ALU·control 배선을 따라간다. 교육용 MIPS 구현이다. |
| datapath-control.clock-cycle | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/state.html) — The Clock의 rising edge·period·frequency 정의를 확인한다. |
| datapath-control.control-unit | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2011sp/lecture/06-cpu-i-g.pdf) — pp. 10–15의 instruction decode와 ALU·register 제어 경로를 확인한다. |
| datapath-control.critical-path | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2011sp/lecture/07-perf-pipe-i-g.pdf) — pp. 10–12의 register 출력→입력 최장 경로와 최소 클록 주기를 확인한다. 예제는 setup time 등을 생략한다. |
| memory-hierarchy.cache-hit-miss | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Hits & Misses와 Accessing의 valid·tag 판정을 확인한다. |
| memory-hierarchy.cache-line | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Larger Blocks의 연속된 바이트 단위 전송과 block offset을 확인한다. |
| memory-hierarchy.latency-vs-bandwidth | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs5220/2024fa/slides/03-single-core.html) — Act 2: Memory Matters의 Basic Problem과 How Caches Help를 확인한다. 슬라이드는 방향키로 이동한다. |
| memory-hierarchy.memory-hierarchy | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — The Memory Bottleneck과 A Hierarchy of Caches의 용량·비용·지연 절충을 확인한다. |
| memory-hierarchy.miss-penalty | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Understanding Cache Performance의 hit time + miss rate × miss penalty를 확인한다. |
| memory-hierarchy.temporal-spatial-locality | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Locality의 반복 변수 접근과 연속 배열 접근을 비교한다. |
| multicore-memory.cache-coherence-problem | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2025sp/notes/cachecoherency.html) — 도입부의 코어별 캐시 복사본과 공유 주소 공간의 문제를 확인한다. |
| multicore-memory.coherence-protocol-model | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2025sp/notes/cachecoherency.html) — VI·MSI 절의 invalidation과 M·S·I 상태를 확인한다. MESI 전체 구현 명세는 아니다. |
| multicore-memory.false-sharing | CONSOLIDATE_EXISTING | [원문](https://www.kernel.org/doc/html/latest/kernel-hacking/false-sharing.html) — What is False Sharing의 같은 cache line 내 독립 field와 write/read 간섭을 확인한다. |
| multicore-memory.hardware-memory-reordering | CONSOLIDATE_EXISTING | [원문](https://docs.riscv.org/reference/isa/unpriv/rvwmo.html) — RVWMO v2.0의 Preserved Program Order와 Explicit Synchronization을 확인한다. 단일 주소 coherence와 여러 주소의 순서를 구분한다. |
| multicore-memory.multicore-shared-memory | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2025sp/notes/cachecoherency.html) — 도입부의 코어별 캐시와 단일 물리 주소 공간, 공유 복사본을 확인한다. |
| multicore-memory.private-shared-cache | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2011sp/lecture/19-vm1-i-g.pdf) — pp. 5, 22의 코어별 L1·공유 L2 예시와 다중 CPU 캐시 도표를 확인한다. 2009년 장비 사례를 일반 규칙으로 보지 않는다. |
| performance.amdahl-law | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/parallel-perf.html) — Modeling Parallel Performance의 직렬 비율과 speedup 한계를 확인한다. |
| performance.cache-impact | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/caches.html) — Understanding Cache Performance의 AMAT를 확인한다. CPU 전체 CPI와 AMAT를 동일한 지표로 보지 않는다. |
| performance.cpu-time | REPLACE | [원문](https://courses.cs.cornell.edu/cs3410/2026sp/notes/pipelining.html) — Iron Law of Processor Performance의 IC × CPI × clock period를 확인한다. I/O 대기를 포함한 wall time과 구분한다. |
| performance.instruction-count-cpi-clock | REPLACE | [원문](https://courses.cs.cornell.edu/cs3410/2026sp/notes/pipelining.html) — Iron Law와 multi-cycle 명령어 혼합의 가중 평균 CPI를 확인한다. |
| performance.latency-throughput | REPLACE | [원문](https://courses.cs.cornell.edu/cs3410/2026sp/notes/pipelining.html) — Performance of Pipelined Processors의 명령어 지연과 전체 처리량을 구분한다. |
| performance.pipeline-branch-impact | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2018fa/schedule/slides/06-pipeline-bw.pdf) — pp. 78, 84, 89–90의 분기 빈도 × 실패율 × 복구 주기와 추가 CPI를 확인한다. 단순 교육용 모델이다. |
| pipeline-ilp.branch-prediction | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2018fa/schedule/slides/06-pipeline-bw.pdf) — pp. 75–90의 잘못된 경로 flush와 방향 예측·정확도·CPI 예제를 확인한다. |
| pipeline-ilp.forwarding-and-stall | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2018fa/schedule/slides/06-pipeline-bw.pdf) — pp. 59–72의 forwarding과 load-use stall을 확인한다. MEM→EX 직접 연결의 임계 경로 문제도 비교한다. |
| pipeline-ilp.pipeline-hazards | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2018fa/schedule/slides/06-pipeline-bw.pdf) — Hazards의 structural·data·control 구분과 pp. 69–77, 91–92의 검출·stall·flush를 확인한다. |
| pipeline-ilp.pipeline-stages | REPLACE | [원문](https://courses.cs.cornell.edu/cs3410/2026sp/notes/pipelining.html) — Pipelined Processors의 단계 중첩과 pipeline register, 이상적인 CPI를 확인한다. |
| virtual-memory-hardware.mmu | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/vm.html) — The Memory Management Unit과 Other Data in the Page Table의 주소 변환·R/W/X 권한을 확인한다. |
| virtual-memory-hardware.multi-level-page-table | CONSOLIDATE_EXISTING | [원문](https://www.kernel.org/doc/html/latest/mm/page_tables.html) — Page Tables와 Page Table Folding의 희소 계층·상위 leaf·아키텍처별 단계 수를 확인한다. |
| virtual-memory-hardware.page-size-huge-page | CONSOLIDATE_EXISTING | [원문](https://www.kernel.org/doc/html/latest/admin-guide/mm/hugetlbpage.html) — Overview와 hugepagesz의 TLB 자원·다중 페이지 크기, 연속 메모리 확보 제약을 확인한다. |
| virtual-memory-hardware.page-table-walk | CONSOLIDATE_EXISTING | [원문](https://www.kernel.org/doc/html/latest/mm/page_tables.html) — MMU, TLB, and Page Faults의 TLB miss 후 walk와 상위 단계 leaf 종료를 확인한다. |
| virtual-memory-hardware.tlb | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/vm.html) — A Cache for the Page Table의 변환 캐시와 다단계 lookup 비용을 확인한다. TLB miss 자체를 page fault로 보지 않는다. |
| virtual-memory-hardware.virtual-physical-address | REPLACE | [원문](https://www.cs.cornell.edu/courses/cs3410/2026sp/notes/vm.html) — Virtual vs. Physical Memory Addresses와 Pages and Page Tables의 VPN→PPN·offset을 확인한다. |

## 검증 결과

- `python docs/content-corrections/issue-222-r2/reconcile.py`: PASS. 15 Area / 721 Concept / 1,037 relations / 627 URLs; 공유 metadata 충돌·관계/표시 순서 중복 0. 기존 103행 동일, 새 직접 검증 44행, 총 147 verified / CAP 1 pending.
- Reference 5개 감소는 통합 결정의 결과다. 원 UMD 8개 URL과 44관계는 retired 추적표에 보존하며 접근 성공으로 승격하지 않는다.
- `gradlew.bat test --tests com.guseoh.csforge.importcontent.CaReadableReferencesIntegrationTest --console=plain`: PASS (1 test, failures/errors/skipped 0). PostgreSQL 16.4 Testcontainers에서 변경 전 44개 Reference 목록을 복원하고 Preview updated=44/errors=0 → Apply updated=44 → 반복 Preview unchanged=44 → full exact reimport unchanged=3,380/errors=failed=0.
- 721 Concept/2,525 Question의 ID, 유지한 global Reference ID, 개인 노트 44개·quiz session·attempt·wrong note·review schedule/history 보존. Concept 본문과 Reference 외 frontmatter, 모든 Question 바이트는 main과 동일.
- 별도 PostgreSQL `csforge-r2-reader-umd`(localhost:15482), backend :18082, frontend :15173에서 EMPTY→READY bootstrap created=3,380/errors=0. Reader API는 변경 44개 URL·relationNote 모두 일치.
- 실제 Reader 1280×720: direct-mapped cache, fixed-width overflow, coherence protocol, hardware memory ordering, branch prediction, huge page 대표 6개 × light/dark. 새 자료·통합 자료 표시, Tab으로 Reference 진입, `_blank`/`noopener noreferrer`, 가로 넘침 없음 확인. 자료별 recommendation/관계 범위가 분리되어 표시된다. 이번 QA는 다른 viewport 검증을 주장하지 않는다.
- `git diff --check`: PASS. 정규 Repository Validation의 최종 HEAD/실행 URL은 PR 설명에서 추적한다.

자료의 직접 접근 상태는 관측일 결과이며 미래 가용성을 보장하지 않는다. UMD 원문 접근 문제 자체는 미해결이나 학습 관계는 검증한 대체/기존 공식 자료로 확보했다. 남은 R2 관계는 CAP 1건이다. Production Import·배포 없음. PR은 Draft로 유지하며 ChatGPT 전체 리뷰와 사용자 승인 전 병합하지 않는다.
