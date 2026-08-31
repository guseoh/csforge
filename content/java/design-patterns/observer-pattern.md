---
kind: concept
contentKey: java.core.design-patterns.observer-pattern
topicContentKey: java.core.design-patterns
slug: observer-pattern
title: "Observer와 상태 변화 알림"
summary: "발행자와 여러 반응을 분리하면서 동기 호출 순서·구독 snapshot·실패 전파·payload ownership·구독 수명까지 추적해 Observer의 실제 trade-off를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Flow.html"
    title: "Java SE 25 API: Flow"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: publish-subscribe 형태의 JDK 표준 API 참고
---
# Observer와 상태 변화 알림

주문 완료라는 한 변화에 이메일 발송, 통계 기록, 내부 알림 생성처럼 여러 독립 반응이 붙을 수 있습니다. 발행자가 모든 구체 후속 작업을 직접 알면 반응 하나가 추가될 때마다 발행자도 함께 바뀝니다.

```java
void complete(Order order) {
    order.complete();
    emailSender.send(order);
    statistics.record(order);
    notificationService.create(order);
}
```

Observer는 **어떤 변화가 발생했다는 사실을 발행하는 객체와, 그 변화에 반응하는 여러 객체를 분리**합니다.

```java
interface OrderCompletedListener {
    void onCompleted(OrderCompleted event);
}
```

```text
Publisher
   │ OrderCompleted
   ├────────> EmailListener
   ├────────> StatisticsListener
   └────────> NotificationListener
```

발행자는 각 listener의 구체 작업보다 “완료 이벤트에 관심 있는 구독자들에게 알린다”는 책임을 가집니다.

### Observer는 자동으로 비동기가 되지 않는다

가장 먼저 버려야 할 오해는 `Observer = 비동기`라는 생각입니다. 다음 구현은 완전히 동기적입니다.

```java
void publish(OrderCompleted event) {
    for (OrderCompletedListener listener : listeners) {
        listener.onCompleted(event);
    }
}
```

호출 흐름은 같은 thread와 call stack에서 이어집니다.

```text
complete()
  -> publish()
       -> Listener A
       -> Listener B
       -> Listener C
  -> publish() return
```

A가 3초 걸리면 B도 그 뒤에 호출되고 publisher도 3초 이상 기다립니다. A가 unchecked exception을 던지고 publisher가 이를 잡지 않으면 B와 C는 호출되지 않을 수 있습니다.

따라서 Observer를 설계할 때는 **누가 언제 실행되는가**를 먼저 정해야 합니다. 비동기 executor나 message broker를 도입하는 것은 별도의 실행 모델 결정입니다.

### 한 listener의 실패가 다른 listener에게 미치는 범위를 정해야 한다

```java
for (OrderCompletedListener listener : listeners) {
    listener.onCompleted(event);
}
```

이 구현에서는 첫 실패가 전체 publish를 중단할 수 있습니다. 반대로 다음처럼 listener별 예외를 잡으면 다른 listener는 계속 호출할 수 있습니다.

```java
for (OrderCompletedListener listener : listeners) {
    try {
        listener.onCompleted(event);
    } catch (RuntimeException e) {
        log.error("listener failed", e);
    }
}
```

둘 중 하나가 항상 정답은 아닙니다. 이메일 실패는 주문 완료 자체를 취소할 이유가 없을 수 있지만, 반드시 성공해야 하는 핵심 회계 처리라면 “그냥 observer 하나가 실패했다”로 무시하면 안 될 수 있습니다.

즉 **후속 반응이 독립적인가, 핵심 transaction의 일부인가**를 구분해야 합니다. 반드시 순서대로 성공해야 하는 workflow를 Observer라는 이름으로 흩어 놓으면 business flow가 보이지 않게 됩니다.

### 구독 목록을 순회하는 동안 등록·해제가 일어날 수 있다

처음 subscriber가 `[A, B]`라고 해 보겠습니다. A가 자신의 callback 안에서 B를 해제하고 C를 등록합니다.

단순 mutable list를 직접 순회하면서 같은 list를 수정하면 `ConcurrentModificationException`이 생기거나 구현에 따라 예상하기 어려운 순회가 될 수 있습니다. 한 가지 방법은 publish 시작 시 snapshot을 만드는 것입니다.

```java
void publish(Event event) {
    List<Listener> snapshot = List.copyOf(listeners);
    for (Listener listener : snapshot) {
        listener.onEvent(event);
    }
}
```

이제 첫 publish가 시작될 때 snapshot이 `[A, B]`였다면 A callback 안에서 원본 구독 목록을 `[A, C]`로 바꿔도 **현재 snapshot에는 B가 남아 있습니다.**

```text
첫 publish snapshot: [A, B]
A 실행 -> B 해제, C 등록
B 실행 -> 현재 snapshot에 이미 포함됨

다음 publish snapshot: [A, C]
```

이것이 원하는 계약일 수도 있고 아닐 수도 있습니다. “unsubscribe 하면 현재 진행 중인 전달도 즉시 취소되어야 한다”는 요구라면 별도 상태와 확인이 필요합니다. 중요한 것은 snapshot을 썼다는 사실보다 **구독 변경이 현재 전달과 다음 전달 중 어디부터 적용되는지**를 계약으로 정하는 것입니다.

### 알림 순서가 의미 있다면 우연한 collection 순서에 맡기면 안 된다

`HashSet`에 listener를 넣고 iteration order를 business 순서처럼 사용하면 안 됩니다. A 후 B가 반드시 실행되어야 한다면 Observer들이 정말 독립적인지부터 다시 봐야 합니다.

순서가 단지 presentation이나 logging 목적으로 필요하다면 명시적인 ordered collection이나 priority를 둘 수 있습니다. 반면 B가 A의 결과에 의존한다면 두 작업을 하나의 orchestration 흐름으로 표현하는 편이 더 명확할 수 있습니다.

Observer는 direct coupling을 줄이지만 **실행 순서가 덜 눈에 보이는 비용**을 가져옵니다.

### event payload는 과거의 사실인지 live mutable state인지 구분해야 한다

다음처럼 domain aggregate 자체를 그대로 event로 전달할 수 있습니다.

```java
listener.onCompleted(order);
```

하지만 listener가 `order.items()` 같은 mutable 내부 상태를 수정할 수 있거나, publisher가 이후 order를 다시 변경하면 각 listener가 어떤 시점의 상태를 보는지 모호해질 수 있습니다.

완료 당시의 사실이 필요하다면 필요한 값만 담은 immutable payload가 더 자연스러울 수 있습니다.

```java
record OrderCompleted(
        long orderId,
        long paidAmount,
        Instant completedAt
) {}
```

```text
Event = “무슨 일이 일어났는가”의 snapshot
Aggregate = 현재 변화 가능한 business object
```

모든 event를 record로 만들어야 한다는 규칙은 아닙니다. 핵심은 **observer가 publisher의 live mutable 내부 상태에 불필요하게 결합되지 않는가**입니다.

### 오래 사는 publisher의 subscriber 참조는 object lifetime을 늘린다

publisher가 listener를 strong reference로 보관하면 listener는 구독되어 있는 동안 reachable 상태로 남습니다.

```java
class Publisher {
    private final List<Listener> listeners = new ArrayList<>();
}
```

짧게 살아야 할 화면, session, task 객체가 오래 사는 publisher에 등록된 뒤 해제되지 않으면 그 객체와 연결된 object graph가 예상보다 오래 유지될 수 있습니다. 이것은 GC가 고장난 것이 아니라 **publisher에서 listener로 가는 정상 참조가 남아 있기 때문**입니다.

그래서 직접 Observer registry를 만들 때는 `subscribe()`만큼 `unsubscribe()`와 구독 종료 시점을 설계해야 합니다.

### publish-subscribe broker는 Observer와 비슷하지만 추가 보장이 별도다

Kafka 같은 broker도 producer와 여러 consumer를 분리한다는 점에서는 publish-subscribe 구조가 닮았습니다. 하지만 durable storage, retry, ordering partition, delivery semantics, consumer offset은 단순 in-memory Observer가 제공하지 않는 별도의 분산 시스템 책임입니다.

```text
Observer pattern
  └─ 객체 간 알림 구조

Message broker
  ├─ process/network boundary
  ├─ persistence
  ├─ delivery/retry semantics
  └─ consumer coordination
```

패턴 이름이 비슷하다는 이유로 두 실행 모델을 같은 것으로 설명하면 안 됩니다.

### 언제 Observer가 자연스럽고 언제 흐름을 숨길 수 있는가

한 변화에 여러 **독립적인 반응**이 추가·삭제될 수 있고 publisher가 구체 반응을 알 필요가 없을 때 Observer는 유용합니다. UI event listener, cache invalidation 알림, 독립적인 audit/metric 반응 같은 경우가 떠오를 수 있습니다.

반대로 주문 승인 → 재고 확정 → 결제 캡처처럼 순서와 성공 조건이 business 자체라면 각 단계를 observer callback으로 흩어 놓는 순간 “이 use case가 실제로 무엇을 해야 완료되는가”가 흐려질 수 있습니다.

Observer를 리뷰할 때는 subscriber 목록만 보지 말고 **publish 한 번의 실제 call sequence**를 적어 보는 것이 좋습니다. 동기인지 비동기인지, 한 listener가 느리거나 실패하면 다음 listener와 publisher는 어떻게 되는지, callback 중 subscribe/unsubscribe가 언제 반영되는지, payload가 snapshot인지 live object인지, 그리고 listener reference가 언제 제거되는지를 추적하면 패턴의 장점과 비용을 함께 볼 수 있습니다.
