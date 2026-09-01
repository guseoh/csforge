---
kind: concept
contentKey: dsa.core.complexity.input-size-operation-count
topicContentKey: dsa.core.complexity
slug: input-size-operation-count
title: "Input Size and Operation Count"
summary: "입력 크기와 반복되는 기본 연산 수를 세어 비용을 모델링한다."
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

알고리즘 비용을 말하려면 먼저 입력 크기 `n`이 무엇인지 정해야 한다. 배열 길이, 정점과 간선 수, key의 bit 수처럼 실제 반복 횟수를 결정하는 양이 다를 수 있으며, 단순히 객체 개수만 세면 숨은 문자열 길이나 edge 수를 놓친다.

loop 안의 비교·대입·방문을 세고 중첩 loop의 범위를 곱하면 실행량의 모양을 얻는다. early exit가 있어도 최악 입력과 평균 입력을 구분해야 하며, 한 번의 측정값을 모든 `n`에 대한 증명으로 사용하지 않는다.

### Backend 연결

page size·batch size·result count처럼 API 입력 제한을 설계할 때 n의 정의와 상한을 명시한다. query가 반환하는 행 수뿐 아니라 각 행 payload와 sorting 비용도 함께 계산한다.
