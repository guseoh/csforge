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

추상화를 “interface를 만든다”로 이해하면 설계가 쉽게 형식에 빠집니다. 추상화의 핵심은 **현재 협력에서 중요한 책임과 계약은 드러내고, 호출자가 알 필요 없는 구현 세부는 경계 뒤로 보내는 것**입니다.

예를 들어 주문 완료 후 알림을 보내야 한다고 해 보겠습니다.

```java
class OrderService {
    private final SmtpClient smtpClient;

    void complete(Order order) {
        smtpClient.connect(...);
        smtpClient.send(...);
    }
}
```

이 코드는 주문 서비스가 SMTP 연결 방식, SDK API, 메시지 전송 형식까지 알고 있습니다. 주문 서비스의 실제 책임이 “주문 완료 후 알림을 요청한다”라면 SMTP는 그 책임을 수행하는 한 구현 세부입니다.

```java
interface OrderNotifier {
    void notifyCompleted(Order order);
}
```

```java
class EmailOrderNotifier implements OrderNotifier {
    private final SmtpClient smtpClient;

    @Override
    public void notifyCompleted(Order order) {
        // SMTP 세부 처리
    }
}
```

이제 `OrderService`는 SMTP가 아니라 **완료 알림이라는 협력 책임**에 의존할 수 있습니다.

### 좋은 추상화는 “무엇을 할 수 있는가”를 먼저 드러낸다

호출자가 실제로 필요한 것은 구현 object의 모든 method가 아닙니다. 결제 예를 보면 더 분명합니다.

외부 SDK가 다음과 같이 많은 기능을 제공한다고 가정합니다.

```text
VendorSdk
- createToken
- authorize
- capture
- cancel
- downloadReceipt
- queryMerchantSetting
- rotateKey
- ...
```

애플리케이션이 필요한 책임이 승인과 취소뿐이라면 SDK 전체를 복사한 interface는 좋은 추상화가 아닐 수 있습니다.

```java
interface PaymentGateway {
    PaymentResult authorize(Payment payment);
    CancelResult cancel(PaymentId paymentId);
}
```

좋은 경계는 외부 기술이 제공하는 API 목록이 아니라 **우리 application이 외부 시스템에게 요구하는 역할**을 표현합니다.

```text
Application이 필요한 책임
       │
       ▼
PaymentGateway
       │
       ▼
VendorPaymentAdapter
       │
       ▼
Vendor SDK 세부 API
```

이렇게 하면 vendor SDK가 바뀔 때 영향이 adapter 쪽에 모이고, application은 같은 책임을 계속 사용할 수 있습니다.

### 추상화는 정보를 없애는 것이 아니라 중요한 정보를 선택한다

모든 타입을 `Object`, 모든 데이터를 `Map<String, Object>`로 바꾸면 구체 class 의존은 줄어 보일 수 있습니다.

```java
Object execute(Map<String, Object> data);
```

하지만 이제 호출자는 어떤 key가 필요한지, 반환 값이 무엇인지, 어떤 실패가 가능한지 compile-time 계약에서 알 수 없습니다. 구현 세부를 숨긴 대신 **도메인 의미까지 지워 버린 것**입니다.

```java
PaymentResult authorize(Payment payment);
```

추상화는 정보를 적게 주는 것이 아니라, **현재 협력에 필요한 의미를 더 선명하게 주는 것**입니다.

### 책임을 찾으려면 상태를 누가 변경해야 하는지도 본다

객체를 단순 데이터 묶음으로 보면 호출자가 상태를 읽고 판단하고 다시 setter로 넣는 코드가 늘어납니다.

```java
if (order.getStatus() == PAID) {
    order.setStatus(COMPLETED);
}
```

이 구조에서는 “PAID에서만 COMPLETE 가능”이라는 규칙이 호출자에게 있습니다. 다른 호출자가 setter를 직접 사용하면 같은 규칙을 우회할 수도 있습니다.

```java
order.complete();
```

```java
class Order {
    void complete() {
        if (status != PAID) {
            throw new IllegalStateException();
        }
        status = COMPLETED;
    }
}
```

이 경우 `Order`의 추상화는 `status` field가 아니라 **주문을 완료한다는 책임**을 제공합니다. 내부 representation이 enum에서 다른 state model로 바뀌더라도 `complete()` 계약은 유지할 수 있습니다.

즉 추상화와 캡슐화는 서로 연결됩니다. 호출자에게 필요한 행동을 제공하고 상태 representation과 invariant를 내부에 두면 변경 이유가 더 응집됩니다.

### 책임은 “할 수 있는 일”뿐 아니라 “알아야 하는 것”으로도 나뉜다

다음 서비스가 있다고 해 봅시다.

```java
class CheckoutService {
    void checkout(Order order) {
        // 가격 계산
        // 재고 확인
        // 결제 승인
        // 영수증 포맷
        // 이메일 HTML 조립
    }
}
```

메서드 하나여도 가격 정책, 재고 규칙, 결제 provider, 이메일 표현이라는 여러 변경 이유를 알고 있습니다. class 크기만으로 책임 수를 판단할 수는 없습니다. **서로 다른 이유로 바뀌는 지식이 한 객체에 모였는가**가 중요합니다.

가격 계산이 바뀌어도 이메일 HTML은 바뀔 이유가 없고, PG SDK가 교체되어도 재고 규칙은 그대로라면 각각 다른 책임 경계를 검토할 수 있습니다.

### interface가 있다고 의존성이 자동으로 낮아지는 것은 아니다

다음 interface는 구현 class 이름만 지웠을 뿐입니다.

```java
interface VendorService {
    VendorRequest buildVendorRequest(...);
    VendorResponse sendVendorRequest(...);
    VendorToken refreshVendorToken(...);
}
```

호출자가 여전히 vendor DTO와 vendor 개념을 모두 알아야 한다면 외부 세부가 application 안으로 퍼진 상태입니다. interface는 Java의 타입 도구이지 **경계 품질을 자동으로 보장하는 장치**가 아닙니다.

반대로 구현 class 하나뿐이어도 외부 시스템이나 library와 application 사이에 의미 있는 경계를 두기 위해 interface가 가치 있을 수 있습니다. 구현 개수보다 **독립적으로 변할 가능성과 보호해야 할 책임 경계**를 봐야 합니다.

### 너무 넓은 추상화는 호출자와 구현자를 불필요한 책임에 묶는다

```java
interface ApplicationService {
    void createOrder();
    void cancelOrder();
    void resizeImage();
    void exportCsv();
    void sendEmail();
    void rebuildSearchIndex();
}
```

어떤 호출자는 주문 기능만 필요한데 거대한 interface 전체에 의존하게 됩니다. 구현자는 unrelated method까지 구현해야 하고 작은 변경도 넓은 범위에 영향을 줄 수 있습니다.

작은 interface가 무조건 정답이라는 뜻은 아닙니다. 서로 항상 함께 사용되고 같은 이유로 변경되는 operation을 지나치게 잘게 나누면 호출 흐름만 복잡해질 수 있습니다. **협력자가 실제로 필요로 하는 응집된 책임 단위**를 찾는 것이 목적입니다.

### 추상화가 새는 순간을 관찰해야 한다

추상화 뒤의 구현 세부를 결국 모든 호출자가 알아야 한다면 경계가 새고 있는 것입니다.

예를 들어 `PaymentGateway.authorize()`가 vendor별 error code를 그대로 던져 호출자가 다음처럼 분기해야 한다고 해 봅시다.

```java
try {
    gateway.authorize(payment);
} catch (VendorAError e) {
    ...
} catch (VendorBError e) {
    ...
}
```

`PaymentGateway`라는 이름은 있지만 application이 vendor 세부를 여전히 알고 있습니다. provider별 실패를 내부의 의미 있는 결과나 예외 계약으로 번역할 수 있다면 경계를 더 안정적으로 만들 수 있습니다.

물론 모든 차이를 억지로 하나의 공통 타입으로 숨길 수는 없습니다. provider별 고유 기능이 실제 business requirement라면 그 차이는 모델에 드러나야 합니다. 좋은 추상화는 차이를 무조건 감추는 것이 아니라 **호출자가 알아야 할 차이와 몰라도 될 차이를 구분**합니다.

### Spring DI는 추상화를 연결할 뿐 설계해 주지는 않는다

Spring이 다음 두 구현을 Bean으로 연결해 준다고 해서 자동으로 좋은 설계가 되지는 않습니다.

```java
interface PaymentGateway { ... }
class VendorPaymentGateway implements PaymentGateway { ... }
```

`PaymentGateway`가 application 관점의 책임을 잘 표현하는지, 너무 넓거나 vendor 세부가 새는지는 개발자가 설계해야 합니다. DI container는 이미 정의한 dependency graph를 조립하는 도구입니다.

따라서 Java 단계에서 먼저 길러야 하는 능력은 annotation 이름이 아니라 **누가 무엇을 알아야 하고, 어떤 객체가 어떤 상태와 규칙을 소유하며, 어떤 세부가 바뀌어도 협력 계약은 유지되어야 하는지**를 구분하는 것입니다.

좋은 추상화를 판단할 때는 “interface가 있는가”보다 이 질문이 더 유용합니다. 호출자가 실제로 해결하려는 문제를 그 계약만으로 설명할 수 있는가, 구현 세부가 바뀌었을 때 호출자가 불필요하게 함께 바뀌지 않는가, 그리고 추상화 때문에 도메인 의미가 `Object`나 거대한 generic API 속으로 사라지지는 않았는가를 확인합니다. 추상화의 목적은 복잡성을 숨기는 것보다 **복잡성이 존재해야 할 위치를 정하는 것**에 가깝습니다.
