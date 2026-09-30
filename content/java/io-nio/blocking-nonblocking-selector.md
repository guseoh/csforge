---
kind: concept
contentKey: java.core.io-nio.blocking-nonblocking-selector
topicContentKey: java.core.io-nio
slug: blocking-nonblocking-selector
title: "블로킹·논블로킹 I/O와 Selector"
summary: "Java NIO에서 블로킹(blocking)과 논블로킹(non-blocking) 호출의 차이와 Selector가 여러 채널(channel)의 준비 상태를 관찰하는 방식을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SelectableChannel.html"
    title: "Java SE 25 API: SelectableChannel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 블로킹 모드 전환과 Selector 등록 제약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Selector.html"
    title: "Java SE 25 API: Selector"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 선택 연산과 선택 키의 준비 상태 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SelectionKey.html"
    title: "Java SE 25 API: SelectionKey"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: 관심 집합·준비 집합·키 생명주기와 준비 상태(readiness)의 보장 범위 확인
---
# 블로킹·논블로킹 I/O와 Selector

Socket에서 데이터를 읽으려는데 아직 들어온 바이트가 없다고 생각해 보겠습니다. 블로킹 모드에서는 읽기 작업이 진행될 조건이 될 때까지 현재 스레드가 그 호출에서 기다릴 수 있습니다. 논블로킹 모드에서는 **현재 가능한 만큼 처리하고 호출이 돌아오며**, 이후 다시 시도할 시점을 애플리케이션이 관리합니다.

`Selector`는 여러 논블로킹 채널의 **준비 상태(readiness)** 를 하나의 반복 흐름에서 관찰하는 추상화입니다.

![Java NIO Selector 준비 상태 흐름](/learning/java/nio-selector-readiness.svg)

### 블로킹과 논블로킹은 호출한 스레드가 기다리는 방식의 차이다

블로킹 읽기를 단순화하면 다음과 같습니다.

```text
스레드
  │
  ├─ read(channel)
  │      └─ 읽을 데이터가 없으면 여기서 기다릴 수 있음
  │
  └─ 다음 코드
```

블로킹 방식 자체가 느리거나 잘못된 모델이라는 뜻은 아닙니다. 중요한 것은 **I/O 조건을 기다리는 동안 어떤 스레드가 다음 작업으로 진행하지 못하는가**입니다.

논블로킹 채널은 다음처럼 설정할 수 있습니다.

```java
channel.configureBlocking(false);
```

이 모드에서는 요청한 전체 바이트가 준비되지 않았더라도 현재 가능한 결과를 반환할 수 있습니다. 따라서 논블로킹은 "작업이 항상 즉시 완료된다"는 뜻이 아니라 **완료되지 않은 상태를 호출자가 직접 다룰 수 있다**는 뜻에 가깝습니다.

### Selector는 여러 channel을 계속 polling하는 대신 준비된 channel을 찾는다

각 channel을 무한히 직접 확인하면 아무 작업도 준비되지 않았을 때 CPU를 낭비할 수 있습니다.

```text
A 확인 -> 없음
B 확인 -> 없음
C 확인 -> 없음
다시 A...
```

Selector에는 관심 있는 연산을 등록하고 선택 연산을 수행할 수 있습니다.

```java
Selector selector = Selector.open();
channel.configureBlocking(false);
channel.register(selector, SelectionKey.OP_READ);

int readyCount = selector.select();
```

Selector에 등록하는 선택 가능한 채널은 논블로킹 모드여야 합니다. `select()`는 준비된 채널이 생길 때까지 기다릴 수 있고, `selectNow()`는 즉시 반환합니다.

여기서 **채널 I/O가 논블로킹인지와 `Selector`의 선택 연산 호출이 기다릴 수 있는지는 서로 다른 질문**입니다.

### 관심 집합과 준비 집합을 구분한다

등록할 때는 어떤 작업에 관심 있는지를 지정합니다.

```text
Channel A -> OP_READ 관심
Channel B -> OP_WRITE 관심
```

선택 이후에는 그 관심 작업 중 현재 수행할 준비가 되었다고 판단된 연산을 `SelectionKey`에서 확인합니다.

```text
관심 이벤트 집합(interest set)
   │ select
   ▼
준비된 이벤트 집합(ready set)
```

전통적인 `selectedKeys()` loop에서는 처리한 키를 선택된 집합에서 제거하는 등의 생명주기도 애플리케이션이 관리합니다. Channel close나 키 cancel도 selector 등록 상태와 연결되므로 키 validity를 함께 봐야 합니다.

### 준비 상태는 작업 완료 보장이 아니다

`OP_READ`가 ready라고 해서 애플리케이션 메시지 하나를 전부 읽을 수 있다는 뜻은 아닙니다.

```text
TCP 바이트 도착
   │
   ▼
읽기 준비 완료(READ ready)
   │
   ▼
channel.read(buffer)
   │
   ├─ 메시지 일부만 읽을 수 있음
   ├─ 정확히 한 메시지일 수 있음
   └─ 여러 메시지의 byte가 함께 들어올 수 있음
```

Selector는 HTTP나 길이 접두사(length-prefix) 프로토콜의 메시지 경계를 알지 못합니다. 부분 읽은 데이터를 `Buffer`에 이어 붙이고 완전한 메시지인지 판단하는 책임은 상위 프로토콜 처리에 있습니다.

또 준비 상태는 해당 연산을 지금 시도할 만한 상태라는 정보이지, 호출 순간까지 무조건 기다리지 않고 완료된다는 절대 보장으로 이해하지 않는 편이 정확합니다.

### Java Selector와 OS의 epoll·kqueue를 같은 것으로 보지 않는다

JDK 구현은 운영체제별 준비 상태 방식을 활용할 수 있습니다. 하지만 Java 애플리케이션이 의존하는 계약은 `Selector`, `SelectableChannel`, `SelectionKey`입니다.

```text
Java API 계층
Selector / SelectionKey
        │
        ▼
JDK 구현
        │
        ▼
OS별 입출력 준비 통지 방식
```

따라서 "Selector = epoll"이라고 동일시하면 API 계약과 구현 세부를 섞게 됩니다.

이 모델을 이해할 때 핵심은 세 가지입니다. **블로킹/논블로킹이 스레드의 대기 방식을 어떻게 바꾸는지, Selector가 여러 채널의 준비 상태를 어떻게 모으는지, 그리고 준비 상태가 실제 애플리케이션 메시지의 완료를 뜻하지 않는다는 것**입니다. 이 구분이 잡히면 Netty나 이벤트 루프(event loop) 기반 서버의 배경도 훨씬 읽기 쉬워집니다.
