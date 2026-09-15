---
kind: concept
contentKey: dsa.core.algorithm-selection.memory-limit
topicContentKey: dsa.core.algorithm-selection
slug: memory-limit
title: "Memory Limit"
summary: "시간 개선을 위한 추가 메모리가 실제 제한을 넘는 조건을 판단한다."
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
# Memory Limit

시간을 줄이기 위해 추가 메모리를 사용하는 알고리즘은 많다. Hash table, DP table, prefix sum처럼 미리 값을 저장하면 반복 계산이나 lookup을 줄일 수 있지만, 필요한 공간이 허용 범위를 넘으면 사용할 수 없다.

공간을 판단할 때는 단순히 원소 수만 보지 않고 **저장할 state 수 × state 하나의 크기**를 먼저 계산한다. 알고리즘 분석에서는 이를 O(n), O(n²), O(V²) 같은 space complexity로 표현한다.

또 steady-state 공간뿐 아니라 일시적인 peak도 고려해야 한다. Dynamic array나 hash table resize에서는 old/new storage가 잠시 함께 존재할 수 있고, merge sort처럼 별도의 temporary buffer가 필요한 알고리즘도 있다.

```text
기본 storage
+ auxiliary structure
+ temporary/rebuild storage
= peak memory 후보
```

시간을 줄이는 대신 공간이 늘어나는 선택은 trade-off다. 반대로 공간을 줄이는 optimization은 필요한 이전 state나 결과 복원 정보를 잃지 않는지 확인해야 한다.

따라서 좋은 시간 복잡도만 보고 후보를 결정하지 않고, **최대 입력에서 필요한 추가 공간과 peak가 memory limit 안에 들어오는가**를 함께 확인해야 한다.
