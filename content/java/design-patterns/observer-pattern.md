---
kind: concept
contentKey: java.core.design-patterns.observer-pattern
topicContentKey: java.core.design-patterns
slug: observer-pattern
title: "Observer와 상태 변화 알림"
summary: "한 객체의 변화나 이벤트를 여러 구독자에게 전달하면서 발행자 결합도와 구독 생명주기·실패 처리를 함께 고려한다"
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

주문이 완료되었을 때 이메일 전송, 통계 기록, 알림 생성 등 여러 후속 작업이 필요할 수 있습니다. 주문 코드가 모든 후속 객체를 직접 알고 호출하면 관심사가 늘어날수록 결합도도 커집니다.

Observer 패턴은 **어떤 변화가 생겼다는 사실을 발행하고 관심 있는 여러 구독자가 이를 받는 구조**입니다.

```text
Publisher
   │ event
   ├────────> Observer A
   ├────────> Observer B
   └────────> Observer C
```

### 발행자는 구체 후속 작업을 덜 알 수 있다

```java
interface OrderCompletedListener {
    void onCompleted(Order order);
}
```

발행자는 listener 목록에 이벤트를 전달하고, 각각의 구현이 자신이 맡은 후속 작업을 처리할 수 있습니다.

### 동기 호출이면 실패도 같은 흐름에 있다

Observer라고 해서 자동으로 비동기 메시징이 되는 것은 아닙니다. 단순 Java listener를 순서대로 호출하면 한 listener의 느린 작업이나 예외가 발행 흐름에 직접 영향을 줄 수 있습니다.

따라서 다음을 정해야 합니다.

- listener 호출은 동기인가 비동기인가?
- 한 listener 실패가 다른 listener 호출을 막는가?
- 순서가 중요한가?
- 구독 해제는 언제 하는가?

Kafka 같은 외부 메시지 브로커는 이 패턴과 닮은 publish-subscribe 구조를 제공할 수 있지만, delivery guarantee나 durable storage는 완전히 별도의 문제입니다.

### 구독 생명주기를 무시하면 누수가 생길 수 있다

오래 사는 publisher가 짧게 살아야 할 observer 참조를 계속 보관하면 그 객체가 더 이상 필요 없어도 참조가 남을 수 있습니다. 직접 listener 등록 구조를 만든다면 등록과 해제 시점을 함께 설계해야 합니다.

### 언제 자연스러운가

하나의 변화에 여러 독립적인 반응이 추가될 수 있고 발행자가 구체 반응을 모두 알 필요가 없을 때 유용합니다. 반대로 반드시 순서대로 성공해야 하는 핵심 비즈니스 절차를 단순 이벤트 알림으로 흩어 놓으면 흐름을 추적하기 어려울 수 있습니다.

Observer의 핵심은 “이벤트를 쓰면 결합도가 0이 된다”가 아니라 **발행자와 여러 후속 반응 사이의 직접 의존을 줄이는 대신 실행 흐름과 실패 처리 복잡성을 받아들이는 것**입니다.
