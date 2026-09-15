---
kind: concept
contentKey: backend.core.bulk-batch.bulk-processing
topicContentKey: backend.core.bulk-batch
slug: bulk-processing
title: "대량 처리의 Read·Write·Transaction 단위"
summary: "대량 처리에서 읽기 단위, DB batch write 단위, transaction commit 단위를 분리해 메모리·DB 왕복·lock·실패 재처리 범위를 함께 조절한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-batch/reference/"
    title: "Spring Batch Reference Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "chunk 지향 처리와 재시작 가능한 batch 설계를 참고한다."
---
# 대량 처리의 Read·Write·Transaction 단위

10건을 처리하던 코드를 그대로 100만 건에 적용하면 메모리, SQL 횟수, transaction 시간의 성격이 달라집니다. 모든 row를 한 번에 읽으면 heap 사용량이 커지고, row마다 INSERT를 보내면 network round trip이 많아지며, 전체를 한 transaction으로 묶으면 lock과 rollback 범위가 커집니다.

대량 처리에서는 "몇 개씩 처리한다"는 말을 하나의 숫자로 보지 않고 **읽기 단위, DB write 단위, commit 단위**를 분리해서 봅니다.

```text
Input 1,000,000 rows
        │
        ├─ read chunk       : memory에 한 번에 들고 있을 양
        ├─ DB batch size    : 한 번에 전송할 write 수
        └─ transaction size : 한 commit이 책임질 작업 범위
```

세 값은 같을 필요가 없습니다. 예를 들어 1,000개를 읽고, 100개씩 JDBC batch를 전송하면서, 1,000개 단위로 commit할 수 있습니다.

### 큰 transaction은 all-or-nothing 대신 긴 자원 점유를 지불한다

100만 건 전체를 하나의 transaction으로 묶으면 마지막 한 건 실패 시 전체 rollback이라는 명확한 semantics를 얻습니다. 대신 transaction이 오래 살아 있는 동안 connection, lock, MVCC version, WAL, rollback 작업량이 커질 수 있습니다.

반대로 chunk별 commit은 한 번의 실패가 되돌리는 범위를 줄이지만 중간까지 성공한 상태가 실제 제품에서 허용되는지 정의해야 합니다.

| commit 단위 | 장점 | 비용 |
| --- | --- | --- |
| 전체 작업 | 원자성 설명이 단순 | 긴 transaction, 큰 rollback 범위 |
| chunk | 재처리 범위 제한 | 부분 성공·재시작 정책 필요 |
| row | 실패 격리 쉬움 | DB 왕복과 commit 비용 증가 가능 |

### JPA에서는 DB row뿐 아니라 managed entity 수를 본다

JPA로 대량 entity를 저장하면 persistence context가 managed entity를 계속 추적할 수 있습니다. 반복이 길어질수록 1차 캐시와 dirty checking 대상도 커질 수 있습니다.

```java
for (int i = 0; i < rows.size(); i++) {
    entityManager.persist(toEntity(rows.get(i)));

    if ((i + 1) % 500 == 0) {
        entityManager.flush();
        entityManager.clear();
    }
}
```

`flush/clear`는 흔한 선택지지만 숫자 500이 정답인 것은 아닙니다. ID 생성 전략, JDBC batching 설정, cascade, entity 크기와 실제 SQL을 측정해야 합니다.

### 처리량 최적화보다 먼저 실패 모델을 정한다

Batch size를 크게 잡아 throughput을 높여도 한 row 오류 때문에 어느 범위가 실패하고 어디서 다시 시작해야 하는지가 불명확하면 운영하기 어렵습니다.

```text
성공 1~1000
실패 1001

질문:
- 1~1000은 이미 commit됐는가?
- 1001만 다시 할 수 있는가?
- 1002 이후는 처리됐는가?
- 외부 side effect가 있었다면 중복 없이 재시작 가능한가?
```

대량 처리 설계는 "bulk API를 쓰자"보다 **메모리에 머무는 양, DB로 보내는 횟수, 한 transaction의 성공 단위, 실패 후 재처리 범위를 함께 결정하는 것**에서 시작합니다.
