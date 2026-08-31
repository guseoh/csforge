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
    title: "JLS 9 Interfaces"
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

외부 SDK나 오래된 module이 제공하는 API 모양이 우리 application이 원하는 계약과 다를 수 있습니다. 문제는 이름이 다르다는 사실보다, 호출 코드마다 외부 타입과 변환 규칙을 직접 알게 될 때 생깁니다.

```java
interface PaymentGateway {
    PaymentResult pay(Money money);
}
```

내부에서는 `Money`를 사용하지만 외부 SDK는 다음처럼 센트 단위 정수와 vendor request를 요구한다고 해 보겠습니다.

```java
VendorResponse charge(int cents);
```

호출자마다 `money -> cents -> VendorResponse -> PaymentResult` 변환을 반복하면 vendor의 단위·DTO·예외가 application 전체로 퍼집니다. Adapter는 이 차이를 한 경계에 모읍니다.

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
  │ PaymentGateway / Money / PaymentResult
  ▼
Adapter
  │ type / unit / exception translation
  ▼
Vendor SDK
```

호출자는 내부 계약만 사용하고 Adapter만 양쪽 세계를 동시에 압니다.

## Adapter는 단순 method 이름 변경보다 더 넓은 번역 경계다

실제 외부 연동에서는 interface 모양 외에도 다음 차이가 생길 수 있습니다.

```text
내부 의미              외부 표현
Money                  long/int cents
PaymentId              vendor transaction string
PaymentDeclined        VendorError(code=4021)
Instant                vendor epoch milliseconds
```

Adapter가 이런 표현 차이를 변환하면 application은 vendor의 representation을 직접 다루지 않아도 됩니다. 중요한 것은 변환 결과가 내부 계약의 의미를 보존하는 것입니다.

## 단위 변환은 값 손상까지 검토해야 한다

내부 `pay(long euros)`를 외부 `charge(int cents)`에 연결한다고 가정합니다. 다음 cast는 위험합니다.

```java
int cents = (int) (euros * 100);
```

`euros * 100`이 `int` 범위를 넘으면 cast 과정에서 값이 잘릴 수 있습니다. Adapter는 단순히 타입이 맞는 값만 만들면 되는 것이 아니라 **의미가 보존된 값**을 넘겨야 합니다.

```java
long cents = Math.multiplyExact(euros, 100L);
int vendorCents = Math.toIntExact(cents);
```

외부 API가 표현할 수 없는 금액이라면 SDK 호출 전에 실패시키는 것이 손상된 값으로 결제를 시도하는 것보다 안전합니다. 이런 범위 검사는 business 할인 정책이 아니라 **representation translation의 정확성**에 해당하므로 Adapter 경계에 자연스럽게 놓일 수 있습니다.

## 외부 예외를 그대로 흘리면 경계가 새기 시작한다

```java
try {
    gateway.pay(money);
} catch (VendorNetworkException e) {
    ...
} catch (VendorBadRequestException e) {
    ...
}
```

`PaymentGateway`라는 내부 계약을 만들었는데 모든 호출자가 vendor exception을 catch한다면 외부 세부가 이미 application 안으로 들어왔습니다.

Adapter는 필요하면 외부 실패를 내부에서 이해할 수 있는 의미로 바꿉니다.

```java
catch (VendorDeclinedException e) {
    throw new PaymentDeclinedException(e);
}
```

원인 exception을 cause로 보존하면 진단 정보도 잃지 않을 수 있습니다. 다만 vendor의 모든 error code를 하나의 일반 예외로 뭉개서 중요한 차이까지 지우면 안 됩니다. 내부 business가 실제로 구분해야 하는 실패는 내부 계약에 드러나야 합니다.

## Adapter가 business policy를 소유하기 시작하면 책임이 섞인다

다음 코드는 Adapter가 해야 할 일이 아닐 가능성이 큽니다.

```java
if (customer.isVip()) {
    money = money.discount(20);
}
client.charge(...);
```

VIP 할인은 외부 API와 내부 API의 호환 문제라기보다 business rule입니다. Vendor를 다른 PG로 바꿔도 같은 할인 정책을 유지해야 한다면 domain/application 쪽 책임입니다.

```text
Adapter가 주로 아는 것
- 외부 API 모양
- 외부 DTO / 단위
- 외부 error representation

Adapter가 불필요하게 알면 안 되는 것
- 주문 할인 정책
- 회원 등급 규칙
- 결제 가능 business 상태
```

경계를 만들었다가 모든 연동 관련 코드를 Adapter 하나에 넣으면 새로운 god object가 될 수 있습니다.

## 외부 DTO를 내부까지 반환하면 Adapter를 둔 효과가 약해진다

```java
interface PaymentGateway {
    VendorResponse pay(Money money);
}
```

이 signature에서는 호출자가 `VendorResponse`를 알아야 합니다. SDK 교체 시 반환 타입도 함께 바뀔 가능성이 큽니다.

```java
interface PaymentGateway {
    PaymentResult pay(Money money);
}
```

내부가 필요한 결과만 표현하면 provider별 세부를 경계 뒤에 둘 수 있습니다. 단, vendor가 제공하는 고유 정보가 실제 product requirement라면 필요한 만큼은 내부 모델에 명시적으로 포함해야 합니다.

## DTO mapper와 Adapter는 겹칠 수 있지만 초점이 다르다

DTO mapper는 형태가 다른 두 데이터 구조 사이를 변환할 수 있습니다. Adapter도 내부에서 mapper를 사용할 수 있습니다. 그러나 모든 mapper를 디자인 패턴 Adapter라고 부를 필요는 없습니다.

Adapter의 핵심 질문은 **호환되지 않는 협력 계약 사이에서 한쪽을 다른 쪽처럼 사용할 수 있게 만드는가**입니다. 단순 response field rename만 하는 transformation과 외부 시스템 경계를 보호하는 Adapter는 책임 범위가 다를 수 있습니다.

## Decorator와 Proxy와는 변경하는 대상이 다르다

Adapter는 보통 호출자가 보는 계약을 바꿉니다.

```text
VendorClient API -> PaymentGateway API
```

Decorator는 같은 계약을 유지한 채 책임을 겹쳐 붙이는 데 초점이 있습니다.

```text
DataReader -> LoggingDataReader -> DataReader
```

Proxy도 같은 역할을 앞에 두지만 대상 접근 시점·권한·지연 생성 같은 **접근 중개**가 중심입니다. 구현 class 모양이 비슷해도 “무엇을 변환하거나 제어하려는가”를 보면 구분하기 쉽습니다.

## Adapter를 두었다고 외부 시스템 교체가 공짜가 되는 것은 아니다

두 PG가 기능과 의미까지 완전히 같다는 보장은 없습니다. 한 provider만 partial cancel을 지원하거나 timeout 의미가 다를 수 있습니다. Adapter는 **차이를 한곳에서 다룰 수 있는 경계**를 만들 뿐, 실제 차이를 없애지는 않습니다.

새 provider를 붙일 때 Adapter 안의 복잡한 `if vendor == ...`가 계속 늘어난다면 내부 계약 자체가 provider 차이를 너무 억지로 숨기고 있는 것은 아닌지 다시 봐야 합니다.

백엔드에서 Adapter를 적용할 때는 마지막으로 흐름을 직접 추적하면 좋습니다. 내부 값이 외부 representation으로 어떻게 바뀌는지, overflow나 precision 손실은 없는지, 외부 failure가 어떤 내부 의미로 돌아오는지, 그리고 그 과정에 business policy가 섞이지 않았는지 확인합니다. 좋은 Adapter는 vendor 코드를 단순히 감추는 wrapper가 아니라 **외부 기술의 변화가 application의 책임 모델까지 번지지 않게 하는 번역 경계**입니다.
