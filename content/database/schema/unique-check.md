---
kind: concept
contentKey: database.core.schema.unique-check
topicContentKey: database.core.schema
slug: unique-check
title: "UNIQUE와 CHECK로 불변 조건을 DB에 남기기"
summary: "중복 금지와 행 내부 조건을 애플리케이션의 사전 조회만으로 보호하지 않고 DB 제약 조건으로 원자적으로 보장하며 NULL·동시성·CHECK의 적용 범위를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/ddl-constraints.html"
    title: "PostgreSQL Documentation: Constraints"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: UNIQUE, CHECK, NOT NULL 제약 조건 계약 확인
---
# UNIQUE와 CHECK로 불변 조건을 DB에 남기기

“가입 전에 같은 이메일이 있는지 SELECT하고, 없으면 INSERT”하는 코드만으로 중복 가입을 막을 수 있을까요? 두 요청이 동시에 같은 이메일을 확인하면 둘 다 “없다”를 볼 수 있습니다.

```text
Request A                Request B
   │ SELECT email           │ SELECT email
   │ → 없음                 │ → 없음
   │                        │
   ├─ INSERT                ├─ INSERT
```

DB에 UNIQUE 제약 조건이 없다면 둘 다 성공할 수 있습니다. `UNIQUE(email)`은 중복 검사를 **실제 쓰기와 경쟁하는 최종 DB 경계**에서 처리합니다.

```sql
ALTER TABLE member
ADD CONSTRAINT uq_member_email UNIQUE (email);
```

### 사전 조회는 사용자 경험, UNIQUE는 무결성

애플리케이션 사전 조회가 쓸모없다는 뜻은 아닙니다. 이미 사용 중인 이메일을 빠르게 안내할 수 있습니다. 하지만 경쟁 조건을 완전히 닫는 것은 DB 제약 조건이고, 애플리케이션은 제약 조건 위반도 정상적인 경쟁 결과로 처리할 수 있어야 합니다.

### CHECK는 한 행의 유효 조건을 표현할 수 있다

```sql
CREATE TABLE subscription (
    started_at TIMESTAMPTZ NOT NULL,
    ended_at   TIMESTAMPTZ,
    CONSTRAINT ck_period
        CHECK (ended_at IS NULL OR ended_at >= started_at)
);
```

이 규칙은 종료 시각이 있다면 시작 시각보다 빠를 수 없다는 불변 조건을 DB에 둡니다.

하지만 CHECK를 “다른 행이나 다른 테이블을 조회하는 범용 업무 규칙”으로 사용하면 안 됩니다. PostgreSQL CHECK는 기본적으로 현재 행 값에 대한 조건으로 설계해야 하며, 여러 행 사이의 유일성은 UNIQUE 같은 다른 제약 조건이 맡습니다.

### NULL과 제약 조건의 의미를 따로 확인한다

CHECK 표현식 결과가 TRUE 또는 NULL이면 제약 조건이 만족된 것으로 취급될 수 있으므로 값 자체가 반드시 있어야 한다면 `NOT NULL`을 별도로 둡니다. UNIQUE와 NULL의 의미도 DB 버전·옵션을 확인해야 합니다. PostgreSQL에서는 기본적으로 여러 NULL이 UNIQUE 제약 조건과 공존할 수 있고 `NULLS NOT DISTINCT` 같은 선택도 있습니다.

### DB에 모든 업무 규칙을 넣는 것도 답은 아니다

“주문은 결제 완료 후에만 배송할 수 있다”처럼 여러 엔티티 상태와 흐름을 포함하는 규칙은 도메인·애플리케이션 계층이 더 자연스럽게 소유할 수 있습니다. DB 제약 조건은 그중 **데이터 자체가 절대 깨지면 안 되는 하한선**을 보호합니다.

좋은 스키마는 검증을 중복 구현하는 것이 아니라 각 계층의 역할을 나눕니다. API는 입력 오류를 설명하고, 도메인은 생명주기를 보호하고, DB는 동시 쓰기 경로에서도 깨지면 안 되는 불변 조건을 마지막으로 막습니다.
