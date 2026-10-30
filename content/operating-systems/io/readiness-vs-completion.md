---
kind: concept
contentKey: operating-systems.core.io.readiness-vs-completion
topicContentKey: operating-systems.core.io
slug: readiness-vs-completion
title: "준비 알림과 완료 통지(Readiness and Completion)"
summary: "I/O를 지금 시도할 수 있다는 준비 상태(readiness)와 이미 제출한 연산의 결과가 나온 완료(completion)를 구분한다."
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
# 준비 알림과 완료 통지(Readiness and Completion)

준비 알림(readiness)과 완료 통지(completion)는 모두 I/O 사건을 알려주지만 **그 사건이 의미하는 상태가 다르다.**

![준비 알림과 완료 통지 모델의 제어 흐름 차이](/learning/operating-systems/readiness-vs-completion.svg)

### 준비 알림은 `지금 시도할 조건`을 알려준다

읽기 가능(readable) 이벤트가 왔다는 것은 현재 `read()`를 시도하면 진행할 조건이 있다는 뜻이다. 애플리케이션은 이벤트를 받은 뒤 실제 `read()`를 호출한다.

```text
커널: fd가 읽기 가능
      ↓ 준비 알림
애플리케이션: read()
      ↓
바이트 / EOF / 오류 / EAGAIN 처리
```

준비됐다고 해서 애플리케이션 메시지 전체가 도착했다는 뜻은 아니다. 현재 준비된 일부 바이트만 읽을 수도 있다.

### 완료 통지는 `제출한 연산의 결과`를 알려준다

완료 기반 모델에서는 애플리케이션이 먼저 읽기·쓰기 연산을 제출하고, 나중에 그 **특정 연산의 결과**를 받는다.

```text
read(buffer, N) 제출
        ↓
I/O 진행
        ↓
완료 결과 수신
```

이 경우 버퍼와 연산 식별 정보는 완료 결과를 받을 때까지 적절한 생명주기를 유지해야 한다.

### 둘 다 애플리케이션 수준의 작업 완료와는 다르다

준비 이벤트 하나나 I/O 완료 결과 하나가 프로토콜 메시지, 파일 전체 처리, 비즈니스 요청 전체가 끝났다는 뜻은 아니다. 추가 읽기·쓰기가 필요할 수 있다.

핵심은 **준비 알림에서는 이벤트를 받은 뒤 애플리케이션이 I/O를 시도하고, 완료 통지에서는 I/O를 먼저 제출한 뒤 그 결과를 이벤트로 받는다는 차이**다.