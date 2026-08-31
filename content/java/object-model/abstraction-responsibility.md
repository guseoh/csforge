---
kind: concept
contentKey: java.core.object-model.abstraction-responsibility
topicContentKey: java.core.object-model
slug: abstraction-responsibility
title: "추상화와 객체의 책임"
summary: "구현 세부보다 객체가 무엇을 해야 하는지에 초점을 맞춰 협력의 계약을 만들고 변경 영향을 줄인다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "JLS 9 Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 인터페이스 계약의 언어 기반 확인
---
# 추상화와 객체의 책임

추상화는 어려운 이름을 붙이거나 인터페이스를 많이 만드는 기술이 아닙니다. **지금 협력에 필요한 중요한 특징만 드러내고, 그 일을 어떻게 수행하는지는 필요 이상으로 노출하지 않는 것**이 핵심입니다.

예를 들어 주문 서비스가 이메일을 보내야 한다고 해 보겠습니다.

```java
class OrderService {
    private final SmtpClient smtpClient;
}
```

`OrderService`가 SMTP 서버 주소, 연결 방법, 라이브러리 API까지 모두 알아야 한다면 알림 전송 방식이 바뀔 때 주문 로직까지 영향을 받습니다.

### 협력자가 해야 할 일을 먼저 본다

주문 서비스가 실제로 원하는 것은 “SMTP를 호출한다”가 아니라 **주문 완료 알림을 보낸다**일 수 있습니다.

```java
interface OrderNotifier {
    void notifyCompleted(Order order);
}
```

이 인터페이스는 구현 방법보다 책임을 드러냅니다. 실제 구현은 이메일일 수도 있고 다른 채널일 수도 있습니다.

```java
class EmailOrderNotifier implements OrderNotifier {
    @Override
    public void notifyCompleted(Order order) {
        // 이메일 전송 세부 구현
    }
}
```

이렇게 하면 `OrderService`는 구현 세부보다 `OrderNotifier`가 제공하는 계약에 의존할 수 있습니다.

### 추상화가 많다고 좋은 설계는 아니다

구현이 하나뿐이고 변경 가능성도 낮은 아주 단순한 코드에 인터페이스와 계층을 무조건 추가하면 오히려 읽기 어려워질 수 있습니다. 추상화는 **독립적으로 바뀔 이유가 있는 세부를 분리하거나, 여러 구현을 같은 책임으로 다뤄야 할 때** 가치가 커집니다.

따라서 “모든 클래스 앞에 인터페이스를 만든다”는 규칙보다 다음 질문이 중요합니다.

- 호출자가 실제로 필요로 하는 책임은 무엇인가?
- 구현 세부가 바뀌어도 호출자는 같은 방식으로 사용할 수 있어야 하는가?
- 서로 다른 구현을 같은 계약으로 다룰 필요가 있는가?
- 추상화 때문에 오히려 중요한 도메인 의미가 숨겨지지는 않는가?

### 책임과 데이터 구조를 구분해 생각한다

객체를 단순히 필드 묶음으로 보면 설계가 데이터 중심으로 흐르기 쉽습니다.

```java
order.getStatus();
order.getPaidAmount();
order.setStatus(...);
```

반대로 객체가 맡아야 할 책임을 생각하면 `pay()`, `cancel()`, `complete()` 같은 동작이 먼저 보일 수 있습니다. 이렇게 책임을 중심으로 설계하면 상태 변경 규칙을 해당 객체에 모으기 쉬워집니다.

### Spring의 DI와는 어디까지 연결될까

Spring은 객체 생성과 연결을 도와주는 컨테이너를 제공합니다. 하지만 추상화와 책임의 품질은 Spring이 자동으로 만들어 주지 않습니다. 좋지 않은 인터페이스를 Bean으로 등록해도 여전히 좋지 않은 추상화입니다.

Java 단계에서는 **객체가 무엇을 해야 하는지와 어떤 구현 세부를 숨길지 판단하는 능력**이 먼저입니다. Spring DI는 이후 이런 객체들을 실제 애플리케이션에서 연결하는 도구로 볼 수 있습니다.

### 면접에서 설명한다면

추상화는 구현 세부를 모두 감추는 것이 아니라, 특정 협력에서 중요한 책임과 계약을 드러내고 나머지 세부를 경계 뒤로 숨기는 과정이라고 설명할 수 있습니다. 좋은 추상화는 변경 영향을 줄이고 여러 구현을 교체하기 쉽게 만들 수 있지만, 필요 없는 인터페이스를 늘리는 것 자체가 목적은 아닙니다.
