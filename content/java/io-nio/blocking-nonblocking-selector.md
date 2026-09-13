---
kind: concept
contentKey: java.core.io-nio.blocking-nonblocking-selector
topicContentKey: java.core.io-nio
slug: blocking-nonblocking-selector
title: "Blocking·Non-blocking I/O와 Selector"
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
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/SelectionKey.html"
    title: "Java SE 25 API: SelectionKey"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: interest set·ready set·key lifecycle과 readiness의 보장 범위 확인
---
# Blocking·Non-blocking I/O와 Selector

서버가 socket에서 데이터를 읽으려고 했는데 아직 클라이언트가 아무 데이터도 보내지 않았다고 생각해 보겠습니다. **Blocking I/O**에서는 읽기 작업이 진행될 조건이 될 때까지 현재 thread가 그 호출에서 기다릴 수 있습니다. 반면 **non-blocking mode**에서는 지금 당장 가능한 만큼 처리하고 호출이 돌아오도록 구성할 수 있습니다.

Java NIO의 `Selector`는 여러 selectable channel을 하나의 loop에서 관찰하고 **어떤 channel이 지금 특정 I/O 작업을 시도할 준비가 되었는지** 확인하는 모델을 제공합니다.

![Java NIO Selector readiness 흐름](/learning/java/nio-selector-readiness.svg)

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

중요한 것은 "blocking = 느림"으로 외우는 것이 아니라 **호출이 진행 조건을 기다릴 때 어떤 thread가 그 지점에서 진행하지 못하는가**를 이해하는 것입니다.

### non-blocking mode에서는 지금 가능한 만큼 처리한다

SelectableChannel은 non-blocking mode로 설정할 수 있습니다.

```java
channel.configureBlocking(false);
```

Java SE 25의 `SelectableChannel` 계약에서 non-blocking I/O는 호출한 thread를 완료될 때까지 붙잡지 않으며, 요청한 것보다 적은 byte 또는 아무 byte도 전송하지 못한 결과가 나올 수도 있습니다. 따라서 non-blocking은 **작업이 즉시 완료된다**는 뜻이 아니라 **현재 가능한 결과를 보고 이후 시도를 애플리케이션이 관리한다**는 뜻에 가깝습니다.

Selector에 등록하려는 selectable channel은 먼저 non-blocking mode여야 합니다. 등록된 상태에서 다시 blocking mode로 바꾸는 것도 허용되지 않으므로 mode와 registration lifecycle을 함께 봐야 합니다.

### 계속 직접 확인하면 busy loop가 될 수 있다

아무 channel도 준비되지 않았는데 다음처럼 계속 확인하면 CPU를 낭비할 수 있습니다.

```text
while (true)
   channel A 확인 -> 없음
   channel B 확인 -> 없음
   channel C 확인 -> 없음
   다시 A 확인...
```

Selector는 여러 channel을 등록하고 관심 있는 operation을 지정한 뒤 selection operation으로 준비 상태 변화를 확인하게 합니다.

```java
Selector selector = Selector.open();
channel.configureBlocking(false);
channel.register(selector, SelectionKey.OP_READ);

int readyCount = selector.select();
```

`select()` 계열은 등록된 channel의 interest set과 현재 readiness를 비교합니다. 기본 `select()`는 준비된 channel이 생길 때까지 기다릴 수 있지만, `selectNow()`처럼 즉시 반환하는 selection API도 있습니다. 따라서 **channel I/O가 non-blocking이라는 사실과 selector의 selection call 자체가 기다릴 수 있는지는 서로 다른 질문**입니다.

### Selector는 등록 key와 selected key를 구분한다

Selector에는 등록된 모든 key의 집합과, 최근 selection에서 관심 operation 중 하나 이상이 ready라고 감지된 key의 집합이 따로 있습니다.

```text
registered keys
A: OP_READ
B: OP_WRITE
C: OP_READ
      │
      │ select()
      ▼
selected keys
A: READ ready
C: READ ready
```

전통적인 `selectedKeys()` loop를 사용한다면 처리한 key를 selected-key set에서 제거하는 lifecycle도 애플리케이션이 관리합니다. 이미 처리한 key를 계속 남겨 두면 다음 loop에서도 과거 selected 상태를 다시 다루는 코드가 되기 쉽습니다.

Channel을 닫거나 key를 `cancel()`하면 registration도 즉시 모든 내부 집합에서 사라지는 것이 아니라 cancellation과 다음 selection 과정이 연결됩니다. 그래서 selector loop에서는 key validity와 channel lifecycle을 함께 다뤄야 합니다.

### ready는 완료 보장이 아니라 현재 상태에 대한 힌트다

`SelectionKey`의 ready set은 해당 operation을 지금 수행하면 block하지 않을 가능성이 높다는 **readiness 정보**입니다. 공식 API도 이를 operation이 block 없이 수행될 수 있다는 보장이 아니라 hint로 설명합니다. 외부 이벤트나 그 사이 수행된 I/O 때문에 상태가 달라질 수도 있습니다.

더 중요한 것은 **read-ready = application message 전체 수신 완료**가 아니라는 점입니다.

```text
TCP bytes 도착
   │
   ▼
OP_READ ready
   │
   ▼
channel.read(buffer)
   │
   ├─ 메시지 전체가 들어왔을 수도 있음
   ├─ 헤더 일부만 들어왔을 수도 있음
   └─ 여러 메시지의 bytes가 함께 들어왔을 수도 있음
```

Selector는 protocol framing을 알지 못합니다. HTTP 요청, 길이-prefix message, line protocol처럼 어디까지가 한 메시지인지 판단하고 partial data를 Buffer에 이어 붙이는 책임은 그 위의 protocol/application logic에 있습니다.

### Java Selector와 epoll·kqueue는 같은 추상화 층이 아니다

Linux에서는 epoll, 다른 OS에서는 다른 readiness mechanism이 JDK 구현에 활용될 수 있습니다. 하지만 Java 코드가 의존하는 계약은 `Selector`, `SelectableChannel`, `SelectionKey`입니다.

따라서 "Java Selector는 곧 epoll이다" 또는 "항상 특정 syscall 하나를 이런 횟수로 호출한다"고 설명하면 구현 세부를 API 보장처럼 섞게 됩니다. OS 영역에서는 epoll/kqueue의 커널 동작을 따로 학습하고, Java 영역에서는 어떤 readiness abstraction을 제공하는지를 이해하는 편이 정확합니다.

### 백엔드 개발자가 이 모델을 알아야 하는 이유

Spring MVC 애플리케이션에서 직접 Selector loop를 만드는 일은 흔하지 않습니다. 그러나 Netty, reactive server, non-blocking HTTP client가 **소수의 event-loop thread로 많은 connection의 readiness를 처리한다**고 설명할 때 이 구조가 배경이 됩니다.

반대로 virtual thread가 blocking 스타일 코드를 다시 실용적인 선택으로 만드는 이유를 이해할 때도 도움이 됩니다. 이 둘은 "blocking은 낡았고 non-blocking이 항상 우월하다"는 경쟁 관계가 아니라 **thread를 기다림에 묶는 비용과 프로그래밍 모델의 복잡성을 어떻게 교환할 것인가**라는 설계 선택에 가깝습니다.

### 문제를 풀 때 확인할 것

1. channel이 blocking mode인지 non-blocking mode인지 봅니다.
2. channel I/O와 selector `select()` 자체의 blocking 여부를 구분합니다.
3. 어떤 interest operation으로 등록했는지 확인합니다.
4. selected key의 readiness와 실제 작업 완료를 구분합니다.
5. 한 번의 read가 protocol message 전체라고 가정하지 않습니다.
6. 처리한 selected key와 cancelled/closed channel의 lifecycle을 확인합니다.

### 자주 헷갈리는 부분

- non-blocking은 "데이터가 항상 즉시 있다"는 뜻이 아닙니다.
- `OP_READ` ready는 한 번의 read로 메시지 전체를 얻는다는 보장이 아닙니다.
- `select()`는 selector에 준비된 I/O를 찾는 호출이며 non-blocking channel을 쓴다고 그 호출까지 무조건 즉시 반환하는 것은 아닙니다.
- Java Selector API와 특정 OS의 epoll/kqueue 구현은 같은 추상화 수준이 아닙니다.

### 학습 후 스스로 설명해 보기

Blocking I/O는 작업 조건이 충족될 때까지 호출한 thread가 기다릴 수 있고, non-blocking channel은 현재 가능한 결과를 반환해 애플리케이션이 이후 시도를 관리하게 합니다. Selector는 여러 non-blocking selectable channel의 readiness를 한 loop에서 관찰할 수 있게 하지만 readiness는 작업 완료나 protocol message 전체 수신을 보장하지 않습니다. Java의 Selector 계약과 OS의 구체적인 event mechanism도 구분해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. non-blocking I/O를 쓰면 thread가 절대 기다리지 않는다고 말해도 되나요?

Channel의 non-blocking I/O operation은 완료될 때까지 thread를 block시키지 않지만, selector의 `select()` 자체는 준비된 event를 기다리는 blocking selection operation일 수 있습니다. 어떤 호출이 기다리는지 구체적으로 나눠 설명해야 합니다.

#### Q. Selector에서 `OP_READ`가 ready면 HTTP 요청 하나를 전부 읽었다는 뜻인가요?

아닙니다. Readiness는 지금 읽기를 시도할 수 있다는 신호일 뿐 application message boundary를 보장하지 않습니다. 실제 read는 일부 byte만 반환할 수 있고 protocol parser가 여러 read에 걸친 조각을 조립하거나 한 read에 들어온 여러 메시지를 분리해야 할 수 있습니다.
