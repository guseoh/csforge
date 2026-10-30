---
kind: concept
contentKey: security.core.authn-authz.authorization
topicContentKey: security.core.authn-authz
slug: authorization
title: "인가와 리소스별 권한 판단"
summary: "인증된 주체가 특정 작업과 리소스에 접근할 수 있는지 서버가 판단하는 과정을 이해하고, 역할 검사와 소유권 검사를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "기본 거부·요청마다 인가·최소 권한 원칙 확인"
---
# 인가와 리소스별 권한 판단

로그인 사용자가 `/orders/123`을 호출했다고 해도 서버는 **이 사용자가 이 주문에 해당 작업을 할 수 있는가**를 확인해야 합니다. 이것이 인가입니다.

```text
인증된 주체: 회원 42
요청한 리소스: 주문 123 (소유자 회원 77)
요청한 작업: 취소

역할 USER ✓
소유권 ✗

→ 거부
```

### 역할만 확인해서는 부족한 리소스가 많다

```java
@GetMapping("/orders/{id}")
public OrderResponse get(@PathVariable long id) {
    return orderService.get(id); // 로그인 여부만 확인된다면 위험
}
```

같은 `USER` 역할이어도 서로의 주문을 볼 수 없다면 서비스나 조회 조건에 현재 사용자의 식별자를 포함해야 합니다.

```java
orderRepository.findByIdAndMemberId(orderId, currentMemberId)
```

또는 애플리케이션의 인가 정책에서 소유자를 비교할 수 있습니다. 검사 위치는 구조에 따라 달라도 **서버가 사용자와 리소스의 관계를 확인**해야 합니다.

### 엔드포인트 인가와 도메인 인가를 나눈다

`/admin/**` 경로 전체를 관리자에게만 허용하는 것은 HTTP 경계에서 처리하기 좋습니다. “이 사용자가 이 주문을 취소할 수 있는가?”는 소유권과 주문 상태를 함께 봐야 하므로 애플리케이션의 유스케이스에서 판단할 수 있습니다.

### 기본 거부 정책이 누락을 줄인다

새 엔드포인트가 자동으로 공개되지 않도록 기본적으로 접근을 거부하고, 공개할 경로만 명시적으로 허용하면 정책 누락을 줄일 수 있습니다.

### 인가 실패와 인증 실패는 다르다

- 인증 정보가 없거나 유효하지 않음 → 인증 필요
- 주체는 확인됐지만 권한 없음 → 접근 거부

HTTP 상태 코드와 보안 예외 처리도 이 차이를 반영해야 합니다.

인가는 역할 이름만 비교하는 기능이 아닙니다. 서버가 **인증 주체·리소스·작업·현재 상태의 관계**를 확인하는 과정입니다.
