---
kind: concept
contentKey: java.core.object-model.abstraction-responsibility
topicContentKey: java.core.object-model
slug: abstraction-responsibility
title: "추상화와 객체의 책임"
summary: "추상화를 단순 interface 생성이 아니라 협력자가 알아야 할 책임과 변경 가능한 세부를 분리하는 과정으로 이해하고, 상태·행동·외부 경계의 책임 배치를 판단한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java interface 계약의 언어 기반 확인
---
# 추상화와 객체의 책임

추상화를 단순히 “인터페이스를 만든다”라고 이해하면 형식만 남기 쉽습니다. 추상화의 핵심은 **현재 협력에서 중요한 의미와 책임은 드러내고, 호출자가 알 필요 없는 세부는 경계 뒤로 보내는 것**입니다.

예를 들어 애플리케이션이 결제를 요청해야 한다고 해 보겠습니다. 호출자가 특정 결제 SDK의 연결 방식과 요청 형식까지 직접 알아야 한다면 외부 기술의 세부가 넓게 퍼집니다.

```java
interface PaymentGateway {
    PaymentResult authorize(Payment payment);
    CancelResult cancel(PaymentId paymentId);
}
```

이 계약은 “어떤 SDK 메서드를 호출하는가”보다 **애플리케이션이 결제 시스템에 무엇을 요구하는가**를 표현합니다. 실제 SDK 연동 코드는 이 책임을 구현하는 한 방법이 됩니다.

```text
호출자가 필요한 의미
        │
        ▼
 PaymentGateway
        │
        ▼
구체 구현과 외부 API
```

### 좋은 추상화는 필요한 정보를 더 선명하게 만든다

구체 타입을 없애는 것만으로는 좋은 추상화가 되지 않습니다.

```java
Object execute(Map<String, Object> data);
```

이렇게 만들면 어떤 값이 필요한지, 무엇이 반환되는지, 어떤 의미의 작업인지 타입만 보고 알기 어렵습니다. 구현 세부를 줄이는 대신 중요한 의미까지 지워 버린 셈입니다.

```java
PaymentResult authorize(Payment payment);
```

추상화는 정보를 무조건 줄이는 작업이 아니라 **협력자가 알아야 할 정보와 몰라도 될 정보를 구분하는 작업**입니다.

### 객체의 책임은 상태 변경에서도 드러난다

객체를 단순한 데이터 묶음으로 보면 호출자가 상태를 꺼내 규칙을 판단한 뒤 다시 값을 넣는 코드가 늘어납니다.

```java
if (order.getStatus() == PAID) {
    order.setStatus(COMPLETED);
}
```

이 구조에서는 “결제 완료 상태에서만 주문을 완료할 수 있다”는 규칙이 호출자에게 있습니다.

```java
order.complete();
```

`Order`가 `complete()`라는 책임을 제공하고 내부에서 상태 전이 조건을 확인한다면 호출자는 상태 표현 방식까지 알 필요가 없습니다. 여기서 추상화와 캡슐화가 연결됩니다. **호출자에게 필요한 행동은 드러내고, 그 행동을 안전하게 수행하기 위한 상태와 규칙은 내부에 둡니다.**

### 인터페이스는 추상화를 표현하는 도구이지 자동 정답이 아니다

다음처럼 외부 기술의 API를 이름만 바꿔 그대로 노출하면 인터페이스가 있어도 호출자는 여전히 외부 세부에 묶일 수 있습니다.

```java
interface VendorService {
    VendorRequest buildVendorRequest(...);
    VendorResponse sendVendorRequest(...);
    VendorToken refreshVendorToken(...);
}
```

반대로 구현 클래스가 하나뿐이어도 외부 시스템과 애플리케이션 사이에 안정적인 의미 경계를 두어야 한다면 인터페이스가 유용할 수 있습니다. 구현 개수보다 **무엇이 독립적으로 바뀌는지와 어떤 책임을 보호해야 하는지**가 더 중요한 판단 기준입니다.

추상화도 너무 넓으면 문제입니다. 서로 다른 이유로 바뀌는 기능을 하나의 거대한 계약에 묶으면 호출자와 구현자가 필요하지 않은 책임까지 함께 알게 됩니다. 반대로 메서드마다 인터페이스를 하나씩 만들 정도로 지나치게 쪼개면 흐름을 이해하는 비용이 커집니다.

따라서 추상화를 설계할 때는 다음 세 가지를 확인하면 좋습니다.

- 호출자가 실제로 필요로 하는 책임이 무엇인가?
- 그 책임을 수행하는 구체적인 방식 중 호출자가 몰라도 되는 것은 무엇인가?
- 내부 구현이 바뀌어도 이 계약의 의미는 유지되는가?

좋은 추상화는 복잡성을 없애기보다 **복잡성이 존재해야 할 위치를 정하고, 협력자가 알아야 할 의미를 선명하게 만드는 것**에 가깝습니다.
