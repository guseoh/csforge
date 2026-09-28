---
kind: concept
contentKey: database.core.index.btree
topicContentKey: database.core.index
slug: btree
title: "B-tree 인덱스가 탐색 범위를 줄이는 원리"
summary: "정렬된 B-tree 구조가 동등 비교·범위·정렬 쿼리에서 전체 테이블 대신 필요한 키 범위를 탐색하게 하는 이유와 쓰기·저장 비용을 함께 이해한다."
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
# B-tree 인덱스가 탐색 범위를 줄이는 원리

인덱스를 “검색을 빠르게 하는 옵션”으로만 보면 어떤 쿼리에 효과가 있고 왜 쓰기가 느려지는지 설명하기 어렵습니다. B-tree 인덱스는 키를 정렬된 탐색 구조에 유지해 **필요한 키 위치 또는 범위를 빠르게 좁히는 별도 자료구조**입니다.

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at);
```

다음 쿼리는 전체 행을 처음부터 모두 확인하는 대신 특정 시각 이후의 인덱스 범위를 찾는 계획을 선택할 수 있습니다.

```sql
SELECT id, member_id, total
FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-08-01'
ORDER BY created_at;
```

### 인덱스는 테이블의 복사본이 아니다

단순화하면 다음처럼 볼 수 있습니다.

```text
B-tree index
        [2026-08-15]
        /          \
   earlier        later
      │              │
      └── key + row 위치 정보 ──► table page
```

실제 PostgreSQL B-tree는 페이지 단위의 균형 트리 구조이며 동등 비교와 범위 비교, 정렬에 활용될 수 있습니다. 하지만 쿼리가 반환하는 컬럼이 테이블에만 있다면 인덱스로 후보를 찾은 뒤 힙(heap) 페이지를 방문해야 할 수 있습니다.

### 선택도가 낮으면 인덱스가 오히려 불리할 수 있다

`active = true`가 전체 행의 99%라면 인덱스를 따라 수많은 행을 방문하는 것보다 Sequential Scan이 싸다고 옵티마이저가 판단할 수 있습니다. “WHERE가 있는데 인덱스를 안 쓴다”가 곧 DB 오류는 아닙니다.

```text
index scan 비용
= index 탐색
+ 많은 heap page 접근

seq scan 비용
= table page를 순차적으로 읽기
```

데이터 분포와 반환 행 비율이 선택에 영향을 줍니다.

### 인덱스는 쓰기 때 유지 비용을 낸다

INSERT/UPDATE/DELETE는 관련 인덱스의 유지 비용을 만들 수 있지만, 실제 갱신 시점과 새 인덱스 엔트리 생성 여부는 연산과 HOT 가능 여부에 따라 달라집니다. 인덱스가 많을수록 저장 공간, 캐시 사용, 쓰기 I/O, VACUUM·유지보수 부담이 늘 수 있습니다. 그래서 “나중에 쓸지도 모르니 모든 컬럼에 인덱스”는 좋은 기본값이 아닙니다.

인덱스 설계는 쿼리 형태와 실제 실행 계획을 기반으로 해야 합니다. **어떤 조건과 정렬이 반복되고, 얼마나 많은 행을 줄이며, 그 이득이 쓰기 비용보다 큰지**를 보는 것이 핵심입니다.
