# Issue #222 R2 — DSA 저자 공식 구현 대조 및 UMD 접근 경계 (2026-10-19)

기준 `main 57e6d460eca009a5bd2aaa06fd88810565e0ceb6`. 선행 기록: [DSA 70관계](dsa-preliminary.md), [UMD 44관계](umd-44-relationship-review.md), [Issue #222](https://github.com/guseoh/csforge/issues/222). **이번 변경은 감사 근거만 추가하고 canonical·Question·Reference·검증 ledger를 수정하지 않는다.**

## 검증 방법과 상태 경계

- DSA Wave3 역사적 `NEEDS_REVIEW` **70 Concept–URL 관계 / Princeton 18 URL**은 병합 후에도 검사 대상이다. 기존 `#232`의 여섯 `relationNote` 변경은 원래 웹페이지의 전문 직접 열람을 뜻하지 않는다.
- 이번에 다시 요청한 Princeton canonical `/13stacks/`, `/14analysis/`, `/34hash/`, `/41graph/`, `/44sp/` 및 `/13stacks/index.php`는 **HTTP 403**; `/13stacks/ResizingArrayQueue.java.html`도 **403**. 검색 결과에 원문 발췌가 있어도 이는 `INDEXED_EXCERPT_ONLY`다.
- 별도 직접 검증한 [교재 저자 공식 Java 저장소](https://github.com/kevin-wayne/algs4)의 `master` Java 파일은 **원본 교재 HTML과 서로 다른 URL**이다. 소스 자체의 코드·Javadoc은 `AUTHOR_SOURCE_CODE_DIRECTLY_READ`로 구분한다. **이 결과를 canonical URL의 `DIRECT_CONTENT_VERIFIED`로 승격하지 않는다.**
- `kevin-wayne/algs4` README는 Robert Sedgewick/Kevin Wayne의 Algorithms, 4th Edition Java 코드가 이 공식 저장소에서 관리된다고 밝힌다. 읽은 클래스는 아래에 각각 기록했고, 코드 링크는 실제 파일 조회에 성공한 경로만 사용한다.
- **검증 완료 수치 불변**: 기존 R2 수동 directly-verified 17관계 / 역사적 후속 131관계(DSA70, UMD44, OS14, Distributed2, Network1). UMD의 '44'는 DSA와 별도다. 이번 17개 Princeton 절에 대한 코드 대조는 그 17관계를 검증 완료로 차감한다는 의미가 아니다.

## Princeton 18 URL ↔ 저자 관리 코드 — 독립 대조

공식 코드 공통 prefix: `https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/`. 개별 소스 파일을 실제로 읽고 아래 목적과 한계를 확인했다. URL별 숫자는 **현재 추적표의 관계 수**이며 직접 verified 개수가 아니다.

| canonical 절 | 관계 수 | 이번에 실제 읽은 공식 저자 구현 | 직접 확인된 의미·적용 한계 |
| --- | ---: | --- | --- |
| `13stacks` | 10 | [ResizingArrayQueue.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/ResizingArrayQueue.java) SHA `227d7f1` | `first/last` 회전, full 시 확장, 1/4 상태에서 축소, copy 과정의 modulo, FIFO를 직접 확인. 기존 `circular-queue`와 개념상 연결됨. `DoublyLinkedList.java`는 **이 GitHub repo에서 직접 파일을 찾지 못했으므로** sentinel 근거를 이번 증거로 승격하지 않음. 단조 덱 일반 증명 또한 해당 코드에서 확인한 것이 아님. |
| `14analysis` | 8 | [DoublingTest.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/DoublingTest.java) SHA `9a0b5fb` | `ThreeSum.count`의 입력 크기 2배 실험·시간 측정 코드. 모든 전처리·복수 질의 비용 합산 공식의 직접 근거로 쓰지 않음. |
| `15uf` | 2 | [UF.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/UF.java) SHA `c67a4a7` | weighted quick-union by rank + path compression by halving, `find/union` 집합 결합. |
| `22mergesort` | 5 | [Merge.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Merge.java) SHA `af519bc` | 두 재귀 호출 후 `merge` 실행 순서. 특정 Java 메서드 호출 상태의 예시이지 모든 언어의 스택 프레임 규범 아님. |
| `23quicksort` | 2 | [Quick.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Quick.java) SHA `84cfd27` | shuffle → partition → 재귀 분할 예시. 랜덤화가 모든 입력에서 최악 시간 복잡도를 불가능하게 만드는 계약은 아님. |
| `24pq` | 3 | [Heap.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Heap.java) SHA `e9108f4` | heapify/sortdown; 구현 설명에 in-place 추가 공간 및 not stable 명시. priority queue의 다른 구현을 전부 증명하지 않음. |
| `25applications` | 1 | [Insertion.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Insertion.java) SHA `a8d2810` | 저자 코드가 insertion sort를 stable하다고 명시. 다만 **2.1 구현**이지 canonical **2.5 Stability 절 자체를 읽은 근거는 아님**. |
| `31elementary` | 4 | [BinarySearchST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/BinarySearchST.java) SHA `3429a31` | ordered array `rank(key)`의 삽입 위치 및 이진 탐색. 별도 `upper_bound` API와 중복 키 범위 전체를 그대로 구현한 근거는 아님. |
| `32bst` | 3 | [BST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/BST.java) SHA `5e215a8` | BST 순서·순회, 최악 O(n) 불균형. 일반 이진 트리의 전위/후위/레벨 순회 전체를 책 §3.2 본문에서 확인했다는 뜻은 아님. |
| `33balanced` | 2 | [RedBlackBST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/RedBlackBST.java) SHA `5317343` | left-leaning red-black BST, `rotateLeft/rotateRight`, balance/color 처리. 회전을 모든 balanced tree 종류의 단일 정책으로 일반화하지 않음. |
| `34hash` | 9 | [SeparateChainingHashST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/SeparateChainingHashST.java) SHA `a6e0ca1`, [LinearProbingHashST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/LinearProbingHashST.java) SHA `19ef449` | 충돌 해결의 별개 구현; 평균 시간은 **uniform hashing 가정**에 의존한다고 Javadoc이 명시. worst-case 상수 시간 보장이 아님. |
| `41graph` | 8 | [Graph.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Graph.java) SHA `561e56b`, [BreadthFirstPaths.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/BreadthFirstPaths.java) SHA `9861555`, [DepthFirstPaths.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/DepthFirstPaths.java) SHA `1284fcf`, [CC.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/CC.java) SHA `b1b9d2b` | 무방향 그래프 인접 관계·BFS 무가중 간선 수 최단 경로·DFS·연결요소 구현 확인. 방향 그래프 사이클/위상 정렬의 직접 근거는 별도. |
| `42digraph` | 2 | [Digraph.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Digraph.java) SHA `3f71d31`, [Topological.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/Topological.java) SHA `69b8e29` | 방향 그래프/위상 정렬(DAG만 존재), DFS 구현. 무방향 사이클 검출과 적용 대상 구분. |
| `43mst` | 3 | [KruskalMST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/KruskalMST.java) SHA `e8e25c9`, [PrimMST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/PrimMST.java) SHA `36a61ac` | Kruskal union-find / Prim indexed heap, 비연결 그래프는 minimum spanning **forest** 생성. |
| `44sp` | 3 | [DijkstraSP.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/DijkstraSP.java) SHA `03f384e`, [BellmanFordSP.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/BellmanFordSP.java) SHA `5ab46ea`, [FloydWarshall.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/FloydWarshall.java) SHA `6d1978e` | Dijkstra 비음수 가중치 전제; Bellman–Ford reachable 음수 사이클; Floyd–Warshall all-pairs O(V³) 시간/O(V²) 추가 공간, 음수 사이클과 부동소수점·overflow 제약. #232 개별 안내를 뒷받침하지만 **원래 4.4 교재 본문의 직접 열람은 아님**. |
| `51radix` | 3 | [MSD.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/MSD.java) SHA `9fd1c2c`, [LSD.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/LSD.java) SHA `1e3aee4` | radix 정렬의 MSD/LSD 차이; 이 구현의 extended-ASCII 문자열/정수 처리 조건은 모든 Unicode 정렬의 일반 계약 아님. |
| `52trie` | 1 | [TrieST.java](https://github.com/kevin-wayne/algs4/blob/master/src/main/java/edu/princeton/cs/algs4/TrieST.java) SHA `eba9bee` | 256-way trie의 문자열 키/prefix 관련 구현. 일반 trie의 유일한 branching factor가 256이라는 뜻 아님. |
| `cheatsheet` | 1 | 해당 URL의 표는 검색 색인에서만 확인; 저자 GitHub에서 **동일 cheat sheet 원문을 직접 읽은 것은 아님** | 표의 worst/average case 조건(예: 균등 해시 가정)을 정확한 문맥과 함께 재검증할 때까지 미확정 유지. |

**18 URL 중 17 URL에 연계된 저자 공식 Java 구현을 직접 읽어 학습 적합성의 보조 근거를 확보했다.** 이 수치는 17 canonical URL 열람 성공이나 70 Concept–URL 관계 검증 완료가 아니다.

## 관계별 후속 판단 / 변경 보류

1. `dsa.core.stack-queue-deque.circular-queue`: 공식 `ResizingArrayQueue.java`에서 `first`/`last`의 wrap-around 및 `resize()`의 modulo로 설명 방향을 구체 확인. 기존 KEEP을 유지하되 canonical HTML 링크 자체는 원문 접근 미확정.
2. `dsa.core.search-sort.binary-search-boundary`: `BinarySearchST.rank()`는 정렬 배열 내 삽입 지점을 제공하지만 중복 키를 포함한 일반 `lower_bound/upper_bound` 구현과 같은 계약은 아니다. **SCOPE_NOTE_REVIEW** 후보로 유지; 현행 Concept의 설명/기존 다른 자료를 함께 읽기 전 무단 변경하지 않음.
3. `dsa.core.algorithm-selection.preprocessing-query-cost`: `DoublingTest`는 입력 크기별 실행 시간 측정일 뿐 전처리 + 질의 횟수 × 질의비용 식을 보장하지 않는다. 현행 relationNote가 이미 이 한계를 적시하므로 추가 중복 교정 불필요.
4. `dsa.core.graph-path.floyd-warshall`: 저자 코드의 음수 사이클, all-pairs, 시간/공간 제약을 확인. #232의 개별 relationNote와 모순 없음. 저자 구현의 수치 정확성 제한(overflow/rounding)은 코드 Javadoc 특유의 조건이며 일반 알고리즘 전체의 동일 수치 타입 강제가 아니다.
5. `dsa.core.sequential.doubly-linked-list`, `dsa.core.stack-queue-deque.monotonic-stack-queue`: 저자 GitHub에 이번에 읽힌 관련 코드가 없으므로 예전 §1.3 색인 발췌의 코드/연습 문제를 직접 verified로 상향하지 않음.

## Computer Architecture UMD — 독립 접근 재검사

현행 44 Concept–URL 관계/8 UMD 원본은 [선행 전체 조사표](umd-44-relationship-review.md)에 있다. 이번 검색/직접 요청에서 대표 `cache-organization`, `number-systems`, `multiprocessors` 원 URL이 이 웹 도구에서 `not accessible`을 반환했고, UMD 교재 루트 `/411/CA-online/index.html`은 HTTP 403. `/cmsc411/CA-online/` 및 하위 cache/memory URL의 별도 경로 시도도 접근 불가. 일부 UMD의 별도 `cmsc411/legacy/overview/chapter01.html` 강의는 검색 색인에서 CPU time·Amdahl 내용을 확인할 수 있지만 **원래 canonical UMD 44개를 검증한 증거가 아님**.

따라서 UMD **44/44 ACCESS_UNRESOLVED 유지**, broken/404 확정 0, 신규 `DIRECT_CONTENT_VERIFIED` 0. 구조상 44 관계의 전역 URL metadata를 추정 변경하거나 마구 대체 자료를 추가하지 않는다.

## 다음 검증 게이트

- DSA: 원본 18 URL의 실제 Reader/browser 접속·해당 절 직접 읽기 가능 여부를 우선 판정하고, `binary-search-boundary` 등 학습 전제 불일치가 증명되는 개별 관계에만 최소 수정. 변경 시 #232와 중복 방지, 전역 URL 메타데이터 동일성, 15Area reconcile 및 격리 Import idempotency 필요.
- UMD: 동일하게 8 원 URL의 실제 Reader 브라우저 접근·관련 chapter/PDF 전문 확인 후 관계별 범위 판정. 도구 접근 실패만으로 일괄 대체 금지.
- 이번 감사 문서의 출처 검증은 **기록만 남기는 단계**. CI나 Import를 실행한 것처럼 표시하지 않는다. 변경 파일은 이 문서 1개뿐이며 프로덕션 DB/Cloud Run은 건드리지 않는다.
