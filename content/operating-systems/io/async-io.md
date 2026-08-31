---
kind: concept
contentKey: operating-systems.core.io.async-io
topicContentKey: operating-systems.core.io
slug: async-io
title: "Asynchronous I/O"
summary: "I/O 완료를 callback·future·completion queue로 받는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# Asynchronous I/O

asynchronous I/O는 호출자가 작업을 시작한 뒤 완료를 기다리지 않고 다른 일을 수행하며, 나중에 callback·future·completion queue로 결과를 받는 모델이다. buffer는 완료 전까지 유효해야 하고 cancellation과 error가 비동기적으로 도착할 수 있다.

비동기 API가 thread를 전혀 사용하지 않는다는 뜻은 아니다. runtime이 worker나 kernel facility를 사용할 수 있으므로 callback 실행 context와 backpressure를 계약으로 둔다.

### Backend 연결

CompletableFuture pipeline에서 timeout은 원격 작업을 실제로 중단하지 않을 수 있다. 결과 무시와 resource cancellation을 분리해 downstream 작업이 계속 쌓이지 않게 한다.

