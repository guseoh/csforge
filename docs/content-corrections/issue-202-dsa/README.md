# Issue #202 — Data Structures & Algorithms 정밀 교정

> Draft, 미병합, Production 미변경. **DSA Slice 진행 기록**이며 Issue #202 전체 종료나 최종 승인 판정이 아니다.

## 기준 · 범위

- 기준 `main`: `392ffccf90b733dfe191e222b2af15b407e42033`.
- 기존 [Wave 3 DSA 12 Topic·84 Concept·293 Question 전수 감사](../../content-audit/learning-experience-2026/wave-3/dsa.json) 기록과 [원본 findings](../../content-audit/learning-experience-2026/wave-3-findings.json), [carried finding](../../content-audit/learning-experience-2026/wave-3-carried-findings.json)을 연결한다.
- 원본 26개 발견(P0 9 / P1 9 / P2 8)과 이관 LEX-004(P2 1) **총 27개 발견 ID**를 현재 canonical과 재대조했다. 전부 최소 교정 대상으로 판정했다. 수정을 마쳤다고 해서 이번 작업에서 84 Concept/293 Question 전체를 다시 독립적으로 수기 재채점했다고 주장하지 않는다.
- **12개 Concept Markdown + 21개 Question = 33개 canonical 항목**, 소스 **23파일** 변경. 새로운 Concept/Question, 주제·영역 이동, 문제 유형/난도/정답 키/contentKey/Concept 연결 변경 없음. Concept frontmatter/Reference 보존.

## P0 9건 — 필수 기술적 정정

| Finding | 교정 핵심 |
| --- | --- |
| W3-DSA-020 | BFS parent가 최단 경로 복원의 유일한 방법은 아님. 원 그래프+dist를 통한 이전 정점 역탐색 가능성·비용 인정 |
| W3-DSA-022 | Kruskal D 오답이 정상적인 skip과 중복 해석되지 않게 가중치 순서/사이클 검사를 위반하는 문장으로 수정 |
| W3-DSA-025 | 구간 스케줄링 반례의 `[start,finish)` 경계 조건을 문항에 명시, B/C/D의 3개 선택 성립 |
| W3-DSA-009 | 선형 탐사 삭제에서 tombstone은 한 방법이며 클러스터 재삽입·backshift도 탐사 경로를 유지할 수 있음 |
| W3-DSA-010 | Hash resize에서 기대 Θ(n)에 새 용량 Θ(n)·분산·상수 해시/동등성 비용 전제 추가, 충돌 최악 경우 구별 |
| W3-DSA-018 | 재귀 점화식의 추가 작업을 O가 아닌 Θ로 두고 기저 비용 명시, tight bound 보장 |
| W3-DSA-014 | 미확인 원소 `[left,right)` vs 정답 경계 `[left,right]` 구분, all-false의 n도 처리 |
| W3-DSA-016 | Heap sort의 안정성을 보완하는 동률 기준은 임의 고유 ID가 아니라 원래 입력 순번 |
| W3-DSA-005 | Array vs linked-list **이미 구축된 자료의 순회**에서 cache/pointer chasing 비용과 **구축 시 할당** 비용 분리 |

## P1 9건 — 정확한 전제와 결과

| Finding | 교정 핵심 |
| --- | --- |
| W3-DSA-026 | 전처리 vs 반복 질의 독립 문항에 100ms/800ms/5ms·10회·원본 불변 조건 제공 |
| W3-DSA-001 | 비감소 정렬 전제를 lower-bound 불변식과 q2에 명시하고 정렬에 의한 suffix 성질 설명 |
| W3-DSA-023 | Prim lazy edge-heap O(E log E)/O(E) vs eager vertex-heap O(E log V)/O(V)·단순 그래프 조건 |
| W3-DSA-019 | 위상 정렬 순서 재현을 위한 (displayOrder, contentKey) 최종 고유 비교키 |
| W3-DSA-015 | 페이지네이션 문항을 데이터 불변 조건으로 한정하고 변경 데이터의 별도 snapshot 정책 지적 |
| W3-DSA-007 | Circular queue rear의 다음 삽입 위치 정의와 삽입 후 rear 갱신 시점 일치 |
| W3-DSA-008 | Monotonic deque에서 outgoing 값도 모르는 입력 전제 명시; index는 대표 수단일 뿐 |
| W3-DSA-011 | BST 탐색 q1의 삽입 순서, key 변경 q3의 root/위치 입력 전제 제공 |
| W3-DSA-012 | Tree traversal q2에 트리 자식 구조를 재명시하여 이전 q1에 의존하지 않게 함 |

## P2 8건 + 이관 1건 — 표현·중복 목표·상태 예시

| Finding | 교정 핵심 |
| --- | --- |
| W3-DSA-002 | 불변식 관련 한국어 조사 정정 |
| W3-DSA-021 | Bellman–Ford 보기 A rationale의 반박 방향 정정 |
| W3-DSA-024 | Prim '간선를' → '간선을' |
| W3-DSA-017 | 계수 정렬/병합 정렬의 조사 정정 |
| W3-DSA-003 | 동적 배열 배수 변경 시 단일 resize **기존 n개 복사량**과 이후 빈도·할당량 비교 |
| W3-DSA-004 | Doubly linked list의 head/tail sentinel 빈 상태·삽입·삭제 링크 도식 보강 |
| W3-DSA-006 | 중복 amortized latency 문항을 old/new 배열 공존 및 피크 메모리 실패 조건으로 전환 |
| W3-DSA-013 | Tree rotation/heap/trie 조사·접속 오류 정정 |
| LEX-004 | 0/1 배낭 weight 2/value 3/capacity 4: 순방향 dp4=6 오답 vs 역방향 dp4=3 정답. 초기화/계산순서와 공간최적화 책임 분리 |

## 기술 근거와 검증 경계

- [Princeton Algorithms 4e: LazyPrimMST](https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/LazyPrimMST.html) 와 [PrimMST](https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/PrimMST.html)에서 lazy·eager 구현의 E log E / E log V 경계 직접 확인.
- [Princeton MST 공식 강의](https://algs4.cs.princeton.edu/43mst/), [Princeton Hash Tables](https://algs4.cs.princeton.edu/34hash/)에서 MST cut와 해시 충돌·크기 조정 전제를 분리.
- 기존 canonical이 연결한 Cornell loop invariants, MIT dynamic programming, Princeton 그래프/정렬 강의 링크는 계속 보존한다. 보존한 URL의 원문이 모든 구현에서 같은 보장을 제공한다고 일반화하지 않는다.
- **Question 12파일 전체 JSON 파싱 결과** 293개 유지. 기존과 변경본 비교에서 변경 Question은 정확히 **21개**, 유형·난도·상태·정답 키·Concept link 등 메타데이터 불변, MC 단일 정답과 rationale·단답 acceptedAnswers 기본 검증 이상 0.
- **변경 Concept 12파일**은 변경 전후 YAML frontmatter 완전 동일 및 코드 펜스 균형 검증, 이상 0. 나머지 Concept/Question은 기존 Wave3 전수 감사 및 기본 Repository Validation을 활용한다.

## 남은 완료 게이트

1. [DSA Draft PR](https://github.com/guseoh/csforge/pulls)의 최신 HEAD Repository Validation SUCCESS.
2. 격리 PostgreSQL 16.4에서 실제 이전 main snapshot → 교정 적용, exact reimport UNCHANGED, 기존 학습/오답/복습 이력·stable ID 보존 확인.
3. Reader/Quiz 실제 프런트엔드 라우트를 375/1280px × light/dark에서 검증하되 API fixture 기반 자동 QA와 **실제 백엔드가 연결된 Human Usage Check**를 구별한다.
4. 사용자 승인 전 merge 금지, Production Import 금지. 다른 Area Draft PR #253/#254의 branch와 독립 유지.


## Historical PostgreSQL / Chromium 증거 (2026-10-20)

- [DSA correction historical import & Reader/Quiz #39420862319](https://github.com/guseoh/csforge/actions/runs/39420862319): **SUCCESS**, `historical-dsa-import`와 `dsa-reader-quiz` 모두 성공. 검증 HEAD `abf651a09448663865c617eac7a6da34b8e9bc58`.
- Testcontainers PostgreSQL 16.4에 전체 canonical 3,380개를 먼저 bootstrap한 후 **이전 main SHA `392ffccf`의 `content/dsa` Git archive snapshot**에서 바뀐 23개 파일을 복원. **12 Concept + 21 Question = 33 UPDATED**, 오류/생성/실패 0.
- 이후 교정된 23개 파일을 Preview/Apply하여 **33 UPDATED**로 복구했고, 동일 교정 파일의 exact replay는 **UPDATED 0**, 전체 canonical bootstrap 재import는 **3,380 UNCHANGED**, 오류 0.
- `personal_note`, `quiz_session`, `attempt`, `wrong_note`, `review_schedule`, `review_history`, `concept_progress` 등 개인/history 기록과 모든 Concept/Question ID 및 Reference 관계 총량의 변경 없음을 확인했다.
- Chromium에서는 실제 React Reader 4개 Concept (이진 탐색 경계, Hash resize, DP 계산 순서, lazy Prim) × 375/1280px × light/dark = **16조건**, 구간 스케줄링 SCENARIO Quiz 실제 교정 JSON 기반 답변 입력 × 4조건으로 **총 20조건 PASS**. `dsa-reader-quiz-light-dark` artifact에 screenshot 20장을 보존했다.
- 브라우저 QA는 실제 프런트엔드 컴포넌트/라우트를 실행했지만 **백엔드 API는 fixture**다. 실제 백엔드 연동 Human Usage Check는 미수행이며 Production/실제 사용자 데이터를 변경하지 않았다. 본 검증만으로 전체 84 Concept/293 Question 독립 신규 전수 재채점을 주장하지 않는다.
- 전용 일회성 test/script/workflow는 검증 성공 후 제거하고 실행 결과/JUnit XML/screenshot/본 근거 문서만 유지한다. 최종 정리 HEAD Repository Validation과 review thread/base drift를 별도로 확인한다.
