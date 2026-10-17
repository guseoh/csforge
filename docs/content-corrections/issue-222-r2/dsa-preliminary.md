# Issue #222 R2 — DSA Reference 독립 대조 1차 (2026-10-17)

기준: `main 2862a92d9208153678f3b618df90fafe37cb2e09`, PR #228 HEAD `eb607ec2c027` 확인 후 작성. 변경 대상은 **감사 evidence만**이며 canonical/Reference metadata는 수정하지 않는다.

## 범위·판정 경계

- `wave-3-reference-issues.json`의 DSA **NEEDS_REVIEW 70 관계 / 18 고유 URL**과 최신 main의 실제 Concept front matter 일부를 대조. URL 403을 broken/404로 바꾸지 않음.
- 이번 7개 canonical URL의 직접 요청(`13stacks`, `14analysis`, `34hash`, `cheatsheet`, `25applications`, `44sp`, `33balanced`)은 모두 **403**. 색인에 노출된 원문 일부 및 저자 코드·연습문항·공식 강의 자료가 해당 학습 주제를 보조한다는 것은 확인 가능하지만, 원래 target의 **원문 직접 열람 성공과는 별개**다.
- `22mergesort`는 보조 색인을 추가 대조했으나 canonical 직접 접속은 이번 회차에 재검사하지 않았다. 그 외 URL도 이번 새 직접 접근/전문 검증 완료라고 주장하지 않는다.
- **이번 DIRECT_CONTENT_VERIFIED 신규 0관계**, #228의 기존 15개 독립 검증/잔여 138후보 수치는 변경하지 않는다. 아래 SCOPE_CHECK/NOTE_FIX_CANDIDATE는 실제 결함 확정/교정 PR 착수 판정이 아니다.

## 18개 URL별 재검토 진행 매핑

| 공식 URL | 관계 | 현재 증거 수준 | 확인/잔여 핵심 범위 |
| --- | ---: | --- | --- |
| [13stacks](https://algs4.cs.princeton.edu/13stacks/) | 10 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 1.3 기본 Stack/Queue, resizing-array, linked list 및 Stock prices 연습문항, DoublyLinkedList.java 별도 코드 |
| [34hash](https://algs4.cs.princeton.edu/34hash/) | 9 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 3.4 해시 함수·충돌 처리·separate chaining·linear probing·load factor |
| [14analysis](https://algs4.cs.princeton.edu/14analysis/) | 8 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 1.4 실험 기반 실행 비용, 메모리·분할 상환/연산 시퀀스 근거. 전처리 질의 수식 자체는 별도 판단 |
| [41graph](https://algs4.cs.princeton.edu/41graph/) | 8 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | 5 | INDEXED_EXCERPT_ONLY; canonical 이번 직접 접근 미검사 | 2.2 merge-sort 및 comparison lower-bound decision-tree 연습/강의 색인 근거 |
| [31elementary](https://algs4.cs.princeton.edu/31elementary/) | 4 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [24pq](https://algs4.cs.princeton.edu/24pq/) | 3 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [32bst](https://algs4.cs.princeton.edu/32bst/) | 3 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [43mst](https://algs4.cs.princeton.edu/43mst/) | 3 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [44sp](https://algs4.cs.princeton.edu/44sp/) | 3 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 4.4 Dijkstra/Bellman-Ford 중심 본문; Floyd–Warshall은 연습문항 11 및 저자 코드에 등장 |
| [51radix](https://algs4.cs.princeton.edu/51radix/) | 3 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [15uf](https://algs4.cs.princeton.edu/15uf/) | 2 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [23quicksort](https://algs4.cs.princeton.edu/23quicksort/) | 2 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [33balanced](https://algs4.cs.princeton.edu/33balanced/) | 2 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 3.3 Red-black BST rotations의 좌/우 회전과 정렬 불변식 |
| [42digraph](https://algs4.cs.princeton.edu/42digraph/) | 2 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [25applications](https://algs4.cs.princeton.edu/25applications/) | 1 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 2.5 Stability 섹션, 동등 키의 원래 상대순서 보존 |
| [52trie](https://algs4.cs.princeton.edu/52trie/) | 1 | PR #228 기존 Wave3 근거만 확인; 이번 직접 열람/독립 본문 판정 미수행 | 기존 감사 원본의 관계별 미확정 유지 |
| [cheatsheet](https://algs4.cs.princeton.edu/cheatsheet/) | 1 | INDEXED_EXCERPT_ONLY; canonical 직접 403 | 자료구조/정렬/우선순위 큐/심볼 테이블/그래프 연산 복잡도 요약 표 |

## Concept별 선행 점검이 필요한 7관계

아래는 전체 70개 가운데 **정확한 학습 위치/범위 확인이 우선인 후보 7개**이며, 불일치 7건을 확정했다는 뜻이 아니다.

| contentKey | 기존 자료 | 예비 판정 및 후속 검증 |
| --- | --- | --- |
| `dsa.core.algorithm-selection.preprocessing-query-cost` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | SCOPE_CHECK — 1.4 일반 실행비용 분석이 전처리/질의 복합식의 직접 증거인지는 별도 절 대조 필요. |
| `dsa.core.graph-path.floyd-warshall` | [44sp](https://algs4.cs.princeton.edu/44sp/) | NOTE_FIX_CANDIDATE — 현재 recommendation은 Dijkstra/Bellman–Ford만 열거. 4.4 Exercises 11의 FloydWarshall.java 및 all-pairs V³/V² 영역을 별도로 지시. |
| `dsa.core.recursion-backtracking.recursion-call-state` | [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | SCOPE_CHECK — 2.2 mergesort 재귀 실행과 모든 언어의 call-frame/stack 모델을 구분. |
| `dsa.core.sequential.doubly-linked-list` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | NOTE_FIX_CANDIDATE — §1.3 본문의 단일 연결 구조와 별도 DoublyLinkedList.java의 pre/post sentinel 구현을 구분해 읽을 위치 명시. |
| `dsa.core.stack-queue-deque.circular-queue` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | SCOPE_CHECK — §1.3 resizing-array queue와 원형 인덱스의 full/empty 설계가 같은 범위인지 저자 구현 코드까지 분리 확인. |
| `dsa.core.stack-queue-deque.monotonic-stack-queue` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | NOTE_FIX_CANDIDATE — §1.3 stock-prices(index stack) 연습은 관련되지만 단조 deque/윈도우 최대값의 일반 증명까지 이 자료로 보장하지 않음. |
| `dsa.core.trees.binary-tree-traversal` | [32bst](https://algs4.cs.princeton.edu/32bst/) | SCOPE_CHECK — 3.2 BST inorder는 일반 이진 트리의 preorder/postorder/level-order 전부를 포괄한다고 일반화하지 않음. |

## 원문/보조 색인 근거

- Princeton §1.3 Bags, Queues, and Stacks 검색 색인: https://algs4.cs.princeton.edu/13stacks/index.php
- 같은 저자의 DoublyLinkedList.java (sentinel `pre`/`post`, `prev`/`next`): https://algs4.cs.princeton.edu/13stacks/DoublyLinkedList.java.html
- Princeton §1.4 Analysis, amortized proposition: https://algs4.cs.princeton.edu/14analysis/
- Princeton §3.4 Hash Tables, separate chaining / linear probing 가정: https://algs4.cs.princeton.edu/34hash/
- Princeton §2.5 Stability: https://algs4.cs.princeton.edu/25applications/
- Princeton §3.3 Red-black tree rotations: https://algs4.cs.princeton.edu/33balanced/
- Princeton §4.4 Exercises #11 Floyd–Warshall 및 저자 구현: https://algs4.cs.princeton.edu/44sp/index.php , https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/FloydWarshall.java.html
- Princeton Cheatsheet (복잡도 및 점근 표기 표): https://algs4.cs.princeton.edu/cheatsheet/

**출처 유형:** 위는 웹 검색 서비스가 제공한 공식 출처의 인덱싱된 본문/일부 코드 단서이며, canonical 직접 403을 뒤집는 증거가 아니다. 각 `contentKey`에 `DIRECT_CONTENT_VERIFIED` 승격·KEEP 확정·미해결 차감은 하지 않는다.

## 전체 70관계 추적

| contentKey | URL | 현재 후속 상태 |
| --- | --- | --- |
| `dsa.core.algorithm-selection.constraint-to-complexity` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.data-shape` | [31elementary](https://algs4.cs.princeton.edu/31elementary/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.data-shape` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.data-shape` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.data-shape` | [51radix](https://algs4.cs.princeton.edu/51radix/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.memory-limit` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.operation-driven-structure-choice` | [cheatsheet](https://algs4.cs.princeton.edu/cheatsheet/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.algorithm-selection.preprocessing-query-cost` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.complexity.amortized-analysis` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.complexity.best-average-worst` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.complexity.big-o-theta-omega` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.complexity.input-size-operation-count` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.complexity.time-space-tradeoff` | [14analysis](https://algs4.cs.princeton.edu/14analysis/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.adjacency-list-matrix` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.bfs` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.connected-components` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.cycle-detection` | [42digraph](https://algs4.cs.princeton.edu/42digraph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.cycle-detection` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.dfs` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.graph-model` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph.topological-sort` | [42digraph](https://algs4.cs.princeton.edu/42digraph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.bellman-ford` | [44sp](https://algs4.cs.princeton.edu/44sp/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.dijkstra` | [44sp](https://algs4.cs.princeton.edu/44sp/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.floyd-warshall` | [44sp](https://algs4.cs.princeton.edu/44sp/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.graph-path.kruskal` | [43mst](https://algs4.cs.princeton.edu/43mst/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.minimum-spanning-tree` | [43mst](https://algs4.cs.princeton.edu/43mst/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.path-compression-union-rank` | [15uf](https://algs4.cs.princeton.edu/15uf/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.prim` | [43mst](https://algs4.cs.princeton.edu/43mst/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.union-find` | [15uf](https://algs4.cs.princeton.edu/15uf/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.graph-path.unweighted-shortest-path` | [41graph](https://algs4.cs.princeton.edu/41graph/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.average-worst-lookup` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.bucket-mapping` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.collision` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.hash-function` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.load-factor` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.open-addressing` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.resize` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.hashing.separate-chaining` | [34hash](https://algs4.cs.princeton.edu/34hash/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.recursion-backtracking.divide-and-conquer` | [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.recursion-backtracking.recurrence` | [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.recursion-backtracking.recursion-call-state` | [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.search-sort.binary-search-boundary` | [31elementary](https://algs4.cs.princeton.edu/31elementary/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.binary-search` | [31elementary](https://algs4.cs.princeton.edu/31elementary/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.comparison-sort-lower-bound` | [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.counting-sort` | [51radix](https://algs4.cs.princeton.edu/51radix/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.heap-sort` | [24pq](https://algs4.cs.princeton.edu/24pq/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.linear-search` | [31elementary](https://algs4.cs.princeton.edu/31elementary/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.merge-sort` | [22mergesort](https://algs4.cs.princeton.edu/22mergesort/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.partition` | [23quicksort](https://algs4.cs.princeton.edu/23quicksort/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.quicksort` | [23quicksort](https://algs4.cs.princeton.edu/23quicksort/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.radix-sort` | [51radix](https://algs4.cs.princeton.edu/51radix/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.search-sort.stable-sort` | [25applications](https://algs4.cs.princeton.edu/25applications/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.sequential.array-vs-linked` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.sequential.array` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.sequential.doubly-linked-list` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.sequential.dynamic-array` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.sequential.singly-linked-list` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.stack-queue-deque.circular-queue` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.stack-queue-deque.deque` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.stack-queue-deque.monotonic-stack-queue` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.stack-queue-deque.queue` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.stack-queue-deque.stack` | [13stacks](https://algs4.cs.princeton.edu/13stacks/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.balanced-tree-motivation` | [33balanced](https://algs4.cs.princeton.edu/33balanced/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.binary-search-tree` | [32bst](https://algs4.cs.princeton.edu/32bst/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.binary-tree-traversal` | [32bst](https://algs4.cs.princeton.edu/32bst/) | SCOPE_CHECK / NOTE_FIX_CANDIDATE |
| `dsa.core.trees.heap` | [24pq](https://algs4.cs.princeton.edu/24pq/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.priority-queue` | [24pq](https://algs4.cs.princeton.edu/24pq/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.tree-rotation` | [33balanced](https://algs4.cs.princeton.edu/33balanced/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.tree-terminology` | [32bst](https://algs4.cs.princeton.edu/32bst/) | PENDING_DIRECT_SOURCE_CHECK |
| `dsa.core.trees.trie` | [52trie](https://algs4.cs.princeton.edu/52trie/) | PENDING_DIRECT_SOURCE_CHECK |

## 후속

1. SCOPE_CHECK 7관계부터 공식 원문 본문/저자 코드 경계를 구체 절 단위로 확정한 뒤 KEEP/NOTE_FIX/ACCESS_UNRESOLVED 중 선택한다. 자료 접근 실패와 자료의 의미 불일치를 구분.
2. 이미 동일 URL의 Concept가 있다면 global `title/referenceType/language/depth/recommendation`는 변경하지 않고, 필요한 경우 관계별 `relationNote`의 최소 변화만 별도 DSA Content PR로 제안.
3. Computer Architecture 46관계는 DSA 결과와 독립 추적. R2 감사 원본 및 기존 15건의 완료 증거를 덮어쓰지 않는다.

## DSA 우선 7관계 심화 검토 (동일 날짜, 공식 저자 코드·색인 교차 확인)

> **판정 수준 안내:** 원래 canonical Princeton 주소(예: `/13stacks/`)를 `open`한 결과 403이었다. 이하 근거는 **공식 발행자 인덱싱된 절·저자 Java 코드 검색 결과**이므로 `DIRECT_CONTENT_VERIFIED`로 승격하지 않는다. 권고는 교정 우선순위이며, 아직 canonical 메타데이터·원본 ledger 또는 `verified-relations.json`을 변경하지 않는다.

| contentKey | 판단 | 공식 출처의 확인 가능한 학습 범위와 결정 | 필요한 최소 변경 |
| --- | --- | --- | --- |
| `dsa.core.graph-path.floyd-warshall` | **NOTE_FIX_RECOMMENDED** | [교재 4.4 연습문항 11](https://algs4.cs.princeton.edu/44sp/index.php)은 Floyd–Warshall을 별도로 지목하며 [저자 구현](https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/FloydWarshall.java.html)의 all-pairs·V³시간·V²공간을 설명함. 현재 전역 recommendation은 Dijkstra/Bellman–Ford만 명시 | 개별 `relationNote`에 ‘4.4 연습문항 11 및 FloydWarshall.java의 모든 쌍 최단 경로·음수 사이클 조건’을 안내. global recommendation은 동일 URL의 다른 두 관계와 공유하므로 단일 관계에서만 고치지 않음 |
| `dsa.core.sequential.doubly-linked-list` | **NOTE_FIX_RECOMMENDED** | [1.3 교재](https://algs4.cs.princeton.edu/13stacks/index.php) 기본 연결 리스트는 단일 next 기반 입문이고, [DoublyLinkedList.java](https://algs4.cs.princeton.edu/13stacks/DoublyLinkedList.java.html)에 `pre/post` sentinel과 `prev/next` 이중 갱신 코드가 있음 | `relationNote`에 본문 일반 연결 리스트와 별도 이중 연결 리스트 예제를 명확히 구분 |
| `dsa.core.stack-queue-deque.monotonic-stack-queue` | **NOTE_FIX_RECOMMENDED** | [1.3 Web Exercises 62: Stock prices](https://algs4.cs.princeton.edu/13stacks/index.php)에 stack-of-indices의 선형 시간 풀이 힌트가 있음. 이 자료가 sliding-window monotonic deque의 불변식/구현까지 설명한다고 근거 없이 확대하면 안 됨 | `relationNote`에 ‘연습문항 62의 다음 큰 값/인덱스 스택 예시만 보조’ 한정, 단조 덱의 정의·증명은 Concept 본문을 우선 |
| `dsa.core.stack-queue-deque.circular-queue` | **KEEP_SCOPE_LIMITED** | [ResizingArrayQueue.java](https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/ResizingArrayQueue.java.html)는 `first/last/n`, 인덱스 wraparound, resize 시 논리적 FIFO 순서 재배치, size 기반 full/empty를 구현. Concept에서 설명하는 핵심 원형 인덱스와 일치함 | 원본 URL 및 현재 recommendation 유지 가능. 구현은 크기 조정 가능한 원형 배열 큐이며 ‘고정 배열 전용’ 구현이라고 표현하지 않음. 선택적 `relationNote`만 검토 |
| `dsa.core.algorithm-selection.preprocessing-query-cost` | **NOTE_FIX_RECOMMENDED** | [교재 1.4](https://algs4.cs.princeton.edu/14analysis/)는 실행 횟수·연산 비용 모델·분할 상환 분석을 다루지만 본 Concept의 `전처리 + Q×질의 + 갱신` 비용 식 자체를 명시하는 절의 증거는 확보하지 못함 | 관계별 `relationNote`는 ‘비용 모델·기본 연산 분석 배경’만 지목. 전처리·질의 수식의 직접 증명이라는 주장 금지 |
| `dsa.core.trees.binary-tree-traversal` | **NOTE_FIX_RECOMMENDED** | [교재 3.2](https://algs4.cs.princeton.edu/32bst/)는 BST 정렬 조건에 기반한 inorder 순회를 직접 설명하고 level-order는 별도 연습 7을 언급. 모든 일반 binary tree의 preorder/postorder traversal을 이 URL만으로 정밀 보장하지 않음 | `relationNote`에서 ‘BST inorder·정렬된 순회 및 level-order 연습’으로 범위를 명시, 나머지 DFS 순회는 Concept 자체를 우선 |
| `dsa.core.recursion-backtracking.recursion-call-state` | **NOTE_FIX_RECOMMENDED** | [교재 2.2](https://algs4.cs.princeton.edu/22mergesort/index.php)는 재귀 top-down mergesort, `lo/mid/hi` 분할과 반환 후 merge의 실행 순서를 설명함. JVM/OS의 실제 stack frame 레이아웃·오버플로 한계는 직접 다루지 않음 | `relationNote`에 ‘merge-sort의 재귀 호출 전개·복귀 추적’만 안내하고 호출 프레임의 런타임 보장은 별도 자료로 구분 |

**집계:** 이 표는 7개 관계에서 **6개 scope-note 권고 + 1개 제한 조건 하 KEEP**이다. `NOTE_FIX_RECOMMENDED`는 오류 6건 확정이 아니며, 원문 전면 확인·Import/Reader QA가 없는 상태에서 본 작업만으로 ‘R2 완료 7건 추가’라고 세지 않는다. DSA 역사적 미확정 70건 / 18URL은 후속 후보로 남기며, 전역 15 verified / 138 pending 집계를 그대로 둔다.
