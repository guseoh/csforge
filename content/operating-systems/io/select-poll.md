---
kind: concept
contentKey: operating-systems.core.io.select-poll
topicContentKey: operating-systems.core.io
slug: select-poll
title: "select·poll"
summary: "여러 descriptor의 readiness를 한 wait point에서 감시하는 방식과 per-call scan 비용을 설명한다."
level: 2
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
# select·poll

Blocking I/O는 descriptor 하나가 준비될 때까지 기다리는 데는 단순하지만, 많은 descriptor를 동시에 다뤄야 할 때 descriptor마다 별도 thread를 두면 실행 자원과 memory 비용이 커질 수 있다. `select()`와 `poll()`은 여러 descriptor 중 **현재 I/O를 시도할 준비가 된 대상이 있는지 한 번의 wait에서 확인하는 readiness multiplexing** interface다.

`poll()`을 단순화하면 caller는 `(fd, 관심 event)` 목록을 kernel에 넘긴다. 준비된 descriptor가 없으면 호출 task는 기다릴 수 있고, 조건이 생기면 kernel이 각 entry의 결과 event를 표시해 반환한다. 이후 application이 실제 `read()`나 `write()`를 호출한다. 즉 `poll()`의 반환은 I/O completion이 아니라 **어떤 descriptor에서 지금 progress를 시도할 수 있는지 알려주는 readiness 결과**다.

### 큰 관심 집합에서는 반복 scan 비용이 생긴다

전형적인 `select()`/`poll()` 사용에서는 wait를 호출할 때마다 감시할 집합을 전달하고, 반환 후 어떤 descriptor가 ready인지 결과를 확인해야 한다. 감시하는 descriptor가 매우 많고 실제 ready한 descriptor는 적다면 매 호출마다 큰 관심 집합을 다루는 비용이 커질 수 있다.

`select()`는 fd 집합 표현과 최대 descriptor 번호에 제약이 있고, `poll()`은 배열 기반 interface로 이런 제약 일부를 완화한다. 그러나 둘 모두 **persistent interest set과 ready set을 분리하는 방식은 아니다.** 이 한계가 large mostly-idle connection set에서 `epoll` 같은 facility가 필요한 배경이 된다.

### readiness 이후에도 실제 I/O 결과는 다시 확인한다

Ready event를 받았더라도 실제 `read()`가 application message 전체를 반환한다는 보장은 없다. 상태가 바뀌었거나 일부 data만 존재할 수 있으며, non-blocking descriptor에서는 `EAGAIN`도 정상적인 결과가 될 수 있다. 따라서 multiplexing은 "어디를 다시 시도할지"를 알려줄 뿐 partial read/write와 protocol state 관리까지 대신하지 않는다.

`select`와 `poll`의 핵심은 **여러 descriptor의 readiness를 하나의 wait point에서 감시할 수 있지만, 관심 집합이 커질수록 매 호출의 집합 전달·검사 비용이 커질 수 있다는 것**이다.
