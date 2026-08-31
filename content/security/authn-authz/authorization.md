---
kind: concept
contentKey: security.core.authn-authz.authorization
topicContentKey: security.core.authn-authz
slug: authorization
title: "Authorization과 resource-level permission"
summary: "확인된 principal이 현재 operation과 resource에 대해 권한을 갖는지 서버가 판단해야 하며 role 검사와 ownership 검사가 서로 다른 축임을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: deny-by-default, every request authorization, least privilege 원칙 확인
---
# Authorization과 resource-level permission

로그인 사용자가 `/orders/123`을 호출했다고 해도 서버가 확인해야 할 질문은 하나 더 있습니다. **이 principal이 이 특정 order에 이 operation을 할 수 있는가?** 이것이 authorization입니다.

```text
Authenticated principal: member 42
Requested resource      : order 123 (owner member 77)
Requested action        : cancel

role USER ✓
ownership ✗

→ DENY
```

### role만 확인해서는 부족한 resource가 많다

```java
@GetMapping("/orders/{id}")
public OrderResponse get(@PathVariable long id) {
    return orderService.get(id); // 로그인 여부만 확인된다면 위험
}
```

일반 USER role끼리도 서로의 주문을 보면 안 된다면 service/query에 current member identity를 포함해야 합니다.

```java
orderRepository.findByIdAndMemberId(orderId, currentMemberId)
```

또는 domain/application authorization policy에서 owner를 비교할 수 있습니다. 위치는 architecture에 따라 다르지만 **서버가 resource 관계를 알고 검사**해야 합니다.

### endpoint authorization과 domain authorization을 나눈다

`/admin/**` 전체를 ADMIN만 접근하게 하는 것은 coarse-grained route rule에 적합합니다. 반면 “이 사용자가 이 주문을 취소할 수 있는가?”는 resource state와 ownership을 함께 봐야 하므로 application/domain 경계가 더 자연스러울 수 있습니다.

### default deny가 안전하다

새 endpoint를 만들 때 명시하지 않아도 public이 되는 구조보다 기본적으로 인증/인가가 필요하고 필요한 public route만 열어 주는 방식이 누락 위험을 줄입니다.

### authorization failure와 authentication failure는 다르다

- 인증 정보가 없거나 유효하지 않음 → authentication 필요
- 주체는 확인됐지만 권한 없음 → access denied

HTTP 상태와 security handler도 이 차이를 반영할 수 있습니다.

Authorization은 role 이름을 비교하는 기능 하나가 아니라 **principal × resource × action × current state의 허용 관계**를 서버에서 검증하는 과정입니다.
