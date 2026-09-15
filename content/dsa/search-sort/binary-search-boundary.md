---
kind: concept
contentKey: dsa.core.search-sort.binary-search-boundary
topicContentKey: dsa.core.search-sort
slug: binary-search-boundary
title: "Binary Search Boundary"
summary: "left·right invariant로 lower/upper boundary를 구현하는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Binary Search Boundary

Boundary search는 특정 값을 하나 찾는 것이 아니라 **조건이 처음 false에서 true로 바뀌는 위치**를 찾는다. 정렬 배열에서 lower bound는 `value >= target`이 처음 참인 위치이고, upper bound는 `value > target`이 처음 참인 위치다.

```text
value:   1 2 2 2 5 8
>= 2 ?:  F T T T T T
           ↑ lower bound
```

Half-open interval `[left, right)`를 사용한다면 답 후보가 항상 그 구간 안에 있다는 invariant를 유지할 수 있다. Mid가 조건을 만족하면 mid도 답일 수 있으므로 `right = mid`, 만족하지 않으면 mid까지는 답이 아니므로 `left = mid + 1`로 이동한다.

```text
while left < right:
    mid = left + (right - left) / 2
    if predicate(mid):
        right = mid
    else:
        left = mid + 1
```

매 반복에서 후보 구간이 줄고 종료 시 `left == right`가 첫 true 위치가 된다. 모든 값이 조건을 만족하지 않으면 결과는 `n`, 처음부터 모두 만족하면 0이 될 수 있으므로 반환 범위 `[0, n]`도 contract의 일부다.

Lower bound와 upper bound는 비교 조건 하나가 다르지만 의미가 다르다. 중복 값의 개수는 `[lower, upper)` 길이로 구할 수 있기 때문에 `<`, `<=`, `>=`, `>` 중 어떤 predicate를 사용하는지 정확히 고정해야 한다.
