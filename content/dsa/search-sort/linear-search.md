---
kind: concept
contentKey: dsa.core.search-sort.linear-search
topicContentKey: dsa.core.search-sort
slug: linear-search
title: "Linear Search"
summary: "순차 검사와 조기 종료의 correctness·최악 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Linear Search

Linear search는 첫 원소부터 차례대로 target과 비교하며 후보를 하나씩 제거한다. 별도의 정렬이나 index가 없어도 사용할 수 있다는 점이 장점이다.

```text
[7, 2, 9, 4, 5], target = 4
7 ✗ → 2 ✗ → 9 ✗ → 4 ✓
```

First match를 찾는 문제라면 현재 index 이전의 모든 원소를 이미 검사했고 target이 아니었다는 invariant를 유지할 수 있다. Equality가 성립하면 즉시 반환하고, 끝까지 도달하면 target이 존재하지 않는다는 결론을 낸다.

Target이 첫 위치에 있으면 한 번의 비교로 끝나지만, 마지막에 있거나 존재하지 않으면 n개를 모두 확인해야 하므로 worst-case는 O(n)이다. Average cost를 말하려면 target 위치나 존재 확률에 대한 분포 가정이 필요하다.

중복 값에서 첫 일치, 아무 일치, 모든 일치 중 무엇을 원하는지도 먼저 정해야 한다. 모든 일치를 찾아야 한다면 첫 equality에서 종료할 수 없다.

Linear search는 n이 작거나 검색이 한 번뿐일 때 충분히 좋은 선택일 수 있다. 반복 lookup을 위해 정렬이나 별도 index를 만드는 비용이 더 큰지까지 함께 비교해야 한다.
