# Issue #222 R2 — DSA Reference 학습 범위 최소 교정

Base: `main 2862a92d9208153678f3b618df90fafe37cb2e09`. Source evidence: [PR #228 DSA 관계별 감사](https://github.com/guseoh/csforge/blob/2f26bd468635db71fa5dbccf0755d4a7aa6fef50/docs/content-corrections/issue-222-r2/dsa-preliminary.md).

## 변경 계약

**6개 Concept Markdown frontmatter의 관계별 `relationNote`만 추가.** URL, 전역 Reference `title/referenceType/language/depth/recommendation`, 정렬 순서, Concept identity/본문, Question, Curriculum, SVG, DB schema, 제품 코드는 변경하지 않는다. 원형 큐의 Reference는 그대로 KEEP한다. 기존 감사 원본과 재검토 대기 상태를 덮어쓰지 않는다.

| Concept 경로 | Princeton 절 | 적용할 정확한 학습 범위 |
| --- | --- | --- |
| `graph-path/floyd-warshall` | 44sp | 4.4절 연습문항 11과 저자 FloydWarshall.java에서 모든 정점 쌍 최단 경로 및 음수 사이클 처리 범위를 확인한다. 본문 중심 주제인 Dijkstra·Bellman–Ford 설명과 구분해 읽는다. |
| `sequential/doubly-linked-list` | 13stacks | 1.3절의 연결 리스트 입문과 별도 DoublyLinkedList.java 예제를 구분해 읽는다. 이중 연결 예제의 pre/post 센티널 및 prev/next 연결 갱신을 확인한다. |
| `stack-queue-deque/monotonic-stack-queue` | 13stacks | 1.3절 Web Exercises 62(Stock prices)의 인덱스 스택과 다음 큰 값 탐색 사례만 참고한다. 이 연습문항이 슬라이딩 윈도 단조 덱의 전체 구현을 설명하는 것은 아니다. |
| `algorithm-selection/preprocessing-query-cost` | 14analysis | 1.4절의 기본 연산 비용 모델과 더 빠른 탐색 알고리즘 설계를 배경으로 읽는다. 전처리·반복 질의·갱신 비용을 합산하는 식 자체가 원문에 명시되어 있다고 해석하지 않는다. |
| `trees/binary-tree-traversal` | 32bst | 3.2절 BST의 중위 순회(inorder)와 정렬 불변식, Exercises 7의 레벨 순회(level-order) 사례를 읽는다. 일반 이진 트리의 모든 전위·후위 순회를 설명하는 자료로 확대하지 않는다. |
| `recursion-backtracking/recursion-call-state` | 22mergesort | 2.2절 Top-down mergesort의 lo/mid/hi 분할, 재귀 호출과 복귀 뒤 merge 순서를 추적한다. JVM 호출 프레임의 실제 메모리 배치나 스택 한계를 규정하는 근거는 아니다. |

## 공식 근거

- [Princeton 4.4 Shortest Paths — Exercises 11](https://algs4.cs.princeton.edu/44sp/index.php), [FloydWarshall.java](https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/FloydWarshall.java.html)
- [Princeton 1.3 Stacks/Queues — Web Exercises 62](https://algs4.cs.princeton.edu/13stacks/), [DoublyLinkedList.java](https://algs4.cs.princeton.edu/13stacks/DoublyLinkedList.java.html)
- [Princeton 1.4 Analysis](https://algs4.cs.princeton.edu/14analysis/), [Princeton 3.2 BST](https://algs4.cs.princeton.edu/32bst/), [Princeton 2.2 Mergesort](https://algs4.cs.princeton.edu/22mergesort/index.php)

자료 일부는 원래 URL 직접 열람 시 403이며 검색 엔진의 공식 도메인 색인과 공개 저자 코드로 보완 대조했다. 전체 원문을 `DIRECT_CONTENT_VERIFIED`로 승격하거나 403을 broken link로 판정하지 않는다.

## 병합 전 검증 게이트

- [ ] 최종 HEAD Repository Validation CI.
- [ ] 격리 PostgreSQL old→new 6개 Preview ERROR0 / Apply UPDATED 6 / full-pack exact reimport 3,380 UNCHANGED.
- [ ] Concept ID, shared Reference ID, 개인 학습/퀴즈/오답 이력 불변.
- [ ] 전체 15 Area global URL metadata 충돌 0, 중복 관계·order 0.
- [ ] DSA 영역 Content/Question 변동 없음 확인.
- [ ] 비운영 Reader의 6개 안내·URL, 375/1280px light/dark·키보드·새 탭 Human Usage.

**Draft·미병합**, Production Import/배포 금지. 사용자의 명시적 승인 없이 merge하지 않는다.
