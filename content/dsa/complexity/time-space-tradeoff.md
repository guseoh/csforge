---
kind: concept
contentKey: dsa.core.complexity.time-space-tradeoff
topicContentKey: dsa.core.complexity
slug: time-space-tradeoff
title: "Time-Space Trade-off"
summary: "추가 메모리를 사용해 반복 계산이나 탐색 시간을 줄이는 선택과 그 반대 방향의 비용을 분석한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Time-Space Trade-off

알고리즘은 실행 시간을 줄이기 위해 추가 메모리를 사용할 수도 있고, 메모리를 아끼는 대신 같은 계산이나 탐색을 반복할 수도 있다. 이런 선택을 time-space trade-off라고 한다.

예를 들어 배열에서 값의 존재 여부를 여러 번 검사해야 한다면 매번 선형 탐색을 수행하는 대신 값을 hash set에 미리 저장할 수 있다. 전처리와 추가 공간을 지불하지만 이후 조회 비용을 크게 줄일 수 있다. Prefix sum도 원본 배열 외에 누적합을 저장하는 대신 반복 구간합 query를 빠르게 답하는 같은 유형의 선택이다.

```text
추가 저장 없음
  → memory 적음
  → 반복 계산/탐색 가능

추가 상태 저장
  → memory 증가
  → 이후 연산 비용 감소 가능
```

반대로 모든 중간 결과를 저장하는 것이 항상 좋은 것은 아니다. 입력 크기가 크거나 저장한 상태의 수명이 짧다면 추가 공간이 이득보다 클 수 있다. 어떤 정보를 저장해야 하는지, 그 정보가 이후 몇 번 재사용되는지와 memory limit을 함께 봐야 한다.

핵심은 **시간 복잡도 하나만 최소화하는 것이 아니라 주어진 입력 크기와 메모리 제한 아래에서 전체 비용을 선택하는 것**이다.
