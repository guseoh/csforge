---
kind: concept
contentKey: backend.core.dto-validation-error.error-contract
topicContentKey: backend.core.dto-validation-error
slug: error-contract
title: "오류 응답 계약"
summary: "실패도 API 계약으로 보고 HTTP 상태, 안정적인 오류 코드, 필드 오류와 추적 정보를 분리해 클라이언트가 문자열 파싱 없이 다음 행동을 결정하게 한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
- url: https://www.rfc-editor.org/rfc/rfc9457
  title: RFC 9457 Problem Details for HTTP APIs
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: 기계가 처리할 수 있는 HTTP 오류 표현과 확장 필드 원칙 확인
---
# 오류 응답 계약

정상 응답만 API 계약으로 관리하고 실패는 exception message 그대로 반환하면 클라이언트가 서버의 문구와 구현 세부에 결합됩니다. 오류 응답도 **어떤 종류의 실패인지, 사용자가 고칠 수 있는지, 다시 시도할 수 있는지, 어떤 입력이 문제인지**를 안정적으로 전달하는 외부 계약입니다.

### 사람에게 보여 줄 문구와 기계가 분기할 코드를 분리한다

```json
{
  "code": "ORDER_ALREADY_CANCELLED",
  "message": "이미 취소된 주문입니다.",
  "traceId": "01J...",
  "fieldErrors": []
}
```

`message`는 표현을 다듬거나 다국어 처리를 하면서 바뀔 수 있습니다. 반면 `code`를 클라이언트의 조건 분기에 사용하기로 했다면 그 값은 훨씬 안정적인 계약으로 관리해야 합니다.

프론트엔드가 `message == "이미 취소된 주문입니다."`를 비교해 화면 동작을 결정하게 만들면 문구 변경이 곧 기능 장애가 됩니다.

### HTTP 상태와 제품 오류 코드는 서로 다른 층위의 정보를 준다

```text
409 Conflict
    │ HTTP 차원의 넓은 실패 범주
    ▼
ORDER_VERSION_CONFLICT
    │ 제품 차원의 구체적인 원인
    ▼
사용자에게 재조회/재시도 안내
```

`409`만으로는 이미 취소된 주문인지, optimistic version 충돌인지 알기 어렵습니다. 반대로 제품 오류 코드만 있고 HTTP 상태를 항상 `200`으로 반환하면 프록시나 일반 HTTP client가 실패 의미를 활용하기 어려워집니다.

둘을 경쟁시키기보다 역할을 나눠 함께 사용합니다.

### 필드 오류는 입력 위치와 원인을 안정적으로 표현한다

```json
{
  "field": "email",
  "code": "INVALID_FORMAT",
  "message": "올바른 이메일 형식이 아닙니다."
}
```

클라이언트가 `field`와 `code`를 사용하면 사용자 문구와 화면 구성을 독립적으로 바꿀 수 있습니다. 배열·중첩 객체가 있는 요청이라면 어떤 위치를 field path로 표현할지 역시 API 전체에서 일관되게 정하는 편이 좋습니다.

### 재시도 가능 여부는 상태 코드 하나로 단정하지 않는다

`5xx`라고 모든 요청을 무조건 재시도할 수 있는 것은 아닙니다. 서버가 작업은 완료했지만 응답을 전달하지 못했다면 클라이언트는 결과를 모르는 상태가 됩니다. 특히 주문·결제처럼 side effect가 있는 요청은 재시도 정책을 **멱등성 설계와 함께** 봐야 합니다.

오류 응답에 `retryable: true` 같은 정보를 제공할 수도 있지만, 그 의미와 유효 기간까지 제품 계약으로 관리할 준비가 있을 때 사용하는 것이 좋습니다.

### 내부 진단 정보와 외부 응답을 분리한다

stack trace, SQL, 내부 host, vendor token 같은 정보는 외부 응답에 노출하지 않습니다. 그렇다고 진단 정보를 버리는 것은 아닙니다.

```text
외부 응답
  code / message / traceId

서버 로그·관측
  traceId / root cause / upstream status / stack trace
```

동일한 `traceId`나 correlation id로 두 정보를 연결하면 클라이언트에는 안정적인 계약만 제공하면서 운영자는 실제 원인을 추적할 수 있습니다.

RFC 9457 Problem Details를 사용한다면 `type`, `title`, `status`, `detail`, `instance`의 의미를 유지하면서 제품별 오류 코드 같은 확장 필드를 추가할 수 있습니다. 중요한 것은 특정 JSON 모양을 그대로 복사하는 것이 아니라 **실패 응답도 정상 응답처럼 버전과 호환성을 가진 계약으로 관리하는 것**입니다.
