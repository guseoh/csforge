---
kind: concept
contentKey: dsa.core.complexity.input-size-operation-count
topicContentKey: dsa.core.complexity
slug: input-size-operation-count
title: "Input Size and Operation Count"
summary: "입력 크기를 정의하고 반복되는 기본 연산 수를 세어 알고리즘 비용을 모델링한다."
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
# Input Size and Operation Count

알고리즘의 비용을 비교하려면 먼저 **입력 크기 `n`이 무엇을 뜻하는지** 정해야 한다. 배열 문제라면 원소 수가 될 수 있고, 그래프라면 정점 수 `V`와 간선 수 `E`처럼 하나보다 여러 크기 변수가 필요할 수 있다. 문자열을 처리한다면 문자열의 길이가 실제 작업량을 결정할 수도 있다.

그다음 입력이 커질 때 반복되는 기본 연산의 수를 센다. 배열의 모든 원소를 한 번 검사하면 대략 `n`번의 비교가 필요하고, 모든 원소 쌍을 검사하면 대략 `n²`에 비례하는 연산이 생긴다.

```text
한 번 전체 순회      → n에 비례
두 중첩 전체 순회   → n²에 비례
반복마다 후보 절반 제거 → log n에 비례
```

정확한 CPU instruction 수를 모두 세는 것이 목적은 아니다. 입력 크기가 증가할 때 **지배적인 반복 구조가 어떻게 증가하는지**를 설명할 수 있는 비용 모델을 만드는 것이 핵심이다.

또한 early exit처럼 입력 상태에 따라 실행량이 달라질 수 있다. 그래서 기본 연산 수를 셀 때는 어떤 입력 조건을 분석하는지 함께 명시해야 하며, 이후 best·average·worst case와 점근 표기로 그 차이를 표현한다.
