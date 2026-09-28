---
kind: concept
contentKey: operating-systems.core.ipc.message-queue
topicContentKey: operating-systems.core.ipc
slug: message-queue
title: "메시지 큐(메시지 큐)"
summary: "커널이 메시지 경계를 보존하는 큐와 복사 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/mq_overview.7.html"
    title: "mq_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "POSIX message queue의 message boundary, priority, blocking/non-blocking와 lifetime을 확인한다."
    displayOrder: 1
---
# 메시지 큐(메시지 큐)

OS-level 메시지 큐는 프로세스가 커널이 관리하는 큐에 **메시지 단위로 data를 넣고 꺼내는 IPC**다. 파이프가 바이트 스트림이라 애플리케이션이 프레이밍을 직접 정의해야 하는 것과 달리, 메시지 큐는 큐 추상화 자체가 메시지 경계를 보존한다.

### 메시지 경계와 용량

Producer가 `A`, `B`라는 두 메시지를 보내면 receiver는 큐 API가 정의한 메시지 단위로 수신한다. 대신 각 메시지의 최대 크기와 큐 용량 같은 제한이 존재할 수 있다.

Consumer보다 producer가 빠르면 큐가 가득 찰 수 있다. 블로킹 send라면 공간이 생길 때까지 기다릴 수 있고, 논블로킹 mode에서는 즉시 실패할 수 있다. 따라서 큐는 메시지 프레이밍뿐 아니라 **bounded 용량를 통한 producer-consumer 속도 연결**도 제공한다.

### 우선순위와 ordering은 API 계약을 따른다

POSIX 메시지 큐처럼 메시지 우선순위를 지원하는 interface가 있을 수 있다. 같은 우선순위 안의 순서, 블로킹 의미와 수명은 구체적인 API 계약을 확인해야 한다. 모든 OS 메시지 큐가 동일한 ordering이나 persistence 의미를 갖는다고 일반화하면 안 된다.

### 공유 메모리와 비교

메시지 큐는 메시지 경계와 큐 ownership을 커널이 관리해 communication 프로토콜을 단순하게 만들 수 있지만 payload 복사와 큐 용량 비용이 있다. 공유 메모리는 큰 data 복사를 줄일 수 있지만 동기화과 layout을 프로세스들이 직접 설계해야 한다.

OS 메시지 큐의 핵심은 **커널이 discrete 메시지와 bounded 큐를 관리한다는 것**이며, 외부 broker의 영속성·redelivery·consumer-group 의미와는 다른 층의 개념이다.

### 흐름으로 보기

```text
Producer ── message A, message B ──→ bounded kernel queue ──→ Consumer
                                      경계 보존
                                      capacity 제한
```

큐가 가득 찼을 때 기다릴지 즉시 실패할지는 사용 중인 큐 API와 블로킹 설정에 달려 있다.
