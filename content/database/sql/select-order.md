---
kind: concept
contentKey: database.core.sql.select-order
topicContentKey: database.core.sql
slug: select-order
title: "SELECT의 논리 처리 순서"
summary: "SQL을 작성 순서대로 실행된다고 생각하지 않고 FROM·WHERE·GROUP BY·HAVING·SELECT·ORDER BY의 논리 단계가 alias와 aggregate 사용 가능 시점을 어떻게 결정하는지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/sql-select.html"
    title: "PostgreSQL Documentation: SELECT"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: SELECT 처리 단계와 clause 의미 확인
---
# SELECT의 논리 처리 순서

SQL은 코드에 적힌 순서를 위에서 아래로 그대로 실행하는 절차형 언어처럼 읽으면 alias나 aggregate 조건에서 혼란이 생깁니다. 실제 optimizer의 물리 실행 계획은 더 자유롭게 바뀔 수 있지만, query 의미를 이해할 때는 **논리 처리 단계**를 잡는 것이 도움이 됩니다.

```sql
SELECT department_id, AVG(salary) AS avg_salary
FROM employee
WHERE active = true
GROUP BY department_id
HAVING AVG(salary) >= 5000
ORDER BY avg_salary DESC;
```

### 먼저 어떤 row 집합을 만들지 결정한다

개념적으로는 다음 순서로 읽을 수 있습니다.

```text
FROM / JOIN
   │  입력 row 집합 구성
   ▼
WHERE
   │  개별 row 필터
   ▼
GROUP BY
   │  그룹 형성
   ▼
HAVING
   │  그룹 필터
   ▼
SELECT
   │  출력 expression 계산
   ▼
ORDER BY
      최종 정렬
```

그래서 aggregate 결과를 `WHERE AVG(salary) > ...`처럼 사용할 수 없습니다. WHERE 단계에서는 아직 그룹 aggregate가 만들어지지 않았기 때문입니다. 그룹 결과를 필터링하려면 HAVING이 필요합니다.

### alias 사용 가능 위치도 이 관점으로 이해한다

`avg_salary` alias는 SELECT output을 만들면서 생깁니다. PostgreSQL에서는 ORDER BY에서 output column name을 사용할 수 있지만 WHERE에서는 그 alias가 아직 존재하지 않습니다.

```sql
-- 가능
ORDER BY avg_salary DESC

-- 같은 의미로 WHERE에서 사용한다고 생각하면 안 됨
WHERE avg_salary > 5000
```

### 논리 순서와 실제 execution plan은 다르다

optimizer가 실제로 모든 row를 물리적으로 FROM → WHERE 순서로 하나씩 처리한다는 뜻은 아닙니다. index scan을 선택하거나 predicate를 아래로 push하는 등 결과 의미를 보존하면서 더 효율적인 계획을 고를 수 있습니다.

```text
논리 처리 순서 = query 의미를 이해하는 모델
실행 계획       = DB가 같은 결과를 만들기 위해 선택한 물리 연산
```

이 둘을 구분하면 “WHERE가 논리적으로 SELECT보다 먼저인데 EXPLAIN에서는 왜 다른 node 모양이지?” 같은 혼란을 피할 수 있습니다.
