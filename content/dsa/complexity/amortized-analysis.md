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
    recommendation: "operation 비용을 입력 크기와 실행 sequence 관점에서 분석하는 방법을 확인한다."
    displayOrder: 1
---
# Amortized Analysis

### 평균 입력을 가정하는 분석과는 다르다

어떤 operation은 대부분 싸지만 가끔 매우 비쌀 수 있다. 이때 각 operation의 worst case만 보고 구조 전체를 평가하면 실제 sequence의 비용을 지나치게 크게 잡을 수 있다.

Amortized analysis는 **한 operation의 평균 실행 시간을 경험적으로 측정하는 것**이 아니라, worst-case 입력 sequence 전체에 들어가는 총비용을 여러 operation에 나누어 보는 분석이다. 확률적인 input distribution을 가정하는 average-case analysis와도 다르다.

대표적인 예가 dynamic array append다. Capacity가 남아 있으면 새 원소를 뒤에 쓰는 일만 필요하지만, capacity가 꽉 차면 더 큰 배열을 만들고 기존 원소를 모두 복사해야 한다.

### Capacity를 두 배로 늘릴 때 총 복사량을 세어 보자

초기 capacity가 1이고 꽉 찰 때마다 두 배로 늘린다고 하자. 원소를 `n`개까지 append하는 동안 resize copy 크기는 대략 다음처럼 증가한다.

```text
1 + 2 + 4 + 8 + ...
```

`n` 직전의 가장 큰 power of two까지 더하면 이 합은 `2n`보다 작다. 일반 append 자체의 `n`번 write와 합쳐도 총 operation 수는 `O(n)`이다.

따라서 `n`번 append sequence의 총비용이 O(n)이므로 append 한 번의 amortized cost는 O(1)이다.

여기서 중요한 점은 **resize가 일어난 바로 그 append가 O(1)이라는 뜻은 아니라는 것**이다. 특정 append는 O(n) copy를 수행할 수 있지만, 이런 비싼 사건이 충분히 드물게 발생하기 때문에 전체 sequence에 나누면 상수 amortized bound가 된다.

### Growth factor가 왜 중요한가

Capacity를 `+1`씩만 늘린다고 해 보자. Size가 1, 2, 3, ...일 때 거의 매 append마다 기존 원소를 복사해야 한다.

```text
1 + 2 + 3 + ... + (n-1) = O(n²)
```

이 경우 n번 append의 총비용이 O(n²)이므로 append amortized cost도 O(n)이 된다. Dynamic array가 보통 multiplicative growth를 사용하는 이유다.

반대로 growth factor를 지나치게 크게 잡으면 resize 횟수는 줄지만 사용하지 않는 capacity와 순간 memory peak가 커진다. 실제 implementation에서는 allocator, memory limit와 copy latency까지 고려해야 한다.

### Aggregate, accounting, potential method는 같은 질문을 다른 방식으로 푼다

Aggregate method는 지금처럼 operation sequence 전체 비용을 먼저 구하고 operation 수로 나눈다.

Accounting method는 싼 operation에 실제 비용보다 조금 더 큰 'credit'을 부과하고 그 credit을 나중의 비싼 operation 비용에 사용한다고 생각한다.

Potential method는 자료구조 상태에 저장된 future work를 potential function으로 표현해 실제 비용과 potential 변화의 합을 amortized cost로 계산한다. 세 방법은 표현 방식이 다르지만 '드문 비싼 operation의 비용이 sequence 전체에서 어떻게 지불되는가'를 설명한다.

### Amortized O(1)은 latency spike가 없다는 뜻이 아니다

Backend에서 dynamic buffer나 in-memory queue가 amortized O(1) append를 제공하더라도 resize가 발생한 한 요청은 큰 copy와 allocation으로 지연될 수 있다. Average throughput에는 문제가 없어도 p99 latency나 memory peak에는 영향을 줄 수 있다.

그래서 latency-sensitive path에서는 초기 capacity 예약, chunked structure 또는 growth policy 변경을 검토할 수 있다. 다만 예상 최대 크기를 무조건 preallocate하면 memory를 낭비할 수 있으므로 workload size distribution을 측정해 결정한다.
