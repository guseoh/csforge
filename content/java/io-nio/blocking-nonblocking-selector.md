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

```csforge-viz
{
  "version": 1,
  "type": "java-api-contract",
  "example": "selector",
  "title": "선택된 키와 준비 비트의 생명주기",
  "description": "전통적인 selectedKeys 방식입니다. 선택 집합은 현재 준비 상태의 순수 목록이 아니며 처리 후 제거를 직접 관리합니다."
}
```

### 블로킹과 논블로킹은 호출한 스레드가 기다리는 방식의 차이다

블로킹 읽기를 단순화하면 다음과 같습니다.

읽기 조건을 기다리는 동안 해당 read 호출 다음 코드는 실행되지 않을 수 있습니다.

블로킹 방식 자체가 느리거나 잘못된 모델이라는 뜻은 아닙니다. 중요한 것은 **I/O 조건을 기다리는 동안 어떤 스레드가 다음 작업으로 진행하지 못하는가**입니다.

논블로킹 채널은 다음처럼 설정할 수 있습니다.

```java
channel.configureBlocking(false);
```

이 모드에서는 요청한 전체 바이트가 준비되지 않았더라도 현재 가능한 결과를 반환할 수 있습니다. 따라서 논블로킹은 "작업이 항상 즉시 완료된다"는 뜻이 아니라 **완료되지 않은 상태를 호출자가 직접 다룰 수 있다**는 뜻에 가깝습니다.

### Selector는 여러 channel을 계속 polling하는 대신 준비된 channel을 찾는다

각 channel을 무한히 직접 확인하면 아무 작업도 준비되지 않았을 때 CPU를 낭비할 수 있습니다.

A·B·C를 반복해서 직접 확인하면 준비된 채널이 없는 동안에도 확인 작업을 계속하게 됩니다.

Selector에는 관심 있는 연산을 등록하고 선택 연산을 수행할 수 있습니다.

```java
Selector selector = Selector.open();
channel.configureBlocking(false);
channel.register(selector, SelectionKey.OP_READ);

int updatedKeyCount = selector.select();
```

Selector에 등록하는 선택 가능한 채널은 논블로킹 모드여야 합니다. `select()`는 준비된 채널이 생길 때까지 기다릴 수 있고, `selectNow()`는 즉시 반환합니다.

여기서 **채널 I/O가 논블로킹인지와 `Selector`의 선택 연산 호출이 기다릴 수 있는지는 서로 다른 질문**입니다.

### 키의 연산 비트와 Selector의 키 집합을 구분합니다

등록할 때는 어떤 작업에 관심 있는지를 지정합니다.

예를 들어 A에는 OP_READ, B에는 OP_WRITE를 관심 연산으로 등록할 수 있습니다.

`interestOps()`는 키마다 관심 연산을 담는 비트 집합이고, `readyOps()`는 선택 연산에서 감지한 준비 연산의 비트 집합입니다. 둘 다 `SelectionKey`의 정보입니다. `selector.selectedKeys()`는 이와 다른 차원인 **선택된 키들의 집합**입니다.

```text
키 A의 interestOps = READ
키 A의 readyOps = READ
selector.selectedKeys() = {A}
```

전통적인 `select()`·`selectNow()`는 준비가 감지된 키를 선택 집합에 추가하거나, 이미 선택된 키의 기존 준비 비트에 새 준비 비트를 합칩니다. 준비가 사라졌다고 기존 키와 비트를 매번 지우는 방식이 아닙니다. 따라서 이 집합을 **지금 이 순간 ready인 채널의 순수 목록**으로 읽으면 안 됩니다. 반환값도 선택 집합 전체 크기가 아니라 준비 정보가 갱신된 키 수입니다.

예를 들어 A가 READ로 선택된 뒤 데이터를 읽어도 A는 자동 제거되지 않습니다. 새 준비가 없는 `selectNow()`가 0을 반환하는 경우에도 선택 집합에 A가 남아 있을 수 있습니다. 처리한 키는 다음과 같이 반복자를 통해 제거합니다.

```java
var iterator = selector.selectedKeys().iterator();
while (iterator.hasNext()) {
    SelectionKey key = iterator.next();
    iterator.remove();
    if (!key.isValid()) {
        continue;
    }
    if (key.isReadable()) {
        // 논블로킹 read의 반환값과 프로토콜 상태를 처리합니다.
    }
}
```

이 코드는 한 스레드가 선택 집합을 관리하는 골격입니다. 제거는 선택 집합에서의 제거이며 채널 등록 취소가 아닙니다. `cancel()`은 키를 즉시 무효화하고, 다음 선택 연산에서 등록 해제가 처리됩니다. 다른 스레드가 취소할 수 있는 코드에서는 `isValid()` 검사 후에도 취소 관련 예외를 처리해야 합니다. `select(Consumer)` 계열은 별도의 전달 방식을 사용하므로 이 selected-key set 추적 모델과 혼합하지 않습니다.

### 준비 상태는 작업 완료 보장이 아니다

`OP_READ`가 ready라고 해서 애플리케이션 메시지 하나를 전부 읽을 수 있다는 뜻은 아닙니다.

TCP 입력은 메시지 일부·한 개·여러 개에 걸친 바이트일 수 있습니다. 상위 프로토콜이 메시지 경계를 판별해야 합니다.

Selector는 HTTP나 길이 접두사(length-prefix) 프로토콜의 메시지 경계를 알지 못합니다. 부분 읽은 데이터를 `Buffer`에 이어 붙이고 완전한 메시지인지 판단하는 책임은 상위 프로토콜 처리에 있습니다.

읽기 준비는 데이터뿐 아니라 EOF·오류 상황에서도 보고될 수 있습니다. 논블로킹 `read()`의 양수 반환, 0, EOF의 -1과 예외를 모두 처리해야 합니다. 준비 통지는 다음 I/O 시도의 단서이며 성공량이나 프로토콜 메시지 완료의 보장이 아닙니다.

### Java Selector와 OS의 epoll·kqueue를 같은 것으로 보지 않는다

JDK 구현은 운영체제별 준비 상태 방식을 활용할 수 있습니다. 하지만 Java 애플리케이션이 의존하는 계약은 `Selector`, `SelectableChannel`, `SelectionKey`입니다.

Java API 계약 아래에서 JDK 구현이 OS의 준비 통지 방식을 이용합니다. 세 계층을 같은 계약으로 보지 않습니다.

따라서 "Selector = epoll"이라고 동일시하면 API 계약과 구현 세부를 섞게 됩니다.

이 모델을 이해할 때 핵심은 세 가지입니다. **블로킹/논블로킹이 스레드의 대기 방식을 어떻게 바꾸는지, Selector가 여러 채널의 준비 상태를 어떻게 모으는지, 그리고 준비 상태가 실제 애플리케이션 메시지의 완료를 뜻하지 않는다는 것**입니다. 이 구분이 잡히면 Netty나 이벤트 루프(event loop) 기반 서버의 배경도 훨씬 읽기 쉬워집니다.
