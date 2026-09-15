---
kind: concept
contentKey: dsa.core.complexity.best-average-worst
topicContentKey: dsa.core.complexity
slug: best-average-worst
title: "Best, Average and Worst Case"
summary: "같은 입력 크기에서도 입력 상태·분포에 따라 달라지는 best·average·worst 비용을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Best, Average and Worst Case

같은 크기 `n`의 입력이라도 입력 상태에 따라 알고리즘이 수행하는 연산 수가 달라질 수 있다. 이 차이를 best case, average case, worst case로 나누어 본다.

Best case는 가장 유리한 입력에서의 비용이고, worst case는 같은 크기의 입력 중 가장 큰 비용이다. Average case는 가능한 입력에 대한 **확률 분포를 가정한 기대 비용**이므로 어떤 입력이 얼마나 자주 나타나는지에 대한 가정 없이는 의미가 완성되지 않는다.

예를 들어 정렬되지 않은 배열에서 값을 순차 탐색할 때 첫 원소가 target이면 한 번의 비교로 끝날 수 있지만, target이 마지막에 있거나 존재하지 않으면 모든 원소를 확인해야 한다.

```text
best   → 첫 위치에서 발견
worst  → 끝까지 검사
average → 입력 위치/존재 확률 분포를 가정한 기대 비용
```

Worst case는 특정 입력 분포를 몰라도 지켜지는 상한을 설명하는 데 유용하고, average case는 현실적인 입력 분포가 알려져 있을 때 예상 비용을 설명하는 데 유용하다. 어느 하나가 항상 더 중요한 것이 아니라 **어떤 보장을 알고 싶은지에 따라 분석 관점이 달라진다.**
