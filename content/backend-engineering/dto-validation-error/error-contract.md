---
kind: concept
contentKey: backend.core.dto-validation-error.error-contract
topicContentKey: backend.core.dto-validation-error
slug: error-contract
title: error contract
summary: 실패도 API contract다. HTTP status, 안정적인 machine code, field error와 추적 정보를 역할별로 분리한다.
level: 2
status: PUBLISHED
displayOrder: 30
references:
- url: https://www.rfc-editor.org/rfc/rfc9457
  title: RFC 9457 Problem Details for HTTP APIs
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: 기계가 처리할 수 있는 HTTP error detail 형식과 확장 원칙 확인
---
# error contract

정상 응답만 API contract라고 생각하면 client는 실패할 때마다 문자열을 파싱하게 됩니다. Error contract는 **어떤 실패인지, 사용자가 고칠 수 있는지, retry할 수 있는지, 어떤 field가 문제인지**를 기계가 안정적으로 판단하게 합니다.

### 사람 메시지와 machine code를 분리한다

```json
{
  "code": "ORDER_ALREADY_CANCELLED",
  "message": "이미 취소된 주문입니다.",
  "traceId": "01J...",
  "fieldErrors": []
}
```

`message`는 번역이나 문구 개선으로 바뀔 수 있지만 `code`는 client branch의 계약이 됩니다.

### HTTP status와 domain error code는 역할이 다르다

`409 Conflict`는 generic HTTP 의미를 전달하고 `ORDER_VERSION_CONFLICT`는 product-specific 의미를 전달합니다. 둘을 경쟁시키지 않고 함께 사용합니다.

RFC 9457의 Problem Details를 사용한다면 `type`, `title`, `status`, `detail`, `instance`와 확장 field의 역할을 이해하고 product error code를 추가할 수 있습니다.

### retryability를 명시할 때 조심한다

5xx라고 무조건 retry 가능한 것은 아닙니다. 요청이 서버에서 이미 처리됐지만 response 전달만 실패했을 수도 있습니다. client가 retry할 수 있는 operation이라면 idempotency와 함께 설계해야 합니다.

### 내부 정보를 숨긴다

stack trace, SQL, vendor token, 내부 host를 response에 넣지 않습니다. 대신 server log에는 traceId와 root cause를 남겨 운영자가 같은 사건을 찾을 수 있게 합니다.

### field error를 stable하게 만든다

```json
{
  "field": "email",
  "code": "INVALID_FORMAT",
  "message": "올바른 이메일 형식이 아닙니다."
}
```

frontend가 한글 문구를 비교하지 않고 field/code를 사용하게 하면 문구와 UI를 독립적으로 바꿀 수 있습니다.
