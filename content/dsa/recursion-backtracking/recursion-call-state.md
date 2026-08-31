---
kind: concept
contentKey: dsa.core.recursion-backtracking.recursion-call-state
topicContentKey: dsa.core.recursion-backtracking
slug: recursion-call-state
title: "Recursion Call State"
summary: "각 재귀 호출의 입력, 종료 조건과 반환 상태를 추적한다."
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
# Recursion Call State

재귀 호출은 현재 인자와 다음 호출의 관계, 그리고 호출이 끝난 뒤 사용할 반환 상태를 가진다. base case는 더 분해하지 않을 조건이며, recursive case는 입력을 반드시 그 조건 쪽으로 줄여야 종료를 보장한다.

호출 stack을 따라 내려갈 때의 상태와 올라올 때 결합할 결과를 따로 기록하면 재귀 버그를 찾기 쉽다. 같은 상태를 반복 계산하면 memoization이나 bottom-up DP를 고려한다.

### Backend 연결

중첩된 parser나 tree 변환은 입력 깊이에 따라 stack을 소모한다. 외부 입력의 깊이를 제한하거나 명시적 stack으로 바꾸는 경계를 정하면 장애와 자원 고갈을 예방할 수 있다.
