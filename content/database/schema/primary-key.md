---
kind: concept
contentKey: database.core.schema.primary-key
topicContentKey: database.core.schema
slug: primary-key
title: "Primary key와 row identity"
summary: "Primary key를 단순 자동 증가 번호가 아니라 한 row를 안정적으로 식별하는 DB 계약으로 이해하고 natural·surrogate key 선택과 변경 가능성을 판단한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS"
    title: "PostgreSQL Documentation: Primary Keys"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: PRIMARY KEY의 unique/not-null 의미와 자동 index 생성 확인
---
# Primary key와 row identity

애플리케이션에서 어떤 row를 수정하거나 삭제하려면 “이 row가 바로 그 row다”라고 안정적으로 가리킬 수 있어야 합니다. Primary key는 이 식별 계약을 DB schema에 둡니다. PostgreSQL의 primary key는 값이 unique해야 하고 NULL일 수 없으며, 해당 key를 지원하는 unique B-tree index가 자동으로 만들어집니다.

```sql
CREATE TABLE member (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email    VARCHAR(255) NOT NULL,
    nickname VARCHAR(50)  NOT NULL
);
```

### 식별자와 업무 속성을 같은 것으로 볼 필요는 없다

email이 현재 unique하다고 해서 반드시 primary key여야 하는 것은 아닙니다. 이메일은 변경될 수 있고 대소문자·정규화 정책이 달라질 수 있습니다. 반면 `member.id`는 회원의 다른 속성이 바뀌어도 같은 회원을 가리키는 내부 identity로 유지할 수 있습니다.

```text
member id = 42
   │
   ├─ email: old@example.com → new@example.com
   ├─ nickname 변경
   └─ profile 변경

identity는 유지
```

이런 별도 식별자를 surrogate key라고 부릅니다. 반대로 국가 코드처럼 domain에서 이미 안정적이고 의미 있는 key가 있다면 natural key를 사용할 수도 있습니다. 중요한 것은 “항상 숫자 ID가 정답”이 아니라 **그 값이 lifecycle 동안 identity로 안정적인가**입니다.

### sequence 값이 건너뛴다고 identity가 깨진 것은 아니다

자동 생성 ID는 transaction rollback 등으로 번호가 비는 경우가 있습니다. `1, 2, 4, 7`처럼 gap이 있다고 데이터 손상으로 보면 안 됩니다. 식별자의 목적은 연속 번호표가 아니라 uniqueness와 identity입니다. 화면에 연속 순번이 필요하다면 별도 표현 문제로 다루는 편이 안전합니다.

### primary key를 API 계약과 그대로 동일시하지 않는다

DB 내부 ID를 URL에 쓰는 것은 흔하지만, 외부 노출 ID가 반드시 DB primary key와 같아야 하는 것은 아닙니다. 보안상 추측 가능성, 데이터 이관, 여러 시스템 간 식별 요구가 있다면 UUID나 별도의 public identifier를 둘 수 있습니다. 그래도 DB 내부에서는 row를 안정적으로 찾는 primary key 계약이 필요합니다.

Primary key를 설계할 때는 “어떤 타입이 빠른가?”보다 먼저 **이 row의 identity가 무엇이고 어떤 변경에도 유지되어야 하는가**를 묻는 것이 출발점입니다.
