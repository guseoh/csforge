---
kind: concept
contentKey: dsa.core.recursion-backtracking.divide-and-conquer
topicContentKey: dsa.core.recursion-backtracking
slug: divide-and-conquer
title: "Divide and Conquer"
summary: "문제를 독립 부분 문제로 나누고 결과를 combine한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Divide and Conquer

divide-and-conquer는 문제를 작은 부분 문제로 나누고, 각각을 해결한 다음 combine 단계에서 전체 답을 만든다. 부분 문제가 서로 독립이면 병렬화나 재귀 분석이 쉬워지고, 겹치면 DP가 더 적합할 수 있다.

분할이 균형인지, base case가 무엇인지, combine 비용이 얼마인지가 핵심이다. 세 요소가 recurrence를 결정하므로 “반으로 나눈다”는 사실만으로 항상 `O(n log n)`이라고 결론 내리면 안 된다.

### Backend 연결

대용량 import를 partition으로 나눌 때 각 chunk의 독립성과 마지막 병합의 idempotency를 확인한다. 실패한 chunk만 재시도할 수 있게 경계를 기록하면 전체 재처리를 줄일 수 있다.
