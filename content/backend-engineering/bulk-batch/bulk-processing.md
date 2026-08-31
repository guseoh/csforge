---
kind: concept
contentKey: backend.core.bulk-batch.bulk-processing
topicContentKey: backend.core.bulk-batch
slug: bulk-processing
title: "Bulk 처리와 메모리·트랜잭션 경계"
summary: "대량 데이터를 한 번에 처리할 때 생기는 메모리, SQL 횟수, 트랜잭션 크기, 부분 실패 문제를 함께 본다."
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
# Bulk 처리와 메모리·트랜잭션 경계

10건을 처리하던 코드를 그대로 100만 건에 적용하면 같은 정답이 나오지 않는다. 모든 데이터를 메모리에 올리는 순간 heap이 문제되고, 행마다 `INSERT`를 보내면 round trip이 문제되고, 전체를 하나의 transaction으로 묶으면 lock·WAL·rollback 비용이 커진다.

### 한 번에 많이 처리한다는 말의 세 가지 의미

```text
Input 1,000,000 rows
        │
        ├─ read batch size
        ├─ write batch size
        └─ transaction chunk size
```

이 세 값은 같을 필요가 없다. 예를 들어 1,000개씩 읽고 100개씩 JDBC batch를 보내되 1,000개 단위로 commit할 수도 있다. 핵심은 **메모리 사용량, DB 왕복 횟수, 실패 시 재처리 범위**를 함께 조절하는 것이다.

### transaction을 크게 잡으면 왜 위험한가

하나의 transaction이 너무 길면 변경한 row lock을 오래 잡고, 실패 시 rollback할 작업량이 커지며, 다른 요청이 영향을 받을 수 있다. 반대로 너무 잘게 commit하면 중간 실패 시 일부만 반영된 상태를 어떻게 복구할지 정책이 필요하다.

| 선택                  | 장점                  | 비용                         |
| --------------------- | --------------------- | ---------------------------- |
| 하나의 큰 transaction | all-or-nothing이 단순 | lock/rollback/메모리 비용 큼 |
| chunk transaction     | 재시작 범위가 작음    | 부분 성공 상태를 설계해야 함 |
| row 단위 commit       | 실패 격리 쉬움        | DB 왕복과 처리량 저하 가능   |

### JPA에서는 영속성 컨텍스트도 커진다

JPA로 대량 entity를 저장하면 DB row뿐 아니라 managed entity가 persistence context에 쌓일 수 있다. 일정 단위로 `flush()`와 `clear()`가 필요한 이유는 SQL 전송뿐 아니라 **1차 캐시와 dirty checking 대상의 크기**도 제어하기 위해서다.

```java
for (int i = 0; i < rows.size(); i++) {
    repository.save(toEntity(rows.get(i)));

    if ((i + 1) % 500 == 0) {
        entityManager.flush();
        entityManager.clear();
    }
}
```

이 코드도 만능 답은 아니다. ID 생성 전략, JDBC batching, cascade, validation 비용에 따라 실제 SQL을 측정해야 한다. Bulk 처리는 먼저 처리량과 실패 모델을 정한 뒤 framework 기능을 선택하는 문제다.
