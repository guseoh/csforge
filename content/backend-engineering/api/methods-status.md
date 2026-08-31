---
kind: concept
contentKey: backend.core.api.methods-status
topicContentKey: backend.core.api
slug: methods-status
title: method와 status
summary: HTTP method와 status code는 장식이 아니라 proxy, cache, client library가 해석하는 공통 의미 계약입니다. 모든 요청을 POST와 200 OK로 처리하면 서버 내부 로직은 동작해도 HTTP가 제공하는 의미를 잃습니다.
level: 1
status: PUBLISHED
displayOrder: 20
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP method, status, representation, idempotence semantics 확인
---
# method와 status

HTTP method와 status code는 장식이 아니라 proxy, cache, client library가 해석하는 **공통 의미 계약**입니다. 모든 요청을 `POST /doSomething`과 `200 OK`로 처리하면 서버 내부 로직은 동작해도 HTTP가 제공하는 의미를 잃습니다.

### method는 서버 구현이 아니라 요청 의도를 나타낸다

| Method | 핵심 의미                                 | 반복 호출 관점                  |
| ------ | ----------------------------------------- | ------------------------------- |
| GET    | 현재 representation 조회                  | safe, idempotent                |
| PUT    | 지정 resource 상태를 전체적으로 대체/생성 | idempotent                      |
| DELETE | resource 제거 요청                        | idempotent                      |
| POST   | resource-specific processing/생성         | 일반적으로 idempotent 보장 없음 |

`idempotent`는 “응답이 항상 같다”가 아니라 같은 의도를 여러 번 적용해도 서버의 의도된 효과가 추가로 누적되지 않는 의미입니다. DELETE를 두 번 호출했을 때 두 번째 응답이 404여도 첫 삭제가 다시 중복 적용되는 것은 아닙니다.

### 생성 성공은 200만 있는 것이 아니다

```http
POST /api/orders HTTP/1.1

HTTP/1.1 201 Created
Location: /api/orders/42
```

새 resource가 만들어졌다면 `201 Created`와 `Location`이 자연스럽습니다. 비동기 작업을 접수했다면 실제 작업 완료를 뜻하는 201보다 `202 Accepted`가 더 정확할 수 있습니다.

### 400, 404, 409를 구분하는 이유

```text
JSON 자체를 해석할 수 없음         → 400 Bad Request
존재하지 않는 주문 조회            → 404 Not Found
현재 상태와 요청이 충돌             → 409 Conflict
인증되지 않음                       → 401 Unauthorized
인증됐지만 권한 없음                → 403 Forbidden
```

모든 business exception을 400으로 뭉치면 클라이언트가 retry/사용자 안내/권한 문제를 구분하기 어렵습니다.

### status만으로 충분하지 않을 수 있다

`409`라는 숫자만으로 “이미 취소된 주문”인지 “version conflict”인지 알 수 없습니다. 그래서 안정적인 error code나 Problem Details 같은 body contract를 함께 둡니다.

### 흔한 실수

status code를 너무 세밀하게 나눠 API마다 다른 규칙을 만드는 것도 문제입니다. HTTP 의미를 존중하되 product가 실제로 구분해 대응해야 하는 실패를 중심으로 일관성을 유지합니다.
