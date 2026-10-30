---
kind: concept
contentKey: security.core.access.bola-idor
topicContentKey: security.core.access
slug: bola-idor
title: "객체 수준 인가 실패(BOLA/IDOR)와 수평 권한 상승"
summary: "요청자가 객체 ID를 바꿔 다른 사용자의 리소스에 접근하는 BOLA/IDOR의 원인과 객체별 인가 검사를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"
    title: "OWASP API Security: Broken Object Level Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "API1:2023 BOLA 공격과 객체별 인가 요구 확인"
---
# 객체 수준 인가 실패(BOLA/IDOR)와 수평 권한 상승

API가 다음처럼 동작한다고 해 봅시다.

```http
GET /api/orders/1001
Authorization: session of member 42
```

사용자가 URL의 `1001`을 `1002`로 바꿨더니 다른 회원 주문이 보인다면 전형적인 객체별 인가 실패입니다.

```text
공격자(회원 42)
   │ GET /orders/1002
   ▼
서버
   │ findById(1002)
   ▼
주문(소유자=77)
   │
   └─ 소유권 검사 없음 → 다른 회원의 주문 노출
```

IDOR(Insecure Direct Object Reference)라는 표현은 객체 식별자를 직접 참조하는 취약점을 강조하고, OWASP API Security에서는 BOLA(Broken Object Level Authorization)라는 더 넓은 이름으로 다룹니다.

### 인증이 정상이어도 공격은 성공한다

공격자는 **정상 로그인 사용자**일 수 있습니다. 그래서 “모든 API에 인증 적용”만으로는 막히지 않습니다.

### sequential ID가 원인은 아니다

`1001, 1002, 1003`처럼 순차 ID면 공격 발견은 쉬워질 수 있지만 UUID로 바꾸는 것만으로 인가 실패가 사라지지 않습니다. 권한 있는 리소스인지 매 요청 검사해야 합니다.

### list API도 object-level 범위를 제한해야 한다

```sql
SELECT * FROM orders ORDER BY created_at DESC;
```

일반 사용자 엔드포인트에서 전체 주문을 조회한 뒤 Java에서 걸러내기보다 처음부터:

```sql
WHERE member_id = :currentMemberId
```

처럼 범위를 제한하는 편이 데이터 노출 위험과 불필요한 fetch를 함께 줄일 수 있습니다.

### 존재 여부 노출도 정책이다

권한이 없는 사용자에게 `403`을 줄지 `404`로 리소스 존재를 숨길지는 API 계약과 위협 모델에 따라 결정할 수 있습니다. 중요한 것은 상태 코드보다 실제 데이터가 반환되지 않도록 하는 것입니다.

BOLA는 “URL ID를 조작하는 공격”이 아니라 **리소스 식별자를 신뢰하고 현재 인증 주체와 객체 권한을 연결하지 않은 설계 실패**입니다.
