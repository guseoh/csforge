---
kind: concept
contentKey: operating-systems.core.io.blocking-io
topicContentKey: operating-systems.core.io
slug: blocking-io
title: "Blocking I/O"
summary: "I/O가 progress할 조건이 생길 때까지 호출 task가 기다리는 semantics와 resource 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/read.2.html"
    title: "read(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "read()의 partial result와 O_NONBLOCK/EAGAIN 계약을 확인한다."
    displayOrder: 1
---
# Blocking I/O

blocking I/O는 호출이 원하는 progress를 할 수 없을 때 **호출 task가 그 조건이 만족될 때까지 기다릴 수 있는 semantics**를 말한다. 예를 들어 blocking socket `read()`에 아직 받을 data가 없다면 kernel은 현재 thread를 sleep 가능한 waiting state로 보내고 data arrival 같은 사건 뒤 다시 runnable하게 만들 수 있다.

여기서 `blocking = CPU를 계속 소비한다`는 뜻은 아니다. 일반적인 sleep 기반 wait에서는 기다리는 동안 다른 runnable task가 CPU를 사용할 수 있다. 대신 thread의 stack과 scheduling state, request context, connection 같은 resource는 계속 살아 있으므로 많은 blocking operation이 동시에 쌓이면 thread pool과 memory budget이 먼저 고갈될 수 있다.

### 호출이 돌아오는 조건도 여러 가지다

blocking `read(fd, buf, 4096)`이 항상 정확히 4096 byte를 채운 뒤 돌아오는 것은 아니다. object 종류와 상황에 따라 일부 bytes만 읽고 성공 반환할 수 있고, EOF나 signal interruption, timeout/error로 종료될 수도 있다. 따라서 blocking 여부와 `요청한 양 전체가 완료되었다`는 보장은 별개다.

stream protocol에서는 application이 필요한 message 길이를 알고 있다면 partial read를 누적하는 loop가 필요할 수 있다.

### 즉시 반환되는 blocking call도 있다

page cache에 data가 있거나 socket receive buffer에 이미 bytes가 있다면 blocking descriptor의 read도 즉시 끝날 수 있다. 따라서 blocking API를 사용한다는 사실만으로 해당 호출이 항상 느리다고 판단하지 않는다. 반대로 평소 빠르던 call도 storage/cache/network 상태가 달라지면 오래 기다릴 수 있다.

### Thread-per-request 모델과 연결하면

Spring MVC의 platform-thread request가 blocking DB/socket 호출을 수행하면 해당 request thread는 결과가 올 때까지 다른 request 코드를 실행하지 못한다. 그래서 executor worker 수, DB connection pool, HTTP client pool과 timeout이 하나의 concurrency budget을 만든다.

해결책이 항상 non-blocking 전환인 것은 아니다. blocking code가 단순하고 concurrency가 bounded하면 충분히 좋은 선택일 수 있다. 먼저 `active workers`, `blocked/waiting threads`, queue wait, downstream saturation을 측정해 실제 병목을 확인한다.
