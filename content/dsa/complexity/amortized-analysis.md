---
kind: concept
contentKey: dsa.core.complexity.amortized-analysis
topicContentKey: dsa.core.complexity
slug: amortized-analysis
title: "Amortized Analysis"
summary: "드물게 비싼 operation을 전체 operation sequence의 총비용으로 묶어 amortized bound를 계산한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Amortized Analysis

어떤 자료구조의 operation은 대부분 싸지만 가끔 매우 비쌀 수 있다. 각 operation의 worst case만 따로 보면 전체 sequence 비용을 실제보다 지나치게 크게 평가할 수 있다. Amortized analysis는 **연속된 여러 operation의 총비용을 분석해 한 operation당 보장되는 평균 비용을 구하는 방법**이다.

이는 input distribution을 가정하는 average-case analysis와 다르다. 확률적인 평균을 사용하는 것이 아니라, 가능한 operation sequence의 총비용을 묶어 분석한다.

대표적인 예가 dynamic array append다. Capacity가 남아 있을 때 append는 마지막 위치에 값을 쓰면 끝나지만, 배열이 가득 차면 더 큰 배열을 만들고 기존 원소를 복사해야 한다. Capacity를 1, 2, 4, 8처럼 두 배씩 늘린다면 `n`개의 원소를 추가하는 동안 발생하는 복사량은 다음과 같이 기하급수적으로 증가한다.

```text
1 + 2 + 4 + 8 + ... < 2n
```

따라서 일반 append `n`번과 resize copy를 모두 합쳐도 `n`번 append의 총비용은 `O(n)`이다. 결과적으로 append 한 번의 amortized cost는 `O(1)`이다.

여기서 **resize가 일어난 특정 append 자체가 O(1)인 것은 아니다.** 그 operation은 `O(n)` 복사를 수행할 수 있다. 다만 비싼 operation이 드물게 발생하므로 전체 sequence에 나누었을 때 상수 비용으로 제한된다.

반대로 capacity를 매번 `+1`만 늘리면 복사량이 `1 + 2 + ... + (n-1) = O(n²)`가 되어 amortized append도 `O(n)`이 될 수 있다. 즉 amortized bound는 자료구조가 비싼 상태 변화를 얼마나 자주 발생시키는지와 직접 연결된다.
