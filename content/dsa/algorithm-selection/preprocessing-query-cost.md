---
kind: concept
contentKey: dsa.core.algorithm-selection.preprocessing-query-cost
topicContentKey: dsa.core.algorithm-selection
slug: preprocessing-query-cost
title: "전처리와 질의 비용"
summary: "초기 전처리 비용과 반복 질의 비용의 합을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 기본 연산을 정하고 점근 시간·공간 및 분할 상환 비용을 분석한다."
    displayOrder: 1
---
# 전처리와 질의 비용

전처리는 초기 비용을 먼저 지불해 이후 반복 질의의 비용을 줄이는 전략이다. 정렬 후 이진 탐색을 사용하거나 누적 합(prefix sum)을 만들어 구간 합 질의를 빠르게 처리하는 것이 대표적이다.

전체 비용은 한 번의 질의만 보지 않고 다음처럼 생각해야 한다.

```text
총 비용
= 전처리 비용
+ 질의 횟수 × 질의 한 번의 비용
+ 필요한 갱신·유지 비용
```

예를 들어 매번 선형 탐색하면 Q개의 질의에 O(Qn)이 들 수 있다. 한 번 O(n log n)에 정렬한 뒤 각 질의를 O(log n)에 처리하면 O(n log n + Q log n)이 된다. 질의가 적다면 전처리 비용이 더 클 수 있지만 반복 횟수가 많아지면 초기 비용을 회수할 수 있다.

원본 데이터가 자주 바뀌면 전처리된 구조를 다시 계산하거나 갱신하는 비용도 포함해야 한다. 변경되지 않는 데이터에서 반복 구간 합을 계산한다면 누적 합이 잘 맞지만, 갱신이 빈번하다면 다른 자료구조가 더 적합할 수 있다.

따라서 전처리 여부는 **초기 비용, 질의 횟수, 질의당 절감량, 데이터 갱신 빈도**를 함께 비교해 결정한다.
