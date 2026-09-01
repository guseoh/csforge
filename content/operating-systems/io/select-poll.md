---
kind: concept
contentKey: operating-systems.core.io.select-poll
topicContentKey: operating-systems.core.io
slug: select-poll
title: "select and poll"
summary: "여러 descriptor의 readiness를 한 wait point에서 감시하는 방식과 per-call scan 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/poll.2.html"
    title: "poll(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "descriptor 배열의 requested/reported event와 timeout·interruption semantics를 확인한다."
    displayOrder: 1
---
# select and poll

blocking read 하나는 한 descriptor가 progress할 때까지 기다리는 데 적합하지만, connection 수가 많아지면 descriptor마다 thread 하나를 두는 대신 **여러 descriptor 중 어느 것이 준비됐는지 한 번에 기다리는 I/O multiplexing**이 필요해진다. `select()`와 `poll()`은 이런 readiness multiplexing의 고전적인 interface다.

### Caller가 관심 목록을 kernel에 전달한다

`poll()`을 단순화하면 caller가 `(fd, 관심 event)` 배열을 전달하고 kernel이 각 entry의 현재 상태를 확인한 뒤 준비된 event를 표시해 반환한다. 준비된 descriptor가 없다면 timeout 또는 signal/error가 발생할 때까지 호출 task가 기다릴 수 있다.

반환되면 application은 어떤 fd가 readable/writable/error 상태인지 보고 실제 read/write를 수행한다. 즉 `poll returned`는 I/O completion이 아니라 readiness notification이다.

### 왜 descriptor 수가 커지면 비용이 문제가 되는가

전형적인 `select/poll` 사용은 매 wait call에서 감시 집합을 kernel에 전달하고, 반환 후 caller가 결과 목록을 다시 확인한다. 수천·수만 descriptor 중 실제 active한 것은 몇 개뿐인 workload에서는 **매번 큰 관심 집합을 다루는 비용**이 active connection 수보다 total registered descriptor 수에 영향을 받을 수 있다.

`select()`에는 fd-set 표현과 최대 descriptor 번호 관련 제약도 있고 `poll()`은 배열 표현으로 이를 완화하지만, 둘 다 large mostly-idle connection set에서 scalable event facility가 필요한 이유를 보여준다.

### Readiness 뒤에도 non-blocking I/O가 안전하다

readiness를 받은 뒤 다른 thread가 먼저 data를 소비하거나 상태가 변할 수 있고, edge conditions도 존재한다. 그래서 event-driven server는 descriptor를 non-blocking으로 설정하고 실제 read/write가 `EAGAIN`을 반환해도 정상적인 state transition으로 처리하는 편이 안전하다.

### API 선택보다 workload가 먼저다

connection이 수십 개뿐이고 코드 단순성이 중요한 tool이라면 poll의 scan 비용이 실제 문제가 아닐 수 있다. 반대로 수만 idle connection 중 소수만 active한 server에서는 epoll/kqueue 같은 persistent interest/ready-set model이 더 적합할 수 있다.

Backend에서는 `connection count`, `active ready events`, event-loop CPU와 system-call cost를 같이 측정한다. 단지 `epoll이 더 최신이다`라는 이유만으로 architecture를 바꾸지 않는다.
