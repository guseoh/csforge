---
kind: concept
contentKey: database.core.schema.unique-check
topicContentKey: database.core.schema
slug: unique-check
title: "UNIQUE와 CHECK로 invariant를 DB에 남기기"
summary: "중복 금지와 row 내부 조건을 애플리케이션의 사전 조회만으로 보호하지 않고 DB constraint로 원자적으로 보장하며 NULL·동시성·CHECK 범위를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/ddl-constraints.html"
    title: "PostgreSQL Documentation: Constraints"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: UNIQUE, CHECK, NOT NULL constraint 계약 확인
---
# UNIQUE와 CHECK로 invariant를 DB에 남기기

“가입 전에 같은 이메일이 있는지 SELECT하고, 없으면 INSERT”하는 코드만으로 중복 가입을 막을 수 있을까요? 두 요청이 동시에 같은 이메일을 확인하면 둘 다 “없다”를 볼 수 있습니다.

```text
Request A                Request B
   │ SELECT email           │ SELECT email
   │ → 없음                 │ → 없음
   │                        │
   ├─ INSERT                ├─ INSERT
```

DB에 UNIQUE constraint가 없다면 둘 다 성공할 수 있습니다. `UNIQUE(email)`은 중복 검사를 **실제 write와 경쟁하는 최종 DB 경계**에서 처리합니다.

```sql
ALTER TABLE member
ADD CONSTRAINT uq_member_email UNIQUE (email);
```

### 사전 조회는 UX, UNIQUE는 무결성

애플리케이션 사전 조회가 쓸모없다는 뜻은 아닙니다. 이미 사용 중인 이메일을 빠르게 안내할 수 있습니다. 하지만 race를 완전히 닫는 것은 DB constraint이고, 애플리케이션은 constraint violation도 정상적인 경쟁 결과로 처리할 수 있어야 합니다.

### CHECK는 한 row의 유효 조건을 표현할 수 있다

```sql
CREATE TABLE subscription (
    started_at TIMESTAMPTZ NOT NULL,
    ended_at   TIMESTAMPTZ,
    CONSTRAINT ck_period
        CHECK (ended_at IS NULL OR ended_at >= started_at)
);
```

이 규칙은 종료 시각이 있다면 시작 시각보다 빠를 수 없다는 invariant를 DB에 둡니다.

하지만 CHECK를 “다른 row나 다른 table을 조회하는 범용 business rule”로 사용하면 안 됩니다. PostgreSQL CHECK는 기본적으로 현재 row 값에 대한 조건으로 설계해야 하며, cross-row uniqueness는 UNIQUE 같은 다른 constraint가 맡습니다.

### NULL과 constraint 의미를 따로 확인한다

CHECK expression 결과가 TRUE 또는 NULL이면 constraint가 만족된 것으로 취급될 수 있으므로 값 자체가 반드시 있어야 한다면 `NOT NULL`을 별도로 둡니다. UNIQUE와 NULL의 의미도 DB 버전·옵션을 확인해야 합니다. PostgreSQL에서는 기본적으로 여러 NULL이 unique constraint와 공존할 수 있고 `NULLS NOT DISTINCT` 같은 선택도 있습니다.

### DB에 모든 business rule을 넣는 것도 답은 아니다

“주문은 결제 완료 후에만 배송할 수 있다”처럼 여러 entity 상태와 workflow를 포함하는 규칙은 domain/application이 더 자연스럽게 소유할 수 있습니다. DB constraint는 그중 **데이터 자체가 절대 깨지면 안 되는 하한선**을 보호합니다.

좋은 schema는 validation을 중복 구현하는 것이 아니라 각 계층의 역할을 나눕니다. API는 입력 오류를 설명하고, domain은 lifecycle을 보호하고, DB는 concurrent/write 경로에서도 깨지면 안 되는 invariant를 마지막으로 막습니다.
