---
kind: concept
contentKey: operating-systems.core.io.select-poll
topicContentKey: operating-systems.core.io
slug: select-poll
title: "select와 poll"
summary: "여러 디스크립터의 준비 상태를 한 wait point에서 감시하는 방식과 per-call scan 비용을 설명한다."
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
# select와 poll

블로킹 I/O는 디스크립터 하나가 준비될 때까지 기다리는 데는 단순하지만, 많은 디스크립터를 동시에 다뤄야 할 때 디스크립터마다 별도 스레드를 두면 실행 자원과 메모리 비용이 커질 수 있다. `select()`와 `poll()`은 여러 디스크립터 중 **현재 I/O를 시도할 준비가 된 대상이 있는지 한 번의 wait에서 확인하는 준비 상태 multiplexing** interface다.

`poll()`을 단순화하면 호출자는 `(fd, 관심 event)` 목록을 커널에 넘긴다. 준비된 디스크립터가 없으면 호출 작업는 기다릴 수 있고, 조건이 생기면 커널이 각 entry의 결과 이벤트를 표시해 반환한다. 이후 애플리케이션이 실제 `read()`나 `write()`를 호출한다. 즉 `poll()`의 반환은 I/O 완료이 아니라 **어떤 디스크립터에서 지금 진행를 시도할 수 있는지 알려주는 준비 상태 결과**다.

### 큰 관심 집합에서는 반복 scan 비용이 생긴다

전형적인 `select()`/`poll()` 사용에서는 wait를 호출할 때마다 감시할 집합을 전달하고, 반환 후 어떤 디스크립터가 ready인지 결과를 확인해야 한다. 감시하는 디스크립터가 매우 많고 실제 ready한 디스크립터는 적다면 매 호출마다 큰 관심 집합을 다루는 비용이 커질 수 있다.

`select()`는 fd 집합 표현과 최대 디스크립터 번호에 제약이 있고, `poll()`은 배열 기반 interface로 이런 제약 일부를 완화한다. 그러나 둘 모두 **persistent interest set과 ready set을 분리하는 방식은 아니다.** 이 한계가 large mostly-idle 연결 set에서 `epoll` 같은 facility가 필요한 배경이 된다.

### 준비 상태 이후에도 실제 I/O 결과는 다시 확인한다

Ready 이벤트를 받았더라도 실제 `read()`가 애플리케이션 메시지 전체를 반환한다는 보장은 없다. 상태가 바뀌었거나 일부 data만 존재할 수 있으며, 논블로킹 디스크립터에서는 `EAGAIN`도 정상적인 결과가 될 수 있다. 따라서 multiplexing은 "어디를 다시 시도할지"를 알려줄 뿐 partial read/write와 프로토콜 상태 관리까지 대신하지 않는다.

`select`와 `poll`의 핵심은 **여러 디스크립터의 준비 상태를 하나의 wait point에서 감시할 수 있지만, 관심 집합이 커질수록 매 호출의 집합 전달·검사 비용이 커질 수 있다는 것**이다.

### 흐름으로 보기

```text
관심 descriptor와 event
          │ select()/poll() 대기
          ▼
ready 결과를 반환 ── readiness 알림이지 I/O 완료가 아님
          │
          ▼
application이 read()/write() 시도
          │
          └── partial result 또는 EAGAIN일 수 있음
```
