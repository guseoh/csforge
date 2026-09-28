---
kind: concept
contentKey: operating-systems.core.ipc.message-queue
topicContentKey: operating-systems.core.ipc
slug: message-queue
title: "메시지 큐(Message Queue)"
summary: "커널이 메시지 경계를 보존하는 유한 큐와 데이터 복사 비용을 설명한다."
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
# 메시지 큐(Message Queue)

운영체제 수준 메시지 큐는 프로세스가 커널이 관리하는 큐에 **메시지 단위로 데이터를 넣고 꺼내는 IPC**다. 파이프가 바이트 스트림이어서 애플리케이션이 프레이밍을 직접 정의해야 하는 것과 달리, 메시지 큐는 큐 추상화 자체가 메시지 경계를 보존한다.

### 메시지 경계와 큐 용량

생산자가 `A`, `B`라는 두 메시지를 보내면 소비자는 큐 API가 정의한 메시지 단위로 수신한다. 대신 각 메시지의 최대 크기와 큐 전체 용량 같은 제한이 존재할 수 있다.

소비자보다 생산자가 빠르면 큐가 가득 찰 수 있다. 블로킹 전송이라면 공간이 생길 때까지 기다릴 수 있고, 논블로킹 모드에서는 즉시 실패할 수 있다. 따라서 메시지 큐는 메시지 경계 보존뿐 아니라 **유한한 용량을 통해 생산자와 소비자의 속도를 연결**한다.

### 우선순위와 순서는 API 계약을 따른다

POSIX 메시지 큐처럼 메시지 우선순위를 지원하는 인터페이스가 있을 수 있다. 같은 우선순위 안의 순서, 블로킹 동작, 객체 생명주기는 구체적인 API 계약을 확인해야 한다. 모든 운영체제 메시지 큐가 동일한 순서 보장이나 영속성 계약을 갖는다고 일반화하면 안 된다.

### 공유 메모리와 비교

메시지 큐는 메시지 경계와 큐 관리를 커널이 담당하므로 통신 프로토콜을 단순하게 만들 수 있지만 payload 복사와 큐 용량 비용이 있다. 공유 메모리는 큰 데이터 복사를 줄일 수 있지만 동기화와 데이터 배치 구조를 프로세스들이 직접 설계해야 한다.

운영체제 메시지 큐의 핵심은 **커널이 독립된 메시지와 유한 큐를 관리한다는 것**이다. 외부 메시지 브로커가 제공하는 영속 저장, 재전송, 소비자 그룹 같은 계약과는 다른 층의 개념이다.

```text
생산자 ── 메시지 A, 메시지 B ──→ 유한한 커널 큐 ──→ 소비자
                                     메시지 경계 보존
                                     용량 제한
```

큐가 가득 찼을 때 기다릴지 즉시 실패할지는 사용하는 큐 API와 블로킹 설정에 달려 있다.
