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

하나의 상태 변화에 이메일 발송, 통계 기록, 알림 생성처럼 여러 독립적인 반응이 붙을 수 있습니다. 발행자가 모든 후속 작업을 직접 알면 반응 하나가 추가될 때마다 발행자도 함께 바뀝니다.

Observer 패턴은 **변화가 발생했다는 사실을 알리는 발행자와, 그 변화에 반응하는 여러 구독자를 분리**합니다.

```java
interface OrderCompletedListener {
    void onCompleted(OrderCompleted event);
}
```

```text
Publisher
   │ OrderCompleted
   ├────→ EmailListener
   ├────→ StatisticsListener
   └────→ NotificationListener
```

발행자는 구체적인 후속 작업보다 “이 이벤트를 구독자에게 알린다”는 책임을 가집니다.

## Observer는 비동기를 의미하지 않는다

다음 구현은 같은 스레드에서 순서대로 실행되는 동기 호출입니다.

```java
void publish(OrderCompleted event) {
    for (OrderCompletedListener listener : listeners) {
        listener.onCompleted(event);
    }
}
```

```text
publish()
  → Listener A
  → Listener B
  → Listener C
  → return
```

A가 오래 걸리면 B와 발행자도 기다립니다. A가 예외를 던지고 별도로 처리하지 않으면 뒤 구독자가 실행되지 않을 수도 있습니다. 비동기 executor나 메시지 브로커는 Observer와 별개의 실행 모델 결정입니다.

## 실패와 순서가 비즈니스 의미를 가진다면 독립 반응인지 다시 본다

구독자 하나의 실패를 전체 실패로 볼지, 기록하고 다음 구독자를 계속 실행할지는 계약에 따라 다릅니다. 이메일 실패처럼 핵심 상태 변화를 되돌릴 필요가 없는 반응도 있고, 반드시 선행 작업이 성공해야 하는 업무 단계도 있습니다.

```text
독립적인 후속 반응
→ Observer로 분리하기 자연스러움

A 성공 후 B, B 성공 후 C가 반드시 필요한 흐름
→ 명시적인 orchestration이 더 잘 보일 수 있음
```

Observer는 직접 결합을 줄이는 대신 실행 흐름이 덜 눈에 보일 수 있다는 비용이 있습니다.

## 이벤트에는 필요한 사실만 담을 수 있다

가변 aggregate 자체를 그대로 전달하면 구독자가 live 상태에 결합되거나 변경 시점을 해석하기 어려워질 수 있습니다.

```java
record OrderCompleted(
        long orderId,
        long paidAmount,
        Instant completedAt
) {}
```

이처럼 이벤트를 “완료 시점에 어떤 일이 일어났는가”의 값으로 만들면 구독자는 발행자의 내부 객체를 직접 조작할 필요가 없습니다. 모든 이벤트가 반드시 record여야 하는 것은 아니지만 **구독자가 발행자의 가변 내부 상태를 불필요하게 공유하지 않는지**는 확인할 가치가 있습니다.

## 구독 수명도 책임의 일부다

발행자가 listener를 강한 참조로 보관하면 등록된 listener는 구독이 유지되는 동안 도달 가능한 객체로 남습니다.

```java
class Publisher {
    private final List<Listener> listeners = new ArrayList<>();
}
```

짧게 살아야 할 객체가 오래 사는 publisher에 등록된다면 `subscribe()`뿐 아니라 언제 `unsubscribe()`해야 하는지도 설계해야 합니다.

Observer는 객체 간 알림 구조를 말합니다. Kafka 같은 메시지 브로커의 durable storage, retry, delivery semantics까지 자동으로 포함하지 않습니다. **발행자와 반응을 분리한다는 구조와 실제 전달 실행 모델을 구분**하는 것이 핵심입니다.
