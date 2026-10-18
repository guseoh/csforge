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
- [x] 격리 PostgreSQL old→new 6개 Preview ERROR0 / Apply UPDATED 6 / full-pack exact reimport 3,380 UNCHANGED.
- [x] Concept ID, shared Reference ID, 개인 학습/퀴즈/오답 이력 불변.
- [x] 전체 15 Area 기존 URL 글로벌 메타데이터·관계/순서 변경 없음. 전체 canonical Import 성공으로 새 충돌·중복 오류 없음 확인.
- [x] DSA 영역 본문/Question 변경 없음. PR diff에서 Reference note 6줄 이외의 canonical delta 없음 확인.
- [x] 비운영 Reader 6개 안내·URL, 375/768/1280px light/dark·키보드·새 탭 Human Usage PASS.

**Draft·미병합**, Production Import/배포 금지. 사용자의 명시적 승인 없이 merge하지 않는다.

## 격리 Import / Human Usage 실행 증거 (2026-10-18)

- [Repository Validation #39133119631](https://github.com/guseoh/csforge/actions/runs/39133119631): 새 `DsaReferenceScopeCorrectionIntegrationTest`를 포함한 Backend tests, Backend build, frontend lint/tests/build, Compose 검사 SUCCESS. Cloud Run deploy SKIPPED.
- [격리 Chromium Human Usage #39133815845](https://github.com/guseoh/csforge/actions/runs/39133815845) SUCCESS. PostgreSQL 16.4 일회성 DB: `EMPTY → 3,380 CREATED / ERROR 0 → READY`. 실제 Concept application API의 6 Reference 각각 URL/relationNote 확인, React Reader **6개** 화면 캡처, 375/768/1280px × light/dark, 화면 overflow 0, keyboard focus→Enter→Princeton 새 탭→Reader 복귀 PASS. JS page exception 0.
- Artifact: `pr232-dsa-browser-evidence`([동일 실행](https://github.com/guseoh/csforge/actions/runs/39133815845))의 `report.json`과 한국어 스크린샷 PNG 6개. 실제 PNG를 내려받아 확인함. 콘솔에 비차단 404 경고 1건(리소스 경로 보고가 없는 경고)이 기록돼 ‘완전 무경고’라고 주장하지 않는다.
- 실제 운영 DB·배포·사용자 이력 변경 없음. QA 전용 `repository-validation.yml` 변경과 `browser-check.cjs`는 [원상 복구 커밋 `96aad749`](https://github.com/guseoh/csforge/commit/96aad749861b2e23279c355ef3bbc262578eef6d)에서 모두 제거하고 격리 실행 자원은 종료했다.
- **남은 게이트**: 브라우저 QA 파일 제거 후 최종 HEAD의 정규 Repository Validation SUCCESS 및 최종 diff/PR 상태 확인. 사용자 병합 승인 전 Draft 유지.
