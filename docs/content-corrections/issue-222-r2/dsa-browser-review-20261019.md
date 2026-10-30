# Issue #222 R2 — DSA 원 URL 브라우저 직접 검토

기준: `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`, 2026-10-19 KST. 선행 [#240](https://github.com/guseoh/csforge/pull/240)은 Draft·미병합, HEAD `36ea1a64a2c6e5d8c4927417e8023b08edd27be8`; [Repository Validation #39191034085](https://github.com/guseoh/csforge/actions/runs/39191034085)는 completed/success다. 이 문서는 #240의 저자 GitHub 코드 대조를 반복하지 않고 **원래 canonical URL의 브라우저 본문 접근** 게이트를 처리한다.

## 방법과 결론

ChatGPT in-app browser에서 Princeton canonical 18 URL 모두 제목뿐 아니라 본문과 관련 절을 직접 읽었다. 기존 웹 조회의 403 기록은 당시 도구의 결과로 보존한다. 브라우저 성공을 다른 URL·다른 Concept의 검증으로 자동 전파하지 않고, 아래 70관계의 현행 summary·Reference recommendation·relationNote와 각 원문 절을 따로 대조했다. §1.3의 원형 큐·센티널, §3.1의 rank, §3.4의 resize, §5.1의 counting pass는 페이지가 연결하는 코드 HTML도 직접 읽었다.

**70관계 모두 KEEP(해당 절·학습 배경에 한정)**. 출처 전문의 모든 주장이나 Concept/Question 전체의 정확성을 인증하는 판정은 아니다. 새 P0/P1 Reference 결함은 확인하지 못했고 canonical 변경은 없다. 원본 직접 확인 70건은 이 Draft의 제안 결과이며 main의 기존 수동 검증 17건을 이미 변경한 것으로 보고하지 않는다. Wave 원본과 기존 `verified-relations.json`도 보존한다.

자료는 Algorithms **4th Edition의 Java 구현 예제**다. 특히 §1.4의 64-bit 객체 크기·참조 8바이트·Java 7 String 수치를 Java 25/모든 JVM의 계약으로 사용하지 않는다. §1.3의 오래된 Java 라이브러리/boxing Q&A, §2.5의 과거 Java 시스템 정렬 구현 및 보편적인 속도 우열 주장 역시 추천 범위에서 제외한다. §3.3·5.1·5.2의 `under major construction`은 본문 범위 한계이며 broken link 판정이 아니다. 추가 한국어 자료 quota나 새 URL은 도입하지 않는다.

## 원 URL별 실제 읽은 범위

URL prefix는 `https://algs4.cs.princeton.edu/`다. 모든 원 URL은 브라우저에서 본문을 확인했다. 개별 관계의 적용 근거는 다음 표에 별도로 둔다.

| 경로 | 읽은 절/연결 코드 | 적용 한계 |
| --- | --- | --- |
| `13stacks/` | FIFO/LIFO, array resizing, linked lists, Web Exercises List iterators·deque·Stock prices; `ResizingArrayQueue.java.html`, `DoublyLinkedList.java.html` | 회전 큐는 크기 조절 가능, 단조 덱은 Stock prices 스택 연습만으로 완결하지 않음 |
| `14analysis/` | cost model, input dependence, amortized analysis, memory usage, partial sums 연습 | tilde와 O/Θ/Ω의 형식 정의 구별; 과거 JVM 바이트 수 일반화 금지 |
| `15uf/` | dynamic connectivity, weighted quick-union, path compression | size 기반 weighting과 rank 기반 구현을 동일 코드로 주장하지 않음 |
| `22mergesort/` | top-down/bottom-up, 보조 배열, 비교 하한, 정렬 입력 점화식 연습 | runtime frame layout 계약 아님 |
| `23quicksort/` | partition, pointer bounds, equal keys, randomized average/worst, 3-way partition | 랜덤화가 최악 O(n²)을 없애지 않음 |
| `24pq/` | priority queue, heap order, swim/sink, heap construction/sortdown | 자료구조 추상화와 heap 구현 구별 |
| `25applications/` | Stability·다중 키 정렬 | 현행 JDK 정렬 구현/성능 보장으로 확대하지 않음 |
| `31elementary/` | sequential search, sorted array, rank, floor/ceiling, 비용; `BinarySearchST.java.html` | duplicate key를 저장하지 않음; 일반 upper_bound 구현 근거 아님 |
| `32bst/` | BST invariant, shape/height, inorder, height·순회 연습 | 일반 이진 트리의 모든 순회가 이 절의 중심 주제는 아님 |
| `33balanced/` | 2-3 tree, LLRB, rotations, height bound | 모든 균형 트리의 공통 색상 정책 아님; 작성 중 |
| `34hash/` | hash→index, collision, uniform assumption, chaining/probing, load factor; `SeparateChainingHashST.java.html` | 같은 임계값을 두 충돌 해결법에 강제하지 않음; 이 코드의 resize 정책만 확인 |
| `41graph/` | graph glossary, adjacency list/matrix, DFS/BFS, CC, Cycle | BFS 최단은 간선 수 기준, 무방향 그래프와 방향 그래프 구별 |
| `42digraph/` | directed cycle, DFS orders, DAG/topological | DFS 방식 예시이며 Kahn 구현 전체 검증 아님 |
| `43mst/` | connected/forest, cut, Prim lazy/eager, Kruskal | 동률 가중치는 MST가 유일하지 않을 수 있음 |
| `44sp/` | relaxation, Dijkstra, Bellman-Ford, negative cycles, Floyd-Warshall 연습 | 음수 사이클의 도달성/영향 범위, 단일 출발점과 all-pairs 구별 |
| `51radix/` | LSD/MSD, American flag counting 연습; `LSD.java.html` | 작성 중; 고정 길이 extended ASCII/32-bit int 조건, 일반 Unicode 보장 아님 |
| `52trie/` | R-way/TST, prefix/wildcard, lazy/eager delete | 작성 중; 각 노드 분기 수를 모든 trie에 고정하지 않음 |
| `cheatsheet/` | priority queue, symbol table, graph 시간/공간 표와 각주 | textbook 구현 기준; amortized·uniform hashing 각주 필수 |

## 관계별 판정 근거

각 행의 key에는 `dsa.core.` prefix를 붙인다. 원 URL은 위 prefix + 경로다. 판정은 전부 **KEEP / DIRECT_CONTENT_VERIFIED**, 단 설명한 절만 학습 배경으로 추천한다. 이것이 source 전체의 무오류나 Question full review PASS를 의미하지 않는다.

| contentKey suffix | 원 URL 경로 | 직접 대조한 학습 범위 |
| --- | --- | --- |
| algorithm-selection.constraint-to-complexity | 14analysis/ | 입력 크기별 성장률·연산 비용 모델; 특정 시간제한의 기계별 상수는 별도 |
| algorithm-selection.data-shape | 31elementary/ | 정렬 배열이 이진 탐색을 가능하게 하는 전제 |
| algorithm-selection.data-shape | 34hash/ | 키 분포·충돌이 해시 조회 비용에 미치는 조건 |
| algorithm-selection.data-shape | 41graph/ | Graph/AdjMatrixGraph의 표현 차이; 희소/조밀 선택 배경 |
| algorithm-selection.data-shape | 51radix/ | 고정 길이 문자열·자리수 활용; 임의 정수 범위와 구별 |
| algorithm-selection.memory-limit | 14analysis/ | 변수·배열·보조 구조의 공간 추산 방법; 과거 JVM 바이트 수는 역사적 예시만 |
| algorithm-selection.operation-driven-structure-choice | cheatsheet/ | 연산별 시간표와 평균/최악·분할 상환 각주 |
| algorithm-selection.preprocessing-query-cost | 14analysis/ | cost model·빠른 알고리즘 설계 배경; 기존 #232의 합산식 한정 안내 유지 |
| complexity.amortized-analysis | 14analysis/ | 빈 구조에서 N 연산의 총비용·배열 확장 분석 |
| complexity.best-average-worst | 14analysis/ | input model·worst-case guarantee·randomized 차이 |
| complexity.big-o-theta-omega | 14analysis/ | 성장률·tilde 비용 모델 배경; 세 기호의 형식 정의를 다 설명하는 절이라고 주장하지 않음 |
| complexity.input-size-operation-count | 14analysis/ | statement cost × frequency, ThreeSum array-access 모델 |
| complexity.time-space-tradeoff | 14analysis/ | memory usage와 partial sums의 추가 배열/반복 합 계산 절감 |
| graph.adjacency-list-matrix | 41graph/ | Graph.java와 AdjMatrixGraph.java의 표현 구별 |
| graph.bfs | 41graph/ | FIFO·mark·edgeTo로 간선 수 최단 경로 탐색 |
| graph.connected-components | 41graph/ | CC의 DFS와 연결 동치 관계 |
| graph.cycle-detection | 42digraph/ | 방향 cycle·DirectedCycle, DAG와의 관계 |
| graph.cycle-detection | 41graph/ | 무방향 Cycle의 DFS; 방향 재귀 상태와 구별 |
| graph.dfs | 41graph/ | 방문 표시 후 미방문 인접 정점 재귀 탐색 |
| graph.graph-model | 41graph/ | 정점·간선·차수·경로의 무방향 모델 배경 |
| graph.topological-sort | 42digraph/ | DAG iff topological order, reverse postorder; Kahn은 Concept 자체 설명 |
| graph-path.bellman-ford | 44sp/ | 반복 완화·queue 방식·출발점에서 도달 가능한 음수 사이클 |
| graph-path.dijkstra | 44sp/ | 비음수 가중치·최소 잠정거리·IndexMinPQ 완화 |
| graph-path.floyd-warshall | 44sp/ | Floyd-Warshall 연습·all-pairs V³/V²; 기존 #232 범위 안내 유지 |
| graph-path.kruskal | 43mst/ | 가중치 순 간선·union-find cycle 배제 |
| graph-path.minimum-spanning-tree | 43mst/ | cut property·연결 전제·비연결 forest·동률 비유일성 |
| graph-path.path-compression-union-rank | 15uf/ | weighted union·path compression; size와 rank 정책을 구별 |
| graph-path.prim | 43mst/ | frontier cut·lazy/eager priority queue 차이 |
| graph-path.union-find | 15uf/ | 연결 동치 클래스·find/union·root 연결 불변식 |
| graph-path.unweighted-shortest-path | 41graph/ | BFS 층과 최소 간선 수; 가중치 최단 경로와 구별 |
| hashing.average-worst-lookup | 34hash/ | uniform hashing 가정·평균 비교 비용과 최악 충돌 구별 |
| hashing.bucket-mapping | 34hash/ | hashCode를 [0,M) index로 변환하는 예제 |
| hashing.collision | 34hash/ | 서로 다른 키의 같은 index와 equals 비교 |
| hashing.hash-function | 34hash/ | 결정성·계산 비용·분포, equals와 hashCode 조건 |
| hashing.load-factor | 34hash/ | chaining N/M 길이와 probing 점유율의 다른 의미 |
| hashing.open-addressing | 34hash/ | linear probing hit/miss·빈 슬롯 조건; tombstone만이 유일한 삭제 구현은 아님 |
| hashing.resize | 34hash/ | 연결된 SeparateChainingHashST.resize에서 새 용량으로 모든 key 재삽입 |
| hashing.separate-chaining | 34hash/ | 버킷별 linked symbol table·목록 길이와 검색 비용 |
| recursion-backtracking.divide-and-conquer | 22mergesort/ | 두 하위 배열 정렬 후 merge하는 분할·결합 |
| recursion-backtracking.recurrence | 22mergesort/ | 재귀 분할과 sorted-input recurrence 연습; 일반 점화식 해법 전체는 아님 |
| recursion-backtracking.recursion-call-state | 22mergesort/ | lo/mid/hi 분할·호출 복귀 후 merge; 기존 #232 runtime 경계 유지 |
| search-sort.binary-search-boundary | 31elementary/ | rank/삽입 위치가 경계 탐색의 배경; 중복 없는 symbol table로 일반 lower/upper bound를 증명하지 않음 |
| search-sort.binary-search | 31elementary/ | 정렬 배열·중앙 비교·후보 구간 축소 |
| search-sort.comparison-sort-lower-bound | 22mergesort/ | comparison-based 최소 lg(N!) 비교 명제; 비비교 정렬에는 적용하지 않음 |
| search-sort.counting-sort | 51radix/ | American flag/key-indexed counting·연결 LSD 빈도/누적/배치 코드 |
| search-sort.heap-sort | 24pq/ | heap construction·sortdown·in-place 배열 |
| search-sort.linear-search | 31elementary/ | unordered linked-list 순차 비교와 성공/실패 비용 |
| search-sort.merge-sort | 22mergesort/ | top-down/bottom-up·두 정렬 구간 merge·추가 공간 |
| search-sort.partition | 23quicksort/ | pivot 양측 조건·pointer 교차·동등 키 처리 |
| search-sort.quicksort | 23quicksort/ | shuffle·분할·평균 N log N과 최악 N² 구별 |
| search-sort.radix-sort | 51radix/ | LSD 연결 코드의 stable counting pass, MSD와 구별 |
| search-sort.stable-sort | 25applications/ | Stability의 동일 키 상대순서와 다중 키 거래 예제만 |
| sequential.array-vs-linked | 13stacks/ | 배열 기반/연결 기반 collection의 저장·링크·복사 차이 |
| sequential.array | 13stacks/ | fixed capacity array 기반 stack의 indexing 배경 |
| sequential.doubly-linked-list | 13stacks/ | List iterators·직접 읽은 DoublyLinkedList의 pre/post·prev/next; #232 안내 유지 |
| sequential.dynamic-array | 13stacks/ | full 확장·1/4 shrink·size/capacity 구별 |
| sequential.singly-linked-list | 13stacks/ | Node.next·head 삽입/삭제·tail 연결·순회 |
| stack-queue-deque.circular-queue | 13stacks/ | 연결 ResizingArrayQueue의 first/last wraparound·n; 고정 용량 전용 구현은 아님 |
| stack-queue-deque.deque | 13stacks/ | Web Exercises의 양끝 연산·stack/steque 조합 문제 |
| stack-queue-deque.monotonic-stack-queue | 13stacks/ | Stock prices의 index stack·선형 시간 힌트만; #232 단조 덱 제외 안내 유지 |
| stack-queue-deque.queue | 13stacks/ | FIFO·first/last·enqueue/dequeue |
| stack-queue-deque.stack | 13stacks/ | LIFO·push/pop·최근 상태 복귀 |
| trees.balanced-tree-motivation | 33balanced/ | 2-3/LLRB 높이와 로그 비용 보장; 작성 중 범위 |
| trees.binary-search-tree | 32bst/ | 왼쪽/오른쪽 키 순서·get/put·입력 순서별 높이 |
| trees.binary-tree-traversal | 32bst/ | inorder와 BST 순회·level-order 연습; #232의 일반 순회 한정 유지 |
| trees.heap | 24pq/ | complete tree·배열 parent/child·heap order |
| trees.priority-queue | 24pq/ | insert/delete-max 추상화·배열/목록/heap 비용 비교 |
| trees.tree-rotation | 33balanced/ | LLRB 좌/우 rotation과 key ordering 유지 |
| trees.tree-terminology | 32bst/ | root/subtree/null link·height와 검색 경로의 관계 |
| trees.trie | 52trie/ | R-way/TST·prefix/wildcard·삭제 표시와 가지 정리; 작성 중 범위 |

## 검증·미해결 경계

- `reconcile.py`: 기준 main에서 15 Area / 721 Concept / 1,042관계 / 622 URL, metadata 충돌·관계/순서 중복 0, 기존 17 verified / 131 pending 확인.
- 이 문서는 감사 전용이다. Concept/Question identity·전역 metadata·Import payload·Reader 코드 변경 0이므로 신규 Apply/idempotency 및 Reader UI 회귀 테스트는 해당 없음. 실제 외부 원문 접근 확인을 Reader UI full QA로 대체 표기하지 않는다.
- P2: memory-limit에 과거 JVM 수치 한정, binary-search-boundary에 rank의 중복 키 미지원 한정을 Reader에도 추가하면 더 친절하다. 현재 recommendation이 해당 구현을 Java 25 메모리 계약/upper_bound 구현이라고 주장하지 않으므로 이번에는 수정하지 않는다.
- 다음 단계: CA 원본 44관계. R2 최종 reconcile에서 이 Draft의 70개 독립 결과를 통합하되 병합 전 main 완료 수치와 분리한다. #240과 본 PR은 모두 사용자 검토/승인 전 병합하지 않는다.
