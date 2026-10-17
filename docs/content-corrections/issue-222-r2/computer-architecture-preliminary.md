# Issue #222 R2 — Computer Architecture Reference 46관계 1차 재대조 (2026-10-17)

기준 `main 2862a92d9208153678f3b618df90fafe37cb2e09`. 기존 Wave3 `NEEDS_REVIEW` 46 관계, 10 URL과 현재 canonical Concept 중 일부의 Reference frontmatter·본문을 대조한 **감사 전용 추적표**. **본 단계는 원문 46관계 직접 VERIFIED 판정이 아니며**, 단순 접근 장애를 broken으로 기록하지 않는다.

## 대상 구성

- **UMD 교육 자료 44 관계 / 8 URL**, IEEE 754 표준 랜딩 1관계/1URL, OpenJDK JMH 프로젝트 1관계/1URL.
- UMD 캐시 관련 chapter 직접 열람은 이 환경에서 실패. UMD 별도 캐시 강의나 교육 자료의 존재가 바로 문제 URL 원문의 검증 완료를 의미하지 않는다.
- IEEE 문서 ID `8766227`과 표준 서지 DOI에 사용된 `8766229`가 다른 점은 **publisher publication number vs actual document DOI 가능성**을 포함하므로 링크 오류로 단정하지 않고 별도 확인 항목으로 추적한다.
- 기존 R2 `15 verified / 138 pending`은 **그대로**. 이 46개를 신규 해결 건수로 차감하지 않는다.

## 10 URL별 접근/학습 범위 계획

| canonical URL | 관계 | 후속 의미 검증 체크 |
| --- | ---: | --- |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html) | 7 | undefined |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html) | 7 | undefined |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html) | 4 | undefined |
| [8766227](https://ieeexplore.ieee.org/document/8766227) | 1 | IEEE Xplore 원본 직접 접근 불가. 출판사 공식 IEEE 754-2019 표준 기록은 DOI 10.1109/IEEESTD.2019.8766229로 검색되며 이 URL의 8766227은 출판 catalog 식별자일 가능성: **target landing의 표준 전문/경로 매칭 확인 전 링크 오류 단정 금지**. |
| [datapath.pdf](https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf) | 3 | Datapath PDF 직접 읽기/시각 검수 전이므로 register→combinational→register critical path, ALU, control 3관계를 미확정으로 유지. |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html) | 7 | undefined |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html) | 6 | undefined |
| [jmh](https://openjdk.org/projects/code-tools/jmh/) | 1 | OpenJDK JMH 공식 프로젝트 접근 제한. 다른 OpenJDK GitHub 소스/문서와 미러 링크 확인 없이 dead link 단정 금지. |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html) | 4 | undefined |
| [index.html](https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html) | 6 | undefined |

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
