---
kind: concept
contentKey: operating-systems.core.deadlock.resource-allocation-graph
topicContentKey: operating-systems.core.deadlock
slug: resource-allocation-graph
title: "Resource-Allocation Graph"
summary: "process-resource edge로 cycle과 deadlock 가능성을 추적한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Resource-Allocation Graph

resource-allocation graph는 process가 resource를 보유한 edge와 resource를 기다리는 edge를 함께 그린다. 단일 인스턴스 resource에서 cycle은 deadlock을 나타내며, 여러 인스턴스에서는 cycle만으로 확정되지 않아 추가 가능성 분석이 필요하다.

그래프의 node와 edge를 요청 시점마다 갱신해야 현재 상태를 반영한다. lock 이름만 로그에 남기지 말고 owner, waiter, 획득 순서와 timestamp를 함께 기록하면 cycle을 복원할 수 있다.

### Backend 연결

thread dump와 DB lock view, connection pool 상태를 하나의 wait graph로 합치면 cross-layer deadlock을 찾을 수 있다. 관측 데이터는 개인정보와 query payload를 제외한 식별자로 남긴다.

