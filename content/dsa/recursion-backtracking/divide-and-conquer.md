---
kind: concept
contentKey: dsa.core.recursion-backtracking.divide-and-conquer
topicContentKey: dsa.core.recursion-backtracking
slug: divide-and-conquer
title: "Divide and Conquer"
summary: "문제를 독립 부분 문제로 나누고 combine하는 구조를 설명한다."
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
# Divide and Conquer

Divide and Conquer는 큰 문제를 더 작은 부분 문제로 나누고, 각 부분 문제를 해결한 뒤 그 결과를 결합해 전체 답을 만드는 전략이다.

```text
문제 n
 ├─ divide: 더 작은 부분 문제 생성
 ├─ conquer: 각 부분 문제 해결
 └─ combine: 부분 결과 결합
```

Merge sort에서는 배열을 절반으로 나누고 두 절반을 각각 정렬한 뒤 merge한다. 이때 두 부분 문제는 서로의 중간 결과에 의존하지 않고, 마지막 combine 단계에서만 결과를 합친다.

분할 모양만 보고 비용을 결정할 수는 없다. 부분 문제의 개수와 크기뿐 아니라 각 단계의 combine 비용도 함께 봐야 한다. Merge sort는 `2T(n/2) + O(n)` 구조지만, combine이 더 비싸다면 전체 복잡도도 달라진다.

균형 잡힌 분할은 recursion depth를 줄이는 데 중요하다. Quicksort처럼 한쪽이 `n-1`, 다른 쪽이 0에 가까운 분할이 반복되면 divide-and-conquer 형태라도 깊이가 O(n)까지 커질 수 있다.

Backtracking도 호출 tree를 만들 수 있지만 목적이 다르다. Divide and Conquer는 **필요한 부분 문제를 분해해 결과를 결합**하고, backtracking은 가능한 선택 공간을 탐색하며 불가능한 branch를 되돌린다.
