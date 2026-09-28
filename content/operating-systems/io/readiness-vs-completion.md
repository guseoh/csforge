---
kind: concept
contentKey: operating-systems.core.io.readiness-vs-completion
topicContentKey: operating-systems.core.io
slug: readiness-vs-completion
title: "준비 알림과 완료 통지(준비 상태 and 완료)"
summary: "I/O를 지금 시도할 수 있다는 준비 상태와 이미 제출한 연산의 결과가 나온 완료을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux readiness model에서 interest list와 ready list, level/edge-triggered semantics를 확인한다."
    displayOrder: 1
---
# 준비 알림과 완료 통지(준비 상태 and 완료)

준비 상태와 완료은 모두 I/O 이벤트를 알려주지만 **이벤트가 의미하는 상태가 다르다.**

![준비 상태와 완료 모델의 control flow 차이](/learning/operating-systems/준비 상태-vs-완료.svg)

### 준비 상태는 `지금 시도할 조건`을 알려준다

Readable 이벤트가 왔다는 것은 현재 read를 시도하면 진행할 조건이 있다는 뜻이다. 애플리케이션은 이벤트를 받은 뒤 실제 `read()`를 호출한다.

```text
kernel: fd readable
      ↓ readiness event
application: read()
      ↓
bytes / EOF / error / EAGAIN 처리
```

Ready라고 해서 애플리케이션 메시지 전체가 도착했다는 뜻은 아니다. 현재 준비된 일부 바이트만 읽을 수도 있다.

### 완료은 `제출한 operation의 결과`를 알려준다

완료 model에서는 애플리케이션이 먼저 read/write 연산을 제출하고, 나중에 그 **특정 연산의 결과**를 받는다.

```text
submit read(buffer, N)
        ↓
I/O 진행
        ↓
completion(result)
```

이 경우 버퍼와 연산 식별자는 완료이 끝날 때까지 적절한 수명을 유지해야 한다.

### 둘 다 애플리케이션-level 완료와는 다르다

준비 상태 이벤트 하나나 I/O 완료 하나가 프로토콜 메시지, 파일 전체 처리, business 요청 완료를 의미하지는 않는다. 추가 read/write가 필요할 수 있다.

준비 상태 / 완료의 핵심은 **준비 상태에서는 이벤트 뒤 애플리케이션이 I/O를 시도하고, 완료에서는 I/O를 먼저 제출한 뒤 그 결과를 이벤트로 받는다는 차이**다.