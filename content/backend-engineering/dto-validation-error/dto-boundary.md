---
kind: concept
contentKey: backend.core.dto-validation-error.dto-boundary
topicContentKey: backend.core.dto-validation-error
slug: dto-boundary
title: "요청·응답 DTO 경계"
summary: "API DTO를 외부 representation과 내부 application/domain/persistence 모델 사이의 번역 경계로 사용해 과도한 입력 허용과 우발적인 계약 결합을 줄인다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://spec.openapis.org/oas/latest.html
  title: OpenAPI Specification
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP API의 요청·응답 schema와 외부 계약을 표현하는 표준 형식 확인
---
# 요청·응답 DTO 경계

API DTO를 두는 목적은 단순히 "Entity를 숨기기 위해서"가 아닙니다. 핵심은 **외부에서 약속한 representation과 내부 모델이 서로 다른 이유로 바뀔 수 있게 번역 경계를 만드는 것**입니다.

예를 들어 주문 생성 요청에는 클라이언트가 입력해야 할 값만 있어야 합니다.

```java
public record CreateOrderRequest(
        List<OrderItemRequest> items,
        String couponCode
) {}
```

여기에는 JSON 필드 이름, nullable 여부, 문자열 형식 같은 API 계약이 들어갑니다. 애플리케이션 계층으로 넘어갈 때는 현재 유스케이스에 필요한 의미로 변환할 수 있습니다.

```text
JSON
 │
 ▼
CreateOrderRequest
 │ 요청 형식 검증 + 변환
 ▼
CreateOrderCommand
 │
 ▼
Order.place(...)
```

API Request 타입을 애플리케이션 서비스가 그대로 받지 않으면 HTTP 표현이 바뀌었을 때 유스케이스 내부까지 수정되는 범위를 줄일 수 있습니다.

### 영속성 Entity를 요청 모델로 그대로 사용하면 쓰기 권한까지 섞인다

```java
@PostMapping("/members")
MemberEntity create(@RequestBody MemberEntity request) { ... }
```

이 구조에서는 `role`, `status`, `createdAt`처럼 서버가 결정해야 할 필드까지 외부 입력 모델에 노출되기 쉽습니다. serializer 설정만으로 우연히 막기보다 요청 DTO 자체가 **클라이언트가 설정할 수 있는 값의 범위**를 표현하는 편이 안전합니다.

### 응답 DTO는 이번 API가 약속하는 정보만 드러낸다

JPA Entity에는 lazy association, 내부 식별자, 감사 필드, persistence를 위한 상태가 있을 수 있습니다. 이를 그대로 직렬화하면 의도하지 않은 연관 조회가 실행되거나 순환 참조, 내부 정보 노출이 생길 수 있습니다.

응답 DTO는 "현재 endpoint가 외부에 어떤 representation을 제공하는가"를 명시합니다.

```java
public record OrderSummaryResponse(
        long id,
        String status,
        BigDecimal totalAmount
) {}
```

목록 API라면 필요한 필드만 query projection으로 조회해 바로 응답 모델을 만드는 것도 가능합니다. 항상 전체 도메인 객체 그래프를 먼저 복원해야 하는 것은 아닙니다.

### DTO를 모든 계층에 하나씩 기계적으로 만들 필요는 없다

작은 유스케이스에서 API 요청과 application command가 실제로 같은 변경 이유와 같은 필드를 가진다면 별도 객체 하나가 단순 복사만 늘릴 수도 있습니다. 중요한 것은 "계층마다 DTO가 있어야 한다"는 형식이 아니라 **서로 다른 계약이 같은 타입에 섞여 변경이 전파되고 있는가**입니다.

### DTO가 도메인 규칙과 권한 검사를 대신하지는 않는다

요청 DTO에서 `status` 필드를 제거했다고 모든 잘못된 상태 변경이 자동으로 차단되는 것은 아닙니다. 애플리케이션은 사용자의 권한을 확인해야 하고, 도메인은 허용된 상태 전이를 보호해야 하며, DB는 저장 무결성을 지켜야 합니다.

DTO의 역할은 이 모든 검증을 대신하는 것이 아니라 **외부 표현이 내부 모델의 구조와 쓰기 권한을 직접 결정하지 않게 하는 첫 번째 번역 경계**입니다.
