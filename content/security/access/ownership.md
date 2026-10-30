---
kind: concept
contentKey: security.core.access.ownership
topicContentKey: security.core.access
slug: ownership
title: "리소스 소유권 기반 인가"
summary: "로그인 여부와 역할만으로는 막을 수 없는 수평 권한 상승을 살펴보고, 현재 인증 주체와 리소스의 소유권을 비교하는 서버 인가를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "객체별 인가와 요청마다 권한을 확인하는 원칙 확인"
---
# 리소스 소유권 기반 인가

`ROLE_USER`인 사용자끼리 서로의 주문을 보면 안 되는 서비스에서 역할 검사만 통과시키면 인가가 부족합니다. 같은 역할 안에서도 **이 리소스가 누구 소유인지**를 확인해야 합니다.

```text
principal.memberId = 42
order.id = 900
order.memberId = 77

ROLE_USER ✓
소유권  ✗
→ 거부
```

### ID를 숨기는 것은 소유권 검사가 아니다

주문 ID를 UUID나 긴 무작위 값으로 바꿔도 공격자가 링크·로그·Referer 등 다른 경로로 ID를 얻을 수 있습니다. ID를 추측하기 어렵게 만드는 것은 보조 효과일 뿐 서버의 권한 검사를 대체하지 않습니다.

### 쿼리 단계에서 소유자를 조건에 넣을 수 있다

```java
Optional<Order> findByIdAndMemberId(long orderId, long memberId);
```

```sql
SELECT *
FROM orders
WHERE id = :orderId
  AND member_id = :currentMemberId;
```

이 방식은 존재 여부와 권한을 한 조회 결과로 묶고, 권한 없는 리소스의 존재 자체를 외부에 덜 노출하는 데도 도움이 됩니다. 복잡한 정책이라면 서비스나 도메인의 인가 구성 요소에서 명시적으로 검사하는 편이 읽기 좋을 수 있습니다.

### 소유자와 actor가 다른 작업도 있다

고객 지원 담당자가 사용자 주문을 조회할 수 있다면 소유자 일치 여부만으로는 부족합니다.

```text
허용 조건
  요청자 == 리소스.소유자
  또는 요청자에게 SUPPORT_ORDER_READ 권한이 있음
```

이때 일반 사용자와 관리자 권한을 한 분기에서 대충 처리하기보다 정책을 명시적으로 표현합니다.

### nested 리소스에서도 상위 소유권을 따라간다

`/orders/{orderId}/items/{itemId}`에서는 상품 항목이 해당 주문에 속하는지, 그 주문이 현재 사용자의 것인지 모두 확인해야 합니다. 두 경로 매개변수의 존재 여부만 각각 확인하면 다른 주문의 항목을 조합하는 공격이 가능할 수 있습니다.

소유권 인가는 단순히 “내 것인지 확인”하는 절차가 아닙니다. **현재 인증 주체, 대상 리소스, 상위 리소스와의 관계, 수행할 작업**을 함께 판단해야 합니다.
