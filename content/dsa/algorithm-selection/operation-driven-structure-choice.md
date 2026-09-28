---
kind: concept
contentKey: dsa.core.algorithm-selection.operation-driven-structure-choice
topicContentKey: dsa.core.algorithm-selection
slug: operation-driven-structure-choice
title: "연산 중심 자료구조 선택"
summary: "주요 연산 빈도와 불변식을 기준으로 자료구조를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/cheatsheet/"
    title: "Algorithms and Data Structures Cheatsheet"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "정렬, 우선순위 큐, 심볼 테이블과 그래프 자료구조의 연산별 복잡도를 비교한다."
    displayOrder: 1
---
# 연산 중심 자료구조 선택

자료구조 선택은 어떤 구조가 가장 빠른지를 묻는 문제가 아니라 **어떤 연산을 얼마나 자주 수행하고 어떤 불변식을 유지해야 하는지**를 묻는 문제다.

정확 일치 조회가 대부분이라면 해시 테이블이 후보가 될 수 있다. 정렬된 순회나 범위 질의가 중요하면 균형 트리가 자연스럽고, 최소값이나 최대값을 반복해서 꺼내는 작업이 핵심이면 힙 기반 우선순위 큐가 적합할 수 있다. 문자열 접두사 조회가 많다면 트라이도 후보가 된다.

```text
정확 일치 조회 많음 → 해시 테이블 후보
정렬·범위 질의 필요 → 균형 트리 후보
최소·최대값 반복 추출 → 힙 후보
접두사 질의 많음 → 트라이 후보
```

연산 하나의 Big-O만 비교해서는 부족하다. 삽입·삭제 비율, 중복 허용 여부, 정렬 순서 유지 필요성, 추가 메모리 비용처럼 구조가 유지해야 하는 조건도 함께 봐야 한다.

모든 연산을 동시에 최적으로 만드는 단일 자료구조는 드물다. 따라서 실제 작업 부하에서 자주 수행하는 연산과 반드시 지켜야 하는 불변식을 먼저 적고, 그 조합에 가장 잘 맞는 구조를 선택한다.

자료구조 선택의 핵심 질문은 **우리 문제에서 가장 중요한 연산은 무엇이며, 그 연산을 빠르게 만들기 위해 어떤 다른 비용을 지불하는가**다.
