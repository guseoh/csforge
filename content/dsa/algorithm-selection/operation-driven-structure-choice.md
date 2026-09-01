---
kind: concept
contentKey: dsa.core.algorithm-selection.operation-driven-structure-choice
topicContentKey: dsa.core.algorithm-selection
slug: operation-driven-structure-choice
title: "Operation-Driven Structure Choice"
summary: "자료의 이름이 아니라 자주 수행하는 operation과 유지해야 할 invariant를 기준으로 자료구조를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Operation-Driven Structure Choice

자료구조는 “빠른 것”을 고르는 대상이 아니라 **어떤 operation을 얼마나 자주 수행하는가**에 맞춰 고르는 도구다. 같은 10만 개의 key를 저장하더라도 exact lookup이 대부분인지, 정렬 순회가 많은지, 최소값을 반복해서 꺼내는지, range query가 필요한지에 따라 좋은 선택이 달라진다.

예를 들어 hash table은 좋은 hash와 적절한 load factor라는 전제에서 exact lookup을 expected `O(1)`에 제공하지만 key 순서를 보장하지 않는다. balanced search tree는 lookup·insert·delete를 `O(log n)`에 수행하면서 ordered traversal과 range query를 지원한다. heap은 최소/최대 원소를 반복해서 꺼내는 데 유리하지만 arbitrary key lookup이나 전체 정렬 순회에는 적합하지 않다.

### workload를 operation 비율로 쓴다

막연히 “조회가 많다”라고 말하지 말고 workload를 더 구체적으로 적는다.

```text
exact lookup      70%
insert            10%
delete             5%
range query        15%
```

이런 workload에서 exact lookup만 보고 hash table을 고르면 range query가 매번 전체 scan이 될 수 있다. 반대로 range query가 거의 없는데 ordered tree를 유지하면 필요하지 않은 ordering 비용을 계속 지불할 수 있다.

Operation 하나의 Big-O만 비교하는 것도 부족하다. iteration order가 deterministic해야 하는지, duplicate key를 허용하는지, min/max를 동시에 추적해야 하는지 같은 invariant가 선택을 제한한다.

### 대표 자료구조를 operation으로 비교한다

| 구조 | 강한 operation | 주의할 경계 |
| --- | --- | --- |
| Array | index access, sequential scan | 중간 insert/delete 이동 비용 |
| Hash table | exact key lookup | ordering/range query 약함, collision 전제 |
| Balanced tree | ordered lookup, range | hash보다 높은 상수와 pointer 비용 |
| Heap | repeated min/max | arbitrary search와 range에 부적합 |
| Trie | prefix traversal | alphabet/노드 수에 따른 memory 비용 |

이 표는 정답표가 아니라 후보를 좁히는 출발점이다. 실제 구현의 cache locality, memory overhead, update 패턴까지 함께 봐야 한다.

### 여러 요구를 한 구조에 억지로 넣지 않는다

모든 operation을 동시에 최적으로 만드는 단일 자료구조는 드물다. 그래서 canonical data는 한 구조로 유지하면서 필요에 따라 별도의 index나 derived structure를 둘 수도 있다. 다만 파생 구조를 추가하면 preprocessing/update/freshness 비용이 생기므로 앞에서 배운 trade-off와 다시 연결된다.

자료구조 선택의 질문은 결국 “HashMap이 빠른가 Tree가 빠른가”가 아니다. **우리 workload의 핵심 operation은 무엇이고, 그 operation을 위해 어떤 invariant와 비용을 지불할 것인가**가 정확한 질문이다.
