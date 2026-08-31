---
kind: concept
contentKey: dsa.core.recursion-backtracking.recurrence
topicContentKey: dsa.core.recursion-backtracking
slug: recurrence
title: "Recurrence"
summary: "부분 문제 비용으로 전체 실행 시간 recurrence를 세운다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Recurrence

recurrence는 크기 `n`의 작업을 더 작은 크기의 작업과 현재 combine 비용으로 표현한다. 예를 들어 균등하게 두 부분으로 나누고 선형 병합을 하면 `T(n)=2T(n/2)+O(n)` 형태가 된다.

분할 비율과 부분 문제 개수, 각 호출의 추가 비용을 먼저 적고 그 뒤에 tree나 치환으로 해를 구한다. base case와 입력이 작아지는 조건을 빼면 계산 결과가 실제 종료를 보장하지 않는다.

### Backend 연결

재귀적인 JSON/Markdown 처리의 비용을 추정할 때 문서 깊이와 총 노드 수를 별도 제한한다. 평균 문서가 작다는 이유로 최악의 중첩 입력을 무시하지 않는다.
