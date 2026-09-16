---
kind: concept
contentKey: backend.core.api.methods-status
topicContentKey: backend.core.api
slug: methods-status
title: "HTTP 메서드와 상태 코드"
summary: "HTTP 메서드와 상태 코드를 서버 내부 구현의 장식이 아니라 클라이언트·프록시·캐시가 함께 해석하는 공통 의미 계약으로 사용한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP 메서드의 safe/idempotent 의미와 상태 코드 계약 확인
---
# HTTP 메서드와 상태 코드

서버 코드만 보면 모든 요청을 `POST`로 받고 성공하면 `200 OK`를 반환해도 기능을 구현할 수 있습니다. 하지만 HTTP 메서드와 상태 코드는 클라이언트뿐 아니라 프록시, 캐시, SDK가 함께 해석하는 **공통 의미 계약**입니다. 같은 동작을 어떤 메서드와 상태로 표현하는지가 재시도, 캐싱, 사용자 오류 처리에 영향을 줍니다.

### 메서드는 서버 코드 모양이 아니라 요청 의도를 표현한다

| 메서드 | 대표 의미 | 반복 요청 관점 |
| --- | --- | --- |
| `GET` | 현재 representation 조회 | safe, idempotent |
| `PUT` | 지정한 리소스 상태를 대체하거나 생성 | idempotent |
| `DELETE` | 리소스 제거 요청 | idempotent |
| `POST` | 리소스별 처리나 생성 요청 | 일반적으로 idempotent 보장 없음 |

여기서 멱등성(idempotency)은 "응답 body가 매번 완전히 같다"는 뜻이 아닙니다. 같은 의도의 요청을 여러 번 적용해도 서버가 의도한 효과가 추가로 누적되지 않는다는 의미입니다.

예를 들어 같은 리소스를 두 번 `DELETE`했을 때 첫 요청은 `204`, 두 번째는 `404`를 반환할 수 있습니다. 응답은 달라도 삭제 효과가 계속 누적되지는 않습니다.

### 성공도 상황에 따라 다른 상태를 사용한다

새 주문 리소스가 실제로 만들어졌다면 다음과 같이 표현할 수 있습니다.

```http
POST /api/orders HTTP/1.1

HTTP/1.1 201 Created
Location: /api/orders/42
```

반면 요청을 접수했지만 처리가 비동기로 이어진다면 `202 Accepted`가 더 적절할 수 있습니다. 중요한 것은 숫자를 많이 외우는 것이 아니라 **클라이언트가 지금 어떤 상태까지 보장받았는지**가 응답 의미와 일치하는 것입니다.

### 실패 상태는 클라이언트가 다음 행동을 결정하게 한다

```text
요청 형식 자체를 해석할 수 없음  → 400 Bad Request
대상 리소스를 찾을 수 없음       → 404 Not Found
현재 상태와 요청이 충돌          → 409 Conflict
인증 정보가 없음/유효하지 않음   → 401 Unauthorized
인증됐지만 권한이 없음           → 403 Forbidden
```

모든 업무 실패를 `400` 하나로 반환하면 클라이언트는 "입력을 고쳐야 하는가", "이미 상태가 바뀐 것인가", "대상이 없는가"를 구분하기 어렵습니다.

그렇다고 업무 오류마다 새로운 HTTP 상태 코드를 억지로 찾을 필요도 없습니다. HTTP 상태는 넓은 실패 범주를 표현하고, 제품별 세부 원인은 안정적인 오류 코드와 응답 body로 보완할 수 있습니다.

```json
{
  "code": "ORDER_VERSION_CONFLICT",
  "message": "주문 상태가 이미 변경되었습니다."
}
```

Backend Engineering에서 중요한 것은 상태 코드를 세밀하게 암기하는 것이 아니라 **제품이 실제로 구분해야 하는 성공·실패 의미를 HTTP의 공통 semantics에 일관되게 매핑하는 것**입니다. 프로토콜 자체의 세부 규칙은 Network & HTTP 영역에서 더 깊게 다룹니다.
