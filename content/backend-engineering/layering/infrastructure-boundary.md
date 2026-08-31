---
kind: concept
contentKey: backend.core.layering.infrastructure-boundary
topicContentKey: backend.core.layering
slug: infrastructure-boundary
title: infrastructure boundary
summary: 외부 SDK와 protocol의 타입·오류·변경을 내부 의미로 번역해 Domain과 Application의 변경 전파를 제한한다.
level: 1
status: PUBLISHED
displayOrder: 30
references: []
---
# infrastructure boundary

외부 시스템은 내부 코드보다 훨씬 자주 다른 이유로 바뀝니다. 결제사의 SDK가 바뀌거나, 검색 엔진 응답 형식이 바뀌거나, 파일 저장소가 S3에서 로컬로 바뀔 수 있습니다. 이런 변화가 Domain 전체로 번지는 것을 막기 위해 **외부 표현을 내부 계약으로 번역하는 경계**가 필요합니다.

### vendor 모델을 그대로 들여오지 않는다

```java
StripePaymentIntent intent = stripeClient.create(...);

order.completePayment(
        intent.getStatus(),
        intent.getAmountReceived(),
        intent.getCurrency()
);
```

Domain이 `StripePaymentIntent`를 받기 시작하면 “결제 완료”라는 내부 개념이 vendor object에 묶입니다. 대신 infrastructure adapter가 필요한 정보만 변환합니다.

```java
PaymentResult result = paymentGateway.pay(command);

order.completePayment(
        result.paymentId(),
        result.paidAmount()
);
```

```text
Domain / Application
        │
        │ PaymentGateway
        ▼
Infrastructure Adapter
        │
        ├─ HTTP / SDK
        ├─ vendor error code
        └─ vendor response
```

### 번역해야 하는 것은 타입만이 아니다

| 외부 세계            | 내부에서 원하는 표현           |
| -------------------- | ------------------------------ |
| HTTP 429             | RemoteRateLimited              |
| vendor SUCCEEDED     | PaymentResult.success()        |
| milliseconds timeout | use-case deadline 안의 timeout |
| vendor request ID    | 진단용 metadata                |
| nullable field       | 내부 계약에 맞는 명시적 상태   |

외부 오류를 전부 `RuntimeException` 하나로 던지면 retry 가능한 오류와 permanent 오류를 구분할 수 없습니다. 반대로 vendor error code를 Domain enum에 전부 복제하면 vendor 변경이 Domain 변경이 됩니다.

### 경계를 어디에 둘 것인가

실제 책임이 없는 port/adapter 추상화를 미리 만드는 것은 피합니다. 하지만 **외부 SDK 타입이 application/domain으로 침투하기 시작하는 순간**은 분리 신호가 강합니다.

### 장애 분석에도 경계가 도움이 된다

외부 호출 latency, request ID, raw status는 infrastructure에서 관측해야 하지만 business log에는 내부 의미가 필요합니다. 외부 세부를 숨긴다는 말은 운영 증거까지 버린다는 뜻이 아닙니다.
