---
kind: concept
contentKey: backend.core.api.resource-endpoint
topicContentKey: backend.core.api
slug: resource-endpoint
title: "리소스와 엔드포인트"
summary: "클라이언트가 다루는 대상과 상태 변화를 먼저 정의하고, URI·HTTP 메서드·요청/응답 표현을 하나의 안정적인 API 계약으로 설계한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP 메서드, 상태 코드, representation의 표준 의미 확인
---
# 리소스와 엔드포인트

API를 설계할 때 URI에 어떤 동사를 넣을지부터 고민하면 실제 계약보다 이름 모양에 집중하기 쉽습니다. 먼저 **클라이언트가 무엇을 하나의 대상으로 보고, 그 대상의 어떤 상태를 조회하거나 변경하는가**를 정하는 편이 좋습니다.

엔드포인트도 단순한 URL 문자열이 아닙니다. URI, HTTP 메서드, 요청 형식, 응답 representation, 상태 코드가 함께 외부 소비자가 의존하는 계약을 만듭니다.

### 동사 이름보다 클라이언트가 다루는 대상을 먼저 본다

주문 취소를 다음처럼 표현할 수 있습니다.

```http
POST /api/orders/42/cancel
```

이 URI가 무조건 잘못된 것은 아닙니다. 다만 취소가 단순 명령인지, 취소 요청 자체를 식별하고 조회해야 하는 별도 리소스인지 먼저 판단해야 합니다.

```http
POST /api/orders
GET  /api/orders/42
POST /api/orders/42/cancellations
```

취소 요청에 사유·처리 상태·시각이 있고 나중에 조회해야 한다면 `cancellations`를 별도 리소스로 표현하는 쪽이 제품 의미를 더 잘 드러낼 수 있습니다. 반대로 별도 생명주기가 없는 단순 상태 전이라면 억지로 새 리소스를 만들 필요는 없습니다.

### API 구조를 DB 구조에 맞추지 않는다

```text
/order_table/42/member_fk/7
```

이런 URI는 외부 소비자가 이해해야 할 주문·회원 관계보다 테이블과 FK 이름을 노출합니다. DB 스키마가 바뀌면 API까지 함께 바뀌기 쉬워집니다.

API는 **외부 소비자가 이해하는 제품 리소스와 동작**을 기준으로 설계하고, 내부 저장 구조는 그 계약을 구현하는 세부로 남기는 편이 좋습니다.

### 컬렉션과 개별 리소스의 역할을 일관되게 만든다

```text
/orders
  ├─ POST : 새 주문 생성
  └─ GET  : 주문 목록 조회

/orders/{orderId}
  ├─ GET    : 특정 주문 조회
  ├─ PATCH  : 계약이 허용하는 일부 상태 변경
  └─ DELETE : 제품에서 삭제 의미가 있을 때
```

모든 API가 이 모양이어야 한다는 규칙은 아닙니다. 중요한 것은 같은 제품 안에서 비슷한 동작이 서로 다른 방식으로 표현되지 않아 클라이언트가 계약을 예측할 수 있게 하는 것입니다.

### 중첩 URI는 실제 소유 관계를 표현할 때만 사용한다

```text
/members/7/orders/42/items/3
```

중첩은 부모 문맥이 필요한 리소스를 표현하는 데 유용하지만 깊어질수록 동일 대상을 여러 URI로 표현하거나 부모 ID를 불필요하게 반복할 수 있습니다. "이 리소스를 식별하고 권한을 판단하는 데 부모 문맥이 실제로 필요한가"를 기준으로 깊이를 정합니다.

### URI 모양보다 관찰 가능한 계약 전체가 더 중요하다

`/orders/42`라는 URI가 깔끔해도 다음이 빠져 있으면 좋은 API라고 보기 어렵습니다.

- 다른 사용자의 주문을 조회하지 못하도록 하는 권한 정책
- 목록 결과의 페이지 크기와 정렬 계약
- 중복 생성 요청을 어떻게 처리할지에 대한 멱등성 정책
- 실패를 클라이언트가 안정적으로 구분할 수 있는 오류 계약

Backend Engineering에서 리소스 설계의 목적은 REST 모양을 맞추는 것이 아니라 **클라이언트가 의존할 수 있는 안정적인 제품 계약을 만드는 것**입니다. HTTP 프로토콜 자체의 세부 의미는 Network & HTTP 영역에서 더 깊게 다루고, 여기서는 그 의미를 제품 API에 어떻게 적용할지에 집중합니다.
