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
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Constraint to Complexity

알고리즘을 고를 때는 먼저 최대 입력 크기와 허용 비용을 확인한다. 입력 상한을 알면 어떤 점근 복잡도가 구조적으로 가능한지 후보를 빠르게 줄일 수 있다.

예를 들어 `n = 100,000`일 때 `n²`은 약 `10¹⁰`개의 조합을 만들지만 `n log₂ n`은 약 `1.7 × 10⁶` 수준이다. Big-O가 실제 실행 시간을 직접 알려 주는 것은 아니지만, 입력이 커질 때 어떤 후보가 감당하기 어려워지는지 판단하는 데 유용하다.

반대로 n이 작고 상한이 명확하다면 더 높은 복잡도의 단순한 알고리즘이 충분할 수 있다. `O(n²)`이라는 이유만으로 항상 잘못된 선택은 아니다.

복잡도는 최종 정답이 아니라 **후보 제거 기준**이다. 같은 O(n log n)이라도 실제 상수, 메모리 사용, 입력 분포와 operation 종류가 다를 수 있다.

따라서 선택 순서는 보통 다음과 같다.

```text
입력 상한 확인
→ 감당하기 어려운 복잡도 제거
→ 남은 후보의 메모리·data shape·operation 비교
```

핵심은 복잡도 표기를 알고리즘의 등급표가 아니라 **입력 제약을 실행 비용 증가율로 번역하는 도구**로 사용하는 것이다.
