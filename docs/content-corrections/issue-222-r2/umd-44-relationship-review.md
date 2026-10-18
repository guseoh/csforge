# Issue #222 R2 — UMD 원본 Reference 44관계/8URL 추가 감사

작성 2026-10-18. 기준 canonical main SHA 2862a92d9208153678f3b618df90fafe37cb2e09. [46관계 선행 조사표](computer-architecture-preliminary.md)에서 44개 UMD 관계만 추적.

## 결론과 증거 수준

원래 canonical UMD chapter 7개와 PDF 1개의 HTTP 직접 조회는 불가 또는 403이었다. 이는 URL이 404/깨짐 또는 자료 내용이 틀렸다는 증거가 아니다. 메릴랜드대의 다른 직접 읽을 수 있는 공식 강의와 Linux/RISC-V 문서는 보충 출처로만 기록하며 원본의 본문을 읽은 것처럼 DIRECT_CONTENT_VERIFIED 처리하지 않는다.

현재 44관계는 모두 **KEEP_PENDING_ACCESS / ACCESS_UNRESOLVED**. 확정 자료 오류 P0/P1 0건, URL 교정 0건. VERIFIED KEEP 44건이라는 뜻이 아님. 기존 URL, shared metadata, contentKey, global recommendation, relationNote 변경 없음.

## URL별 8그룹 검토

| URL군 | 관계 | 실제 Concept 학습 범위 | 공식 보조 자료 | 접근/관련성 판정 |
| --- | ---: | --- | --- | --- |
| memory-hierarchy-design | 7 | 메모리 계층, 지역성, hit/miss, cache line, miss penalty | [열람 가능한 보충 자료](https://www.cs.umd.edu/class/sum2003/cmsc311/Notes/Memory/introCache.html) | 같은 대학 캐시 개론에서 지역성 설명 확인. canonical 원문 직접 미확인 |
| cache-organization | 7 | direct/set/fully associative mapping, tag/index/offset, replacement, write policy | [열람 가능한 보충 자료](https://www.cs.umd.edu/users/meesh/411/website/projects/outer/hoc/nontech.htm) | 같은 교수·대학의 별도 캐시 설명 확인. 원본 chapter의 write-policy 상세 절 미확인 |
| number-systems | 4 | bit/byte, 이진·16진 수, overflow, two's complement | [열람 가능한 보충 자료](https://www.cs.umd.edu/class/sum2003/cmsc311/Notes/Data/twoscomp.html) | UMD 2의 보수 원문으로 기초 사실 교차 확인, 기존 URL의 강의 범위는 미확인 |
| datapath.pdf | 3 | ALU/Control Unit/critical path 및 timing | [열람 가능한 보충 자료](https://www.cs.umd.edu/class/fall2002/cmsc411/overview/appendixA.html) | 원본 datapath.pdf 403으로 도표 직접 검수 실패. 다른 UMD pipeline 설명은 별도 자료 |
| performance | 7 | IC×CPI×clock, Amdahl, latency/throughput, cache·branch impact | [열람 가능한 보충 자료](https://www.cs.umd.edu/~meesh/cmsc411/legacy/overview/chapter01.html) | UMD Chapter 1 Notes의 성능식·Amdahl 확인, 원본 performance chapter는 미확인 |
| multiprocessors | 6 | private/shared caches, coherence, false sharing, hardware ordering | [열람 가능한 보충 자료](https://www.kernel.org/doc/html/latest/kernel-hacking/false-sharing.html) | Linux false-sharing와 RISC-V RVWMO는 별도 공식 근거. UMD 원본 내용은 미확인 |
| pipelining-mips-implementation | 4 | 5-stage pipeline, hazards, forwarding, stalls, branch prediction | [열람 가능한 보충 자료](https://www.cs.umd.edu/class/fall2002/cmsc411/overview/appendixA.html) | UMD pipeline 설명 보조 확인. 현대 CPU 동작 보장으로 확대 금지 |
| virtual-memory | 6 | MMU, TLB, page table, page walk, huge pages | [열람 가능한 보충 자료](https://www.kernel.org/doc/html/latest/mm/page_tables.html) | Linux kernel page tables/HugeTLB는 일부 Concept에 이미 별도 Reference로 존재 |

## 44관계 원본 추적

| contentKey | 기존 URL | 원문 검증 상태 |
| --- | --- | --- |
| `computer-architecture.core.cache-organization.cache-friendly-access` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.direct-mapped-cache` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.fully-associative-cache` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.index-tag-offset` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.replacement-policy` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.set-associative-cache` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.write-allocate` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.cache-organization.write-through-write-back` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.data-representation.binary-hex` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.data-representation.bit-byte-word` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.data-representation.fixed-width-overflow` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.data-representation.signed-twos-complement` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.datapath-control.alu-datapath` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | ACCESS_UNRESOLVED_PDF |
| `computer-architecture.core.datapath-control.clock-cycle` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.datapath-control.control-unit` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | ACCESS_UNRESOLVED_PDF |
| `computer-architecture.core.datapath-control.critical-path` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | ACCESS_UNRESOLVED_PDF |
| `computer-architecture.core.memory-hierarchy.cache-hit-miss` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.memory-hierarchy.cache-line` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.memory-hierarchy.latency-vs-bandwidth` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.memory-hierarchy.memory-hierarchy` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.memory-hierarchy.miss-penalty` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.memory-hierarchy.temporal-spatial-locality` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.multicore-memory.cache-coherence-problem` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.multicore-memory.coherence-protocol-model` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.multicore-memory.false-sharing` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.multicore-memory.hardware-memory-reordering` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.multicore-memory.multicore-shared-memory` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.multicore-memory.private-shared-cache` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.performance.amdahl-law` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.performance.cache-impact` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.performance.cpu-time` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.performance.instruction-count-cpi-clock` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.performance.latency-throughput` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.performance.pipeline-branch-impact` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.pipeline-ilp.branch-prediction` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.pipeline-ilp.forwarding-and-stall` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.pipeline-ilp.pipeline-hazards` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.pipeline-ilp.pipeline-stages` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.virtual-memory-hardware.mmu` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.virtual-memory-hardware.multi-level-page-table` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.virtual-memory-hardware.page-size-huge-page` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.virtual-memory-hardware.page-table-walk` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.virtual-memory-hardware.tlb` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | KEEP_PENDING_ACCESS |
| `computer-architecture.core.virtual-memory-hardware.virtual-physical-address` | [기존 UMD 링크](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | KEEP_PENDING_ACCESS |

## 내용 검토에서 확인한 계층 경계

- hardware-memory-reordering: 이 Concept의 RISC-V RVWMO 별도 공식 Reference는 실제 ISA ordering에 관한 표준 근거다. UMD multiprocessors 개괄을 JMM/전체 ISA 규범으로 과장하지 않는다.
- false-sharing: 이미 같은 Concept의 Linux 공식 false-sharing Reference가 캐시 라인 소유권 문제의 정확한 근거다. UMD 403만으로 URL 교체할 이유는 없다.
- page-size-huge-page: Linux 공식 page_tables 및 hugetlbpage는 이미 연결되어 있다. Linux 구현을 하드웨어 보편 계약과 구분한다.
- write-allocate / write-through-write-back: UMD 원본의 세부 write policy 설명은 미확인; 동일 URL을 7개 Concept가 전역 metadata로 공유하기 때문에 일부 개념에서 global recommendation을 편집하는 것은 금지.
- pipeline-ilp.branch-prediction: 옛 MIPS 예시를 모든 현대 CPU의 predictor 계약으로 확대하지 않는다.
- datapath-control 3관계: PDF 원문을 직접 열거나 렌더링하지 못했으므로 원본의 critical-path diagram/clock timing을 검증 완료로 표시하지 않는다.
- performance.amdahl-law: 다른 UMD 강의 노트에서 공식 확인했지만 원래 canonical URL의 같은 절을 본 것은 아니다.

## 다음 단계

1. 실제 Reader/개별 사용 환경에서 원래 UMD 8개를 열 수 있는지, 정확한 관련 절이 있는지 확인. 조건을 충족하면 URL 유지.
2. 사용자에게 실제 접근 불가가 재현되거나 실질적인 범위 불일치가 확인되는 개별 관계만 공식 대체 자료로 교정하며, 관계 단위·전역 URL metadata 일치 유지.
3. OpenJDK JMH 1관계는 44 UMD 건과 별개: [공식 openjdk/jmh README](https://github.com/openjdk/jmh/blob/master/README.md)가 접근 가능하고 harness 사용·benchmark 제한을 실제로 설명하는 것을 확인. 기존 openjdk.org의 403은 dead link 확정 증거가 아님.
4. IEEE 754 1관계는 [Draft PR #233](https://github.com/guseoh/csforge/pull/233)에 별도 교정되어 있으나 merge 전이다.

통합 감사 verified 15 / pending 138은 유지. 이 문서는 evidence only; canonical 수정, Production Import, 배포, 병합 없음.
