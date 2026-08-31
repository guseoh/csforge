---
kind: concept
contentKey: database.core.index.btree
topicContentKey: database.core.index
slug: btree
title: "B-tree index가 탐색 범위를 줄이는 원리"
summary: "정렬된 B-tree 구조가 equality·range·ordering query에서 전체 table 대신 필요한 key 범위를 탐색하게 하는 이유와 write·storage 비용을 함께 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/indexes-types.html#INDEXES-TYPES-BTREE"
    title: "PostgreSQL Documentation: B-Tree Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: B-tree가 지원하는 비교와 정렬 연산 확인
---
# B-tree index가 탐색 범위를 줄이는 원리

인덱스를 “검색을 빠르게 하는 옵션”으로만 보면 어떤 query에 효과가 있고 왜 write가 느려지는지 설명하기 어렵습니다. B-tree index는 key를 정렬된 탐색 구조에 유지해 **필요한 key 위치 또는 범위를 빠르게 좁히는 별도 자료구조**입니다.

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at);
```

다음 query는 전체 row를 처음부터 모두 확인하는 대신 특정 시각 이후의 index 범위를 찾는 계획을 선택할 수 있습니다.

```sql
SELECT id, member_id, total
FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-08-01'
ORDER BY created_at;
```

### index는 table의 복사본이 아니다

단순화하면 다음처럼 볼 수 있습니다.

```text
B-tree index
        [2026-08-15]
        /          \
   earlier        later
      │              │
      └── key + row 위치 정보 ──► table page
```

실제 PostgreSQL B-tree는 page 단위의 균형 트리 구조이며 equality와 range 비교, 정렬에 활용될 수 있습니다. 하지만 query가 반환하는 column이 table에만 있다면 index로 후보를 찾은 뒤 heap/table page를 방문해야 할 수 있습니다.

### 선택도가 낮으면 index가 오히려 불리할 수 있다

`active = true`가 전체 row의 99%라면 index를 따라 수많은 row를 방문하는 것보다 sequential scan이 싸다고 optimizer가 판단할 수 있습니다. “WHERE가 있는데 index를 안 쓴다”가 곧 DB 오류는 아닙니다.

```text
index scan 비용
= index 탐색
+ 많은 heap page 접근

seq scan 비용
= table page를 순차적으로 읽기
```

데이터 분포와 반환 row 비율이 선택에 영향을 줍니다.

### index는 write 때 유지 비용을 낸다

INSERT/UPDATE/DELETE가 발생하면 table뿐 아니라 관련 index도 갱신해야 합니다. index가 많을수록 저장 공간, cache 사용, write I/O, vacuum/maintenance 부담이 늘 수 있습니다. 그래서 “나중에 쓸지도 모르니 모든 column에 index”는 좋은 기본값이 아닙니다.

Index 설계는 query 형태와 실제 실행 계획을 기반으로 해야 합니다. **어떤 predicate와 ordering이 반복되고, 얼마나 많은 row를 줄이며, 그 이득이 write 비용보다 큰지**를 보는 것이 핵심입니다.
