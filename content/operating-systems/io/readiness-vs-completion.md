---
kind: concept
contentKey: operating-systems.core.io.readiness-vs-completion
topicContentKey: operating-systems.core.io
slug: readiness-vs-completion
title: "Readiness versus Completion"
summary: "I/O를 지금 시도할 수 있다는 readiness와 이미 제출한 operation의 결과가 나온 completion을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux readiness model에서 interest list와 ready list, level/edge-triggered semantics를 확인한다."
    displayOrder: 1
---
# Readiness versus Completion

고동시성 I/O를 설명할 때 readiness와 completion을 같은 event model로 취급하면 state machine이 쉽게 꼬인다. 둘은 kernel이 caller에게 알려주는 **사건의 의미 자체가 다르다.**

### Readiness는 operation을 시도할 조건을 알려준다

readiness model에서 `readable` event는 일반적으로 `지금 read를 시도하면 이전보다 progress할 조건이 있다`는 뜻이다. socket receive buffer에 bytes가 들어왔거나 EOF/error 같은 상태 변화가 있을 수 있다. 하지만 event 하나가 application message 전체의 수신 완료를 의미하지는 않는다.

예를 들어 HTTP body가 100KiB인데 현재 8KiB만 socket에 도착했다면 readiness 뒤 read는 8KiB만 반환할 수 있다. application은 남은 92KiB를 계속 기다리고 protocol parser state를 유지해야 한다.

write readiness도 비슷하다. `writable`은 send buffer에 어느 정도 공간이 생겼다는 의미일 수 있지만 큰 response 전체가 한 번에 전송되었다는 뜻은 아니다.

### Completion은 제출한 operation의 결과를 알려준다

completion model에서는 caller가 `이 buffer에 최대 N byte를 읽어 달라` 같은 operation을 제출하고, kernel/runtime이 그 operation을 처리한 뒤 result를 completion queue/callback/future로 돌려준다. 이 경우 event는 단순한 readiness가 아니라 **특정 submission의 결과**와 연결된다.

그렇다고 completion이 application-level 업무 완료와 같은 것은 아니다. 한 async read가 4KiB 완료되었어도 protocol message가 100KiB라면 추가 operation이 필요하다.

### Event를 받은 뒤 누가 I/O를 수행하는가

- readiness: application이 event를 받고 실제 `read/write`를 다시 호출한다.
- completion: operation을 먼저 제출하고 나중에 해당 operation의 result를 받는다.

이 차이가 buffer ownership에도 영향을 준다. readiness에서는 read를 호출할 때 buffer를 제공하지만 completion 기반 API에서는 제출한 operation이 끝날 때까지 kernel/runtime이 buffer를 참조할 수 있으므로 lifetime을 지켜야 한다.

### Level-triggered와 edge-triggered는 readiness 내부의 또 다른 구분이다

level-triggered는 조건이 계속 true인 동안 event를 다시 받을 수 있고, edge-triggered는 상태 변화에 더 민감한 방식이라 non-blocking drain loop를 제대로 구현하지 않으면 unread data가 남은 채 다음 notification을 기다리는 오류가 생길 수 있다. 이는 completion vs readiness 구분과 별도의 문제다.

Backend에서는 `socket readable`, `request body parsed`, `business operation completed`, `response bytes fully written`을 별도 state로 둔다. event-loop metric도 ready-event 수만으로 request throughput을 대신 설명하지 않는다.
