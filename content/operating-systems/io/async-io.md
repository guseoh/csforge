---
kind: concept
contentKey: operating-systems.core.io.async-io
topicContentKey: operating-systems.core.io
slug: async-io
title: "Asynchronous I/O"
summary: "operation을 먼저 제출하고 나중에 completion result를 수집하는 모델과 buffer·cancellation·backpressure 책임을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/io_uring.7.html"
    title: "io_uring(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux io_uring의 submission queue와 completion queue가 operation/result를 연결하는 모델을 확인한다."
    displayOrder: 1
---
# Asynchronous I/O

asynchronous I/O는 caller가 I/O operation을 제출한 뒤 그 자리에서 완료될 때까지 기다리지 않고 다른 작업을 진행하며, **나중에 해당 submission의 completion result를 받는 모델**이다. readiness가 `지금 시도할 수 있다`는 상태를 알려주는 것과 달리 completion은 구체적인 operation 결과와 연결된다.

Linux의 `io_uring`을 concrete example로 보면 user space는 submission queue에 operation description을 넣고 kernel은 처리 결과를 completion queue에 기록한다. 이 구조 자체가 모든 OS의 async API 표준이라는 뜻은 아니지만 readiness/completion 차이를 이해하기 좋은 모델이다.

### Submission과 completion 사이에는 state가 살아 있다

async read에 destination buffer와 file offset, user data token을 넣어 제출했다면 completion이 오기 전까지 그 operation을 식별하고 필요한 resource lifetime을 유지해야 한다. runtime/API에 따라 buffer를 고정하거나 복사할 수 있으므로 `submit 직후 buffer를 자유롭게 재사용해도 된다`고 일반화하면 안 된다.

completion result 역시 성공 byte 수, EOF, cancellation, error를 구분해야 한다. stream/message 전체가 완료되려면 한 completion 이후 추가 operation을 제출해야 할 수도 있다.

### 비동기는 무한 concurrency를 허용하지 않는다

thread가 block되지 않는다고 operation 수를 무제한으로 제출하면 submission queue, memory buffer, device queue와 downstream capacity가 포화된다. completion이 처리되는 속도보다 submission이 빠르면 outstanding operation과 memory가 계속 증가한다.

따라서 max in-flight, queue depth, deadline과 admission control이 필요하다. 이는 thread pool의 bounded queue와 같은 문제를 다른 execution model에서 다시 만나는 것이다.

### Cancellation도 결과 상태다

timeout future가 완료됐다고 실제 kernel/device operation이 취소되었다는 뜻은 아니다. cancellation request가 race에서 이미 완료된 operation과 교차할 수도 있다. application은 `result를 더 이상 사용하지 않는다`와 `underlying I/O가 실제로 중단되었다`를 분리해 resource lifetime을 안전하게 관리해야 한다.

### Async API가 kernel thread 0개를 뜻하지 않는다

언어/runtime의 asynchronous abstraction은 내부적으로 kernel async facility를 사용할 수도 있고 worker thread에서 blocking call을 대신 수행할 수도 있다. 따라서 `Future를 반환하니 OS thread를 전혀 사용하지 않는다`고 추론하지 않는다. framework/runtime 구현과 실제 thread/I/O metric을 확인한다.

Backend에서는 async HTTP/file pipeline의 처리량을 높일 때 callback 수가 아니라 in-flight operation, completion latency, buffer memory와 downstream capacity를 함께 측정한다.
