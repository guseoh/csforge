---
kind: concept
contentKey: dsa.core.recursion-backtracking.divide-and-conquer
topicContentKey: dsa.core.recursion-backtracking
slug: divide-and-conquer
title: "Divide and Conquer"
summary: "분할·정복·결합 단계와 부분 문제 독립성, 비용 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "부분 문제 크기와 단계별 비용이 전체 복잡도로 이어지는 구조를 확인한다."
    displayOrder: 1
---
# Divide and Conquer

### 문제를 나누는 것만으로는 충분하지 않다

Divide and Conquer는 큰 문제를 더 작은 부분 문제로 나누고, 각 부분 문제를 해결한 뒤 결과를 합쳐 전체 답을 만드는 설계 방식이다. 핵심은 단순히 재귀 호출을 사용한다는 데 있지 않다. **어떻게 나누는가, 부분 문제 사이에 어떤 의존성이 있는가, 결과를 합치는 비용이 얼마인가**가 알고리즘의 정확성과 성능을 결정한다.

대표적으로 merge sort는 배열을 절반으로 나눈다. 두 절반을 각각 정렬하는 작업은 독립적으로 수행할 수 있고, 마지막에 두 sorted sequence를 merge하면 전체 정렬 결과를 얻는다. 반면 부분 문제들이 같은 상태를 반복해서 계산한다면 독립적인 분할 정복보다 memoization이나 dynamic programming이 더 적합할 수 있다.

### Divide, Conquer, Combine

분할 정복을 분석할 때는 세 단계를 분리해서 본다.

```text
원래 문제 n
   │
   ├─ divide: 부분 문제를 만든다
   │
   ├─ conquer: 각 부분 문제를 해결한다
   │
   └─ combine: 부분 결과를 전체 답으로 합친다
```

예를 들어 merge sort에서 divide는 index 중간을 정하는 작업이라 거의 상수 비용이고, conquer는 두 개의 `n/2` 정렬이며, combine은 전체 `n`개 원소를 한 번 훑는 merge다. 그래서 비용은 대략 `T(n) = 2T(n/2) + O(n)`으로 표현된다.

반대로 부분 문제를 반으로 나누더라도 combine이 매 단계 `O(n²)`이라면 전체 알고리즘은 `O(n log n)`이 아니다. “절반으로 나눈다”는 모양만 보고 복잡도를 결정하면 안 되는 이유다.

### 좋은 분할이 만족해야 할 조건

분할이 너무 한쪽으로 치우치면 recursion depth가 커질 수 있다. quicksort가 pivot을 계속 최솟값이나 최댓값으로 고르면 `n-1`과 `0`에 가까운 불균형 분할이 반복되어 최악 `O(n²)`이 되는 것이 대표적이다.

또한 부분 문제가 독립적인지도 중요하다. 같은 원본 데이터를 읽는 것은 괜찮지만 한 부분 문제가 다른 부분 문제의 중간 결과를 변경한다면 병렬 실행이나 독립 retry가 어려워진다. 부분 문제를 나누는 순간 어떤 상태를 공유하고 어떤 결과만 combine하는지를 명확히 해야 한다.

### 분할 정복과 다른 전략의 경계

분할 정복과 backtracking은 모두 tree 형태의 호출을 만들 수 있지만 목적이 다르다. 분할 정복은 **원래 문제를 필요한 부분 문제로 분해**하고 모든 부분 결과를 결합하는 경우가 많다. backtracking은 가능한 선택 공간을 열고, 조건에 맞지 않는 branch를 되돌리거나 pruning한다.

Dynamic programming과의 차이도 부분 문제의 중복 여부에서 드러난다. 같은 상태가 여러 경로에서 반복된다면 그대로 재귀 호출하는 대신 결과를 저장하는 편이 낫다.

### 실제 시스템에서 연결되는 지점

대용량 파일이나 import batch를 chunk 단위로 나누는 작업도 분할 정복과 비슷한 사고를 요구한다. 다만 알고리즘의 부분 문제처럼 자동으로 독립적인 것은 아니다. chunk 간 unique constraint, 전체 정렬 순서, 마지막 aggregate 결과가 서로 의존한다면 combine 단계와 실패 복구가 별도 설계 대상이 된다.

따라서 실무에서는 단순히 “작업을 여러 조각으로 나눈다”보다 **각 조각을 독립 실행할 수 있는지, 실패한 조각만 재시도해도 되는지, 마지막 결합이 idempotent한지**를 함께 확인해야 한다.
