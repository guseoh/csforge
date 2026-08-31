---
kind: concept
contentKey: java.core.io-nio.blocking-nonblocking-selector
topicContentKey: java.core.io-nio
slug: blocking-nonblocking-selector
title: "Blocking, non-blocking, and Selector"
summary: "Java NIO에서 blocking과 non-blocking 호출의 차이와 Selector가 여러 channel의 준비 상태를 관찰하는 방식을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SelectableChannel.html"
    title: "Java SE 25 API: SelectableChannel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: blocking mode 전환과 Selector 등록 제약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Selector.html"
    title: "Java SE 25 API: Selector"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: selection operation과 selected key의 준비 상태 확인
---
# Blocking, non-blocking, and Selector

서버가 socket에서 데이터를 읽으려고 했는데 아직 클라이언트가 아무 데이터도 보내지 않았다고 생각해 보겠습니다. **Blocking I/O**에서는 읽기 작업이 진행될 조건이 될 때까지 현재 thread가 그 호출에서 기다릴 수 있습니다. 반면 **non-blocking mode**에서는 지금 당장 가능한 만큼 처리하고 호출이 돌아오도록 구성할 수 있습니다.

Java NIO의 `Selector`는 여러 selectable channel을 하나의 loop에서 관찰하고 **어떤 channel이 지금 특정 I/O 작업을 시도할 준비가 되었는지** 확인하는 모델을 제공합니다.

### blocking은 기다리는 동안 현재 thread가 다음 코드로 가지 못할 수 있다

개념적으로 다음과 같습니다.

```text
thread
  │
  ├─ read(channel)
  │      │
  │      └─ data가 없으면 기다림
  │
  └─ 다음 코드  <- read가 돌아온 뒤 실행
```

Blocking 자체가 나쁜 것은 아닙니다. 코드 흐름이 단순하고, 작업당 thread 모델이나 virtual thread와 결합하면 많은 서버 프로그램에서 충분히 좋은 선택이 될 수 있습니다.

중요한 것은 "blocking = 느림"으로 외우는 것이 아니라 **호출이 진행 조건을 기다릴 때 어떤 thread가 묶이는가**를 이해하는 것입니다.

### non-blocking mode에서는 현재 가능한 상태를 확인한다

SelectableChannel은 non-blocking mode로 설정할 수 있습니다.

```java
channel.configureBlocking(false);
```

이 모드에서는 I/O 호출이 "원하는 전체 작업이 끝날 때까지 현재 thread를 기다리게 하는 방식"과 다르게 동작합니다. 예를 들어 지금 읽을 byte가 없다면 즉시 현재 가능한 결과를 반환할 수 있습니다.

하지만 non-blocking이라고 데이터가 항상 즉시 존재한다는 뜻은 아닙니다. 오히려 애플리케이션이 **언제 다시 시도할지**를 관리해야 합니다.

### 계속 반복해서 확인하면 CPU를 낭비할 수 있다

다음처럼 아무 준비도 되지 않았는데 무한히 read를 반복하면 busy loop가 될 수 있습니다.

```text
while (true)
   channel A 확인 -> 없음
   channel B 확인 -> 없음
   channel C 확인 -> 없음
   다시 A 확인...
```

Selector는 여러 channel을 등록해 두고 준비 상태 변화가 있는 channel을 찾도록 도와줍니다.

```text
channel A ─┐
channel B ─┼─ register ─> Selector
channel C ─┘                │
                            │ select
                            ▼
                    준비된 SelectionKey
                            │
                            ▼
                     실제 read/write
```

### Selector가 알려 주는 것은 "준비 상태"다

```java
Selector selector = Selector.open();
channel.configureBlocking(false);
channel.register(selector, SelectionKey.OP_READ);

int readyCount = selector.select();
```

`select()` 이후 선택된 key를 보면 어떤 channel이 read/write/connect 등의 관심 작업에 대해 준비됐는지 판단할 수 있습니다.

하지만 **readable = 메시지 전체가 이미 도착했다**는 뜻은 아닙니다. 실제 read를 했을 때 일부 데이터만 얻을 수 있고, application protocol의 한 메시지가 여러 network read로 나뉠 수도 있습니다.

```text
read-ready
   │
   ▼
현재 읽을 수 있는 data가 있음
   │
   ├─ 메시지 전체일 수도 있음
   └─ 메시지 일부일 수도 있음
```

Protocol framing은 Selector가 해결하지 않습니다.

### selected key도 처리 후 관리해야 한다

Selector loop에서는 선택된 key를 처리하고 selected set에서 적절히 제거하는 lifecycle을 관리해야 합니다. Channel이 닫히거나 관심 operation이 바뀌는 경우도 고려합니다.

단순 예제의 핵심 흐름은 다음과 같습니다.

```text
1. channel을 non-blocking으로 설정
2. selector에 관심 operation 등록
3. select로 준비된 channel 확인
4. selected key 순회
5. 실제 I/O 수행
6. key 상태 정리
7. 다음 selection 반복
```

### Java Selector와 OS의 epoll/kqueue는 같은 추상화 층이 아니다

Linux에서는 epoll 같은 OS 기능이 readiness 기반 I/O에 사용될 수 있습니다. 하지만 Java `Selector` API가 "항상 epoll syscall을 정확히 몇 번 호출한다" 같은 구현을 언어 수준에서 보장하는 것은 아닙니다.

Java 코드에서는 Selector라는 JDK API 계약을 배우고, OS 영역에서는 epoll/kqueue 등 커널의 I/O notification 방식을 별도로 이해하는 편이 정확합니다.

### 백엔드 개발자가 언제 이걸 알아야 할까

Spring MVC에서 직접 Selector loop를 구현하는 경우는 흔하지 않습니다. 하지만 Netty, reactive server, non-blocking HTTP client 같은 기술이 "적은 수의 event-loop thread로 많은 connection을 다룬다"고 설명할 때 그 배경을 이해하는 데 도움이 됩니다.

반대로 virtual thread 기반 blocking 코드가 왜 다시 실용적인 선택이 될 수 있는지도 **blocking API와 OS thread를 반드시 1:1로 많이 만들어야 한다는 가정이 달라졌기 때문**이라는 연결을 나중에 할 수 있습니다.

### 문제를 풀 때 확인할 것

1. channel이 blocking mode인지 non-blocking mode인지 봅니다.
2. 호출이 기다리는 동안 현재 thread가 어떻게 되는지 생각합니다.
3. Selector에 어떤 interest operation을 등록했는지 확인합니다.
4. selected key의 readiness와 실제 작업 완료를 구분합니다.
5. 한 번의 read가 protocol message 전체라고 가정하지 않습니다.

### 면접에서 설명한다면

Blocking I/O는 작업 조건이 충족될 때까지 호출한 thread가 기다릴 수 있고, non-blocking channel은 현재 가능한 결과를 반환해 애플리케이션이 이후 시도를 관리하게 합니다. Selector는 여러 non-blocking selectable channel의 readiness를 한 loop에서 관찰할 수 있게 합니다. Readiness는 작업 완료나 전체 메시지 수신을 의미하지 않으며 Java Selector API와 OS의 구체적인 event mechanism도 구분해야 합니다.
