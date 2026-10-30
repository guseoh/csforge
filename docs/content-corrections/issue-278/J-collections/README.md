# #278 Batch — J-collections

기준: `refactor` `786b25a9f4d0a08477e9c87da34122730037962b`, 검토일 2026-10-28 KST.

**9 Concept / 51 Question 전수 검토 완료.** 구현·검증 기록이며 독립 리뷰 승인을 대신하지 않습니다.

## Concept 검토

| Concept | #277 목표 / 결과 | 정확성·설명·문체·Markdown 검토 |
| --- | --- | --- |
| `arraylist-linkedlist-tradeoff` | V1 / DONE | 참조 슬롯/연결 두 행 구조 inline RESTYLE, 탐색+연결 비용과 물리 배치 경계 |
| `hashmap-hashing-collision` | V2 / DONE | Aa/BB 고정 입력과 충돌·동등성·value 반환·miss V2; 특정 bucket·equals 호출 횟수 비보장 |
| `hashset-set-semantics` | NONE / NO_VISUAL_NEEDED | add 반환값·충돌과 중복·가변 원소·순회 순서 검토; 중복 도식 없음 |
| `immutable-unmodifiable-collections` | V1 / DONE | view의 구조 공유와 copyOf의 구조 분리/가변 원소 공유 V1; 깊은 복사·새 할당 비보장 |
| `iterable-iterator-foreach-modification` | V1 / DONE | remove 지원 반복자의 유효 순서 V1, optional 연산·best-effort fail-fast·배열 foreach 분리 |
| `list-set-map-contracts` | V1 / DONE | List 순서/중복·Set 동등성·Map 세 뷰의 기반 관계 검토, view V1 |
| `priorityqueue` | V3 / DONE | 기존 V3 KEEP, 중복 ASCII 제거; head·동률·순회·원소 변경·JDK 배열 경계 |
| `queue-deque-arraydeque` | V1 / DONE | Queue 전체=FIFO 일반화 교정, 앞/뒤 V1과 예외/특별값·null·동시성 계약 |
| `sorted-collections-tree` | NONE / NO_VISUAL_NEEDED | 비교 0·범위 조회·복잡도 확인; equals 불일치 시 일반 Set 계약 위반 명시 |

본문의 유효한 합쇼체·예시·학습 순서를 유지했습니다. 구조 ASCII는 필요한 도식/문장으로 통합하고, 코드·수학 관계·실제 출력 표본은 보존했습니다. NONE 항목에 억지로 도식을 추가하지 않았습니다.

## Question 전수 검토

prompt·정답·선택지와 근거·해설/모범 답안·난이도·Concept 연결 51개를 모두 대조했습니다. 3개만 필요한 교정을 했고 나머지 48개는 유지했습니다. **정답 키·난이도·문항/선택지 key와 순서·Concept 연결은 모두 유지**했습니다.

| Question | 교정 근거 |
| --- | --- |
| `list-set-map-contracts.q2` | TreeSet 비교 기준이 equals와 다르면 일반 Set 계약을 위반할 수 있음을 명시 |
| `hashmap-hashing-collision.q1` | 동일 참조 경로를 포함하고 equals 호출 횟수 보장으로 읽히지 않게 교정 |
| `hashset-set-semantics.q4` | C의 오류는 최종 size라는 점을 정확히 설명 |

모든 문항의 KEEP/CORRECTED 판정, 변경 필드와 검토 대상 SHA-256은 [review.json](review.json)에 있습니다.

## 도식과 Reference

| 기존 자산 | 판정 | 적용 |
| --- | --- | --- |
| `array-list-linked-list.svg` | RESTYLE | 참조 슬롯/이중 연결의 두 행 구조 유지 |
| `hashmap-buckets.svg` | REBUILD | 충돌 후보·동등성·value/miss V2 |
| `기존 min-heap 선언` | KEEP | 삽입·poll·중간/완료 상태·역이동 V3 유지 |

외부 SVG 파일 자체는 이전에 저장된 Markdown과의 호환을 위해 보존했습니다. 이번 canonical 본문은 승인된 inline 선언을 사용합니다. Java 기존 SVG 27개와 다른 Java Topic/Network 파일은 변경하지 않았습니다.

기존 공식 JLS/Java SE 25 API 참조와 relationNote를 검토했습니다. 전체 URL과 확인 방식은 [공통 Reference 기록](../java-batch/references.json)에 있습니다. D2 보조 자료는 역사적 구현/인코딩 사례로 유지하며 Java 25 규범으로 사용하지 않습니다.

## 검증

- 격리 PostgreSQL: 이 Topic 전체 Preview **ERROR=0**, Apply 성공, 동일 파일 재Preview **61개 전부 UNCHANGED**, 재Apply 후에도 개인 이력 동일.
- 9개 Concept에 진도·북마크·노트·quiz/attempt/선택지·오답·복습 이력을 심고 업데이트 전후를 비교했습니다. 이력 8개 테이블과 모든 Question/선택지 ID·정답·연결을 보존했습니다.
- 실제 Markdown 전체 렌더링과 선언 검증은 Frontend Topic별 테스트에서 수행했습니다. 다크/라이트 × 1440px/390px 브라우저 검사에서 도식 대체 오류·SVG 텍스트 넘침이 없었습니다.
- Java 25 compiler/API 프로브, 전체 Backend 54 suite/190 tests(실패 0·skip 1), 최종 콘텐츠 4 suite/10 tests(실패·skip 0), Frontend 73 files/529 tests와 lint/build, Compose 검증 통과.
- 명령·통합 테스트 범위와 결과는 [Batch 보고서](../java-batch/README.md), [검증 집계](../java-batch/verification.json), [브라우저 기록](../java-batch/browser-qa.json)을 참조하세요.

## 보존과 남은 범위

`contentKey`, Topic/slug/title/level/status/order, 문항 정답과 선택지 식별자를 보존했습니다. DB schema·Reader/Quiz 전체 구조·운영 데이터는 변경하지 않았습니다. `J-object-model`은 기존 독립 리뷰 대기 상태로 유지합니다. 기존 공통 UI 디자인/라이트 제목 대비는 [후속 재검토 목록](../java-batch/design-followups.md)에 기록했습니다.
