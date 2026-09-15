---
kind: concept
contentKey: operating-systems.core.io.async-io
topicContentKey: operating-systems.core.io
slug: async-io
title: "Asynchronous I/O"
summary: "operation을 먼저 제출하고 나중에 completion result를 수집하는 모델과 buffer·cancellation·backpressure 책임을 설명한다."
level: 3
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
  - url: "https://tech.kakao.com/posts/680"
    title: "실시간 메시징 시스템 개발기 - 성능 개선 레슨런"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "실시간 messaging server에서 io_uring 도입을 검토하며 syscall/context-switch 비용과 실제 성능을 평가한 사례를 확인한다."
    displayOrder: 2
---
# Asynchronous I/O

Asynchronous I/O는 caller가 I/O operation을 먼저 제출하고 그 자리에서 완료를 기다리지 않은 뒤, **나중에 그 submission의 결과를 completion 형태로 받는 모델**이다. Readiness가 "지금 I/O를 시도할 수 있다"는 상태를 알려주는 것이라면 completion은 "앞서 제출한 이 operation이 이런 결과로 끝났다"는 사건이다.

Linux `io_uring`을 예로 들면 user space는 submission queue를 통해 operation을 제출하고 kernel은 처리 결과를 completion queue로 돌려준다. 이 구체적인 API가 모든 OS의 표준 모델이라는 뜻은 아니지만 submission과 completion을 분리해 이해하기 좋은 사례다.

### Submission과 completion 사이에도 상태가 존재한다

Async read를 제출할 때 file offset, destination buffer, operation을 식별할 token 같은 정보가 필요할 수 있다. Completion이 오기 전까지 이 state의 lifetime을 안전하게 유지해야 한다. API에 따라 kernel/runtime이 buffer를 직접 참조할 수 있으므로 submit 직후 buffer를 자유롭게 재사용할 수 있다고 일반화하면 안 된다.

Completion result도 성공 byte 수, EOF, error, cancellation 등을 구분해야 한다. 한 read operation이 완료되었다고 application message 전체가 완성되었다는 뜻은 아니다.

### Non-blocking과의 차이

Non-blocking I/O에서는 지금 progress할 수 없으면 즉시 반환하고 caller가 나중에 다시 `read()`나 `write()`를 시도한다. Async completion model에서는 operation을 먼저 제출하고 그 결과를 나중에 받는다.

```text
readiness/non-blocking
ready event → application이 read() → 결과 처리

completion-oriented async
submit read → 다른 일 수행 → completion result 수신
```

### 비동기여도 capacity는 유한하다

Caller thread가 block되지 않는다고 device 처리량과 memory가 무한해지는 것은 아니다. Submission이 completion보다 지속적으로 빠르면 outstanding operation, buffer memory, device queue가 계속 쌓일 수 있다. 따라서 max in-flight, queue depth, timeout/cancellation 같은 제한이 필요하다.

Cancellation도 별도 상태 전이다. Application이 더 이상 결과를 원하지 않는 것과 underlying I/O가 실제로 중단된 것은 같은 사건이 아닐 수 있다. Async I/O의 핵심은 **wait를 없애는 것이 아니라 operation의 제출과 완료를 분리하고 그 사이의 state와 resource lifetime을 명시적으로 관리하는 것**이다.
