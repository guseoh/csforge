---
kind: concept
contentKey: dsa.core.search-sort.stable-sort
topicContentKey: dsa.core.search-sort
slug: stable-sort
title: "Stable Sort"
summary: "비교 key가 같은 원소의 원래 상대 순서를 보존하는 안정성과 multi-key ordering의 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stability가 동일 key 원소의 상대 순서를 보존하는 의미와 sorting application을 확인한다."
    displayOrder: 1
---
# Stable Sort

### 동일한 sort key 사이의 원래 순서를 보존한다

stable sort는 comparator가 두 원소를 같은 key라고 판단할 때 입력에서 먼저 있던 원소가 결과에서도 먼저 남도록 보장한다.

```text
input
(A, score=10)
(B, score=20)
(C, score=10)

score ascending stable sort
→ A(10), C(10), B(20)
```

A와 C는 score가 같지만 입력에서 A가 먼저였으므로 결과에서도 A가 C보다 앞선다. unstable sort에서는 C,A 순서가 되어도 sort key 관점에서는 정렬 자체가 틀린 것은 아니다.

### stability는 다중 기준 정렬을 단계적으로 만들 수 있게 한다

예를 들어 먼저 `createdAt`으로 정렬한 뒤 `priority`로 stable sort하면 같은 priority 그룹 안에서 기존 createdAt 순서가 유지된다. 즉 마지막 stable sort가 앞 단계 ordering을 tie-breaker처럼 보존할 수 있다.

하지만 comparator 하나로 `(priority, createdAt, id)`를 직접 정의하는 것과 단계적 stable sort는 구현 방식이 다를 뿐, 최종 ordering contract를 먼저 명확히 해야 한다.

### deterministic ordering과 stable sort는 같은 말이 아니다

stable sort는 **현재 input order를 equal-key tie-breaker로 보존**한다. 그런데 DB나 distributed source에서 input order 자체가 매번 같다는 보장이 없다면 stable sort만으로 API 결과가 deterministic해지지는 않는다.

목록 pagination처럼 호출 간 동일 ordering이 필요하면 sort key가 같은 row 사이에 unique ID 같은 명시적 final tie-breaker를 두는 편이 안전하다.

```text
ORDER BY score DESC, id ASC
```

이건 stable algorithm 여부와 별도의 API ordering contract다.

### stability에는 구현 비용이 붙을 수 있다

어떤 알고리즘은 자연스럽게 stable하게 구현하기 쉽고, 어떤 알고리즘은 in-place swap 때문에 equal-key 순서를 쉽게 바꾼다. stability를 추가하려면 extra buffer나 original index 같은 metadata를 사용할 수도 있다.

따라서 `stable이 항상 더 좋다`가 아니라 결과 semantics에서 equal-key order가 중요한지 먼저 판단하고 time/space 비용과 함께 선택한다.
