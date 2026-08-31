---
kind: concept
contentKey: backend.core.dto-validation-error.dto-boundary
topicContentKey: backend.core.dto-validation-error
slug: dto-boundary
title: request/response DTO
summary: API DTO는 외부 표현의 변화와 내부 모델의 변화를 서로 독립적으로 관리하는 번역 경계다.
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://spec.openapis.org/oas/latest.html
  title: OpenAPI Specification
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP API contract를 schema로 표현하는 표준적 형식 확인
---
# request/response DTO

API DTO를 두는 목적은 `Entity를 숨기기 위해서`만이 아닙니다. **외부 표현의 변화와 내부 모델의 변화를 서로 독립적으로 관리하는 번역 경계**를 만드는 것이 핵심입니다.

### request와 domain creation은 책임이 다르다

```java
public record CreateOrderRequest(
        List<OrderItemRequest> items,
        String couponCode
) {}
```

HTTP request는 nullable, optional field, 문자열 형식 같은 transport concern을 포함합니다. Application에서 이를 검증된 command/value object로 변환한 뒤 Domain을 생성합니다.

```text
JSON
 │
 ▼
CreateOrderRequest
 │  shape validation
 ▼
CreateOrderCommand
 │
 ▼
Order.place(...)
```

### Entity를 response로 반환할 때 생기는 누수

JPA Entity에는 LAZY association, 내부 ID, audit field, persistence를 위한 constructor가 있을 수 있습니다. serializer가 Entity graph를 따라가면 의도하지 않은 query나 순환 참조도 생깁니다. Response DTO는 “이번 endpoint가 약속하는 representation”만 명시합니다.

### DTO를 모든 계층에 끌고 가지 않는다

API Request 타입을 Application Service가 직접 받기 시작하면 Application이 HTTP layer에 의존합니다. 반대로 내부 command가 단지 필드 복사만 하는 얇은 객체라면 작은 시스템에서는 변환 비용을 고려할 수 있습니다. 중요한 것은 **변경 이유가 다른 모델이 실제로 섞이고 있는지**입니다.

### read model은 domain object와 달라도 된다

목록 화면은 `id, title, authorName, commentCount`만 필요할 수 있습니다. 이 경우 여러 Entity를 로딩해 Domain graph를 만든 뒤 Response로 바꾸는 것보다 query projection이 더 적절할 수 있습니다.

### DTO가 해결하지 못하는 것

DTO를 만들었다고 over-posting이 자동으로 사라지는 것은 아닙니다. Request에 `role`, `status` 같은 client가 바꾸면 안 되는 field를 애초에 넣지 않고, Application/Domain에서도 authorization과 invariant를 다시 확인해야 합니다.
