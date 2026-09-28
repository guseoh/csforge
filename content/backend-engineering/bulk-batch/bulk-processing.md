---
kind: concept
contentKey: backend.core.bulk-batch.bulk-processing
topicContentKey: backend.core.bulk-batch
slug: bulk-processing
title: "대량 처리의 읽기·쓰기·트랜잭션 단위"
summary: "대량 처리에서 읽기 단위, DB batch write 단위, 트랜잭션 commit 단위를 분리해 메모리·DB 왕복·잠금·실패 재처리 범위를 함께 조절한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-batch/reference/step/chunk-oriented-processing.html"
    title: "Spring Batch: Chunk-oriented Processing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring Batch에서 설정한 commit interval만큼 item을 읽어 한 묶음으로 쓰고 트랜잭션을 commit하는 chunk 처리 모델을 확인한다."
---
# 대량 처리의 읽기·쓰기·트랜잭션 단위

10건을 처리하던 코드를 그대로 100만 건에 적용하면 메모리, SQL 횟수, 트랜잭션 시간의 성격이 달라집니다. 모든 row를 한 번에 읽으면 heap 사용량이 커지고, row마다 INSERT를 보내면 네트워크 왕복이 많아지며, 전체를 한 트랜잭션으로 묶으면 잠금과 rollback 범위가 커집니다.

대량 처리에서는 "몇 개씩 처리한다"는 말을 하나의 숫자로 보지 않고 **읽기 단위, DB 쓰기 전송 단위, 트랜잭션 commit 단위**를 분리해서 봅니다.

```text
입력 1,000,000건
        │
        ├─ 읽기 버퍼/페이지 단위 : 메모리에 한 번에 올릴 양
        ├─ DB batch write 단위   : 한 번에 전송할 쓰기 수
        └─ 트랜잭션 commit 단위  : 한 commit이 책임질 작업 범위
```

세 값은 같을 필요가 없습니다. 예를 들어 1,000개씩 읽고, 100개씩 JDBC batch로 전송하면서, 1,000개 단위로 commit할 수 있습니다. 여기서 **일반적인 읽기 버퍼 단위를 Spring Batch의 `chunk`와 같은 말로 사용하지 않는 것이 중요합니다.** Spring Batch의 chunk-oriented processing에서 chunk는 설정한 commit interval만큼 항목을 읽어 묶어 쓰고 트랜잭션을 commit하는 처리 경계를 가리킵니다.

### 큰 트랜잭션은 전체 원자성 대신 긴 자원 점유를 지불한다

100만 건 전체를 하나의 트랜잭션으로 묶으면 마지막 한 건 실패 시 전체 rollback이라는 명확한 의미를 얻습니다. 대신 트랜잭션이 오래 살아 있는 동안 연결, 잠금, MVCC version, WAL, rollback 작업량이 커질 수 있습니다.

반대로 일정 단위로 commit하면 한 번의 실패가 되돌리는 범위를 줄이지만 중간까지 성공한 상태가 실제 제품에서 허용되는지 정의해야 합니다.

| commit 단위 | 장점 | 비용 |
| --- | --- | --- |
| 전체 작업 | 원자성 설명이 단순 | 긴 트랜잭션, 큰 rollback 범위 |
| 일정 처리 단위 | 재처리 범위 제한 | 부분 성공·재시작 정책 필요 |
| 한 항목 | 실패 격리 쉬움 | DB 왕복과 commit 비용 증가 가능 |

### JPA에서는 DB row뿐 아니라 관리 상태 엔티티 수를 본다

JPA로 대량 엔티티를 저장하면 persistence context가 관리 상태 엔티티를 계속 추적할 수 있습니다. 반복이 길어질수록 1차 캐시와 dirty checking 대상도 커질 수 있습니다.

```java
for (int i = 0; i < rows.size(); i++) {
    entityManager.persist(toEntity(rows.get(i)));

    if ((i + 1) % 500 == 0) {
        entityManager.flush();
        entityManager.clear();
    }
}
```

`flush/clear`는 흔한 선택지지만 숫자 500이 정답인 것은 아닙니다. ID 생성 전략, JDBC batching 설정, cascade, 엔티티 크기와 실제 SQL을 측정해야 합니다.

### 처리량 최적화보다 먼저 실패 모델을 정한다

DB batch 크기를 크게 잡아 처리량을 높여도 한 row 오류 때문에 어느 범위가 실패하고 어디서 다시 시작해야 하는지가 불명확하면 운영하기 어렵습니다.

```text
성공 1~1000
실패 1001

질문:
- 1~1000은 이미 commit됐는가?
- 1001만 다시 할 수 있는가?
- 1002 이후는 처리됐는가?
- 외부 부수 효과가 있었다면 중복 없이 재시작 가능한가?
```

대량 처리 설계는 "bulk API를 쓰자"보다 **메모리에 머무는 양, DB로 보내는 횟수, 한 트랜잭션의 성공 단위, 실패 후 재처리 범위를 함께 결정하는 것**에서 시작합니다.
