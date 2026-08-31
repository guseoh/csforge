---
kind: concept
contentKey: dsa.core.algorithm-selection.constraint-to-complexity
topicContentKey: dsa.core.algorithm-selection
slug: constraint-to-complexity
title: "Constraint to Complexity"
summary: "입력 상한을 허용 복잡도와 후보 알고리즘으로 번역한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Constraint to Complexity

알고리즘 선택은 입력 크기·시간 제한·메모리 제한을 먼저 허용 가능한 복잡도로 번역하는 일이다. `O(n²)`가 작은 n에서는 충분하지만 큰 n에서는 `O(n log n)`이나 선형 구조가 필요할 수 있다.

최악·평균·amortized 비용과 상수, I/O와 구현 복잡도를 함께 본다. 요구량을 모른 채 가장 복잡한 알고리즘을 선택하면 검증과 유지보수 비용이 불필요하게 늘어난다.

### Backend 연결

API page size, import row count, search depth를 알고리즘 입력 제약으로 명시한다. limit을 초과할 때 timeout 대신 validation error나 비동기 job으로 전환한다.

