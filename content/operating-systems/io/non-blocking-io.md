---
kind: concept
contentKey: operating-systems.core.io.non-blocking-io
topicContentKey: operating-systems.core.io
slug: non-blocking-io
title: "Non-Blocking I/O"
summary: "지금 가능한 progress만 수행하고 즉시 반환할 때 caller가 partial state와 retry 시점을 관리하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man2/read.2.html"
    title: "read(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "read()의 partial result와 O_NONBLOCK/EAGAIN 계약을 확인한다."
    displayOrder: 1
---
# Non-Blocking I/O

non-blocking mode에서는 I/O operation이 지금 progress할 수 없다면 호출 thread를 잠재우지 않고 **즉시 control을 돌려준다.** Linux의 `O_NONBLOCK` descriptor에서 read가 지금 block될 상황이면 `EAGAIN`/`EWOULDBLOCK` 같은 결과를 받을 수 있다. caller는 `아직 data가 없다`를 fatal error나 EOF와 구분해야 한다.

### 즉시 반환과 완료는 같은 뜻이 아니다

socket에 10KiB message가 들어오는 중인데 현재 2KiB만 읽을 수 있다고 하자. non-blocking `read`는 2KiB를 반환할 수 있고 나머지는 이후 event에서 계속 읽어야 한다. write도 socket send buffer 여유만큼 일부 bytes만 받아들일 수 있다. 따라서 application은 buffer position, 남은 byte 수, protocol parsing state를 connection별로 보존한다.

`non-blocking = 한 번 호출하면 나중에 kernel이 자동으로 전체 operation을 끝내 준다`는 모델은 아니다. 이는 completion 기반 async I/O와의 중요한 차이다.

### Busy polling과 readiness notification을 구분한다

준비되지 않은 fd에 loop로 계속 `read → EAGAIN → read → EAGAIN`을 반복하면 thread는 block하지 않지만 CPU를 낭비한다. 그래서 `select`, `poll`, `epoll` 같은 readiness mechanism과 조합해 **언제 다시 시도할 가치가 있는지** notification을 받는 구조가 일반적이다.

### Readiness가 와도 drain loop가 필요할 수 있다

ready event를 받았다고 application-level message 전체가 준비된 것은 아니다. 특히 edge-triggered readiness에서는 non-blocking read를 `EAGAIN`이 나올 때까지 반복해 현재 준비된 data를 drain하지 않으면 다음 edge를 놓칠 수 있다. level-triggered에서도 partial message state는 application이 관리해야 한다.

### Backend event loop의 위험

Netty/NIO 같은 event-loop model은 적은 thread로 많은 connection state를 관리할 수 있지만 event-loop thread 안에서 blocking DB query나 file operation을 수행하면 **그 thread가 담당하는 다른 connection의 progress까지 지연**된다. 그래서 transport의 non-blocking 여부와 business/downstream operation의 blocking 여부를 별도로 본다.

non-blocking architecture를 선택할 때는 thread 수 감소만 보지 않고 per-connection state complexity, backpressure, cancellation, partial read/write correctness를 함께 평가한다.
