---
kind: concept
contentKey: security.core.access.ownership
topicContentKey: security.core.access
slug: ownership
title: "Resource ownership authorization"
summary: "로그인 여부나 role만으로 충분하지 않은 사용자별 resource에서 current principal과 owner identity를 비교해 수평 권한 상승을 막는 서버측 authorization을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: object-level authorization과 every-request permission check 원칙 확인
---
# Resource ownership authorization

`ROLE_USER`인 사용자끼리 서로의 주문을 보면 안 되는 서비스에서 role 검사만 통과시키면 authorization이 부족합니다. 같은 role 안에서도 **이 resource가 누구 소유인지**를 확인해야 합니다.

```text
principal.memberId = 42
order.id = 900
order.memberId = 77

ROLE_USER ✓
ownership  ✗
→ deny
```

### ID를 숨기는 것은 ownership 검사가 아니다

Order ID를 UUID로 바꾸거나 매우 큰 random 값으로 만들어도 공격자가 링크·로그·referer 등 다른 경로로 ID를 얻을 수 있습니다. ID 추측 난이도를 높이는 것은 보조 효과일 뿐 서버 permission check를 대체하지 않습니다.

### query 단계에서 owner를 조건에 넣을 수 있다

```java
Optional<Order> findByIdAndMemberId(long orderId, long memberId);
```

```sql
SELECT *
FROM orders
WHERE id = :orderId
  AND member_id = :currentMemberId;
```

이 방식은 존재 여부와 권한을 한 조회 결과로 묶을 수 있고 unauthorized resource의 존재 자체를 외부에 덜 노출하는 응답 설계에도 도움이 될 수 있습니다. 반대로 복잡한 policy는 service/domain authorization component에서 명시적으로 검사하는 편이 읽기 좋을 수 있습니다.

### owner와 actor가 다른 operation도 있다

관리자가 support 목적으로 사용자 주문을 조회할 수 있다면 단순 owner equality만으로는 부족합니다.

```text
allow if
  actor == resource.owner
  OR actor has SUPPORT_ORDER_READ
```

이때 일반 USER와 ADMIN을 같은 코드 branch에서 대충 처리하기보다 policy를 의도 있게 표현합니다.

### nested resource에서도 상위 ownership을 따라간다

`/orders/{orderId}/items/{itemId}`에서 item ID가 order에 실제로 속하는지, 그 order가 current user의 것인지 모두 확인해야 합니다. path parameter 두 개를 각각 존재 여부만 확인하면 다른 order의 item을 조합하는 공격이 가능할 수 있습니다.

Ownership authorization은 “내 것인지 확인” 한 문장이 아니라 **현재 principal, target resource, parent relation, action을 하나의 permission 판단으로 묶는 것**입니다.
