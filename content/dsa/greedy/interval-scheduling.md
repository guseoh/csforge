---
kind: concept
contentKey: dsa.core.greedy.interval-scheduling
topicContentKey: dsa.core.greedy
slug: interval-scheduling
title: "Interval Scheduling"
summary: "가장 빨리 끝나는 interval 선택이 최대 개수를 보장한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/44sp/"
    title: "Algorithms, 4th Edition: Shortest Paths"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "weighted shortest path의 relaxation 조건을 확인한다."
    displayOrder: 1
---
# Interval Scheduling

겹치지 않는 interval의 개수를 최대화할 때 현재 선택 가능한 interval 중 finish time이 가장 이른 것을 고른다. 빨리 끝나는 선택은 남은 시간 구간을 줄이지 않으므로 이후 선택을 위한 공간을 가장 많이 남긴다.

finish time 순으로 정렬하고 마지막 선택의 종료 이후 시작하는 interval만 고려하면 된다. 시작 시간이 빠른 것, 길이가 짧은 것만 고르는 규칙은 반례가 있으므로 objective와 맞지 않는다.

### Backend 연결

복습 시간 slot을 겹치지 않게 배정할 때 최대 세션 수가 목표인지 중요도 합이 목표인지 먼저 구분한다. 가중치 합이면 weighted interval scheduling DP가 필요하다.
