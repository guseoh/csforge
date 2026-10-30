---
kind: concept
contentKey: database.core.sql.window-function
topicContentKey: database.core.sql
slug: window-function
title: "윈도 함수(Window function)로 행을 유지한 채 계산하기"
summary: "GROUP BY처럼 행을 줄이지 않고 각 행에 PARTITION BY·ORDER BY 기준의 계산 결과를 붙이는 윈도 함수의 실행 모델과 순위·누적 합계 사용법을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.postgresql.org/docs/current/tutorial-window.html"
    title: "PostgreSQL Documentation: Window Functions Tutorial"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: OVER, PARTITION BY, ORDER BY와 행 보존 동작 확인
---
# 윈도 함수(Window function)로 행을 유지한 채 계산하기

회원별 주문 총액을 구하면서 각 주문도 그대로 보여 줘야 한다고 해 봅시다. `GROUP BY member_id`를 사용하면 주문 행이 회원별 한 행으로 줄어들기 때문에 요구와 맞지 않습니다. 윈도 함수는 **원래 행을 유지한 채 관련 행 집합을 계산 범위(window)로 보고 결과를 붙입니다.**

```sql
SELECT
    id,
    member_id,
    amount,
    SUM(amount) OVER (PARTITION BY member_id) AS member_total
FROM orders;
```

결과는 다음처럼 행 수가 유지됩니다.

```text
id  │ member │ amount │ member_total
────┼────────┼────────┼─────────────
101 │ 7      │ 1000   │ 3000
102 │ 7      │ 2000   │ 3000
103 │ 8      │ 5000   │ 5000
```

### PARTITION BY는 그룹처럼 묶지만 행을 없애지 않는다

`PARTITION BY member_id`는 계산 범위를 회원별로 나눕니다. 그러나 GROUP BY와 달리 각 주문 행 자체는 남습니다.

```text
partition member=7
  ├─ order 101
  └─ order 102
       │ SUM window
       └─ 각 row에 3000 부착
```

### ORDER BY를 넣으면 순서 의존 계산이 가능하다

```sql
SELECT
    id,
    member_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY member_id
        ORDER BY created_at, id
    ) AS running_total
FROM orders;
```

이제 같은 회원 안에서 주문 순서대로 누적값을 계산할 수 있습니다. 정렬 값이 같은 행이 있을 수 있다면 `id` 같은 동률 해소 기준(tie-breaker)을 포함해 결정적인 순서를 만드는 것이 좋습니다.

### ORDER BY와 frame은 서로 다른 범위를 정한다

`PARTITION BY`는 **어느 회원의 행인가**를, 윈도 `ORDER BY`는 **그 안에서 어떤 순서인가**를 결정합니다. 누적합처럼 frame을 사용하는 함수는 그중 **현재 행의 계산에 포함할 행 범위**까지 따로 정합니다.

PostgreSQL에서 `ORDER BY created_at`만 지정한 누적합은 기본적으로 `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`에 해당합니다. 여기서 `CURRENT ROW`는 같은 정렬 값을 갖는 동료 행(peer)의 마지막까지 포함하기 때문에, 같은 시각 두 주문은 누적합이 함께 뛰어오를 수 있습니다.

```text
member_id=7   id    created_at   amount   기본 RANGE 누적합
               101   10:00        1,000      3,000
               102   10:00        2,000      3,000
               103   10:01          500      3,500
```

반면 한 행씩 증가하는 누적합을 원한다면 **고유한 동률 해소 정렬 기준과 명시적 ROWS frame**을 함께 쓰는 것이 명확합니다.

```sql
SELECT id, member_id, amount,
       SUM(amount) OVER (
           PARTITION BY member_id
           ORDER BY created_at, id
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_total
FROM orders;
-- 회원 7: id 101 → 1,000 / 102 → 3,000 / 103 → 3,500
```

`ROWS`만 지정하고 동률을 구분하지 않으면 같은 `created_at`을 가진 행 사이의 물리적 처리 순서가 보장되지 않아 어느 행이 1,000을 먼저 받는지 달라질 수 있습니다. 반대로 `ORDER BY created_at, id`로 고유하게 정렬하면 기본 `RANGE`에서도 동료 행이 갈라져 위의 누적합처럼 계산됩니다. **frame 종류와 정렬의 유일성**을 함께 판단해야 합니다.

`ROW_NUMBER`, `RANK`, `LAG`, `LEAD`도 같은 윈도 모델 위에서 동작합니다. 예를 들어 회원별 최신 주문 하나를 고를 때 `ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY created_at DESC, id DESC)`를 사용한 뒤 1번 행만 선택할 수 있습니다.

윈도 함수는 “집계의 고급 버전”이 아니라 **행 수를 유지해야 할 때 사용하는 다른 계산 모델**입니다.
