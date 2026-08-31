---
kind: concept
contentKey: security.core.access.bola-idor
topicContentKey: security.core.access
slug: bola-idor
title: "BOLA/IDOR와 수평 권한 상승"
summary: "클라이언트가 object ID를 바꿨을 때 서버가 object-level authorization을 하지 않아 다른 사용자의 resource에 접근하는 BOLA/IDOR 공격 흐름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"
    title: "OWASP API Security: Broken Object Level Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: API1:2023 BOLA attack와 authorization 요구 확인
---
# BOLA/IDOR와 수평 권한 상승

API가 다음처럼 동작한다고 해 봅시다.

```http
GET /api/orders/1001
Authorization: session of member 42
```

사용자가 URL의 `1001`을 `1002`로 바꿨더니 다른 회원 주문이 보인다면 전형적인 object-level authorization 실패입니다.

```text
Attacker(member 42)
   │ GET /orders/1002
   ▼
Server
   │ findById(1002)
   ▼
Order(owner=77)
   │
   └─ ownership check 없음 → leak
```

IDOR(Insecure Direct Object Reference)라는 표현은 object identifier를 직접 참조하는 취약점을 강조하고, OWASP API Security에서는 BOLA(Broken Object Level Authorization)라는 더 넓은 이름으로 다룹니다.

### authentication이 정상이어도 공격은 성공한다

이 공격자는 익명 사용자가 아니라 **정상 로그인 사용자**일 수 있습니다. 그래서 “모든 API에 인증 적용”만으로는 막히지 않습니다.

### sequential ID가 원인은 아니다

`1001, 1002, 1003`처럼 순차 ID면 공격 발견은 쉬워질 수 있지만 UUID로 바꾸는 것만으로 authorization failure가 사라지지 않습니다. 권한 있는 resource인지 매 요청 검사해야 합니다.

### list API도 object-level scope를 제한해야 한다

```sql
SELECT * FROM orders ORDER BY created_at DESC;
```

일반 사용자 endpoint에서 이렇게 전체 주문을 조회한 뒤 Java에서 filtering하는 것보다 처음부터:

```sql
WHERE member_id = :currentMemberId
```

처럼 scope를 제한하는 편이 데이터 노출 위험과 불필요한 fetch를 함께 줄일 수 있습니다.

### 존재 여부 노출도 정책이다

Unauthorized user에게 `403`을 줄지 `404`처럼 resource 존재를 숨길지는 API 계약과 threat model에 따라 결정할 수 있습니다. 중요한 것은 status code 선택보다 실제 data가 반환되지 않는 것입니다.

BOLA는 “URL ID를 조작하는 공격”이 아니라 **resource identifier를 신뢰하고 current principal과 object permission을 연결하지 않은 설계 실패**입니다.
