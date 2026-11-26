# 컴퓨터 구조 — G1 도식·콘텐츠 통합 개선

- 기준: refactor `8f01a8ba820f0a3f33a234e93b400f8101f1c3a7` (2026-11-25)
- 전체 10 Topic / 61 Concept / 183 Question, 기존 SVG 0개. 이전 Wave 3 감사의 61개 Concept·183개 Question 기록을 기준으로 선정. 현재 원문 독립 전수 재감사는 완료되지 않았다.
- CS Learning Visualization의 제작 및 품질 기준을 읽고 구조·상태 비교·시간축·비례 막대 중 학습 목표에 맞는 정적 SVG를 선택했다. 공통 UI/런타임 의존성은 추가하지 않았다. Curriculum visualization 분류와 stable key, YAML frontmatter, 공유 Reference 메타데이터 보존.
- 현재 브랜치의 소스 변경: 20개 신규 SVG 및 연결 본문, 추가 set-associative-cache 본문 1개 교정(21개 Markdown), 4개 기존 Question 수정. 나머지 40개 본문은 유지. 아래 분류는 기존 감사를 활용한 구현 범위 판단이며 최종 검수 결과가 아니다.

## 61개 개념별 선정 결과

| Concept | 이번 변경 | 근거 |
| --- | --- | --- |
| `cache-organization/direct-mapped-cache` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `cache-organization/set-associative-cache` | POLISH 본문 | 직접 사상 비교 예와 valid 조건 연결 |
| `cache-organization/fully-associative-cache` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `cache-organization/index-tag-offset` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `cache-organization/replacement-policy` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `cache-organization/write-through-write-back` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `cache-organization/write-allocate` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `cache-organization/cache-friendly-access` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `data-representation/bit-byte-word` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `data-representation/binary-hex` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `data-representation/signed-twos-complement` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `data-representation/fixed-width-overflow` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `data-representation/floating-point` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `data-representation/endianness` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `datapath-control/alu-datapath` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `datapath-control/control-unit` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `datapath-control/clock-cycle` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `datapath-control/critical-path` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `datapath-control/branch-control-flow` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `device-io/interrupt-exception-trap` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `device-io/interrupt-handler-entry` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `device-io/programmed-io` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `device-io/memory-mapped-io` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `device-io/dma` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `device-io/device-cpu-memory-path` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `isa-execution/isa-vs-microarchitecture` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `isa-execution/instruction-format` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `isa-execution/registers` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `isa-execution/fetch-decode-execute` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `isa-execution/addressing-modes` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `isa-execution/procedure-call-machine-level` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `memory-hierarchy/memory-hierarchy` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `memory-hierarchy/temporal-spatial-locality` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `memory-hierarchy/cache-line` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `memory-hierarchy/cache-hit-miss` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `memory-hierarchy/latency-vs-bandwidth` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `memory-hierarchy/miss-penalty` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `multicore-memory/multicore-shared-memory` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `multicore-memory/private-shared-cache` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `multicore-memory/cache-coherence-problem` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `multicore-memory/coherence-protocol-model` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `multicore-memory/false-sharing` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `multicore-memory/hardware-memory-reordering` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `performance/latency-throughput` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `performance/cpu-time` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `performance/instruction-count-cpi-clock` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `performance/amdahl-law` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `performance/cache-impact` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `performance/pipeline-branch-impact` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `performance/microbenchmark-boundary` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `pipeline-ilp/pipeline-stages` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `pipeline-ilp/pipeline-hazards` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `pipeline-ilp/forwarding-and-stall` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `pipeline-ilp/branch-prediction` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `pipeline-ilp/superscalar-out-of-order` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `virtual-memory-hardware/virtual-physical-address` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `virtual-memory-hardware/mmu` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |
| `virtual-memory-hardware/page-table-walk` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `virtual-memory-hardware/tlb` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `virtual-memory-hardware/multi-level-page-table` | ADD SVG | 기존 학습 목표를 공간·시간 또는 상태 관계로 구체화 |
| `virtual-memory-hardware/page-size-huge-page` | KEEP (기존 ASCII/표/본문) | Wave 3 기존 판단 유지; 최신 독립 전수 재감사 미실시 |

## 사실 모델 및 범위

- 바이트 순서: 0x12345678, 주소 1000~1003. binary32: 0x3FC00000=1.5, 1/8/23bit.
- RV32I ADD: x1=7, x2=5 → x3=12, 정상 순차 PC 0x1000→0x1004. LW 예제 0x1000+32=0x1020, 정상 읽기 값 42. ISA와 실제 내부 회로는 구분한다.
- RV64 표준 정수 ABI: SP S→S-32→S, 24(sp)=S-8에 ra, 16(sp)=S-16에 s0. 중첩 호출 및 복원 조건. 모든 함수에 스택 할당을 요구하지 않는다.
- 고전 5-stage: IF/ID/EX/MEM/WB, 3개 명령의 완료 cycle 5/6/7. load-use: MEM 1cycle, forwarding 지원, consumer ID 1cycle 대기. 비순차 실행은 A load/B 의존/C 독립 예시에서 in-order retire 구조로 한정한다.
- 캐시: 64B 라인 0x1000~0x103f, 주소 0x1028 offset 40. 32KiB/64B/4-way의 512line, 128set, 19/7/6bit. 4라인 direct와 2-way에서 블록0/4 반복 접근 비교. 순차/stride 비교는 4B 원소, 정렬된 배열, 초기 빈 캐시와 프리페치·교체 생략 조건. write-through/write-back은 하위 계층 기록과 영속성 구분.
- 주소 변환: 하드웨어 관리 TLB의 hit/miss와 권한 평가 분리. Sv39 9/9/9/12bit, 4KiB leaf 예제. 희소 2-level 모형에서 미사용 root entry 아래 테이블 미할당. software refill 및 상위 leaf 예외는 본문 설명 보존.
- 멀티코어: 단순 write-invalidate 모델에서 같은 라인 X의 10→20 쓰기와 B 무효화. 거짓 공유는 독립 A/B 값의 라인 권한 경쟁. 일관성과 RMW 원자성, 언어 메모리 모델 구분.
- DMA: 제어 디스크립터, 장치→메모리 DMA, 완료 관찰, CPU 소비의 별개 경로. streaming 매핑의 수명과 coherent mapping에서도 필요한 순서·장치 계약 구분.
- 암달: p=.2, s=10, T=.82, 1/.82≈1.22배. 개선하지 않은 0.8 구간 동일 길이.

## 문항 및 콘텐츠 교정

기존 감사의 control-unit.q3 전제, stack frame, cache-line.q3 false-sharing 연결, branch-prediction.q3 중복, multi-level-page-table.q1 해설, TLB software refill 등은 이미 반영된 현재 원문을 확인하여 유지했다. 추가로 forwarding-and-stall.q2의 구체 cycle, tlb.q2의 권한/소프트웨어 refill, direct-mapped-cache.q3의 modulo 가정, fixed-width-overflow.q3의 Java 곱셈 전 타입 확장 및 배열 경계 검사를 보강했다. 기존 contentKey·유형·정답 키·Concept 연결을 유지했다.

183개 고유 Question 구조 확인(객관식 61, 단답 14, 서술 49, 시나리오 59). 객관식 정답 키/선택지 rationale 및 주관식 acceptedAnswers/modelAnswer 누락은 확인된 범위에서 없다. 모든 문항의 최신 독립 기술 의미 검토와 전체 Reference 검증은 미완료다.

직접 대조한 공식 자료:
- https://docs.riscv.org/reference/abi/v1.0/riscv-cc-procedure-calling-convention.html
- https://docs.riscv.org/reference/abi/riscv-cc-register-convention.html
- https://docs.riscv.org/reference/isa/priv/supervisor.html
- https://docs.kernel.org/core-api/dma-api-howto.html

## 통합 QA 인수인계

사용자 결정 CSF-0007에 따라 실행 QA 이관. [skip ci]로 반영한 제작 소스이며 형식 검사·실제 렌더링·Reader 900/1280 두 폭 및 라이트/다크·픽셀 검수는 아직 실행하지 않았다. 20개 SVG × 2테마 × 2폭 = 80개 Reader 조건은 이후 검수 계획이지 통과 수치가 아니다. 전체 Pack Preview 및 적용, 동일 재import UNCHANGED, 21개 본문/4문항의 업데이트와 개인·과거 답안 데이터 보존, asset 연결 전수 확인, 최신 내용 독립 리뷰 및 전체 Reference 대조 필요. 운영 DB 쓰기·병합·배포 없음.
