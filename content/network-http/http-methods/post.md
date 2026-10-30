---
kind: concept
contentKey: network-http.core.http-methods.post
topicContentKey: network-http.core.http-methods
slug: post
title: "POST와 서버 측 처리"
summary: "POST가 요청 콘텐츠를 대상 자원이 정의한 고유한 의미에 따라 처리하도록 요청하는 메서드이며, 메서드 자체는 멱등하지 않다는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# POST와 서버 측 처리

POST는 요청 콘텐츠를 **대상 자원이 정의한 고유한 방식으로 처리해 달라**고 요청하는 메서드다. 그래서 POST를 단순히 `새 자원을 만드는 메서드` 하나로만 정의하면 부족하다. 폼 제출, 명령 실행, 컬렉션에 새 항목 추가, 데이터 처리 작업 시작처럼 대상 자원이 여러 종류의 처리를 정의할 수 있다.

새 자원이 만들어졌다면 서버는 `201 Created`와 `Location`을 사용해 생성된 자원을 알려 줄 수 있다. 하지만 POST가 항상 새 URI를 만든다는 뜻은 아니다. 처리 결과를 표현(representation)으로 반환하거나 비동기 작업을 시작하는 용도로도 사용할 수 있다.

| 대상 자원이 정의한 처리 | POST의 가능한 결과 | 가능한 응답 |
| --- | --- | --- |
| 주문 컬렉션에 새 주문 추가 | 새 자원 생성 | `201 Created`와 `Location` |
| 검색 엔드포인트에 검색 조건 전달 | 검색 결과 표현 반환 | `200 OK` |
| 작업 엔드포인트에 비동기 작업 요청 | 처리 접수 | `202 Accepted` |

### POST는 메서드 자체가 멱등하지 않다

같은 POST 요청을 반복했을 때 대상 자원의 처리가 두 번 실행될 수 있으므로 HTTP는 POST를 멱등 메서드(idempotent method)로 정의하지 않는다. 예를 들어 `새 주문 생성`을 같은 내용으로 두 번 POST하면 애플리케이션 계약에 따라 두 주문이 생길 수 있다.

그렇다고 모든 POST가 반드시 중복 효과를 만들어야 한다는 뜻도 아니다. 애플리케이션이 작업 식별자나 별도 중복 제거 계약을 제공하면 특정 POST를 재시도해도 업무 효과가 한 번만 적용되도록 설계할 수 있다.

```text
POST 자체의 HTTP 의미
→ 반복 요청의 업무 효과를 자동 중복 제거하지 않음

애플리케이션의 별도 계약
→ Idempotency-Key, 작업 ID, 고유 제약 등으로
   같은 업무 작업의 중복 실행을 막을 수 있음
```

이런 애플리케이션 수준 보장이 POST라는 HTTP 메서드 자체를 멱등 메서드로 바꾸는 것은 아니다. 프로토콜 의미와 서비스가 추가한 업무 계약을 구분해야 한다.

### POST와 PUT은 클라이언트가 무엇을 지정하는지가 다르다

POST에서는 클라이언트가 대상 URI에 **콘텐츠를 어떻게 처리할지 맡기는 것**이 핵심이다. 반면 PUT에서는 클라이언트가 특정 대상 URI가 어떤 상태가 되기를 원하는지 표현한다.

```text
POST /orders
→ 이 주문 데이터를 주문 컬렉션의 규칙에 따라 처리해 달라

PUT /profiles/42
→ /profiles/42가 이 표현이 나타내는 상태가 되게 해 달라
```

핵심은 **POST가 대상 자원에 요청 콘텐츠의 처리를 맡기는 메서드이며, 자원 생성은 그 대표적인 사용 사례 중 하나일 뿐이라는 점**이다.
