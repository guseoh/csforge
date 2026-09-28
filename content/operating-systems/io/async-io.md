---
kind: concept
contentKey: operating-systems.core.io.async-io
topicContentKey: operating-systems.core.io
slug: async-io
title: "비동기 입출력(Asynchronous I/O)"
summary: "연산을 먼저 제출하고 나중에 완료 결과를 수집하는 모델과 버퍼·cancellation·역압(backpressure) 책임을 설명한다."
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
# 비동기 입출력(Asynchronous I/O)

Asynchronous I/O는 호출자가 I/O 연산을 먼저 제출하고 그 자리에서 완료를 기다리지 않은 뒤, **나중에 그 submission의 결과를 완료 형태로 받는 모델**이다. 준비 상태가 "지금 I/O를 시도할 수 있다"는 상태를 알려주는 것이라면 완료은 "앞서 제출한 이 연산이 이런 결과로 끝났다"는 사건이다.

Linux `io_uring`을 예로 들면 사용자 space는 submission 큐를 통해 연산을 제출하고 커널은 처리 결과를 완료 큐로 돌려준다. 이 구체적인 API가 모든 OS의 표준 모델이라는 뜻은 아니지만 submission과 완료을 분리해 이해하기 좋은 사례다.

### Submission과 완료 사이에도 상태가 존재한다

Async read를 제출할 때 파일 오프셋, destination 버퍼, 연산을 식별할 token 같은 정보가 필요할 수 있다. 완료이 오기 전까지 이 상태의 수명을 안전하게 유지해야 한다. API에 따라 커널/런타임이 버퍼를 직접 참조할 수 있으므로 submit 직후 버퍼를 자유롭게 재사용할 수 있다고 일반화하면 안 된다.

완료 결과도 성공 바이트 수, EOF, error, cancellation 등을 구분해야 한다. 한 read 연산이 완료되었다고 애플리케이션 메시지 전체가 완성되었다는 뜻은 아니다.

### Non-블로킹과의 차이

논블로킹 I/O에서는 지금 진행할 수 없으면 즉시 반환하고 호출자가 나중에 다시 `read()`나 `write()`를 시도한다. Async 완료 model에서는 연산을 먼저 제출하고 그 결과를 나중에 받는다.

```text
readiness/non-blocking
ready event → application이 read() → 결과 처리

completion-oriented async
submit read → 다른 일 수행 → completion result 수신
```

### 비동기여도 용량는 유한하다

호출자 스레드가 block되지 않는다고 장치 처리량과 메모리가 무한해지는 것은 아니다. Submission이 완료보다 지속적으로 빠르면 outstanding 연산, 버퍼 메모리, 장치 큐가 계속 쌓일 수 있다. 따라서 max in-flight, 큐 depth, 타임아웃/cancellation 같은 제한이 필요하다.

Cancellation도 별도 상태 전이다. 애플리케이션이 더 이상 결과를 원하지 않는 것과 underlying I/O가 실제로 중단된 것은 같은 사건이 아닐 수 있다. Async I/O의 핵심은 **wait를 없애는 것이 아니라 연산의 제출과 완료를 분리하고 그 사이의 상태와 자원 수명을 명시적으로 관리하는 것**이다.
