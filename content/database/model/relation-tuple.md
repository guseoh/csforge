---
kind: concept
contentKey: database.core.model.relation-tuple
topicContentKey: database.core.model
slug: relation-tuple
title: "Relation과 tuple로 테이블을 바라보기"
summary: "테이블을 단순한 엑셀 표가 아니라 schema가 정의한 속성 위에 tuple 집합이 놓이는 관계형 모델로 이해하고, 행 순서·중복·식별의 의미를 SQL과 연결한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/ddl-basics.html"
    title: "PostgreSQL Documentation: Table Basics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: table, column, row와 schema 정의 확인
---
# Relation과 tuple로 테이블을 바라보기

백엔드에서 데이터베이스를 처음 접하면 테이블을 “행과 열이 있는 표”로 이해해도 CRUD를 시작하는 데는 충분합니다. 하지만 JOIN, key, NULL, constraint, normalization을 이해하려면 한 단계 더 내려가 **어떤 값의 집합을 어떤 schema가 허용하는가**를 봐야 합니다. 관계형 모델에서 relation은 특정 속성 집합 위의 tuple 집합으로 생각할 수 있고, SQL table은 그 모델을 실제 DBMS에서 다루는 표현입니다.

### schema가 먼저 값의 모양을 제한한다

```sql
CREATE TABLE member (
    member_id BIGINT PRIMARY KEY,
    email     VARCHAR(255) NOT NULL,
    nickname  VARCHAR(50)  NOT NULL
);
```

이 정의는 단순히 열 이름을 정하는 것이 아닙니다. `member_id`는 정수 계열이어야 하고, `email`과 `nickname`은 NULL일 수 없다는 **허용 가능한 행의 조건**을 만듭니다. 이후 들어오는 각 row는 이 schema를 만족해야 합니다.

```text
member
┌───────────┬──────────────────────┬──────────┐
│ member_id │ email                │ nickname │
├───────────┼──────────────────────┼──────────┤
│ 1         │ a@example.com        │ alice    │
│ 2         │ b@example.com        │ bob      │
└───────────┴──────────────────────┴──────────┘
```

관계형 모델에서 중요한 것은 “첫 번째 행, 두 번째 행”이라는 물리 순서가 아닙니다. SQL 결과에 `ORDER BY`가 없다면 애플리케이션이 안정적인 출력 순서를 기대해서는 안 됩니다. 페이지네이션에서 stable ordering이 필요한 이유도 여기와 연결됩니다.

### tuple의 식별은 별도의 key 문제다

두 row의 모든 값이 우연히 같을 수도 있고, 어떤 값을 같은 개체로 볼지는 key가 결정합니다. 실무에서는 `PRIMARY KEY`로 한 행을 안정적으로 식별하는 경우가 많습니다.

```text
사람이라는 의미상의 동일성
        │
        ▼
member_id = 17
        │
        ├─ email 변경 가능
        └─ nickname 변경 가능
```

email이 바뀌어도 같은 회원이라면 email은 identity 자체가 아닙니다. 즉 “row의 모든 column 값”과 “이 row가 누구인가”는 다른 문제입니다.

### SQL table과 순수한 relation을 완전히 같은 것으로 보면 안 된다

SQL은 실용적인 DB 언어라 bag semantics, NULL, 물리 저장 구조 등 순수 관계대수와 차이가 있습니다. 예를 들어 `SELECT` 결과에는 중복 row가 나올 수 있고 `DISTINCT`를 명시해야 제거됩니다. 따라서 관계형 모델은 사고의 기반이고, 실제 SQL 동작은 DBMS 계약을 함께 확인해야 합니다.

백엔드에서는 이 구분이 schema 설계로 이어집니다. 어떤 값이 row를 식별하는지, 어떤 중복을 허용하면 안 되는지, 어떤 값이 선택적인지, 결과 순서를 언제 명시해야 하는지를 모델 단계에서 결정할수록 애플리케이션 코드가 데이터 모양을 추측하는 일이 줄어듭니다.
