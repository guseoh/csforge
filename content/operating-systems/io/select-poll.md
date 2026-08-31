---
kind: concept
contentKey: operating-systems.core.io.select-poll
topicContentKey: operating-systems.core.io
slug: select-poll
title: "select and poll"
summary: "여러 descriptor readiness를 감시하는 고전 API의 비용과 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# select and poll

select와 poll은 여러 file descriptor의 readiness를 한 process가 기다리게 하는 interface다. 반환 뒤 감시 목록을 순회해 어떤 descriptor가 준비됐는지 확인하므로 descriptor 수가 커질 때 매번 검사하는 비용이 문제가 될 수 있다.

timeout과 signal interruption, descriptor close race를 호출자가 처리해야 한다. readiness가 반환된 뒤에도 다른 thread가 먼저 소비하면 실제 I/O가 block하지 않는다는 가정이 깨질 수 있다.

### Backend 연결

고수준 framework는 select/poll을 직접 노출하지 않아도 같은 readiness trade-off를 가진다. connection 수와 event loop CPU를 함께 측정하고 큰 규모에서는 적절한 scalable primitive를 선택한다.

