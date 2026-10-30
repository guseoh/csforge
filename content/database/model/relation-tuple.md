---
kind: concept
contentKey: database.core.model.relation-tuple
topicContentKey: database.core.model
slug: relation-tuple
title: "관계(relation)와 튜플(tuple)로 테이블을 바라보기"
summary: "테이블을 단순한 표가 아니라 스키마가 정의한 속성 위에 튜플 집합이 놓이는 관계형 모델로 이해하고, 순수 관계 모델의 집합 의미와 SQL의 중복 허용 특성, 행 순서·식별의 차이를 연결한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/ddl-basics.html"
    title: "PostgreSQL Documentation: Table Basics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 테이블, 컬럼, 행과 스키마 정의 확인
---
# 관계(relation)와 튜플(tuple)로 테이블을 바라보기

백엔드에서 데이터베이스를 처음 접하면 테이블을 “행과 열이 있는 표”로 이해해도 CRUD를 시작하는 데는 충분합니다. 하지만 JOIN, 키, NULL, 제약 조건, 정규화를 이해하려면 한 단계 더 내려가 **어떤 값의 집합을 어떤 스키마가 허용하는가**를 봐야 합니다. 관계형 모델에서 관계(relation)는 특정 속성 집합 위의 튜플(tuple) 집합으로 생각할 수 있고, SQL 테이블은 그 모델을 실제 DBMS에서 다루기 위한 표현입니다.

### 스키마가 먼저 값의 모양을 제한한다

```sql
CREATE TABLE member (
    member_id BIGINT PRIMARY KEY,
    email     VARCHAR(255) NOT NULL,
    nickname  VARCHAR(50)  NOT NULL
);
```

이 정의는 단순히 열 이름을 정하는 것이 아닙니다. `member_id`는 정수 계열이어야 하고, `email`과 `nickname`은 NULL일 수 없다는 **허용 가능한 행의 조건**을 만듭니다. 이후 들어오는 각 행은 이 스키마를 만족해야 합니다.

```text
member
┌───────────┬──────────────────────┬──────────┐
│ member_id │ email                │ nickname │
├───────────┼──────────────────────┼──────────┤
│ 1         │ a@example.com        │ alice    │
│ 2         │ b@example.com        │ bob      │
└───────────┴──────────────────────┴──────────┘
```

관계형 모델에서 중요한 것은 “첫 번째 행, 두 번째 행”이라는 물리 순서가 아닙니다. SQL 결과에 `ORDER BY`가 없다면 애플리케이션이 안정적인 출력 순서를 기대해서는 안 됩니다. 페이지네이션에서 안정적인 정렬 기준이 필요한 이유도 여기와 연결됩니다.

### 순수한 관계의 집합 의미와 SQL의 중복 허용을 구분한다

순수 관계형 모델에서 관계는 **튜플의 집합(set)** 이므로 완전히 같은 튜플이 집합 안에 두 번 존재한다고 표현하지 않습니다. 반면 SQL 테이블과 질의 결과는 실용적인 이유로 중복을 허용하는 방식(bag semantics)을 사용합니다. 따라서 PRIMARY KEY나 UNIQUE 같은 제약 조건이 없다면 SQL 테이블에는 모든 컬럼 값이 같은 행이 여러 개 존재할 수 있고, `SELECT` 결과에도 같은 값의 행이 반복될 수 있습니다.

이 차이를 구분해야 “관계는 집합인데 왜 SQL에서 중복 행이 나오지?”라는 혼동을 피할 수 있습니다. `DISTINCT`는 조회 결과의 중복을 제거하고, PRIMARY KEY·UNIQUE는 저장되는 데이터의 유일성 규칙을 표현합니다. 관계형 모델의 집합 의미와 SQL 구현의 중복 허용 특성, 스키마의 키 제약은 같은 층의 개념이 아닙니다.

### 행의 식별은 별도의 키 문제다

SQL 테이블에서 어떤 값을 같은 개체의 식별자로 볼지는 키가 결정합니다. 실무에서는 `PRIMARY KEY`로 한 행을 안정적으로 식별하는 경우가 많습니다.

```text
사람이라는 의미상의 동일성
        │
        ▼
member_id = 17
        │
        ├─ email 변경 가능
        └─ nickname 변경 가능
```

이메일이 바뀌어도 같은 회원이라면 이메일은 식별자 자체가 아닙니다. 즉 “행의 모든 컬럼 값”과 “이 행이 누구인가”는 다른 문제입니다.

### SQL 테이블과 순수한 관계를 완전히 같은 것으로 보면 안 된다

SQL은 중복 허용, NULL, 물리 저장 구조 등 순수 관계대수와 다른 실용적인 특성을 가집니다. 따라서 관계형 모델은 사고의 기반으로 사용하되 실제 SQL 동작과 보장은 DBMS 계약을 함께 확인해야 합니다.

백엔드에서는 이 구분이 스키마 설계로 이어집니다. 어떤 값이 행을 식별하는지, 어떤 중복을 허용하면 안 되는지, 어떤 값이 선택적인지, 결과 순서를 언제 명시해야 하는지를 모델 단계에서 결정할수록 애플리케이션 코드가 데이터 모양을 추측하는 일이 줄어듭니다.
