---
kind: concept
contentKey: backend.core.external.remote-errors
topicContentKey: backend.core.external
slug: remote-errors
title: "원격 응답 검증과 오류 번역"
summary: "HTTP status·body parsing·schema·business status를 단계별로 검증하고 외부 공급자의 오류 표현을 내부에서 필요한 안정적인 결과와 실패 의미로 번역한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTTP response status와 representation semantics 확인"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc-client.html"
    title: "Spring Framework Reference: REST Clients"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "HTTP response를 application object로 변환하는 client 경계 확인"
---
# 원격 응답 검증과 오류 번역

외부 API가 `200 OK`를 반환했다고 우리 유스케이스까지 성공한 것은 아닙니다. HTTP status는 응답의 한 층위일 뿐이고, body를 정상적으로 읽을 수 있는지, 필요한 필드와 허용된 값이 있는지, 공급자가 표현한 business 상태가 실제 성공인지까지 확인해야 합니다.

```text
HTTP response
   │
   ├─ status / headers
   │
   ├─ body parsing
   │
   ├─ schema·필수 값 검증
   │
   └─ business status 해석
           │
           ▼
     내부 result 또는 failure
```

### Parsing 성공과 유효한 응답은 다르다

다음 JSON은 문법적으로 정상입니다.

```json
{
  "success": true,
  "orderId": null,
  "status": "APPROVED"
}
```

하지만 성공 응답에서 `orderId`가 반드시 있어야 한다는 공급자 계약이라면 내부에서는 정상 결과로 받아들이면 안 됩니다. JSON deserialize가 성공했다는 사실은 **데이터 구조를 읽을 수 있었다는 뜻이지, 응답 의미가 유효하다는 뜻은 아닙니다.**

외부 adapter에서는 필요한 경우 다음을 단계적으로 확인합니다.

- 기대한 HTTP status와 media type인가?
- body를 허용된 크기와 형식으로 읽을 수 있는가?
- 필수 field와 enum 값이 계약에 맞는가?
- 성공 상태와 식별자 같은 값 조합이 모순되지 않는가?

### 공급자 DTO를 안쪽 모델로 그대로 퍼뜨리지 않는다

```text
VendorPaymentResponse
  status = "CAPTURED"
  providerRequestId = "..."
       │
       │ adapter가 검증·번역
       ▼
PaymentResult.success(paymentId, amount)
```

애플리케이션과 도메인이 공급자의 필드 이름, nullable 규칙, error code 체계를 직접 알기 시작하면 공급자 변경이 안쪽 코드 전체의 변경으로 이어집니다. 외부 adapter는 **공급자 표현을 우리 시스템이 정책 판단에 필요한 의미로 변환하는 경계**입니다.

### 실패도 하나의 `RemoteException`으로 뭉개지 않는다

외부 호출 실패 종류에 따라 다음 행동이 달라질 수 있습니다.

```text
remote 429      → rate limited
remote 5xx      → temporarily unavailable 후보
malformed body  → invalid response / contract 문제 후보
response timeout→ outcome unknown 가능
```

이 차이를 유지하면 application은 제한된 retry를 할지, 사용자에게 실패를 즉시 알릴지, 결과 조회를 시도할지 결정할 수 있습니다. 다만 외부의 모든 status와 exception class를 내부 enum으로 그대로 복제할 필요는 없습니다. **우리 정책이 실제로 구분해야 하는 실패만 안정적인 내부 의미로 남깁니다.**

### 원격 오류 body를 그대로 노출하지 않는다

공급자의 error response에는 HTML, stack trace, 내부 식별자, 예상보다 큰 body, 민감한 값이 들어 있을 수 있습니다. 이를 우리 API 응답이나 로그에 그대로 복사하면 정보 노출과 로그 용량 문제가 생길 수 있습니다.

대신 필요한 원인 분류와 공급자 request id 같은 진단 식별자는 보존하고, 외부 사용자에게는 우리 API의 오류 계약으로 번역합니다.

```text
remote error
   │
   ├─ 운영 로그: provider request id + 안전한 원인 정보
   │
   └─ API 응답: stable product error code + correlation id
```

외부 연동의 핵심은 status code를 많이 분류하는 것이 아니라 **신뢰할 수 없는 원격 응답을 경계에서 검증하고, 안쪽 코드가 실제로 대응할 수 있는 안정적인 결과와 실패 의미로 바꾸는 것**입니다.
