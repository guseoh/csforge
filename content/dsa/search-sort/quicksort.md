---
kind: concept
contentKey: dsa.core.search-sort.quicksort
topicContentKey: dsa.core.search-sort
slug: quicksort
title: "Quicksort"
summary: "pivot partition이 재귀 문제 크기를 결정하고 분할 품질이 평균·최악 비용과 stack depth를 바꾸는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/23quicksort/"
    title: "Algorithms, 4th Edition: Quicksort"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "partition invariant, pivot choice와 quicksort의 평균·최악 비용을 확인한다."
    displayOrder: 1
---
# Quicksort

### pivot으로 현재 문제를 두 부분으로 나눈다

quicksort는 pivot 하나를 선택하고 partition을 수행해 pivot보다 작은 쪽과 큰 쪽을 만든 뒤 두 구간을 재귀적으로 정렬한다. 중요한 것은 partition이 끝난 뒤 pivot 주변의 ordering condition이 성립해 다음 재귀가 서로 독립된 subproblem이 되는 것이다.

```text
[7,2,5,1,6]
pivot = 5
      ↓ partition
[2,1] 5 [7,6]
```

이 시점에 왼쪽과 오른쪽 내부가 완전히 정렬될 필요는 없다. pivot을 기준으로 어느 쪽에 속하는지만 맞으면 된다.

### 분할이 균형에 가까울수록 recursion tree가 얕다

매 partition이 대략 절반으로 나뉘면 recursion depth가 O(log n)이고 각 level의 partition work 총합이 O(n)이어서 평균적으로 O(n log n)을 기대할 수 있다.

반대로 pivot이 매번 최솟값 또는 최댓값이라면 한쪽 subproblem 크기가 `n-1`, 다른 쪽은 0이 된다.

```text
n → n-1 → n-2 → ... → 1
```

이 경우 전체 comparison은 O(n²), recursion depth도 O(n)까지 커질 수 있다.

### pivot 선택은 worst-case를 없애기보다 편향 가능성을 낮춘다

정렬된 입력에서 첫 원소를 pivot으로 고르는 단순 구현은 매우 나쁜 분할을 반복할 수 있다. randomization이나 median-of-three 같은 전략은 특정 input pattern에 계속 나쁜 pivot을 고를 가능성을 줄인다.

하지만 어떤 전략도 비교 기반 quicksort의 모든 구현에서 worst-case 자체를 수학적으로 제거한다고 일반화하면 안 된다. production library는 introsort처럼 recursion depth가 커지면 다른 알고리즘으로 fallback하기도 한다.

### duplicate가 많으면 partition scheme도 중요하다

pivot과 같은 값이 많은 입력에서 2-way partition이 equal keys를 계속 양쪽 재귀에 남기면 불필요한 work가 커질 수 있다. 3-way partition처럼 `< pivot`, `== pivot`, `> pivot`을 나누는 방식이 유리한 경우가 있다.

따라서 quicksort 성능은 이름 하나보다 pivot strategy, partition scheme, insertion-sort cutoff, recursion handling 같은 implementation 선택에 영향을 받는다.

### in-place 장점과 안정성·stack 비용을 함께 본다

array quicksort는 보조 merge buffer 없이 in-place에 가깝게 구현할 수 있고 cache locality도 좋은 편이라 실전에서 강력하다. 하지만 기본 swap-based 구현은 stable하지 않으며, 재귀 depth가 커지면 stack usage가 증가한다.

정렬 API에서 stable ordering이 계약인지, input mutation이 허용되는지, adversarial input을 받을 수 있는지를 확인한 뒤 선택해야 한다.
