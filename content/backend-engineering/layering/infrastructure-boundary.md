---
kind: concept
contentKey: backend.core.layering.infrastructure-boundary
topicContentKey: backend.core.layering
slug: infrastructure-boundary
title: "인프라 경계와 외부 모델 번역"
summary: "외부 SDK·프로토콜·오류 표현을 내부에서 필요한 의미로 번역해 공급자 변경과 장애 세부가 애플리케이션·도메인 전체로 퍼지는 것을 막는다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://learn.microsoft.com/ko-kr/azure/architecture/patterns/anti-corruption-layer"
    title: "Microsoft Learn: 손상 방지 계층 패턴"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "서로 다른 의미 체계를 가진 외부 시스템과 내부 모델 사이에서 요청·응답을 번역해 외부 의존성이 내부 설계를 제한하지 않게 하는 원칙을 확인한다."
---
# 인프라 경계와 외부 모델 번역

백엔드는 데이터베이스, 결제사, 메시지 브로커, 파일 저장소처럼 애플리케이션 밖의 시스템과 계속 연결됩니다. 문제는 외부 시스템마다 타입, 오류 코드, 호출 규칙이 다르고 그 규칙이 우리 도메인의 언어와 일치하지 않는다는 점입니다.

이 차이를 그대로 안쪽 코드까지 전달하면 외부 공급자 하나의 변경이 애플리케이션 전체의 변경으로 번집니다. 그래서 인프라 경계에서는 **외부 표현을 내부에서 필요한 의미로 번역**합니다.

### 외부 SDK 타입을 도메인 계약으로 만들지 않는다

```java
StripePaymentIntent intent = stripeClient.create(...);

order.completePayment(
        intent.getStatus(),
        intent.getAmountReceived(),
        intent.getCurrency()
);
```

이 구조에서 `Order`가 `StripePaymentIntent`나 Stripe의 상태 문자열을 알기 시작하면 "결제 완료"라는 내부 개념이 특정 공급자 모델에 묶입니다.

대신 어댑터가 외부 응답을 애플리케이션이 이해하는 결과로 바꿀 수 있습니다.

```java
PaymentResult result = paymentGateway.pay(command);

order.completePayment(
        result.paymentId(),
        result.paidAmount()
);
```

```text
Application / Domain
        │
        │ PaymentGateway contract
        ▼
Infrastructure Adapter
        │
        ├─ HTTP / vendor SDK
        ├─ vendor status / error code
        └─ vendor response body
```

이렇게 하면 안쪽 코드는 "결제가 성공했는가", "결제 식별자와 금액이 무엇인가"를 다루고, 공급자별 상태 코드와 응답 구조는 어댑터에 남습니다.

### 번역해야 하는 것은 객체 타입만이 아니다

외부 시스템의 실패 표현도 내부 의미로 바꿔야 합니다.

| 외부 표현 | 내부에서 필요한 판단 |
| --- | --- |
| HTTP 429 | 잠시 뒤 재시도할 수 있는 제한인지 |
| 공급자 `SUCCEEDED` | 결제가 최종 성공 상태인지 |
| 네트워크 timeout | 결과를 모르는 실패인지 단순 미처리인지 |
| 공급자 요청 ID | 장애 추적에 사용할 상관관계 정보 |
| 선택적 응답 필드 | 내부 계약에서 허용하는 누락인지 |

외부 오류를 모두 `RuntimeException` 하나로 바꾸면 재시도 가능한 실패와 즉시 종료해야 할 실패를 구분하기 어렵습니다. 반대로 공급자의 세부 오류 코드를 도메인 enum으로 전부 복제하면 외부 API 변경이 도메인 변경으로 이어집니다. 내부에서 실제로 필요한 판단 기준만 남기는 것이 중요합니다.

### 경계는 기술을 숨기기 위한 장식이 아니다

실제 책임이 없는데 모든 외부 호출 앞에 port와 adapter를 미리 만드는 것도 비용입니다. 하지만 다음 신호가 보이면 경계를 분리할 이유가 강합니다.

- 외부 SDK 타입이 애플리케이션·도메인 메서드 시그니처에 등장한다.
- 공급자 오류 코드를 여러 유스케이스가 직접 해석한다.
- 공급자 변경을 위해 도메인 규칙까지 수정해야 한다.
- 외부 응답의 누락·이상 값을 각 호출자가 제각각 처리한다.

인프라 경계는 외부 세부를 없애는 곳이 아니라 **외부 세부를 한곳에서 관찰하고, 내부에서 필요한 의미로 바꾸는 곳**입니다. 원본 HTTP status, 공급자 요청 ID, 지연 시간 같은 운영 증거는 인프라 계층에서 보존하되, 도메인 규칙은 공급자 표현에 직접 의존하지 않게 만드는 것이 목표입니다.
