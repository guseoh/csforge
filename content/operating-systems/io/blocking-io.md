---
kind: concept
contentKey: operating-systems.core.io.blocking-io
topicContentKey: operating-systems.core.io
slug: blocking-io
title: "Blocking I/O"
summary: "완료까지 thread가 sleep하는 blocking 상태와 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# Blocking I/O

blocking I/O는 요청이 완료되거나 일부 결과가 생길 때까지 호출 thread가 기다리는 모델이다. 기다리는 동안 thread는 CPU를 쓰지 않을 수 있지만 worker와 stack, connection을 점유하므로 동시 요청 수가 커지면 pool이 고갈된다.

blocking은 반드시 느리다는 뜻이 아니며, local cache hit처럼 즉시 반환될 수도 있다. timeout, interrupt, partial read/write와 cancellation이 호출 계약에 포함되어야 한다.

### Backend 연결

Spring MVC에서 DB·HTTP client 호출이 block되는 동안 request thread가 묶인다. executor와 downstream pool 상한을 맞추고 timeout 뒤 자원을 확실히 반환한다.

