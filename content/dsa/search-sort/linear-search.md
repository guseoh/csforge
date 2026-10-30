---
kind: concept
contentKey: dsa.core.search-sort.linear-search
topicContentKey: dsa.core.search-sort
slug: linear-search
title: "선형 탐색(Linear Search)"
summary: "순차 검사와 조기 종료의 정확성·최악 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/31elementary/"
    title: "Algorithms, 4th Edition: Elementary Symbol Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "순차 탐색과 정렬 배열의 이진 탐색 전제·비용 및 순서 기반 연산을 비교한다."
    displayOrder: 1
---
# 선형 탐색(Linear Search)

선형 탐색은 첫 원소부터 차례대로 대상과 비교하며 후보를 하나씩 제거한다. 별도의 정렬이나 인덱스가 없어도 사용할 수 있다는 점이 장점이다.

```text
[7, 2, 9, 4, 5], target = 4
7 ✗ → 2 ✗ → 9 ✗ → 4 ✓
```

First match를 찾는 문제라면 현재 인덱스 이전의 모든 원소를 이미 검사했고 대상이 아니었다는 불변식을 유지할 수 있다. Equality가 성립하면 즉시 반환하고, 끝까지 도달하면 대상이 존재하지 않는다는 결론을 낸다.

대상이 첫 위치에 있으면 한 번의 비교로 끝나지만, 마지막에 있거나 존재하지 않으면 n개를 모두 확인해야 하므로 최악의 경우는 O(n)이다. Average cost를 말하려면 대상 위치나 존재 확률에 대한 분포 가정이 필요하다.

중복 값에서 첫 일치, 아무 일치, 모든 일치 중 무엇을 원하는지도 먼저 정해야 한다. 모든 일치를 찾아야 한다면 첫 equality에서 종료할 수 없다.

선형 탐색은 n이 작거나 검색이 한 번뿐일 때 충분히 좋은 선택일 수 있다. 반복 조회를 위해 정렬이나 별도 인덱스를 만드는 비용이 더 큰지까지 함께 비교해야 한다.
