---
kind: concept
contentKey: java.core.design-patterns.adapter-pattern
topicContentKey: java.core.design-patterns
slug: adapter-pattern
title: "Adapter로 외부 인터페이스와 경계 분리하기"
summary: "호환되지 않는 외부 API를 내부 계약으로 번역하면서 타입·단위·예외를 경계에 모으고, Adapter가 business policy까지 삼키지 않도록 책임을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: interface 기반 계약의 언어 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html"
    title: "Java SE 25 API: Math"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 단위 변환 과정의 overflow를 안전하게 검사하는 exact arithmetic API 참고
---
# Adapter로 외부 인터페이스와 경계 분리하기

외부 SDK나 오래된 모듈이 제공하는 API가 애플리케이션이 원하는 계약과 다를 수 있습니다. 호출 코드마다 외부 타입과 변환 규칙을 직접 알게 되면 외부 기술의 세부가 애플리케이션 전체로 퍼집니다.

```java
interface PaymentGateway {
    PaymentResult pay(Money money);
}
```

내부에서는 `Money`와 `PaymentResult`를 사용하지만 외부 SDK는 다음처럼 다른 형태를 요구한다고 해 보겠습니다.

```java
VendorResponse charge(int cents);
```

Adapter는 두 계약 사이의 차이를 한 경계에서 번역합니다.

```java
final class VendorPaymentAdapter implements PaymentGateway {
    private final VendorClient client;

    VendorPaymentAdapter(VendorClient client) {
        this.client = client;
    }

    @Override
    public PaymentResult pay(Money money) {
        int cents = toCents(money);
        try {
            VendorResponse response = client.charge(cents);
            return toResult(response);
        } catch (VendorDeclinedException e) {
            throw new PaymentDeclinedException(e);
        }
    }
}
```

```text
Application
Money / PaymentResult / PaymentGateway
        │
        ▼
Adapter
타입 · 단위 · 예외 번역
        │
        ▼
Vendor SDK
```

### Adapter는 메서드 이름만 바꾸는 wrapper가 아니다

실제 경계에서는 타입뿐 아니라 단위, 식별자, 시간 표현, 실패 방식이 다를 수 있습니다.

```text
내부 의미          외부 표현
Money              cents 정수
PaymentId          vendor 문자열 ID
PaymentDeclined    vendor error code
Instant            epoch milliseconds
```

Adapter의 역할은 이런 차이를 변환하면서 **내부 계약의 의미를 보존하는 것**입니다. 예를 들어 금액을 작은 정수 타입으로 바꾸다가 오버플로가 발생할 수 있다면 값을 조용히 잘라 내기보다 안전하게 거부해야 합니다.

```java
long cents = Math.multiplyExact(euros, 100L);
int vendorCents = Math.toIntExact(cents);
```

### 외부 예외도 경계에서 내부 의미로 번역할 수 있다

`PaymentGateway`를 만들었는데 호출자가 모든 vendor 예외를 직접 catch해야 한다면 외부 세부가 여전히 새고 있습니다.

```java
catch (VendorDeclinedException e) {
    throw new PaymentDeclinedException(e);
}
```

다만 외부의 모든 오류를 하나의 일반 예외로 뭉개라는 뜻은 아닙니다. 애플리케이션이 실제로 구분해야 하는 실패는 내부 계약에도 의미 있게 드러나야 합니다.

### 비즈니스 정책까지 Adapter에 넣지 않는다

```java
if (customer.isVip()) {
    money = money.discount(20);
}
```

회원 할인처럼 외부 SDK가 바뀌어도 유지되어야 하는 규칙은 인터페이스 번역 문제가 아닙니다. Adapter는 주로 **외부 API의 표현과 호출 방식을 내부 계약으로 변환**하고, 비즈니스 정책은 그 정책을 소유한 계층에 남기는 편이 응집됩니다.

Adapter는 외부 시스템의 차이를 없애 주는 마법도 아닙니다. 공급자마다 기능과 실패 의미가 실제로 다르다면 그 차이를 내부 모델에 어떻게 드러낼지 결정해야 합니다. Adapter의 가치는 차이를 감추는 데만 있지 않고 **외부 기술 변화가 애플리케이션 전체로 퍼지지 않도록 번역 위치를 명확히 만드는 것**에 있습니다.

Decorator나 Proxy와 구조가 비슷해 보여도 의도는 다릅니다. Adapter는 **서로 다른 계약을 맞추는 것**, Decorator는 같은 계약에 기능을 덧붙이는 것, Proxy는 같은 역할의 실제 대상에 접근하는 과정을 중개하는 것이 중심입니다.
