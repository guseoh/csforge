---
kind: concept
contentKey: dsa.core.search-sort.binary-search-boundary
topicContentKey: dsa.core.search-sort
slug: binary-search-boundary
title: "Binary Search Boundary"
summary: "lower/upper bound를 predicate boundary 문제로 보고 left·right invariant와 종료 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "binary search의 logarithmic range reduction과 boundary condition을 확인한다."
    displayOrder: 1
---
# Binary Search Boundary

### 존재 여부가 아니라 '조건이 처음 바뀌는 지점'을 찾는다

중복이 있는 정렬 배열에서는 target 하나를 찾는 것보다 경계를 찾는 문제가 자주 나온다.

```text
[1, 2, 2, 2, 5, 8]
```

`target=2`일 때 lower bound는 `value >= 2`가 처음 참이 되는 index 1이고, upper bound는 `value > 2`가 처음 참이 되는 index 4다. 따라서 같은 binary search라도 비교 조건과 버리는 구간이 달라진다.

### boundary search는 monotonic predicate를 찾는 문제로 일반화할 수 있다

정렬 배열에서 `value >= target`을 평가하면 왼쪽에서는 false가 이어지다가 어느 지점부터 true가 계속된다.

```text
index:      0 1 2 3 4 5
value:      1 2 2 2 5 8
>= 2 ?:     F T T T T T
               ↑ first true
```

binary search는 이 `false ... false | true ... true` 경계의 첫 true를 찾는 방식으로 이해할 수 있다. 이렇게 보면 timestamp cutoff, version threshold, capacity condition처럼 monotonic predicate를 만족하는 첫 위치를 찾는 문제에도 같은 사고를 적용할 수 있다.

### half-open interval에서는 [left, right)에 답이 존재한다는 invariant를 유지한다

대표적인 lower-bound 구현에서는 `right = n`으로 두고 `[left,right)`를 후보 구간으로 사용한다. `mid`가 조건을 만족하면 mid도 정답 후보이므로 `right = mid`, 만족하지 않으면 mid까지는 정답이 아니므로 `left = mid + 1`로 이동한다.

```text
while left < right:
    mid = left + (right-left)/2
    if a[mid] >= target:
        right = mid
    else:
        left = mid + 1
```

매 반복에서 interval이 줄고 종료 시 `left == right`가 첫 true 위치가 된다.

### lower와 upper의 차이는 비교 연산 하나지만 의미는 다르다

lower bound는 `>= target`, upper bound는 `> target`을 기준으로 한다. 중복 2가 세 개 있을 때 lower는 첫 2를, upper는 마지막 2 바로 다음을 가리킨다. 그래서 `[lower, upper)`의 길이로 target count를 계산할 수도 있다.

비교 연산 하나를 잘못 쓰면 off-by-one이 아니라 API semantics 자체가 바뀐다.

### boundary test는 네 가지 극단을 반드시 포함한다

- empty input
- 모든 값이 target보다 작음 → boundary = n
- 모든 값이 target 이상 → boundary = 0
- 중복이 여러 개 존재

이런 입력에서 loop가 종료하고 index가 `[0,n]` 범위에 남는지 확인하면 interval convention을 섞어서 생기는 많은 bug를 잡을 수 있다.
