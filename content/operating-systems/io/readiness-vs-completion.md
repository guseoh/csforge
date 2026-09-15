---
kind: concept
contentKey: operating-systems.core.io.readiness-vs-completion
topicContentKey: operating-systems.core.io
slug: readiness-vs-completion
title: "Readiness / Completion"
summary: "I/O를 지금 시도할 수 있다는 readiness와 이미 제출한 operation의 결과가 나온 completion을 구분한다."
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
# Readiness / Completion

Readiness와 completion은 모두 I/O event를 알려주지만 **event가 의미하는 상태가 다르다.**

![readiness와 completion 모델의 control flow 차이](/learning/operating-systems/readiness-vs-completion.svg)

### Readiness는 `지금 시도할 조건`을 알려준다

Readable event가 왔다는 것은 현재 read를 시도하면 progress할 조건이 있다는 뜻이다. Application은 event를 받은 뒤 실제 `read()`를 호출한다.

```text
kernel: fd readable
      ↓ readiness event
application: read()
      ↓
bytes / EOF / error / EAGAIN 처리
```

Ready라고 해서 application message 전체가 도착했다는 뜻은 아니다. 현재 준비된 일부 byte만 읽을 수도 있다.

### Completion은 `제출한 operation의 결과`를 알려준다

Completion model에서는 application이 먼저 read/write operation을 제출하고, 나중에 그 **특정 operation의 result**를 받는다.

```text
submit read(buffer, N)
        ↓
I/O 진행
        ↓
completion(result)
```

이 경우 buffer와 operation identity는 completion이 끝날 때까지 적절한 lifetime을 유지해야 한다.

### 둘 다 application-level 완료와는 다르다

Readiness event 하나나 I/O completion 하나가 protocol message, file 전체 처리, business request 완료를 의미하지는 않는다. 추가 read/write가 필요할 수 있다.

Readiness / Completion의 핵심은 **readiness에서는 event 뒤 application이 I/O를 시도하고, completion에서는 I/O를 먼저 제출한 뒤 그 결과를 event로 받는다는 차이**다.