---
kind: concept
contentKey: dsa.core.search-sort.binary-search
topicContentKey: dsa.core.search-sort
slug: binary-search
title: "Binary Search"
summary: "정렬된 구간을 반으로 줄이는 탐색 상태를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Binary Search

Binary search는 **정렬되어 있다는 전제**를 이용해 한 번의 비교로 후보 구간의 절반을 버리는 탐색이다. Mid 값이 target보다 작다면 그보다 왼쪽 값도 target이 될 수 없고, 더 크다면 오른쪽 값을 버릴 수 있다.

```text
[3, 7, 11, 18, 23, 31, 42]
             ↑ mid=18, target=23
→ 오른쪽 구간만 남긴다.
```

핵심 invariant는 target이 존재한다면 현재 search interval 안에 남아 있다는 것이다. Inclusive `[left, right]` 또는 half-open `[left, right)` 중 어떤 표현을 쓰든, 비교 뒤에도 이 조건이 유지되도록 경계를 갱신해야 한다.

매 반복에서 후보 구간의 크기가 줄어들기 때문에 탐색 단계 수는 O(log n)이다. 반대로 `left`나 `right`를 잘못 갱신해 같은 mid를 다시 포함하면 구간이 줄지 않아 infinite loop가 생길 수 있다.

중복 값이 있을 때 임의의 일치 위치를 찾는 것과 첫 위치나 마지막 위치를 찾는 것은 다른 contract다. 후자의 경우에는 equality에서 즉시 종료하지 않고 boundary search invariant를 사용해야 한다.

Binary search의 빠른 탐색은 ordering invariant가 유효하다는 전제 위에 있다. 정렬되지 않은 입력에 그대로 적용하면 일부 후보를 잘못 버리므로 correctness 자체가 깨진다.
