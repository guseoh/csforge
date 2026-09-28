---
kind: concept
contentKey: dsa.core.recursion-backtracking.recurrence
topicContentKey: dsa.core.recursion-backtracking
slug: recurrence
title: "점화식(Recurrence)"
summary: "부분 문제 비용으로 전체 시간 점화식을 세우고 해석한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/22mergesort/"
    title: "Algorithms, 4th Edition: Mergesort"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "분할 정복 재귀 구조, merge 비용, 점화식과 comparison-sort 하한을 확인한다."
    displayOrder: 1
---
# 점화식(Recurrence)

점화식은 크기 n의 문제 비용을 더 작은 부분 문제의 비용과 현재 호출에서 추가로 드는 비용으로 표현한다. 재귀 코드를 비용 구조로 바꾸는 방법이다.

예를 들어 크기 n의 문제를 절반 크기 두 개로 나누고 결과를 O(n)에 결합한다면 다음처럼 쓸 수 있다.

```text
T(n) = 2T(n/2) + O(n)
```

`2T(n/2)`는 두 부분 문제의 비용이고, `O(n)`은 현재 단계의 combine work다. 점화식을 세울 때는 공식을 외우기보다 **한 호출이 몇 개의 하위 호출을 만들고, 각 크기가 얼마이며, 현재 호출이 별도로 무엇을 하는지**를 코드에서 찾아야 한다.

호출 tree로 펼치면 비용을 직관적으로 볼 수 있다. `2T(n/2)+O(n)`은 각 level의 총 work가 O(n)이고 level 수가 O(log n)이므로 전체 O(n log n)이 된다.

반면 `T(n)=T(n-1)+O(1)`은 깊이가 O(n)이고, `T(n)=T(n/2)+O(1)`은 깊이가 O(log n)이다. 같은 재귀 코드라도 부분 문제 수와 크기가 다르면 비용 구조가 달라진다.

점화식은 재귀가 정상적으로 종료한다는 전제 위에 있다. Base case와 progress가 없다면 비용 분석 이전에 알고리즘 정확성이 성립하지 않는다.
