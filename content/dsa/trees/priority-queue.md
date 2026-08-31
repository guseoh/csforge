---
kind: concept
contentKey: dsa.core.trees.priority-queue
topicContentKey: dsa.core.trees
slug: priority-queue
title: "Priority Queue"
summary: "최우선 원소 추출 추상화와 heap 구현 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/24pq/"
    title: "Algorithms, 4th Edition: Priority Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "heap invariant와 배열 index 관계를 확인한다."
    displayOrder: 1
---
# Priority Queue

priority queue는 삽입된 모든 원소 중 우선순위가 가장 높은 것을 꺼내는 추상화다. heap 구현은 insert와 delete-min/max를 O(log n), peek를 O(1)로 제공하며, 동일 priority의 처리 순서는 별도 tie-breaker가 없으면 보장하지 않는다.

우선순위가 시간에 따라 바뀌면 heap 안의 위치 invariant가 낡아져 update-key나 재삽입이 필요하다. 단순 queue를 priority queue로 바꾸면 FIFO 요구가 사라질 수 있으므로 업무 의미를 먼저 정한다.

### Backend 연결

retry 작업과 scheduler에서 priority, aging, starvation 정책을 명시한다. heap 크기와 오래된 작업의 최대 대기시간을 함께 관찰한다.
