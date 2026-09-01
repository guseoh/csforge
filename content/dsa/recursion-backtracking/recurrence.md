---
kind: concept
contentKey: dsa.core.recursion-backtracking.recurrence
topicContentKey: dsa.core.recursion-backtracking
slug: recurrence
title: "Recurrence"
summary: "부분 문제 수·크기·단계 비용으로 재귀 실행 시간을 식으로 표현한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "재귀 호출 수와 입력 크기를 단계별 비용으로 분석하는 방법을 확인한다."
    displayOrder: 1
---
# Recurrence

### 재귀 코드를 비용 식으로 바꾸기

재귀 알고리즘은 실행 흐름이 여러 호출로 갈라지기 때문에 loop처럼 한 줄씩 반복 횟수를 세기 어렵다. 이때 recurrence는 크기 `n`의 문제 비용을 더 작은 문제의 비용과 현재 호출에서 드는 추가 비용으로 표현한다.

예를 들어 배열을 절반으로 나누고 각 절반을 처리한 뒤 `n`개 원소를 합치는 알고리즘이라면 다음처럼 쓸 수 있다.

```text
T(n) = 2T(n/2) + cn
```

`2T(n/2)`는 크기 `n/2`인 부분 문제 두 개의 비용이고, `cn`은 현재 단계에서 수행하는 선형 combine 비용이다. 식을 세울 때 가장 중요한 것은 공식을 외우는 것이 아니라 **코드의 각 작업이 어떤 항에 해당하는지 설명할 수 있는 것**이다.

### 호출 트리로 비용을 읽기

`T(n)=2T(n/2)+cn`을 호출 트리로 펼치면 각 level의 전체 combine 비용은 대략 `cn`이다.

```text
level 0       n                 비용 cn
             / \
level 1    n/2 n/2              합계 cn
           /\   /\
level 2  n/4 ... n/4            합계 cn

level 수 ≈ log₂ n
```

각 level에서 `cn`의 비용이 들고 level 수가 `log n`이므로 전체는 `O(n log n)`이 된다. 이 방식은 recurrence 결과를 암기하지 않고 **부분 문제 수와 tree 깊이로 직접 이유를 확인**하게 해준다.

### 분할 모양이 바뀌면 식도 바뀐다

`T(n)=T(n-1)+O(1)`과 `T(n)=2T(n/2)+O(n)`은 둘 다 재귀지만 비용 구조는 완전히 다르다. 첫 번째는 recursion depth가 `n`에 가깝고 두 번째는 균형 분할이라 `log n`에 가깝다.

또 `T(n)=T(n/2)+O(1)`은 한 단계마다 문제 하나만 절반으로 줄이므로 `O(log n)`이 된다. binary search가 대표적이다.

따라서 recurrence를 세울 때 최소한 다음을 확인해야 한다.

- 한 호출이 몇 개의 하위 호출을 만드는가
- 각 하위 호출의 입력 크기는 얼마인가
- 현재 호출에서 별도로 수행하는 작업은 얼마인가
- base case는 어디에서 멈추는가

### Base case와 종료는 복잡도보다 먼저다

`T(n)`을 계산할 수 있으려면 재귀가 실제로 종료해야 한다. 입력 크기가 줄지 않거나 base case가 도달 불가능하면 recurrence 분석 이전에 알고리즘 자체가 잘못된 것이다.

예를 들어 `solve(n)`이 매번 `solve(n)`을 그대로 호출한다면 `T(n)=T(n)+O(1)` 같은 식을 세워 복잡도를 구하는 것이 의미가 없다. 종료 조건과 progress가 correctness의 전제다.

### 점근식이 실제 latency의 전부는 아니다

Recurrence는 알고리즘의 연산 증가 구조를 설명하지만 실제 실행 시간의 모든 비용을 포함하지는 않는다. 같은 `O(n log n)`이라도 allocation, cache locality, function call overhead, I/O가 다르면 실제 성능 차이가 크게 날 수 있다.

특히 backend 처리에서 입력을 recursive chunk로 분할했다면 network round trip이나 database query가 각 node마다 추가되는지 확인해야 한다. 알고리즘 식에서 `O(1)`처럼 보이던 한 호출의 추가 작업이 실제로는 비싼 I/O라면 병목 위치가 완전히 달라진다.
