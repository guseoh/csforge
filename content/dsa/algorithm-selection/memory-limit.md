---
kind: concept
contentKey: dsa.core.algorithm-selection.memory-limit
topicContentKey: dsa.core.algorithm-selection
slug: memory-limit
title: "메모리 한도(Memory Limit)"
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
    recommendation: "입력 크기와 기본 연산을 정하고 점근 시간·공간 및 분할 상환 비용을 분석한다."
    displayOrder: 1
---
# 메모리 한도(Memory Limit)

시간을 줄이기 위해 추가 메모리를 사용하는 알고리즘은 많다. 해시 테이블, 동적 계획법 테이블, 누적 합(prefix sum)처럼 값을 미리 저장하면 반복 계산이나 조회를 줄일 수 있지만 필요한 공간이 허용 범위를 넘으면 사용할 수 없다.

공간을 판단할 때는 단순히 원소 수만 보지 않고 **저장할 상태 수 × 상태 하나의 크기**를 먼저 계산한다. 알고리즘 분석에서는 이를 `O(n)`, `O(n²)`, `O(V²)` 같은 공간 복잡도로 표현한다.

평상시 사용하는 메모리뿐 아니라 **일시적으로 커지는 최대 메모리 사용량**도 고려해야 한다. 동적 배열이나 해시 테이블의 크기를 조정할 때는 기존 저장 공간과 새 저장 공간이 잠시 함께 존재할 수 있고, 병합 정렬처럼 별도의 임시 버퍼가 필요한 알고리즘도 있다.

```text
기본 저장 공간
+ 보조 자료구조
+ 임시·재구성 저장 공간
= 최대 메모리 사용량 후보
```

시간을 줄이는 대신 공간이 늘어나는 선택은 시간·공간 사이의 상충 관계다. 반대로 공간을 줄이는 최적화에서는 계산에 필요한 이전 상태나 결과를 복원하는 데 필요한 정보를 잃지 않는지 확인해야 한다.

따라서 좋은 시간 복잡도만 보고 후보를 결정하지 않고, **최대 입력에서 필요한 추가 공간과 순간 최대 사용량이 메모리 한도 안에 들어오는가**를 함께 확인해야 한다.
