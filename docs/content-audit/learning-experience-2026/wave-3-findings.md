# Wave 3 발견 사항

전체 369 Concept·1,188 Question의 직접 의미 검토에서 확정한 새 발견이다. CURRENT_VERIFIED는 검토 근거 수준이며 KEEP과 다른 축이다. 기존 발견의 재확인은 wave-3-carried-findings.json에 별도 계승하며 새 심각도 수에 합산하지 않는다. canonical 수정은 수행하지 않았다.

## W3-CA-002 — P0

대상: `computer-architecture.core.datapath-control.control-unit.q3`

원문: [content/computer-architecture/datapath-control/questions.json:77](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/datapath-control/questions.json#L77)

> 메모리 장치는 자신에게 전달된 주소를 정상적으로 읽을 수 있으므로 엉뚱한 위치의 값을 load하거나 보호·페이지 fault가 발생할 수 있다.

문제: 질문은 이후 메모리 읽기가 정상 수행된다는 전제를 준다. 모델은 그 조건 아래 잘못된 위치의 값 읽기와 함께 보호/페이지 fault도 결과로 제시해 이미 주어진 정상 접근 조건을 벗어난다. 주소 계산과 제어 오류의 핵심 설명은 정확하지만 조건을 좁혀 읽는 학습자를 혼란시킬 수 있다.

최소 보강: 현재 전제를 유지하면 모델의 결과를 0x1080의 엉뚱한 값 읽기로 한정한다. fault 설명을 남기려면 정상 접근 전제를 제거했을 때의 별도 경우로 명시한다. 정확한 0x1020/0x1080 계산과 본문, 다른 선택지는 유지한다.

후속: #201

## W3-CA-009 — P2

대상: `computer-architecture.core.device-io.interrupt-exception-trap`

원문: [content/computer-architecture/device-io/interrupt-exception-trap.md:50](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/device-io/interrupt-exception-trap.md#L50)

> 어떤 권한 수준로 진입하는지

문제: 기술적 구별은 정확하지만 '권한 수준로'는 한국어 조사 오류다. 다른 표현을 재작성할 근거는 없다.

최소 보강: 해당 조사만 '권한 수준으로'로 정밀 수정한다. 기존 trap 분류·도식·문항은 유지한다.

후속: #201

## W3-CA-001 — P1

대상: `computer-architecture.core.isa-execution.procedure-call-machine-level`

원문: [content/computer-architecture/isa-execution/procedure-call-machine-level.md:38](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/isa-execution/procedure-call-machine-level.md#L38)

> 필요하면 register / local state를 stack에 보존

문제: 학습 목표는 스택 포인터·반환 주소·인자의 호출·복귀 상태 변화다. 본문은 ra/a0-a7과 보존 주체, 재귀 frame 이름은 설명하지만 SP의 frame 할당·중첩 호출·복귀 복원을 설명하지 않는다. 프레임 수명과 stack 위치 변화의 핵심 학습 근거가 빠져 있다.

최소 보강: RISC-V 표준 ABI를 명시한 작은 non-leaf 예에 entry SP → 정렬된 frame 할당(SP 감소) → ra/s 보존과 nested call → 값 복원 → entry SP 복구의 상태 표/timeline을 추가한다. 기존 정확한 ISA/ABI 분리와 leaf 생략 가능성은 유지하며 모든 함수가 동일 frame을 만든다고 일반화하지 않는다. 기존 문항은 정확하므로 새 문항 생성이나 전체 재작성은 불필요하다.

후속: #201

## W3-CA-004 — P1

대상: `computer-architecture.core.memory-hierarchy.cache-line.q3`

원문: [content/computer-architecture/memory-hierarchy/questions.json:116](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/memory-hierarchy/questions.json#L116)

> 이것이 거짓 공유(false sharing)다.

문제: 문항과 정확한 모델은 두 코어의 line 소유권 이동과 배치 개선을 요구한다. 단일 연결 cache-line 본문은 line 이동/크기와 메타데이터 개요를 가르치며 거짓 공유를 뒤 Topic에 이름만 넘긴다. 소유권의 상태 변화를 배우는 직접 Concept 연결과 학습 순서 근거가 부족하다.

최소 보강: 기존 q3에 직접 전수 검토한 computer-architecture.core.multicore-memory.false-sharing을 추가 연결하고 해당 심화 Topic 이후의 응용임을 명시한다. 실제 본문은 line 소유권 이동과 padding/분할의 비용, 증거 확인을 설명해 문항의 직접 학습 근거가 된다. 정확한 모델과 입문 cache-line 본문은 유지하며 새 문항이나 중복 강의는 만들지 않는다.

후속: #201

## W3-CA-007 — P1

대상: `computer-architecture.core.multicore-memory.multicore-shared-memory.q3`

원문: [content/computer-architecture/multicore-memory/questions.json:33](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/multicore-memory/questions.json#L33)

> 두 스레드가 동일한 `int x`에 대해 각각 `x++`를 한 번 수행했다.

문제: 문항은 최종1을 lost update 사례로 설명하게 하지만 초기값을 주지 않는다. 모델은 초기0을 추가 전제로 두어 두read0→write1을 만든다. 초기-1이라면 두번 정상 증가만으로도1이므로 최종값1만으로 제시한 갱신 손실 원인을 추론할 수 없다. 모델의 interleaving 자체는 초기0에서 정확하다.

최소 보강: prompt에 초기x=0과 원자적RMW가 아닌 교육용 read/add/write 모형을 명시한다. 정확한 두read0→두write1, coherence와RMW원자성의구분은 유지한다. 언어의 x++가 모든CPU에서항상동일한명령3개로내려간다는보장은하지않는다.

후속: #201

## W3-CA-008 — P2

대상: `computer-architecture.core.multicore-memory.private-shared-cache`

원문: [content/computer-architecture/multicore-memory/private-shared-cache.md:50](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/multicore-memory/private-shared-cache.md#L50)

> 절충**로 본다.

문제: 마지막 문장의 절충로는 조사가 자연스럽지 않다. 기술적 비교와 도식, 연결 문항은 정확하며 사소한 한국어 표현 문제다.

최소 보강: 해당 표현만 절충으로 본다로 수정한다. 본문 전체 재작성이나 기존 이미지/문항 수정은 불필요하다.

후속: #201

## W3-CA-010 — P0

대상: `computer-architecture.core.performance.pipeline-branch-impact.q1`

원문: [content/computer-architecture/performance/questions.json:207](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/performance/questions.json#L207)

> `1.2`는 20%의 분기마다 모두 예측에 실패한다고 본 계산에 가깝다.

문제: 정답 D=0.12는 맞지만 B의 rationale은 모든 분기 실패를 가정한 값을1.2에 가깝다고 설명한다. 실제 그 가정의 값은0.20×1×12=2.4이다. 1.2는 주어진5% 대신50% 실패율을 쓰면 나오는 값이어서 오답의 오류 경로를 잘못 가르친다.

최소 보강: B rationale만 '실패율5%를50%로 잘못 적용한 값'처럼 실제1.2를 만드는 계산으로 정밀 수정한다. 정답·다른 rationale·해설은 유지한다.

후속: #201

## W3-CA-003 — P2

대상: `computer-architecture.core.pipeline-ilp.branch-prediction.q3`

원문: [content/computer-architecture/pipeline-ilp/questions.json:155](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/pipeline-ilp/questions.json#L155)

> 명령어당 예측 실패는 0.20 × 0.05 = 0.01회다.

문제: 이 문항은 20% 분기·5% 실패·12cycle의 추가 CPI를 계산한다. 앞 Topic의 computer-architecture.core.datapath-control.branch-control-flow.q3는 20%·10%·12cycle을 같은 식으로 계산한다. 두 HARD 문항의 정답은 정확하지만 같은 학습 목표를 숫자만 바꿔 반복해 심화 상태 추론의 다양성이 작다. 핵심 목표가 검증됐으므로 선택적 P2다.

최소 보강: 앞 Topic의 비용 입문 계산을 유지하고 기존 branch-prediction.q3만 방향 예측 성공/목적지 예측 실패 또는 서로 다른 분기 패턴의 실행·폐기 흐름을 비교하는 응용으로 최소 재구성한다. 본문에 이미 있는 방향/대상·추측/확정 목표를 재사용하며 새 문항이나 예측기 세부 강의는 강제하지 않는다.

후속: #201

## W3-CA-005 — P1

대상: `computer-architecture.core.virtual-memory-hardware.multi-level-page-table.q1`

원문: [content/computer-architecture/virtual-memory-hardware/questions.json:173](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/virtual-memory-hardware/questions.json#L173)

> 아키텍처가 상위 페이지 테이블 엔트리가 큰 물리 주소 범위를 직접 매핑하는 말단 엔트리 역할을 허용하면 해당 범위에 더 낮은 단계의 테이블이 필요하지 않다.

문제: q1은 희소 가상 주소 공간에서 미사용 범위의 하위 테이블을 만들지 않는 이유를 묻고 정답 D 및 모든 rationale는 정확하다. explanation은 flat 테이블의 낭비를 말한 뒤 대형 페이지 upper-leaf의 별도 메커니즘으로 넘어가 정답의 결정적 원인을 설명하지 않는다. 대형 페이지 지원 없이도 희소 테이블의 장점은 성립한다.

최소 보강: q1 해설 후반을 미사용 상위 entry에는 하위 테이블을 할당하지 않아 빈 범위의 PTE 저장 공간을 아낀다는 원인으로 맞춘다. 대형 페이지 upper-leaf 설명은 이미 그 조건을 묻는 q3에 유지한다. 정확한 D와 모든 보기, 본문은 변경할 필요가 없다.

후속: #201

## W3-CA-006 — P1

대상: `computer-architecture.core.virtual-memory-hardware.mmu`, `computer-architecture.core.virtual-memory-hardware.page-table-walk`, `computer-architecture.core.virtual-memory-hardware.tlb`

원문: [content/computer-architecture/virtual-memory-hardware/page-table-walk.md:29](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/computer-architecture/virtual-memory-hardware/page-table-walk.md#L29)

> TLB에 필요한 주소 변환이 없다면 MMU는 페이지 테이블에서 가상 페이지의 매핑을 찾아야 한다.

문제: 세 본문은 TLB miss → MMU/page-table walk → fill을 일반 흐름으로 제시하면서 하드웨어 walker가 있는 대표 모델이라는 범위를 명시하지 않는다. Linux MIPS R4000 refill 경로는 소프트웨어가 PT entry를 읽고 TLB에 기록한 뒤 trap에서 복귀한다. 해당 소스는 hardware walker 지원 경로도 조건부로 구별하므로 모든 MMU/ISA에서 직접 하드웨어 순회가 이뤄진다는 설명은 과도하다. q1 rationale는 이미 hardware/software 가능성을 정확히 언급한다.

최소 보강: 세 본문의 동일 도식·설명을 하드웨어 관리 TLB/page walker가 있는 대표 방식으로 한정하고, 소프트웨어 관리 TLB는 miss/refill handler가 매핑 조회·엔트리 설치를 수행할 수 있다는 짧은 경계를 추가한다. TLB miss 자체와 디스크/page fault를 동일시하지 않는 기존 정확한 설명은 유지한다. 소프트웨어 refill 구현 튜토리얼이나 모든 문항 재작성은 불필요하다.

후속: #201

## W3-DSA-026 — P1

대상: `dsa.core.algorithm-selection.preprocessing-query-cost.q2`

원문: [content/dsa/algorithm-selection/questions.json:166](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/algorithm-selection/questions.json#L166)

> 같은 조건에서 질의가 10번이면 선형 탐색 방식과 전처리 방식의 총 예상 시간을 각각 계산하라.

문제: 독립 Question의 prompt에는 선형100ms/전처리800ms/질의5ms가 없고 이전 q1의 '같은 조건'만 참조한다. 임의 Quiz/Review/Search에서 q2만 표시되면 모델의 1000ms/850ms를 도출할 수 없다. 산술과 반복 비용 설명은 정확하다.

최소 보강: 기존 q2 자체에 선형 탐색 한 번100ms, 전처리800ms, 전처리 후 질의 한 번5ms와 재사용 조건을 명시한다. 답과 해설, 다른 문항은 유지한다.

후속: #202

## W3-DSA-001 — P1

대상: `dsa.core.complexity.invariant-correctness`, `dsa.core.complexity.invariant-correctness.q2`

원문: [content/dsa/complexity/invariant-correctness.md:40](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/complexity/invariant-correctness.md#L40)

> 반대로 `a[mid] >= target`이면 `mid`가 답일 가능성이 남으므로 `right = mid`로 둔다.

문제: lower-bound의 영역 불변식과 갱신을 설명하면서 배열의 비감소 정렬 전제를 명시하지 않는다. q2도 양 끝 known 영역만 주고 정렬 전제가 없다. a[mid]이 target이상이어도 비정렬 suffix 전체가 target이상이라는 유지 증명은 성립하지 않는다. 초기left0/rightn은 양 끝이 비어 있어 비정렬 입력에서도 주어진 invariant 자체는 참이다.

최소 보강: 본문 lower-bound 예와 q2에 '비감소 순으로 정렬된 배열' 전제를 한 문장 추가하고, 정렬 때문에 mid 오른쪽도 target이상이라는 유지 이유를 명시한다. 기존 루프·다른 문항을 재작성할 필요는 없다.

후속: #202

## W3-DSA-002 — P2

대상: `dsa.core.complexity.invariant-correctness`

원문: [content/dsa/complexity/invariant-correctness.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/complexity/invariant-correctness.md#L22)

> 이런 성질을 불변식라고 한다.

문제: 본문에 '불변식라고'와 마지막 단락의 '불변식다'라는 한국어 조사/서술 오류가 있다. 영문 용어 혼용 전체를 재작성할 근거는 아니다.

최소 보강: 두 표현만 '불변식이라고', '불변식이다'로 정밀 수정한다.

후속: #202

## W3-DSA-020 — P0

대상: `dsa.core.graph-path.unweighted-shortest-path.q3`

원문: [content/dsa/graph-path/questions.json:38](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/graph-path/questions.json#L38)

> 이전 정점을 함께 기록해야 목적지에서 시작 정점까지 역추적해 경로를 복원할 수 있다.

문제: 원래graph의edge와전체BFSdist가남아있다면도착점으로들어오는edge중거리1작은predecessor를반복선택해최단경로하나를복원할수있다. A→B/C→D에서dist0/1/1/2만저장해도D←B←A를찾을수있다. prompt는원graph재접근을금지하지않고원래first-discovery경로재현도요구하지않아parent필수단정이올바른대안을배제한다.

최소 보강: parent는효율적인직접역추적을위한대표state라고한정하고graph+dist대안과필요한재탐색비용을인정한다. 또는원graph에재접근할수없거나원래discoverytree를재현해야한다는전제를준다. 본문정확한parent사용법은유지한다.

후속: #202

## W3-DSA-021 — P2

대상: `dsa.core.graph-path.bellman-ford.q1`

원문: [content/dsa/graph-path/questions.json:100](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/graph-path/questions.json#L100)

> 음수 간선이 방향 그래프에서만 가능한 것은 아니다.

문제: A보기는'음수간선은무방향트리에서만허용'이라는데rationale는'방향그래프에서만가능'을부정해반박방향이반대다. undirectednegative반복cycle주의와정답D는정확하다.

최소 보강: 'BellmanFord는음수간선을무방향트리로한정하지않고방향graph의음수간선도처리한다'로A반박을맞춘다. 뒤의undirectednegativecycle경계는유지한다.

후속: #202

## W3-DSA-022 — P0

대상: `dsa.core.graph-path.kruskal.q1`

원문: [content/dsa/graph-path/questions.json:331](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/graph-path/questions.json#L331)

> 현재 간선의 가중치를 무시하고 다음 간선을 선택한다

문제: 이미연결된endpoint의현재edge를skip할때그weight와무관하게다음eligibleedge를고르는것은정상Kruskal과양립한다. 실제q2의AC3skip후CD4선택은B와D의자연스러운해석이동시에맞는예다. D rationale는전체weight정렬을무시한것으로해석하지만보기는그렇게말하지않는다.

최소 보강: D를가중치순서를명시적으로위반하거나다음간선의cycle검사를생략하는구체적오답으로교체하고rationale를그오류에맞춘다. 정답B·A/C·본문은유지한다.

후속: #202

## W3-DSA-023 — P1

대상: `dsa.core.graph-path.prim`

원문: [content/dsa/graph-path/prim.md:36](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/graph-path/prim.md#L36)

> Adjacency list와 binary heap을 사용하면 일반적으로 O(E log V) 정도로 분석할 수 있고

문제: 본문은edge를heap에넣고both-inside staleedge를skip하는lazyPrim을설명하면서heap종류/simplegraph조건없이ElogV를제시한다. 실제저자LazyPrimMST는edgeheap ElogE/E공간,PrimMST는indexedvertexheap ElogV/V공간이다. simplegraph면E≤V²로logE=O(logV)변환가능하지만parallel간선을허용한일반graph에서는같은범위가아니다.

최소 보강: 대표lazyedge방식의O(ElogE)와indexedvertex방식의O(ElogV)를한문장으로구별하거나현재식은simplegraph에서의상한임을명시한다. 기존frontier/state/문항은유지하고구현튜토리얼은추가하지않는다.

후속: #202

## W3-DSA-024 — P2

대상: `dsa.core.graph-path.prim`

원문: [content/dsa/graph-path/prim.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/graph-path/prim.md#L22)

> frontier 간선**를 반복해서

문제: 한국어조사'간선를'오류다. 알고리즘흐름이나그림재작성근거는아니다.

최소 보강: 해당표현만'frontier간선을'로정밀수정한다.

후속: #202

## W3-DSA-019 — P1

대상: `dsa.core.graph.topological-sort.q4`

원문: [content/dsa/graph/questions.json:293](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/graph/questions.json#L293)

> `displayOrder` 기준 우선순위 큐로 선택해 동률 처리 순서를 고정한다.

문제: 결정적위상순서의해결책으로displayOrder만을기준으로한PQ도제시하지만displayOrder가동률이면heap이그동률의순서를고정하지않는다. unique안정키대안은맞다. 앞서실제읽은priority-queue의동률계약과도대조했다.

최소 보강: (displayOrder,contentKey)처럼고유최종tie-break를포함하는전체order를명시하거나displayOrder의유일성을전제로준다. 여러validorder대정확성의기존모델과본문은유지한다.

후속: #202

## W3-DSA-025 — P0

대상: `dsa.core.greedy.interval-scheduling.q3`

원문: [content/dsa/greedy/questions.json:161](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/greedy/questions.json#L161)

> 구간 A=[1,10], B=[2,3], C=[3,4], D=[4,5]가 있다.

문제: prompt는닫힌구간표기지만model/explanation은B/C/D를겹치지않는세구간으로선택한다. 닫힌구간이면B와C는3,C와D는4를공유한다. 이때최대는B/D두개이며모델세개는불가능하다. 바로앞q2는반열린구간의endpoint호환을명시해차이를가르친다.

최소 보강: 의도한세선택반례대로네구간을[start,finish)로표기하고그계약을q3자체에명시한다. earlieststart실패와정확한교환증명·다른문항은유지한다.

후속: #202

## W3-DSA-009 — P0

대상: `dsa.core.hashing.open-addressing.q2`

원문: [content/dsa/hashing/questions.json:19](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/hashing/questions.json#L19)

> 삭제 자리에는 탐사를 계속해야 함을 나타내는 tombstone 상태가 필요하다.

문제: EMPTY로바꾸고뒤B를그대로둘때조회실패설명은맞지만tombstone을필수방식으로단정한다. 실제교재저자LinearProbingHashST.delete는삭제뒤cluster를재삽입하여tombstone없이경로를보존한다. 본문은이미tombstone을가능한방식으로표현한다.

최소 보강: 재배치하지않는삭제방식에서는tombstone이필요하다고한정하거나뒤cluster재삽입/적절한backshift도가능하다는짧은경계를추가한다. 실패trace와정확한본문은유지한다.

후속: #202

## W3-DSA-010 — P0

대상: `dsa.core.hashing.resize`, `dsa.core.hashing.resize.q2`

원문: [content/dsa/hashing/questions.json:28](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/hashing/questions.json#L28)

> 한 번의 전체 재배치는 Θ(n)으로 볼 수 있다.

문제: n항목을모두옮긴다는사실은작업수하한을주지만재삽입비용까지무조건선형상한으로만들지않는다. 실제저자LinearProbingHashST.resize는각항목에put를호출하고모두같은hash인경우probe누계1+2+…+n로Theta(n²)가가능하다. 초기화할capacity가n과독립으로크면그비용도별도다. Concept의대표O(n)모형과q2acceptedTheta(n)에필요한가정이누락됐다.

최소 보강: 상수비용hash/equality,capacityTheta(n),고르게분산되어각재삽입의기대비용상수인조건에서기대Theta(n)이라고본문과q2를한정한다. 또는추상적으로항목당상수시간직접배치를전제로준다. 충돌worst와대표모형을구별하고기존peak·incremental문항은유지한다.

후속: #202

## W3-DSA-018 — P0

대상: `dsa.core.recursion-backtracking.recurrence.q3`

원문: [content/dsa/recursion-backtracking/questions.json:110](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/recursion-backtracking/questions.json#L110)

> 각 깊이 전체에서 Θ(n)의 작업이 발생해 총 Θ(n log n)이 된다.

문제: 두번째식은2T(n/2)+O(n)만주는데모델은각level Theta(n)·전체Theta(nlogn)으로tight차수를단정한다. O(n)에는상수f(n)=1도포함되어2T(n/2)+1,T(1)=1이면2n-1=Theta(n)이다. 실제Cornell의상수combine예와master의Theta추가work조건으로대조했다.

최소 보강: 의도한비교대로두번째추가work를Theta(n)또는cn(c>0)으로prompt에명시하거나모델을O(nlogn)상한과실제f(n)에따른차이로정밀수정한다. 정확한깊이비교·본문의O상한설명은유지한다.

후속: #202

## W3-DSA-014 — P0

대상: `dsa.core.search-sort.binary-search-boundary`, `dsa.core.search-sort.binary-search-boundary.q3`, `dsa.core.complexity.invariant-correctness`

원문: [content/dsa/search-sort/binary-search-boundary.md:30](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/search-sort/binary-search-boundary.md#L30)

> 답 후보가 항상 그 구간 안에 있다는 불변식을 유지할 수 있다.

원문: [content/dsa/search-sort/questions.json:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/search-sort/questions.json#L12)

> 중간 위치를 후보 구간에 남긴다.

원문: [content/dsa/complexity/invariant-correctness.md:36](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/complexity/invariant-correctness.md#L36)

> [left, right) : 아직 답 후보인 영역

문제: lower-bound code의[left,right)는아직검사할unknown원소구간이며가능한answer경계범위는닫힌[left,right]다. 처음right=n의allfalse답n은반열린구간밖이고predicate(mid)가true여서right=mid가되면mid도그구간밖이다. 따라서항상반열린구간안이라는본문및q3표현은기존0/nedgecase·코드와모순된다. complexity의같은영역표현도함께정밀보강해야한다.

최소 보강: knownFalse[0,left),unknown[left,right),knownTrue[right,n)와가능한answer[left,right]를구별한다. right=mid는mid를정답경계로보존하고검사구간에서는제외한다고고친다. 코드·정확한0/n결과·lower/upper정의는유지한다.

후속: #202

## W3-DSA-015 — P1

대상: `dsa.core.search-sort.stable-sort.q3`

원문: [content/dsa/search-sort/questions.json:17](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/search-sort/questions.json#L17)

> `score DESC, id ASC`처럼 고유한 최종 동률 처리 기준을 추가해 전체 순서를 고정해야 한다.

문제: 동률ORDER BY원인과unique tie-break대안은맞지만prompt는데이터가page조회사이불변인지명시하지않는다. rowinsert/delete/score변경으로각querysnapshot이달라지면uniqueorder가있어도page행이이동할수있다. 그런올바른원인/대안을현재모델이구별하지않는다.

최소 보강: 불변dataset/동일snapshot에서동률순서문제를묻는다고prompt를한정하거나, tie-break는동률비결정성만해결하고데이터변경정책은별도라고해설에경계를추가한다. pagination기능구현은추가하지않는다.

후속: #202

## W3-DSA-016 — P0

대상: `dsa.core.search-sort.heap-sort.q3`

원문: [content/dsa/search-sort/questions.json:39](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/search-sort/questions.json#L39)

> 고유 동률 처리 기준을 키에 포함하거나 안정성이 보장되는 다른 정렬 방법을 선택해야 한다.

문제: stable요구의해결책을일반고유tie-break로표현한다. 임의idtie-break는결과결정성은줄수있어도입력에서equalkey의상대순서를보존하지않는다. 실제UTS10forcingstable은현재record순번등원래순서를보존하는증가값을사용한다.

최소 보강: 고유기준을원래입력순번/원래index로명시하여(originalKey,inputSequence)비교라고정밀보강한다. 다른stable알고리즘대안과정확한모델은유지한다.

후속: #202

## W3-DSA-017 — P2

대상: `dsa.core.search-sort.comparison-sort-lower-bound`, `dsa.core.search-sort.merge-sort`

원문: [content/dsa/search-sort/comparison-sort-lower-bound.md:35](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/search-sort/comparison-sort-lower-bound.md#L35)

> 계수 정렬나 기수 정렬

원문: [content/dsa/search-sort/merge-sort.md:38](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/search-sort/merge-sort.md#L38)

> 불변식**다.

문제: 두본문의'계수정렬나'와'불변식다'는한국어조사/서술오류다. 기술설명·도식의재작성근거는없다.

최소 보강: 해당표현만'계수정렬이나', '불변식이다'로정밀수정한다.

후속: #202

## W3-DSA-003 — P2

대상: `dsa.core.sequential.dynamic-array.q4`

원문: [content/dsa/sequential/questions.json:9](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/sequential/questions.json#L9)

> 크기 조정 빈도, 한 번의 복사량, 남는 용량 관점에서 두 선택의 상충 관계를 비교하라.

문제: modelAnswer는 빈도·spare capacity와 더 큰 allocation을 비교하지만 요청한 한 번의 기존 원소 복사량은 답하지 않는다. 동일한 full기존capacity n에서resize하면1.1/2.0모두n개를 복사하므로 allocation 크기와 copy량을 구별해야 한다.

최소 보강: 동일 기존 용량에서의 resize는 둘 다 기존n개를 복사하고 새 확보량/spare 및 장기 resize 빈도·총copy 비용이 다르다는 문장을 model/explanation에 추가한다.

후속: #202

## W3-DSA-004 — P2

대상: `dsa.core.sequential.doubly-linked-list`, `dsa.core.sequential.doubly-linked-list.q2`

원문: [content/dsa/sequential/questions.json:16](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/sequential/questions.json#L16)

> 센티널(sentinel) 노드를 사용하면 빈 리스트와 머리·꼬리 삽입·삭제의 경계 처리가 단순해지는 이유를 설명하라.

문제: sentinel에 대한 답은 정확하지만 연결 Concept는 null끝 일반list만 설명한다. 빈sentinel 모델과 실제data node의 구별을 배우지 않은 상태에서 새로운 구조를 바로 평가한다.

최소 보강: 기존 Concept에 head/tail sentinel의 빈 연결(head.next=tail, tail.prev=head)과 첫 삽입/마지막 삭제가 일반 이웃 갱신이 되는 짧은 설명·텍스트 상태를 추가한다. q2의 정확한 답과 기존 null끝 설명은 유지한다.

후속: #202

## W3-DSA-005 — P0

대상: `dsa.core.sequential.array-vs-linked.q3`

원문: [content/dsa/sequential/questions.json:21](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/sequential/questions.json#L21)

> 연결 리스트는 흩어진 노드를 링크로 따라가며 캐시 미스와 메모리 할당 비용이 커질 수 있다.

문제: 순회CPU 시간을 묻는 modelAnswer에 메모리 할당 비용을 포함한다. 이미 구축한list를 읽는 순회는 node를 새로 할당하지 않는다. pointerchasing/cache 비용은 맞지만 구축 포함 총비용과 순수 scan의 측정 경계가 섞인다.

최소 보강: 순회 차이는 dependent pointer load/cache miss/prefetch 차이로 설명하고 allocation 비용은 자료구조 구축·관리까지 측정할 때 별도로 고려하는 비용으로 분리한다.

후속: #202

## W3-DSA-006 — P2

대상: `dsa.core.sequential.dynamic-array.q3`

원문: [content/dsa/sequential/questions.json:8](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/sequential/questions.json#L8)

> 분할 상환 O(1)과 이런 급증이 동시에 성립할 수 있는 이유를 설명하라.

문제: complexity.amortized-analysis.q4가 이미 드문 큰copy와p99 spike가amortizedO(1)과 공존하는 같은 실행 추론을 평가한다. 현재q3는 동적 배열의 다른 내부 상태 목표를 추가하지 않는다. 기술적으로 틀린 답은 아니다.

최소 보강: 기존 q3만 old/new 배열이 copy중 동시에 살아 있는 peak메모리와 capacity초과 시점의 실패 조건을 평가하도록 최소 전환하는 후보로 기록한다. 이전q4의 amortized/latency 검증은 유지한다.

후속: #202

## W3-DSA-007 — P1

대상: `dsa.core.stack-queue-deque.circular-queue.q1`

원문: [content/dsa/stack-queue-deque/questions.json:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/stack-queue-deque/questions.json#L10)

> 현재 `rear=4`라면 다음 삽입 위치를 계산하는 `(rear+1) mod capacity`의 결과는?

문제: 본문은rear를다음enqueue위치로정의하므로현재rear4의이번삽입위치는4이다. 문항은rear+1을다음삽입위치로부른다. 주어진식의정답0은맞지만rear의상태시점정의가본문과다르다.

최소 보강: 문항을 'rear4위치에삽입한후다음enqueue를위해rear를갱신하는식'으로명시한다. 정답0과modulo해설은유지한다.

후속: #202

## W3-DSA-008 — P1

대상: `dsa.core.stack-queue-deque.monotonic-stack-queue.q3`

원문: [content/dsa/stack-queue-deque/questions.json:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/stack-queue-deque/questions.json#L22)

> 인덱스를 함께 저장해 `index < windowLeft`인 후보를 제거해야 한다.

문제: prompt는덱에값만저장했다는조건만주고이전입력·만료값접근을금지하지않는다. 만료값을알수있고new보다strict하게작은값만뒤에서제거해동일값을유지한다면front가outgoing과같을때한개pop하는값-only구현도정확하다. 따라서index자체가반드시필요하다는model/explanation은가능한올바른대안을배제한다.

최소 보강: 위치/만료를판별할정보가필요하다고설명하고index는대표방법으로한정한다. 또는이전입력·만료값·중복개수정보를별도로알수없다는전제를prompt에추가한다. 값-only대안은동일값보존및outgoing접근조건과함께평가한다.

후속: #202

## W3-DSA-011 — P1

대상: `dsa.core.trees.binary-search-tree.q1`, `dsa.core.trees.binary-search-tree.q3`

원문: [content/dsa/trees/questions.json:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/trees/questions.json#L10)

> BST에 8,3,12,1,6,10,14가 정렬 불변식에 맞게 저장돼 있을 때 키 10을 찾는 비교 경로를 설명하라.

문제: q1은keyset과BSTordering만주어topology가정해지지않는다. root10인validBST도가능하여모델8→12→10은유일하지않다. q3의4→40제자리변경모델도root가40보다작다는미제공조건을단정한다. root50의leftleaf4를40으로바꾸는경우는여전히valid일수있다. 본문그림은명확하지만단독문항에그구조가자동포함되지는않는다.

최소 보강: q1에본문의root/child관계를재기재하거나빈일반BST에열거순서대로삽입했다는전제를준다. q3에root8과leftnode4를명시하거나4<root<40이면실패가능하다는조건부모델로맞춘다. 정확한본문과q2 O(h)는유지한다.

후속: #202

## W3-DSA-012 — P1

대상: `dsa.core.trees.binary-tree-traversal.q2`

원문: [content/dsa/trees/questions.json:7](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/trees/questions.json#L7)

> 같은 트리의 중위 순회와 후위 순회 순서를 각각 쓰라.

문제: 문항자체에tree구조가없고'같은트리'가앞q1을암묵참조한다. 개별출제시입력을확정할수없다. model DBEAC/DEBCA는q1의tree에서는정확하지만다른tree에서는답이달라진다.

최소 보강: q1의A.left=B/A.right=C/B.left=D/B.right=E관계를q2에도짧게재기재하거나동일텍스트tree를포함한다. 두순서와해설은유지한다.

후속: #202

## W3-DSA-013 — P2

대상: `dsa.core.trees.tree-rotation`, `dsa.core.trees.heap`, `dsa.core.trees.trie`

원문: [content/dsa/trees/tree-rotation.md:40](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/trees/tree-rotation.md#L40)

> 불변식**를 기준으로

원문: [content/dsa/trees/heap.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/trees/heap.md#L22)

> 불변식**를 함께

원문: [content/dsa/trees/trie.md:42](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/dsa/trees/trie.md#L42)

> 정확 일치 조회가나 prefix 조회

문제: rotation·heap의'불변식를'과trie의'조회가나'는실제한국어조사/접속오류다. 기술설명과도식은정확하며다른영문혼용표현을재작성할근거는없다.

최소 보강: 각각'불변식을', '정확일치조회나prefix조회'로해당표현만정밀수정한다. 원문내용·도식·문항을확대재작성하지않는다.

후속: #202

## W3-NET-009 — P1

대상: `network-http.core.dns.negative-cache.q2`

원문: [content/network-http/dns/questions.json:27](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/dns/questions.json#L27)

> 부정 응답 캐시 때문에 DNS 오타를 고친 직후에도 실패가 계속될 수 있는 이유를 설명하라.

문제: DNS 오타 수정은 client가 조회 이름을 잘못 썼다가 올바른 이름으로 바꾼 경우도 포함한다. modelAnswer는 같은 이름의 권한 서버 레코드를 추가한 경우를 전제한다. RFC2308 §5에서 NXDOMAIN은 QNAME/QCLASS, NODATA는 QNAME/QTYPE/QCLASS를 키로 하므로 다른 이름으로 수정하면 이전 이름의 부정 캐시가 그대로 실패시키는 인과는 성립하지 않는다.

최소 보강: 질의 QNAME을 유지하고 권한 서버에 누락되거나 잘못된 레코드를 수정·추가했다는 조건을 prompt에 명시한다. 설명에는 client 조회 이름 수정과 권한 데이터 수정의 차이를 한 문장 추가한다. 본문과 나머지 문항은 유지한다.

후속: #202

## W3-NET-026 — P0

대상: `network-http.core.http-cache.last-modified.q1`

원문: [content/network-http/http-cache/questions.json:14](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-cache/questions.json#L14)

> 시간 기반 값은 바이트 단위 강한 검증자가 아니다.

문제: A의 '항상 강한 검증자'는 오답이 맞지만 rationale는 시간 기반 validator가 strong일 수 없는 것처럼 단정한다. RFC9110§8.8.2.2는 origin이 해당 초에 두 번 바뀌지 않았음을 확실히 알거나 Date와의 간격·같은 시계 등의 명시 조건에서 Last-Modified를 strong으로 추론할 수 있게 한다.

최소 보강: 항상 strong인 것은 아니며 기본적으로 implicitly weak, 특정 RFC 조건에서는 strong 추론 가능하다고 한정한다. 정답D와 같은 초 두 변경의 한계는 유지한다.

후속: #202

## W3-NET-027 — P1

대상: `network-http.core.http-cache.if-none-match.q3`

원문: [content/network-http/http-cache/questions.json:19](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-cache/questions.json#L19)

> 사용자별 대시보드에서 두 사용자의 ETag가 우연히 같고 CDN이 `If-None-Match`에 304를 반환한다.

문제: ETag는 전역 고유 ID가 아니다. 서로 다른 자원/분리된 사용자 캐시에서 같은 tag가 나올 수 있고 각 사용자가 자기 본문을 재검증하면 304만으로 정보 유출을 증명하지 못한다. model은 실제 다른 사용자 표현이 잘못 선택된 경우를 전제하지만 prompt에 body 차이·key 범위·재사용 주체가 없다.

최소 보강: 같은 URI의 A/B 서로 다른 개인 본문, 사용자 구분 없는 shared key와 A의 저장 본문이 B에게 선택되는 trace를 명시한다. 동일 tag만으로 인가/누출 오류라고 판정하지 않고 표현 선택 오류를 원인으로 검증한다.

후속: #202

## W3-NET-028 — P2

대상: `network-http.core.http-cache.intermediary-cache.q1`

원문: [content/network-http/http-cache/questions.json:29](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-cache/questions.json#L29)

> TCP keepalive만 확인하고 HTTP 신선도는 평가하지 않는다

문제: 정답과 모든 rationale는 정확하지만 B 원본 DB 매번·C TCP만·D 모든 URL 전역 항목은 모두 지나치게 먼/극단 오답이다. fresh response도 no-cache·Vary·auth·request 조건으로 reuse가 달라지는 학습 목표를 검증하지 못한다.

최소 보강: fresh+no-cache, same URI+Vary mismatch, stale+successful validation처럼 근접한 조건을 넣되 현재 질문 전제에서 정답A만 성립하도록 구성한다.

후속: #202

## W3-NET-015 — P2

대상: `network-http.core.http-message.request-message.q1`

원문: [content/network-http/http-message/questions.json:2](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L2)

> HTTP 요청 메시지의 시작 줄, 필드, 콘텐츠 관계를 설명한 것으로 맞는 것은?

문제: 정답과해설은시작줄에서method/target을전달하는H1구문을genericHTTP요청구조로설명한다. RFC9112 §2/3은H1start-line이고RFC9114 §4.3은controlpseudo-fields를정의한다. Concept본문은이미version별의미/구조를구별한다.

최소 보강: prompt·rationale·explanation에HTTP/1.1을명시하고필요하면H2/3의동일control정보는pseudo-fields라는한문장을붙인다. 모든HTTP버전의공통wireline으로외우게하지않는다.

후속: #202

## W3-NET-016 — P2

대상: `network-http.core.http-message.request-message.q2`

원문: [content/network-http/http-message/questions.json:3](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L3)

> `Host`는 HTTP/1.1에서 요청 대상의 authority 값을 전달해 같은 IP·포트에서 여러 가상 호스트를 구분하는 데 사용될 수 있다.

문제: 질문은프로토콜request-target과Host의역할차이를묻는데model은targetURI와request-target을'요청대상의authority'로섞는다. 가장흔한origin-form request-target은path/query만이며Host는원래targetURI의host/port이다. authority-form은CONNECT의다른형식이다. 논리서비스대actualIP설명은맞지만필드구문경계가불명확하다.

최소 보강: origin-form의GET /path?query와Host:example.com을한예시로구별하고Host가targetURIauthority에서온다고설명한다. absolute/authority/asterisk-form을조건으로짧게언급하고request-target항상authority를포함한다는오해를막는다.

후속: #202

## W3-NET-017 — P2

대상: `network-http.core.http-message.response-message.q1`, `network-http.core.http-message.content-negotiation.q1`

원문: [content/network-http/http-message/questions.json:5](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L5)

> 클라이언트 프로세스의 스택 정보와 서버의 TLS 개인 키

원문: [content/network-http/http-message/questions.json:23](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L23)

> 데이터베이스 트랜잭션 격리 수준

문제: response.q1은A stack/privatekey,B DBcommit전체rows,D SYNonly가모두응답구성에대한현실적인오해와멀다. negotiation.q1도B TCPwindows/C DNSroles/D DBisolation뿐이어서negotiation을모르고계층키워드만으로정답을고를수있다. 정답·rationale오류는없지만이해검증력이낮다.

최소 보강: response문항은status200이면nonempty/202최종완료/필드가본문형식자동검증등실제오해로,negotiation문항은Content-Typerequest선언대Acceptresponse선택/variant면URI필수변경/qvalue단독강제등의혼동으로오답을교체한다. EASY난이도와정답학습목표는유지한다.

후속: #202

## W3-NET-018 — P1

대상: `network-http.core.http-message.content-negotiation.q3`

원문: [content/network-http/http-message/questions.json:25](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L25)

> `Accept-Language`가 다른 두 클라이언트가 같은 캐시 응답을 받는다. 원인과 수정 방향을 설명하라.

문제: 두Accept-Language가다르다는사실만으로원본이서로다른표현을선택한다거나동일cache응답이오류임을도출할수없다. 서버가한언어만지원하거나두요청이같은fallback을선택하면정상일수있다. model/explanation은Vary/cachekey누락을확정해복수가능한답을제거한다. representation.q3와같은Vary목표가반복되는데후자의prompt는이미다른client용표현이라는실제오류를명시한다.

최소 보강: 원본은ko/en두언어표현을제공하고각직접요청에서서로다른본문을확인했으며cache경유때다른언어가반환됐다는조건을추가한다. Vary값/두요청·cachehittrace로실행추론을묻게해representation.q3의단순개념반복도줄인다.

후속: #202

## W3-NET-019 — P2

대상: `network-http.core.http-message.accept.q2`

원문: [content/network-http/http-message/questions.json:21](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L21)

> 콘텐츠 협상은 클라이언트의 선호를 무조건 따르는 것이 아니라 ‘클라이언트가 허용하는 것’과 ‘서버가 제공할 수 있는 것’의 교집합에서 응답을 선택하는 과정이다.

문제: 교집합에서선택한다는교육모델은해당협상입력을존중하는경로에유용하지만교집합이없을때의프로토콜허용과API정책을구별하지않는다. RFC9110 §12.4.1은406을보내거나해당협상필드를무시한응답을보내는두경로를허용한다. 현재본문의'Accept는강제명령이아님'과맞춰질필요가있다.

최소 보강: 협상입력을존중하는경로라는조건을붙이고,만족표현없으면RFC상406또는field무시가허용되지만JSON-onlyAPI등의명시계약은더엄격할수있다는한문장을추가한다. 정상q/specificity설명은유지한다.

후속: #202

## W3-NET-020 — P1

대상: `network-http.core.http-message.content-length-transfer`, `network-http.core.http-message.content-length-transfer.q2`

원문: [content/network-http/http-message/content-length-transfer.md:66](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/content-length-transfer.md#L66)

> 수신 메시지에 둘이 모두 존재하면 `Transfer-Encoding`이 메시지 길이 결정에서 우선하지만, 이런 조합 자체가 요청 스머글링(request smuggling) 같은 공격을 나타낼 수 있어 오류로 취급할 이유가 크다.

원문: [content/network-http/http-message/questions.json:27](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-message/questions.json#L27)

> HTTP/1.1에서 `Content-Length`와 `Transfer-Encoding`의 역할과 둘이 함께 나타난 메시지를 어떻게 다뤄야 하는지 설명하라.

문제: CL+TEsender금지/TE우선/desync설명은맞다. 하지만이입력을실제로어떻게처리하는지에관한핵심connection상태가빠져있다. RFC9112 §6.1은server가reject또는TE만으로처리할수있지만응답뒤MUSTclose를요구하고§6.3은forward를택한중개자가receivedCL을반드시제거하도록한다. '엄격오류처리·정규화'만으로는각홉에무엇을남기고연결을언제버리는지학습자가추적하기어렵다.

최소 보강: reject/TE처리의허용정책과응답뒤close필수,forward시CL제거/TE처리필수를짧은분기표로추가한다. q2model에도동일핵심조건을반영하며전체framing본문재작성은하지않는다.

후속: #202

## W3-NET-021 — P0

대상: `network-http.core.http-methods.patch.q3`

원문: [content/network-http/http-methods/questions.json:19](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-methods/questions.json#L19)

> 하나의 장치로 둘을 모두 해결하려 해서는 안 된다.

문제: 해설은중복적용은operationID,동시수정은conditionalrequest로엄격히분리하고한장치가양쪽을막는해법을배제한다. RFC5789 §2는PATCH를조건부strongETag/If-Match로idempotent하게발행할수있다고설명한다. counter변경이ETag v7→v8을만들고비교/변경을원자적으로수행하면,같은If-Match:v7retry는다시증가하지않고전제조건이실패하며제3자변경도검출한다. 다만412만으로최초요청성공대제3자수정을확정할수는없다.

최소 보강: operationID는논리작업의결과재사용/중복식별,If-Match는base일치및조건에따라동일변경재적용차단에도쓰인다고설명한다. v7→v8→samev7retry실패의짧은상태예시와412후결과조회필요성을추가해두장치의겹침과한계를명시한다.

후속: #202

## W3-NET-029 — P2

대상: `network-http.core.http-state-intermediary.cookie`, `network-http.core.http-state-intermediary.set-cookie`, `network-http.core.http-state-intermediary.cookie-scope`

원문: [content/network-http/http-state-intermediary/cookie.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-state-intermediary/cookie.md#L12)

> https://www.rfc-editor.org/rfc/rfc10025.html

원문: [content/network-http/http-state-intermediary/set-cookie.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-state-intermediary/set-cookie.md#L12)

> https://www.rfc-editor.org/rfc/rfc10025.html

원문: [content/network-http/http-state-intermediary/cookie-scope.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-state-intermediary/cookie-scope.md#L12)

> https://www.rfc-editor.org/rfc/rfc10025.html

문제: 세 Concept의 유일 Reference는 정식RFC10025 URL인데 도구 접근은 실패하고 공식 datatracker의 rfc6265bis 상태는 In Final Review다. 공식 교정본 관련 의미는 확인했으나 학습자가 정식 출처를 실제 읽을 수 있는지와 최종 공표 상태는 확인하지 못했다. 존재하지 않는 RFC라고 단정하지 않는다.

최소 보강: #202에서 공표/정식URL을 먼저 재확인하고 아직finalreview면 공식 revision22/교정본을 임시 근거로 명확히 한정한다. 최종 공표 후 관련 저장/전송/속성절을 지정하고 세 관계를 한 번에 갱신한다. canonical본문의 정확한 cookie설명은 유지한다.

후속: #202

## W3-NET-022 — P2

대상: `network-http.core.http-versions.http11-persistent`

원문: [content/network-http/http-versions/http11-persistent.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-versions/http11-persistent.md#L22)

> HTTP/1.1은 하나의 TCP 연결에서 여러 요청·응답 교환을 처리하는 지속 연결을 기본으로 사용한다.

문제: Curriculum 목표는 지속 연결과 Host 요구를 함께 설명하지만 실제 본문·연결 문항에 Host가 없다. 재사용 설명은 정확하며 기술 오답으로 분류하지 않는다.

최소 보강: RFC9112 §3.2를 연결해 HTTP/1.1 모든 요청의 Host, target authority와 값, 누락/중복/invalid 400을 한 짧은 요청 예시로 보강한다. 기존 host-authority Concept으로 연결한다.

후속: #202

## W3-NET-023 — P2

대상: `network-http.core.http-versions.http2-stream.q3`

원문: [content/network-http/http-versions/questions.json:16](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-versions/questions.json#L16)

> 불법적인 새 스트림 ID를 받으면 상대 끝점은 연결 수준 PROTOCOL_ERROR로 처리할 수 있다.

문제: 새 unexpected stream ID 위반의 오류 범위는 맞지만 RFC9113 §5.1.1의 MUST를 선택적 처리처럼 약화한다. 이미 닫힌 stream의 허용된 WINDOW_UPDATE/RST 등의 후속 frame 상황과 새 stream 재개설도 구분해야 한다.

최소 보강: 새 stream을 위반한 ID로 열려는 상황에 한정하여 connection PROTOCOL_ERROR로 처리해야 한다고 명시한다. 닫힌 stream의 race 처리 전체를 같은 오류로 단정하지 않는다.

후속: #202

## W3-NET-024 — P2

대상: `network-http.core.http-versions.header-compression`

원문: [content/network-http/http-versions/header-compression.md:34](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-versions/header-compression.md#L34)

> HTTP/3의 QPACK은 QUIC의 독립 스트림 환경에서 헤더를 해독하기 위해 모든 요청 스트림이 불필요하게 막히지 않도록 HPACK과 다른 동기화 구조를 사용한다.

문제: 본문과 q2/q3는 QPACK 동기화·별도 streams·never-index까지 학습시키지만 Reference는 HPACK RFC7541만 있다. 현재 설명은 RFC9204와 대조해 정확하므로 근거 범위 부족으로 한정한다.

최소 보강: RFC9204 §2.1.2/4.2/4.5의 필요한 절과 recommendation을 추가한다. 필요하면 미도착 insert count로 blocked된 요청이 갱신 후 풀리는 작은 trace를 덧붙인다.

후속: #202

## W3-NET-025 — P0

대상: `network-http.core.http-versions.quic.q1`

원문: [content/network-http/http-versions/questions.json:23](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/http-versions/questions.json#L23)

> QUIC은 UDP가 제공하지 않는 연결 상태·신뢰성·혼잡 제어·스트림 멀티플렉싱을 사용자 공간 프로토콜에서 구현하고 TLS 1.3을 결합한다.

문제: QUIC의 기능과 정답은 맞지만 사용자 공간 실행을 일반 프로토콜 특성으로 고정한다. RFC9000은 실행 위치를 정하지 않고 Microsoft MsQuic은 실제 Windows kernel driver를 제공한다.

최소 보강: UDP 위 QUIC 구현이 해당 상태를 제공한다고 바꾸고, 사용자 공간 구현은 흔한 배치 방식의 예시라고 한정한다. MsQuic.sys DriverEntry와 공식 RFC를 반례 근거로 연결한다.

후속: #202

## W3-NET-003 — P0

대상: `network-http.core.ip-routing.ipv4-address`

원문: [content/network-http/ip-routing/ipv4-address.md:38](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/ip-routing/ipv4-address.md#L38)

> 특정 인터페이스로 들어온 연결만 받을 수 있다.

문제: LocalIP에bind하는주소선택을수신interface제한으로연결한다. Linux는IP주소를host전체의주소로취급하고다른interface로도해당local목적지packet을받을수있다. Socket의device제한은별도SO_BINDTODEVICE·routing/filter정책이다. q3는private대public목적지주소불일치이므로이문제와구별해유지한다.

최소 보강: Localaddrbind는목적지주소를제한하고ingressinterface제한은별도OS정책/옵션임을구분한다. Linux일반모델과devicebinding의최소반례한문장을추가하며광범위네트워크코드를구현하지않는다.

후속: #202

## W3-NET-004 — P2

대상: `network-http.core.ip-routing.prefix-subnet`

원문: [content/network-http/ip-routing/prefix-subnet.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/ip-routing/prefix-subnet.md#L12)

> https://www.rfc-editor.org/rfc/rfc791

문제: 유일Reference는IPv4classA/B/C구조의RFC791이다. 실제본문CIDRprefix길이·비classful포함관계·LPM학습목표를따라읽는직접자료가아니다. 본문과계산은RFC4632/RFC1812관련절과일치한다.

최소 보강: RFC4632prefix표기/주소범위·classlessforwarding절또는RFC1812CIDR절을최소추가하고RFC791은IPv4header역사자료로한정한다. Concept/Question본문을일괄재작성하지않는다.

후속: #202

## W3-NET-005 — P2

대상: `network-http.core.ip-routing.ttl-hop-limit`

원문: [content/network-http/ip-routing/ttl-hop-limit.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/ip-routing/ttl-hop-limit.md#L12)

> https://www.rfc-editor.org/rfc/rfc791

문제: 비교목표에IPv6HopLimit이포함되지만유일Reference는IPv4RFC791이라HopLimit의exactdecrement/drop/destination처리를확인할수없다. 실제Concept·Question수명trace는RFC1812TTL/RFC8200HopLimit과일치해본문정확성문제가아니다.

최소 보강: RFC8200§3HopLimit과필요시RFC1812§5.3.1TTL절을직접지정하는최소Reference추가를권한다. 기존감소trace/문항은유지한다.

후속: #202

## W3-NET-001 — P2

대상: `network-http.core.local-delivery.switch-forwarding`, `network-http.core.local-delivery.broadcast-domain`

원문: [content/network-http/local-delivery/switch-forwarding.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/local-delivery/switch-forwarding.md#L12)

> https://www.rfc-editor.org/rfc/rfc826

원문: [content/network-http/local-delivery/broadcast-domain.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/local-delivery/broadcast-domain.md#L12)

> https://www.rfc-editor.org/rfc/rfc826

문제: 두Concept의유일Reference/recommendation은ARPIPv4→Ethernet주소해석이다. RFC826PacketGeneration/Reception은neighbortranslation을설명하고switch의sourceMAC→portFDB/aging/VLAN전달영역을직접가르치지않는다. 실제본문·문항동작은Cisco공식MATM절과일치하여재작성불필요하지만현재Reference만따르면핵심목표의후속학습이빗나간다.

최소 보강: Switch에는공식bridge/MATM의sourcelearn·destinationlookup·aging절, broadcastdomain에는VLAN/domain전달범위절을최소추가한다. ARP사례Reference는보조로유지가능하며기존본문/문항은유지한다.

후속: #202

## W3-NET-002 — P2

대상: `network-http.core.local-delivery.broadcast-domain.q1`

원문: [content/network-http/local-delivery/questions.json:8](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/local-delivery/questions.json#L8)

> DNS 질의가 캐시 없이 권한 서버에 도달하는 범위

문제: A의TCPapp상태와C의DNS위임/cache는L2broadcast범위와거리가먼distractor이다. D정답/Bscope오해와rationale는맞지만VLAN/domain/subnet학습목표이해없이두보기를제거할수있다.

최소 보강: A/C중필요한최소보기를samephysicalswitch=domain또는IPprefix=항상domain이라는실제오해로보강하고각rationale에VLAN/bridge경계를설명한다. q2/q3목표는유지한다.

후속: #202

## W3-NET-006 — P2

대상: `network-http.core.port-nat.connection-tuple.q3`

원문: [content/network-http/port-nat/questions.json:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/port-nat/questions.json#L10)

> 출발지 포트와 목적지 IP·포트가 다른 4-튜플

문제: Prompt는두client가동일externalserver의TCP443에연결하고publicsrcIP만같은scenario다. Model은출발지port뿐아니라목적지IP/port도다르게읽히는문장으로고정/변동성분을혼동시킨다. 중심정답인srcport차이에의한distincttuple/PAT역변환은맞다.

최소 보강: 목적지IP/443와publicsrcIP는같고변환srcport만달라4tuple이구분된다고문장을좁힌다. 두실제tuple을나란히제시하는최소해설보강만권한다.

후속: #202

## W3-NET-007 — P2

대상: `network-http.core.port-nat.inbound-reachability.q1`

원문: [content/network-http/port-nat/questions.json:20](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/port-nat/questions.json#L20)

> NAT가 모든 목적지 포트를 항상 0으로 바꾸기 때문이다

문제: D는어떤일반NAT오해인지근거가없고해설도그런일반규칙없음에그친다. 기존매핑없는inbound목적지선정이라는학습목표를이해하지않아도제거할수있는weakdistractor다. B정답/A/Crationale의오류는아니다.

최소 보강: NAT매핑이있으면모든remoteinbound도자동허용된다는오해또는staticDNAT와dynamicoutbound혼동을담도록D와rationale만보강한다.

후속: #202

## W3-NET-008 — P2

대상: `network-http.core.port-nat.nat-mapping.q3`

원문: [content/network-http/port-nat/questions.json:19](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/port-nat/questions.json#L19)

> 기존 연결을 서서히 종료하는 드레이닝(draining)·점진 전환·재시도 폭주 완화책을 준비할 수 있다.

문제: Active장비가이미장애로죽고대기장비에state가없는unplannedfailover가prompt전제인데model은draining/점진전환을재연결허용선택과섞어그적용시점을설명하지않는다. 이미사라진flowstate를기존장비에서drain할수없다. State복제비용대reconnect선택이라는중심답은맞다.

최소 보강: Draining/점진전환은기존장비가살아있는plannedtransition용이라고한정하고unplannedstate-loss뒤에는새연결·boundedretry/backoff로폭주를완화함을구분한다. 실제HA기능구현은후속감사범위밖이다.

후속: #202

## W3-NET-013 — P2

대상: `network-http.core.request-journey.dns-to-route.q3`

원문: [content/network-http/request-journey/questions.json:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/request-journey/questions.json#L10)

> 이름 해석은 끝났지만 선택한 IP 주소로 패킷을 내보낼 네트워크 경로가 없는 문제다.

문제: model첫문장과explanation은No route to host만으로경로없음/경로선택단계실패를확정한다. Linuxip(7) ERRORS는EHOSTUNREACH가remoteICMP에서도발생한다고명시한다. DNS이후네트워크도달실패는맞지만어느홉/route선택이실패했는지는문자열만으로확정되지않는다. 뒤의route/VPN/ACL검사목록은보존할가치가있다.

최소 보강: 첫문장을DNS이후도달실패후보라는조건부표현으로바꾸고route lookup결과와송신패킷/ICMP기원을대조해local대remotefailure를좁히도록추가한다. DNS성공≠reachability의학습목표는유지한다.

후속: #202

## W3-NET-014 — P2

대상: `network-http.core.request-journey.dns-to-route`, `network-http.core.request-journey.transport-establishment`, `network-http.core.request-journey.tls-before-http`

원문: [content/network-http/request-journey/tls-before-http.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/request-journey/tls-before-http.md#L12)

> https://www.rfc-editor.org/rfc/rfc8446

원문: [content/network-http/request-journey/dns-to-route.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/request-journey/dns-to-route.md#L12)

> https://www.rfc-editor.org/rfc/rfc1034

원문: [content/network-http/request-journey/transport-establishment.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/request-journey/transport-establishment.md#L12)

> https://www.rfc-editor.org/rfc/rfc9293

문제: 세본문의핵심기술설명은충분하고정확하나개별Reference는일부핵심단계를확인하기어렵다. DNS→routing은1034만, TCP대QUIC은9293만, TLS대QUIC통합은8446만이다. 8446은현행9846으로대체되었고9001의CRYPTO/packet보호차이는8446만으로학습할수없다. 각각actualrelatedprimary로확인했으나학습자경로에는그안내가없다.

최소 보강: dns-to-route에1122 §3.3.1(필요시826/4861), transport에9000 §2와9001 §4, tls-before-http에현행9846 및9001 §4를관련절로안내한다. TLS Topic W3-NET-012와동일후속Issue에서Reference갱신을묶고정확한본문·도식은유지한다.

후속: #202

## W3-NET-011 — P1

대상: `network-http.core.tls.pki.q3`

원문: [content/network-http/tls/questions.json:10](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/tls/questions.json#L10)

> 사설 CA가 발급한 내부 HTTPS 인증서를 클라이언트의 신뢰 저장소에 배포하지 않았을 때 연결이 실패하는 이유와 올바른 해결 방법을 설명하라.

문제: Prompt는 사설 CA가 발급한 서버 인증서를 trust store에 넣지 않아 연결이 실패한다고 전제한다. 그러나 issuer CA의 trust anchor를 이미 신뢰하고 서버가 필요한 chain을 보내면 leaf별 trust store 배포 없이 검증된다. modelAnswer의 '신뢰 기준점에 도달하지 못함'은 사설 CA 기준점 미배포라는 다른 전제가 필요하다. RFC5280 §6.1/6.1.1과 본문도 anchor와 target leaf를 구분한다.

최소 보강: Prompt를 사설 CA의 신뢰 기준점이 client trust store에 없고 다른 유효 경로도 없는 상황으로 명확히 한다. model의 관리되는 CA 공개 인증서 배포와 hostnamecheck 유지, trust-all 금지는 그대로 보존한다.

후속: #202

## W3-NET-012 — P2

대상: `network-http.core.tls.tls-purpose`, `network-http.core.tls.certificate`, `network-http.core.tls.pki`, `network-http.core.tls.tls-handshake`, `network-http.core.tls.key-agreement`, `network-http.core.tls.symmetric-session-key`, `network-http.core.tls.tls-termination`

원문: [content/network-http/tls/tls-handshake.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/tls/tls-handshake.md#L12)

> https://www.rfc-editor.org/rfc/rfc8446

문제: 직접 읽은 7개 본문이 모두 RFC8446만을 TLS 기본 Reference로 제시한다. 공식 Datatracker에서 2026년7월 RFC9846이8446을대체했으며 §1.2는KeyShare재사용금지·KeyUpdate요구강화·KEM포괄표현등 실제 계약 갱신을 명시한다. 현재 교육용 기본 흐름이 전부 틀린 것은 아니지만 현행 규격 학습 경로와 역사적 설명 범위를 구분할 필요가 있다.

최소 보강: 7개 Concept의 정확한 기본 설명을 유지하고 RFC9846을 현행 기본 Reference로 추가하거나 교체하며 필요한 관련 절을 안내한다. 8446을 남기면 역사적 TLS13 근거임을 표시한다. PKI는5280 §6.1, termination은7239 §8.1 직접안내를 함께 최소보강한다. 최신RFC전체나KEM심화구현까지재작성하지않는다.

후속: #202

## W3-NET-010 — P2

대상: `network-http.core.udp.checksum`

원문: [content/network-http/udp/checksum.md:46](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/network-http/udp/checksum.md#L46)

> IPv4 UDP에는 체크섬을 사용하지 않는 표현이 허용돼 왔지만, IPv6 UDP에서는 일반적인 통신에서 체크섬 사용이 요구된다.

문제: 본문의 IPv4/IPv6 구분은 정확하지만 유일 Reference인 RFC768은 IPv6 계약을 설명하지 않는다. 학습자가 링크만 따라가면 일반 필수와 특수 tunnel 예외를 확인할 수 없다.

최소 보강: 현재 본문과 RFC768은 유지하고 RFC8200 §8.1 또는 RFC8085 §3.4를 추가해 IPv6 일반 필수/제한된 tunnel 예외를 해당 절로 안내한다. 새로운 이미지나 기술 본문 재작성은 필요 없다.

후속: #202

## W3-OS-014 — P2

대상: `operating-systems.core.deadlock.deadlock`

원문: [content/operating-systems/deadlock/deadlock.md:36](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/deadlock/deadlock.md#L36)

> 교착 상태는 둘 이상의 실행 흐름이

문제: 두 실행 흐름 이상을 일반 정의의 필수 조건으로 두면 단일 thread가 자신이 가진 비재귀 mutex를 다시 기다리는 self-deadlock을 제외한다. POSIX NORMAL relock은 실제 deadlock이며 kernel lockdep도 recursion deadlock을 구분한다. 두 thread 예제 자체는 정확하다.

최소 보강: 대표적 상호 교착 모델이라고 범위를 붙이거나 일반 정의에서 둘 이상 제한을 제거하고 NORMAL mutex self-deadlock 한 문장을 추가한다. Java monitor 재진입과 구별한다.

후속: #201

## W3-OS-015 — P1

대상: `operating-systems.core.deadlock.resource-allocation-graph.q4`

원문: [content/operating-systems/deadlock/questions.json:228](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/deadlock/questions.json#L228)

> 예를 들어 T1이 R을 기다리고 T2가 A를 기다리며 A의 소유자가 T1이면

문제: 관측은 T1이 JVM monitor A를 기다린다는 조건인데 모범 예시는 T1을 A의 소유자로 바꾸고 A의 waiter를 T2로 바꾼다. 같은 monitor를 보유한 thread의 재획득은 JLS17.1에서 가능하므로 이 예시는 원래 관측을 보존한 상호 교착 그래프가 아니다.

최소 보강: 원래 관측 T1→A와 R→T2를 보존하는 추가 관계를 설계한다. 예: A owner=T2, T1 owns another resource S, T2 waits S라면 T1→A→T2→S→T1을 닫고 R은 T2의 추가 보유 관측으로 둔다. 또는 문제의 T1 waits A를 T2 waits A로 수정하여 기존 모범 예시와 정확히 맞춘다.

후속: #201

## W3-OS-016 — P2

대상: `operating-systems.core.deadlock.deadlock-avoidance`, `operating-systems.core.deadlock.deadlock-detection-recovery`

원문: [content/operating-systems/deadlock/deadlock-avoidance.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/deadlock/deadlock-avoidance.md#L12)

> https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html

원문: [content/operating-systems/deadlock/deadlock-detection-recovery.md:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/deadlock/deadlock-detection-recovery.md#L12)

> https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/7_Deadlocks.html

문제: 연결 강의의 7.5 첫 문장은 avoidance를 필요 조건 제거로 설명하여 prevention과 혼동한다. 7.5.3.1은 Need<Work라 적어 equality의 완료를 잘못 막고, 7.6.2는 safety의 Steps2/3를 unchanged라 하여 현재 Request 대신 미래 Need로 탐지하게 만든다. Canonical 본문과 수치·문항의 Need≤Work/현재 Request 설명은 정확하다.

최소 보강: 관련 Reference에 오류 절과 정확한 조건을 명시하거나 검증한 Cornell lecture10의 safety p9와 detection p18 등으로 교체한다. RAG/회복의 타당한 절은 유지할 수 있으며 canonical 설명을 잘못된 Reference에 맞춰 변경하지 않는다.

후속: #201

## W3-OS-020 — P1

대상: `operating-systems.core.filesystem.open-file-table.q2`

원문: [content/operating-systems/filesystem/questions.json:174](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/filesystem/questions.json#L174)

> `fd2 = dup(fd1)` 뒤 `fd1`로 100바이트를 순차적으로 읽었다.

문제: 초기 offset0이 명시되지 않았다. Dup는 현재 offset을 공유할 뿐 초기화하지 않으므로 시작offset500이면 실제100바이트read후600이다. Explanation의 offset100과 accepted100만으로 일반 조건의 답을 확정할 수 없다. 또한 한국어 오프셋 100 표기도 허용되지 않는다.

최소 보강: 일반 seekable file·초기offset0·정확히100바이트read완료·다른offset변경없음을 문항에 명시하고 오프셋 100 등 본문 언어 표기를 accepted에 추가한다. 공유offset이라는 원리는 유지한다.

후속: #201

## W3-OS-021 — P0

대상: `operating-systems.core.filesystem.inode.q4`, `operating-systems.core.filesystem.filesystem-block.q2`

원문: [content/operating-systems/filesystem/questions.json:356](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/filesystem/questions.json#L356)

> hard link와 rename

원문: [content/operating-systems/filesystem/questions.json:415](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/filesystem/questions.json#L415)

> 2번 block의 808 byte

원문: [backend/src/main/java/com/guseoh/csforge/quiz/application/grading/ShortAnswerGradingStrategy.java:32](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/backend/src/main/java/com/guseoh/csforge/quiz/application/grading/ShortAnswerGradingStrategy.java#L32)

> anyMatch(submitted::equals)

문제: inode.q4는 한국어 하드 링크와 rename을 accepted에 두지 않고 English/hybrid만 허용한다. Block.q2도 블록 2, 오프셋 808 같은 질문/해설의 한국어 명칭으로 쓴 정확한 답을 거절한다. 영어 또는 특정 표기 요구가 없으며 grader는 trim/lowercase 뒤 literal equality만 비교한다.

최소 보강: 각 문항에 canonical 한국어 명칭의 대표 표기를 추가하거나 요구 답안 형식을 정확히 명시한다. 값 hard link/rename과2/808 및 올바른 해설은 유지한다. 이번 감사에서 채점 기능은 변경하지 않는다.

후속: #201

## W3-OS-022 — P2

대상: `operating-systems.core.filesystem.filesystem-block`

원문: [content/operating-systems/filesystem/filesystem-block.md:24](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/filesystem/filesystem-block.md#L24)

> 세 번째 논리 블록의 808번째 바이트

문제: 0-based block2/offset808 계산은 정확하지만 자연어 808번째 byte는 해당 block의offset807로 읽힌다. Offset808은809번째 byte이다. 아래 식과 문항의 명시0-based 계산은 맞다.

최소 보강: 서수를 809번째로 바꾸거나 블록 내부 오프셋 808바이트 지점으로 표현해 기준을 일치시킨다. 계산과 Question의 수치를 변경하지 않는다.

후속: #201

## W3-OS-023 — P2

대상: `operating-systems.core.filesystem.write-flush-fsync.q2`

원문: [content/operating-systems/filesystem/questions.json:670](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/filesystem/questions.json#L670)

> write → library flush → fsync

문제: Prompt의 arrow는 write→libraryflush라는 실행순서를 암시하지만 model은 write()를 kernel에 전달하는 syscall로 정의한다. BufferedWriter.write의 사용자buffer기록과syscallwrite는별도이며libraryflush가오히려syscallwrite를유발할수있다. 각 반환경계 설명은 정확하다.

최소 보강: Arrow를 없애 세API의 경계 비교로 묻거나 Writer.write→Writer.flush(아래 syscallwrite 수행)→fsync로 계층을 명시한다. Direct syscallwrite 경로에는 libraryflush가 필수가 아니라는 점을 구분한다.

후속: #201

## W3-OS-024 — P2

대상: `operating-systems.core.filesystem.allocation`

원문: [frontend/public/learning/operating-systems/block-allocation-tradeoff.svg:1](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/operating-systems/block-allocation-tradeoff.svg#L1)

> M270 358 L390 330

문제: Indexed 행에는 index 상자와3개선만 있고 끝점에 destination block이나 entry/논리번호가 없어 실제 index lookup/mapping을 따라갈 수 없다. Contiguous/linked 행과 본문의 trade-off는 타당하므로 새 이미지나 전체 본문 재작성은 필요 없다.

최소 보강: 후속 보강에서 기존 indexed 행에 entry[0..2]와각 물리block(B7/B9/B20 등)을 표시해 논리block번호→indexentry→destination을 직접 추적하게 한다. 기존 도식의 비교와 자산은 유지한다.

후속: #201

## W3-OS-025 — P0

대상: `operating-systems.core.io.non-blocking-io`

원문: [content/operating-systems/io/non-blocking-io.md:29](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/io/non-blocking-io.md#L29)

> Linux의 논블로킹 파일 디스크립터에서

문제: Linux fd 전체에 O_NONBLOCK의즉시반환/EAGAIN모델을적용한다. 실제open문서는regularfile과blockdevice에서이flag가효과없고deviceactivity가필요하면여전히block한다고명시한다. Socket/pipe의유효한모델을모든객체보장으로확대하면file I/O를eventloop에넣는실패를놓친다.

최소 보강: Linux의논블로킹socket/pipe 등지원객체로범위를한정하고regularfile/blockdevice예외와비동기완료API별도선택을한문단명시한다. Partial/parser/readiness의정확한설명은유지한다.

후속: #201

## W3-OS-026 — P0

대상: `operating-systems.core.io.non-blocking-io.q1`, `operating-systems.core.io.readiness-vs-completion.q2`

원문: [content/operating-systems/io/questions.json:8](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/io/questions.json#L8)

> Linux 논블로킹 소켓에서 지금 읽을 데이터가 없다면

원문: [content/operating-systems/io/questions.json:12](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/io/questions.json#L12)

> 준비 상태는 현재 일부 바이트를 읽을 수 있다는 뜻일 뿐

문제: q1의데이터없음은would-block과동일하지않다. Stream peer가송신을종료하고buffer가소진되면EOF0도정상이고positivecount/stream/error전제도없다. Accepted는EAGAIN/EWOULDBLOCK만허용한다. Readiness q2 model도일부bytes가존재한다고만정의하지만select/poll은EOF/error의즉시결과도ready로통지한다. HTTP전체완료아니라는결론은맞다.

최소 보강: q1에양수count의streamsocket·peer송신열림·EOF/pendingerror없음·정상상태에서would-block을명시한다. q2는ready뒤bytes/EOF/error및경쟁후EAGAIN을검사한다는본문계약에맞춰한문장보강한다.

후속: #201

## W3-OS-027 — P1

대상: `operating-systems.core.io.sendfile-zero-copy`

원문: [content/operating-systems/io/sendfile-zero-copy.md:24](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/io/sendfile-zero-copy.md#L24)

> 애플리케이션의 사용자 공간 버퍼를 거치는 데이터 복사를 줄일 수 있는 인터페이스

문제: 복사감소·partial/backpressure는정확하지만zero-copy socket/pipe출력경로에서source file의전송부분을peer가소비할때까지변경하면안되는실제sendfile NOTES수명조건이빠져있다. Sendfile의양수반환직후원본을제자리덮어쓰면참조중인데이터의무결성을깨뜨릴수있다.

최소 보강: 출력이source page를참조할수있음을설명하고peer소비전전송부분불변·source수명을명시한다. 완성파일을제자리수정하지않고새inode파일로게시하는전략등최소실패예제를추가하는범위만#201에권한다. 새로운문항구현은이번감사에서하지않는다.

후속: #201

## W3-OS-028 — P0

대상: `operating-systems.core.ipc.pipe.q2`

원문: [content/operating-systems/ipc/questions.json:3](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/ipc/questions.json#L3)

> 해당 파이프의 모든 쓰기 끝 참조가 닫혀 더 이상 데이터를 쓸 주체가 없다고 커널이 판단할 때 읽는 쪽이 EOF를 관찰한다.

문제: EOF 관찰 조건을 writer 닫기로만 설명한다. Buffer100바이트가 남은 뒤 마지막 writer를 닫으면 다음 read는 먼저 데이터를 반환한다. POSIX read(3p)는 empty pipe에서 열린 writer가 없을 때0을 반환한다. 연결 그림은 이미 buffer drained 조건을 정확히 표시하므로 그림과 Concept 유지 판단은 존중한다.

최소 보강: Model과 explanation에 모든 쓰기 참조 닫기 AND buffered data 모두 소비를 추가하고, 잔여100 read 뒤 다음 양수길이 read0의 최소 추론 예시를 #201 범위에 포함한다.

후속: #201

## W3-OS-029 — P0

대상: `operating-systems.core.ipc.signal`

원문: [content/operating-systems/ipc/signal.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/ipc/signal.md#L22)

> 작은 비동기 사건을 알리는 제어 메커니즘

문제: Signal 정의·결론이 비동기 사건으로 한정된다. signal(7)는 특정 명령이 발생시킨 SIGSEGV/SIGFPE 같은 hardware exception도 thread-directed signal로 정의한다. Handler가 비동기 실행될 수 있다는 별도 설명은 정확하다.

최소 보강: 정의에 비동기 제어 알림뿐 아니라 동기 예외 발생도 있음을 한 문장으로 구분하고 생성/전달/동기 대기 용어를 정리한다. Handler 안전성·standard signal 문항은 유지한다.

후속: #201

## W3-OS-030 — P0

대상: `operating-systems.core.ipc.network-socket-ipc`

원문: [content/operating-systems/ipc/network-socket-ipc.md:32](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/ipc/network-socket-ipc.md#L32)

> 연결 재설정(connection reset), 타임아웃, 패킷 손실, 경로 장애처럼 한 호스트 내부 IPC에는 없던 실패가 생긴다.

문제: Reset과 timeout까지 local IPC에 없던 실패로 묶는다. unix(7)도 ECONNRESET을 정의하며 socket(7)의 I/O timeout은 local socket에도 적용된다. 호스트 간 경로/remote failure의 추가 경계라는 중심 설명은 정확하다.

최소 보강: Reset/timeout은 local에서도 발생하는 공통 실패, 원격 host·routing·network partition은 추가 원인/경계로 분리한다. 재시도·결과 불확실성 문항은 유지한다.

후속: #201

## W3-OS-031 — P2

대상: `operating-systems.core.ipc.ipc-tradeoff.q1`

원문: [content/operating-systems/ipc/questions.json:20](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/ipc/questions.json#L20)

> payload와 무관한 변수명 길이만 비교한다

문제: A는 IPC 학습 목표와 관계없는 변수명 길이라 사전 지식 없이 제거할 수 있다. B 정답 및 나머지 rationale의 오류가 아니라 이해도 검증을 약하게 하는 distractor 품질 문제이다.

최소 보강: Copy 비용이 적다는 이유만으로 shared memory를 항상 선택한다는 실제 오해 등으로 A와 해당 rationale만 보강한다. 다른 문항 목표를 일괄 변경하지 않는다.

후속: #201

## W3-OS-032 — P2

대상: `operating-systems.core.ipc.ipc-tradeoff`

원문: [frontend/public/learning/operating-systems/ipc-tradeoff.svg:1](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/frontend/public/learning/operating-systems/ipc-tradeoff.svg#L1)

> more direct shared state

원문: [content/operating-systems/ipc/ipc-tradeoff.md:31](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/ipc/ipc-tradeoff.md#L31)

> ![IPC 방식별 복사, 격리, 동기화 책임 비교](/learning/operating-systems/ipc-tradeoff.svg)

문제: 카드는 왼쪽부터 Pipe/Queue, Shared Memory, Unix Socket, Network Socket인데 하단 continuum 오른쪽에 more direct shared state가 Network Socket과 x715로 정렬된다. 공유 상태 정도의 순서로 읽으면 실제 shared memory 위치와 반대 의미를 암시한다. 본문 표와 개별 카드 내용은 정확하며 이 발견은 SVG 전체 소스/좌표 의미 검토에 한정된다.

최소 보강: 기존 카드/비교 기준을 유지하면서 근거 없는 continuum을 제거하거나 shared memory 쪽에 공유 상태 책임 라벨을 직접 연결한다. 후속 #201의 최소 SVG 의미 보강 후보이며 이번 감사에서는 자산을 수정하지 않는다.

후속: #201

## W3-OS-033 — P2

대상: `operating-systems.core.isolation.user-group-permission.q1`

원문: [content/operating-systems/isolation/questions.json:5](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/isolation/questions.json#L5)

> 파일 확장자·경로명 길이·생성 시각

문제: B파일속성/C애플리케이션역할/Dcache종류의세distractor모두permission주체학습목표와무관하다. A정답과rationale의사실오류가아니라Unixcredential/mode오해를검증하지못하는문항품질문제이다.

최소 보강: 실제owner선택뒤other로fallback한다는오해·realID대effectiveID·보조group미고려등대표오해를담도록distractor/rationale만정밀보강한다.

후속: #201

## W3-OS-034 — P0

대상: `operating-systems.core.isolation.user-group-permission`

원문: [content/operating-systems/isolation/user-group-permission.md:29](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/isolation/user-group-permission.md#L29)

> 실제 판정에는 프로세스의 유효 사용자·그룹 정보가 사용된다.

문제: 일반Unix설명뒤Linux공식References를제공하지만filesystem권한판정을eUID/eGID로단정한다. credentials(7)와path_resolution(7)는Linuxfsuid/fsgid를사용하고보통effectiveIDs와같지만별도로변경가능함을명시한다. 기본mode/table과leastprivilege는유효하다.

최소 보강: 일반Unix와Linux파일검사의범위를한문장으로구분하고fsuid/fsgid는보통eUID/eGID와같지만별도ID임을짧게보충한다. 새API사용을권장하거나본문전체를재작성하지않는다.

후속: #201

## W3-OS-035 — P1

대상: `operating-systems.core.isolation.container-process-model.q3`

원문: [content/operating-systems/isolation/questions.json:19](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/isolation/questions.json#L19)

> 주 프로세스 하나의 종료만으로 자식 생명주기까지 자동 정리된다고 가정하면 안 된다.

문제: Prompt는주프로세스가이미종료했다고하는데model은PID1의wait/forward를점검하라고한다. 그주프로세스가privatePIDnamespaceinit라면죽은PID1은정리할수없고kernel은남은namespaceprocess를SIGKILL한다(pid_namespaces(7)). Gracefulapplicationcleanup누락과살아있는childprocess누락·hostPID공유모드를구별해야한다.

최소 보강: 기본privatePIDnamespace를명시하고PID1이살아있는동안forward→childexit/reap→initexit의정상종료순서와init사망뒤kernelSIGKILL을대조한다. 또는살아있는init아래worker만종료했다는premise로좁힌다. 기존q2의reaping/forwarding분리는유지한다.

후속: #201

## W3-OS-001 — P0

대상: `operating-systems.core.process.process-state.q1`

원문: [content/operating-systems/process/questions.json:213](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/process/questions.json#L213)

> 실행할 조건은 충족됐지만 아직 CPU를 배정받지 못한 작업의 교과서적 상태는?

원문: [content/operating-systems/process/process-state.md:37](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/process/process-state.md#L37)

> 준비(ready) 상태의 프로세스는 실행할 조건은 갖췄지만 아직 CPU를 배정받지 못했다.

원문: [backend/src/main/java/com/guseoh/csforge/quiz/application/grading/ShortAnswerGradingStrategy.java:32](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/backend/src/main/java/com/guseoh/csforge/quiz/application/grading/ShortAnswerGradingStrategy.java#L32)

> .anyMatch(submitted::equals);

문제: 본문은 '준비(ready)'로 정의하지만 acceptedAnswers는 ready/runnable와 각각의 영어+상태 형태만 있다. 한국어 '준비'/'준비 상태'는 정답이다. 현재 ShortAnswerGradingStrategy는 trim/lowercase 뒤 정확 일치여서 두 한국어 답을 오답 처리한다.

최소 보강: 기존 q1 허용 답에 본문과 일치하는 '준비'와 '준비 상태'를 추가한다. 질문/해설/채점기 구현은 유지한다.

후속: #201

## W3-OS-002 — P0

대상: `operating-systems.core.process.wait-reap.q1`

원문: [content/operating-systems/process/questions.json:478](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/process/questions.json#L478)

> 부모가 종료된 자식 프로세스를 회수(reap)하는 대표적인 Linux 인터페이스는?

문제: Linux 공식 wait(2)는 wait/waitpid와 함께 waitid를 정의한다. waitid의 WEXITED와 WNOWAIT 없는 호출도 종료 자식을 회수한다. prompt는 API를 wait/waitpid로 제한하지 않지만 acceptedAnswers에는 waitid가 없어 정확한 API 답을 거부한다.

최소 보강: 기존 q1에 waitid/waitid()를 허용하고 짧은 해설에 waitid도 같은 계열임을 덧붙이거나, 의도한 두 API만 묻도록 질문 범위를 명시한다. 후속 기능 구현은 불필요하다.

후속: #201

## W3-OS-003 — P1

대상: `operating-systems.core.process.process-address-space`

원문: [content/operating-systems/process/process-address-space.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/process/process-address-space.md#L22)

> 페이지 테이블을 통해 가상 페이지를 물리 메모리나 파일 기반 객체 등에 연결한다.

문제: 첫 문장은 page table이 파일 기반 객체까지 직접 연결하는 것처럼 설명한다. Linux의 파일 backing/offset은 VMA 같은 OS metadata에서 관리하고, page table은 상주 물리 페이지 주소/권한 및 비상주 특수 entry를 표현한다. 뒤의 정확한 mapping≠resident 설명과 맞추려면 두 층을 구별해야 한다.

최소 보강: OS가 가상 영역과 anonymous/file backing을 관리하고 준비된 물리 페이지의 주소 변환·권한을 page table로 표현한다는 두 문장으로 한정한다. Linux VMA를 짧은 예로 들되 모든 ISA의 PTE 구조로 일반화하지 않는다. 기존 영역 그림·ASLR·COW·문항은 유지한다.

후속: #201

## W3-OS-011 — P2

대상: `operating-systems.core.race-critical-section.shared-mutable-state.q1`

원문: [content/operating-systems/race-critical-section/questions.json:21](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/race-critical-section/questions.json#L21)

> 둘 이상의 실행 흐름이 같은 변경 가능한 불변 조건에 영향을 줄 수 있다.

문제: 정답보기는변경가능한state와유지해야하는invariant를'변경가능한불변조건'으로합친다. rationale/본문은state가변하고공유불변조건은유지돼야한다고정확히설명해보기용어만충돌한다.

최소 보강: 기존B를같은공유가변상태를읽거나변경해그상태의불변조건에영향을줄수있다는표현으로맞춘다. 정답키/다른보기/해설은유지한다.

후속: #201

## W3-OS-012 — P1

대상: `operating-systems.core.race-critical-section.spin-vs-block.q3`

원문: [content/operating-systems/race-critical-section/questions.json:384](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/race-critical-section/questions.json#L384)

> 단일 코어에서는 락 소유자와 기다리는 스레드가 같은 순간 CPU에서 실행될 수 없다.

문제: SMTphysicalcore는복수logicalCPU를제공하므로같은core라는말만으로owner/waiter동시실행불가를보장하지못한다. 이문항의의도한single-execution-resource모델과실제physicalcore를구별해야한다.

최소 보강: 기존prompt/해설을같은하나의logicalCPU(SMT없거나둘다같은logicalCPU에제한)에서경쟁하는모델로한정한다. owner가다시실행돼야release할수있다는정확한상태추적은유지한다.

후속: #201

## W3-OS-013 — P0

대상: `operating-systems.core.race-critical-section.spin-vs-block.q1`

원문: [content/operating-systems/race-critical-section/questions.json:358](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/race-critical-section/questions.json#L358)

> 기다리는 시간만큼 CPU 사이클을 소비

문제: prompt는영문만요구하지않고해설은CPU사이클이라가르치지만acceptedAnswers에는그한국어표현이없다. 현재trim/lowercase정확일치채점으로'CPU 사이클'정답을거부한다.

최소 보강: 기존허용답에'CPU 사이클'과본문의'CPU 시간'을추가한다. CPU답/기술설명/채점기기능은유지한다.

후속: #201

## W3-OS-004 — P1

대상: `operating-systems.core.scheduling.context-switch`

원문: [content/operating-systems/scheduling/context-switch.md:22](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/scheduling/context-switch.md#L22)

> CPU 코어 하나는 한 순간에 하나의 실행 흐름만 실제로 수행한다.

문제: 물리 core와 OS가 scheduling하는 logical CPU를 구별하지 않는다. SMT에서는 같은 물리 core의 두 logical CPU가 다른 task를 동시에 실행할 수 있다. 실제 Linux affinity 예도 same core/different CPUs와 다른core를 구별한다.

최소 보강: 단일 논리 CPU/하드웨어 thread를 기준으로 한 시분할 모델이라고 한정하고 SMT 물리 core가 여러 논리 CPU를 제공할 수 있음을 짧게 명시한다. 정확한 A/B 저장·복원 도식과 나머지 설명은 유지한다.

후속: #201

## W3-OS-005 — P0

대상: `operating-systems.core.scheduling.round-robin.q1`

원문: [content/operating-systems/scheduling/questions.json:321](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/scheduling/questions.json#L321)

> 라운드 로빈에서 시간 할당량(time quantum)이 매우 커지면 어떤 정책과 비슷해지는가?

원문: [content/operating-systems/scheduling/fcfs.md:6](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/scheduling/fcfs.md#L6)

> title: "선착순 스케줄링(FCFS)"

문제: acceptedAnswers는 FCFS와 영문 두 형태만 있지만 본문에서 학습한 '선착순 스케줄링'도 정확한 답이다. 현재 정확 일치 채점기에서는 한국어 답을 거부한다.

최소 보강: 기존 문항의 허용 답에 '선착순 스케줄링'을 추가한다. 의도한FCFS답·해설과 기능 구현은 유지한다.

후속: #201

## W3-OS-006 — P1

대상: `operating-systems.core.scheduling.fcfs.q1`, `operating-systems.core.scheduling.fcfs.q2`, `operating-systems.core.scheduling.fcfs.q3`

원문: [content/operating-systems/scheduling/questions.json:243](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/scheduling/questions.json#L243)

> 같은 세 작업의 실행 순서를 C→B→A로 바꾸면 평균 대기 시간은 얼마이며, 이 결과가 FCFS의 어떤 한계를 보여 주는가?

문제: q3 자체에는 A8/B2/C1 입력이 없다. q1/q2에는 burst/순서는 있지만 세 작업의 arrival0 또는 실행 시작 전 모두ready라는 전제가 없다. 순서만 A→B→C여도 A가0부터8까지 실행하고B가7에 도착하면 B대기는1이며 모델8이 유일하지 않다. 이전문항·본문의조건이독립출제에전파된다고가정한다.

최소 보강: 각 기존 문항에 필요한 burst와 초기queue/동시arrival0, 단일논리CPU·전환비용무시 전제를 명시한다. 의도한8/평균6/평균4/3 계산과 convoy 해설은 유지한다.

후속: #201

## W3-OS-007 — P2

대상: `operating-systems.core.scheduling.round-robin.q2`

원문: [content/operating-systems/scheduling/questions.json:338](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/scheduling/questions.json#L338)

> A와 B 두 CPU 중심 작업의 버스트가 각각 5이고 시간 할당량이 2다. A가 먼저 실행된다고 할 때 CPU 실행 순서를 할당량 단위로 적어라.

문제: 모델 A2B2A2B2A1B1은 단일CPU에서 두 작업이처음부터ready일때 타당하다. A먼저라는조건만으로는 B도착시점/초기준비상태나 다중CPU 실행을 정하지 못한다. 본문의 단순 RR 예를 암묵적으로 가져온다.

최소 보강: 기존 q2에 한 논리CPU, 시작시둘다ready, 전환비용무시의 교육 모델을 짧게 명시한다. burst/quantum/답의 실행 추적은 유지한다.

후속: #201

## W3-OS-008 — P0

대상: `operating-systems.core.threads.java-virtual-thread-boundary.q1`

원문: [content/operating-systems/threads/questions.json:583](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/threads/questions.json#L583)

> Java 가상 스레드가 CPU에서 Java 코드를 실행할 때 올라가는 플랫폼 스레드를 영문으로 무엇이라 부르는가?

문제: acceptedAnswers에는 carrier 한 개만 있다. 공식 Java25 Thread API가 쓰는 carrier thread도 정확한 영문 정답이며 prompt는 한 단어만 요구하지 않는다. trim/lowercase 정확 일치 채점에서 이 답은 거부된다.

최소 보강: 기존 q1의 허용 답에 'carrier thread'와 본문 용어 'carrier platform thread'를 추가한다. 정답 개념·해설·채점기 기능은 유지한다.

후속: #201

## W3-OS-009 — P0

대상: `operating-systems.core.threads.concurrency-vs-parallelism.q1`

원문: [content/operating-systems/threads/questions.json:423](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/threads/questions.json#L423)

> 단일 코어 CPU에서도 가능한 실행 구성은 무엇인가? 영문 용어로 답하라.

문제: 단일 물리 core도 SMT로 두 logical CPU/실행 자원을 제공할 수 있어 parallelism도 가능한 답이다. 공식 Linux affinity 예는 같은core의다른CPU에서두process를실행한다. 단일core만으로time-slice concurrency를유일답으로만들수없다.

최소 보강: SMT없는단일논리CPU에서여러CPU계산흐름을번갈아진행하는구성을영문으로묻는것으로범위를명시한다. concurrency답/해설과본문의가능한두예는유지한다.

후속: #201

## W3-OS-010 — P2

대상: `operating-systems.core.threads.thread-pool`

원문: [content/operating-systems/threads/thread-pool.md:20](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/threads/thread-pool.md#L20)

> 미리 준비한 작업 스레드(worker)를 재사용

문제: pool정의를미리준비된worker에한정한다. 연결한ThreadPoolExecutor는default로coreworker도task도착시에생성·시작하고prestart는별도선택이다. 재사용의원리와초기생성시점을구별해야한다.

최소 보강: 첫정의를관리하는worker를재사용하는구조로한정하고필요시생성하거나미리시작할수있다는짧은경계를명시한다. boundedworker/queue교육모델과실패추적은유지하고전체executor설정튜토리얼로확장하지않는다.

후속: #201

## W3-OS-017 — P2

대상: `operating-systems.core.virtual-memory.page-table.q1`

원문: [content/operating-systems/virtual-memory/questions.json:136](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/virtual-memory/questions.json#L136)

> 모든 페이지 테이블은 애플리케이션 JSON으로 저장되기 때문이다

문제: 페이지 상태 bit의 구현 의존 의미를 검증하는 문항인데 C는 page table과 관계없는 애플리케이션 JSON 주장이라 실제 present/valid/resident 오해를 검증하지 못한다. A 정답과 모든 해설 자체는 정확하다.

최소 보강: C 한 보기/rationale를 Linux helper 의미와 ISA bit 혼동 또는 present이면 모든 접근 허용이라는 실제 오해로 교체하여 이 목표를 검증한다. 정답·나머지 정확한 설명은 유지한다.

후속: #201

## W3-OS-018 — P0

대상: `operating-systems.core.virtual-memory.page-fault.q1`

원문: [content/operating-systems/virtual-memory/questions.json:195](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/virtual-memory/questions.json#L195)

> 스왑에서 페이지를 다시 읽어 와야 하는 경우

문제: 저장 장치 I/O가 반드시 필요하지 않은 fault의 유일 답을 D로 두지만 B도 swap page가 zswap의 RAM compressed cache에 있으면 fault 시 decompress/load로 복구 가능하다. 실제 kernel 문서가 이 경로를 명시한다. B rationale의 swap⇒저장 장치 필수라는 일반화는 부정확하며 C도 persistent backing 전제가 없다.

최소 보강: 문제를 disk-backed 단순 모델로 명시하거나 B를 RAM swap cache/zswap에 없고 물리 저장 장치의 swap block을 읽어야 하는 경우로 한정한다. C도 저장 장치에 실제 할당된 file data가 모든 관련 memory cache에 없다는 조건을 준다. D의 zero-fill 예제는 유지한다.

후속: #201

## W3-OS-019 — P0

대상: `operating-systems.core.virtual-memory.locality-working-set.q1`

원문: [content/operating-systems/virtual-memory/questions.json:406](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/content/operating-systems/virtual-memory/questions.json#L406)

> 이 구간에서 관찰되는 작업 집합은?

원문: [backend/src/main/java/com/guseoh/csforge/quiz/application/grading/ShortAnswerGradingStrategy.java:32](https://github.com/guseoh/csforge/blob/efe73a15da14c996bd08344181d4d6f87073803d/backend/src/main/java/com/guseoh/csforge/quiz/application/grading/ShortAnswerGradingStrategy.java#L32)

> anyMatch(submitted::equals)

문제: 작업 집합은 {1,2,3}이라는 순서 없는 set이지만 acceptedAnswers는 1,2,3 순서의5표기뿐이다. 현행 trim/lowercase/equals grader는 {3,2,1} 등 같은 집합의 답을 오답 처리한다. Explanation의 값은 정확하다.

최소 보강: 콘텐츠 보강 범위에서 오름차순과 요구 표기 형식을 문제에 명시하거나 유효 permutation을 acceptedAnswers에 추가한다. 이번 감사에서는 채점 기능을 변경하지 않는다.

후속: #201
