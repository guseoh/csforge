# Issue #222 R2 — Computer Architecture Reference 46관계 1차 재대조 (2026-10-17)

기준 `main 2862a92d9208153678f3b618df90fafe37cb2e09`. 기존 Wave3 `NEEDS_REVIEW` 46 관계, 10 URL과 현재 canonical Concept 중 일부의 Reference frontmatter·본문을 대조한 **감사 전용 추적표**. **본 단계는 원문 46관계 직접 VERIFIED 판정이 아니며**, 단순 접근 장애를 broken으로 기록하지 않는다.

## 대상 구성

- **UMD 교육 자료 44 관계 / 8 URL**, IEEE 754 표준 랜딩 1관계/1URL, OpenJDK JMH 프로젝트 1관계/1URL.
- UMD 캐시 관련 chapter 직접 열람은 이 환경에서 실패. UMD 별도 캐시 강의나 교육 자료의 존재가 바로 문제 URL 원문의 검증 완료를 의미하지 않는다.
- IEEE 문서 ID `8766227`과 표준 서지 DOI에 사용된 `8766229`가 다른 점은 **publisher publication number vs actual document DOI 가능성**을 포함하므로 링크 오류로 단정하지 않고 별도 확인 항목으로 추적한다.
- 기존 R2 `15 verified / 138 pending`은 **그대로**. 이 46개를 신규 해결 건수로 차감하지 않는다.

## 10 URL별 접근/학습 범위 계획

| 자료군 | 원본 URL | 관계 | 개별 검토 결과 및 남은 경계 |
| --- | --- | ---: | --- |
| Memory hierarchy (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | 7 | 캐시 계층·지역성·cache hit/miss·miss penalty·latency/bandwidth를 대상으로 묶음. 이 원 URL의 전문 접근은 실패했고 UMD 별도 캐시 자료의 설명을 대신 원문으로 취급하지 않음. |
| Cache organization (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | 7 | direct mapped/fully associative/set associative, tag/index/offset, replacement/write policy. UMD 강의의 write allocate 설명은 색인에서 확인되지만 원 URL의 절은 미확정. |
| Number systems (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | 4 | 이진/16진수·비트/바이트·오버플로·2의 보수. 다른 UMD 자료로 존재를 보충할 수 있어도 이 원문의 직접 절/학습 동선은 미확정. |
| IEEE Xplore 754 reference | [공식 URL](https://ieeexplore.ieee.org/document/8766227) | 1 | 공식 IEEE 754-2019 개별 document 번호는 8766229, 출판물 번호는 8766227로 식별됨. 기존 /document/8766227이 언제나 404라는 뜻은 아님. 현재 접근 가능한 IEEE SA 소개+Oracle 수치 가이드 교정은 Draft PR #233에서 추적. |
| Datapath PDF (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | 3 | ALU/control unit/critical path. PDF 원문을 이번 단계에서 직접 읽어 그림과 타이밍 절을 확인하지 못했으므로 검증 완료로 표시하지 않음. |
| Performance (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | 7 | CPU time·IC×CPI×cycle time·speedup·Amdahl. UMD의 별도 chapter01 계산 예시는 보조 근거이나 원 URL 자체는 미확정. |
| Multiprocessors (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | 6 | 공유 캐시·coherence·false sharing·hardware ordering. 같은 대학의 별도 강의 자료는 false sharing을 다루지만 canonical chapter 전문 검증은 별개. RVWMO/Kernel 보조 자료는 이미 연결된 관계별로 사용. |
| OpenJDK JMH | [공식 URL](https://openjdk.org/projects/code-tools/jmh/) | 1 | openjdk.org 페이지 직접 요청 403. 공식 openjdk/jmh 저장소(https://github.com/openjdk/jmh)의 실제 존재를 대조했으며 기존 공식 프로젝트 링크 자체를 broken으로 단정하지 않음. |
| Pipelining MIPS (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | 4 | 파이프라인/forwarding/stall/branch prediction의 역사적 MIPS 예제. UMD Pipelining Lecture 공개 여부와 원 URL 전문 검증을 구분. |
| Virtual memory (UMD) | [공식 URL](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | 6 | MMU/TLB/page table/address translation/huge page. Linux HugeTLB 별도 공식 근거는 현재 Concept에 존재하나 원 UMD 설명의 직접 검증은 미확정. |

## 위험도 높은 선행 확인 관계

| Concept | 확인된 맥락 | 후속 결론 조건 |
| --- | --- | --- |
| `computer-architecture.core.data-representation.floating-point` | 현재 `ieeexplore.ieee.org/document/8766227`을 `IEEE Standard for Floating-Point Arithmetic`로 연결. [IEEE 공식 DOI 검색 기록](https://doi.org/10.1109/IEEESTD.2019.8766229)은 표준을 754-2019로 식별 | 기존 링크가 같은 표준을 정상 안내하는지, publisher catalog로 리다이렉트/동작하는지 Reader에서 확인. 결함 미확정 |
| `computer-architecture.core.multicore-memory.hardware-memory-reordering` | UMD `multiprocessors` chapter와 [RISC-V RVWMO 공식 문서](https://docs.riscv.org/reference/isa/unpriv/rvwmo.html)를 함께 제공 | 하드웨어 ISA 규칙과 Java Memory Model을 구별; UMD 자료는 개괄, 표준 계약은 ISA 문서 우선 |
| `computer-architecture.core.multicore-memory.false-sharing` | UMD 외 [Linux Kernel false-sharing](https://www.kernel.org/doc/html/latest/kernel-hacking/false-sharing.html) 공식 문서가 이미 존재 | false sharing 메커니즘의 직접 근거를 별도 공식 출처로 보완할 수 있으므로 UMD 단독 미검증을 과장하지 않음 |
| `computer-architecture.core.virtual-memory-hardware.page-size-huge-page` | UMD와 Linux 공식 page tables/HugeTLB 두 링크가 이미 있음 | 일반 주소 변환 원리와 Linux HugeTLB allocation 정책을 분리 |
| `computer-architecture.core.performance.microbenchmark-boundary` | OpenJDK JMH URL 1개 | harness의 warmup/fork/iteration 계약을 프로젝트 근거와 대조하되 하드웨어 performance 자체의 표준으로 착각 금지 |
| `computer-architecture.core.datapath-control.critical-path` | UMD datapath PDF 연결 | PDF 페이지/수식·그림을 실제로 확인 전에는 장 내용 VERIFIED라 하지 않음 |

## 전체 46관계 추적

| contentKey | 원래 URL | 후속 상태 |
| --- | --- | --- |
| `computer-architecture.core.cache-organization.cache-friendly-access` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.direct-mapped-cache` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.fully-associative-cache` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.index-tag-offset` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.replacement-policy` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.set-associative-cache` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.write-allocate` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.cache-organization.write-through-write-back` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.data-representation.binary-hex` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.data-representation.bit-byte-word` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.data-representation.fixed-width-overflow` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.data-representation.floating-point` | [8766227](https://ieeexplore.ieee.org/document/8766227) | SCOPE_PRIORITY |
| `computer-architecture.core.data-representation.signed-twos-complement` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.datapath-control.alu-datapath` | [datapath.pdf](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.datapath-control.clock-cycle` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.datapath-control.control-unit` | [datapath.pdf](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.datapath-control.critical-path` | [datapath.pdf](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | SCOPE_PRIORITY |
| `computer-architecture.core.memory-hierarchy.cache-hit-miss` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.memory-hierarchy.cache-line` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.memory-hierarchy.latency-vs-bandwidth` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.memory-hierarchy.memory-hierarchy` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.memory-hierarchy.miss-penalty` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.memory-hierarchy.temporal-spatial-locality` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.multicore-memory.cache-coherence-problem` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.multicore-memory.coherence-protocol-model` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.multicore-memory.false-sharing` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | SCOPE_PRIORITY |
| `computer-architecture.core.multicore-memory.hardware-memory-reordering` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | SCOPE_PRIORITY |
| `computer-architecture.core.multicore-memory.multicore-shared-memory` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.multicore-memory.private-shared-cache` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.performance.amdahl-law` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.performance.cache-impact` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.performance.cpu-time` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.performance.instruction-count-cpi-clock` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.performance.latency-throughput` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.performance.microbenchmark-boundary` | [jmh](https://openjdk.org/projects/code-tools/jmh/) | SCOPE_PRIORITY |
| `computer-architecture.core.performance.pipeline-branch-impact` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.pipeline-ilp.branch-prediction` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.pipeline-ilp.forwarding-and-stall` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.pipeline-ilp.pipeline-hazards` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.pipeline-ilp.pipeline-stages` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.virtual-memory-hardware.mmu` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.virtual-memory-hardware.multi-level-page-table` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.virtual-memory-hardware.page-size-huge-page` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | SCOPE_PRIORITY |
| `computer-architecture.core.virtual-memory-hardware.page-table-walk` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.virtual-memory-hardware.tlb` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | ACCESS_AND_SCOPE_PENDING |
| `computer-architecture.core.virtual-memory-hardware.virtual-physical-address` | [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | ACCESS_AND_SCOPE_PENDING |

**후속 조치:** 동일 URL 고유 항목부터 공식 본문/코드와 대조한 뒤 각 관계의 실제 학습 절을 판정. 없는 자료를 상정하여 링크를 생성하거나 403을 404로 바꾸지 않는다. 잠재 NOTE_FIX는 전체 shared URL metadata 충돌 여부를 먼저 평가하여 개념별 `relationNote`로 해결 가능한지 검토. 이미 진행 중인 교정 PR #227/#229/#230/#231과 범위를 섞지 않는다.

## 2026-10-18 추가 대조 및 독립 교정

- IEEE Standards Association의 [IEEE 754-2019 공식 표준 랜딩](https://standards.ieee.org/ieee/754/6210/)에서 Active Standard 및 2019-07-22 출판, binary/decimal formats, arithmetic/exception scope를 **원문 직접 읽음**. IEEE Xplore [754-2019 document 8766229](https://ieeexplore.ieee.org/document/8766229)은 공식 문서 번호이나 웹에서는 JS/bot verification을 요구함. Xplore 기존 `8766227`은 publisher/punumber이므로 무조건 404라고 단정하지 않음.
- [Oracle Numerical Computation Guide Chapter 2](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html)를 직접 열람해 binary32 1/8/23비트, subnormal, Infinity, NaN 표를 확인. 이 문서는 IEEE 754-1985 기준임을 유지. **공식 표준 범위 안내 + 세부 학습 자료**의 두 역할로 보강하는 교정은 [Draft PR #233](https://github.com/guseoh/csforge/pull/233)에만 작성했으며 이 감사 PR은 canonical을 수정하지 않는다.
- OpenJDK 프로젝트 홈페이지는 이 도구에 403을 응답하지만, **공식 [openjdk/jmh](https://github.com/openjdk/jmh) 코드 저장소는 실제 공개**되어 있다. 그 존재가 기존 홈페이지의 링크 오류를 입증하는 것은 아니다. 현재 JMH 1관계 `ACCESS_AND_SCOPE_PENDING` 유지.
- UMD 원래 chapter 8개 URL은 여전히 내용 직접 확인 제한. [UMD 411 Chapter 1 성능](https://www.cs.umd.edu/~meesh/cmsc411/legacy/overview/chapter01.html)와 [UMD 공식 수업 안내](https://www.cs.umd.edu/class/spring2026/cmsc411-0101/) 및 관련 UMD PDF들은 **출처 검증의 보조 증거**이며 원래 UMD 44관계를 자동 VERIFIED 처리하지 않음.
- 이전 표에 남아 있던 자바스크립트 템플릿 표시 오류 `undefined` 8행을 해당 URL별 실제 추적 설명으로 교체. 고유 10URL/46관계 원본 재고와 기존 `verified-relations.json` **15개**, 잔여 **138관계** 기준은 별도 계약 결정 전 불변.
