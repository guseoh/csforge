---
kind: concept
contentKey: spring.core.testing.test-transaction
topicContentKey: spring.core.testing
slug: test-transaction
title: "테스트 transaction 격리"
summary: "Spring test transaction의 자동 rollback이 data cleanup에는 편리하지만 production commit/flush/lazy-loading/async 경계를 가릴 수 있다는 점을 이해한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/testing/testcontext-framework/tx.html"
    title: "Spring Framework Reference: Transaction Management in Tests"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "TestContext transaction 시작/rollback과 production-managed transaction 차이 확인"
---
# 테스트 transaction 격리

Spring integration test에 `@Transactional`을 붙이면 test method를 transaction 안에서 실행하고 끝날 때 rollback해 DB를 깨끗하게 유지할 수 있습니다.

```java
@Transactional
@SpringBootTest
class OrderServiceTest {
    @Test
    void placeOrder() { ... }
}
```

편리하지만 이 구조는 production request와 transaction lifecycle이 같다는 뜻이 아닙니다.

```text
Test
  T_test 시작
    -> service 호출
    -> repository 호출
    -> assertion
  T_test rollback

Production
  controller
    -> service proxy가 T_service 시작
    -> service return
    -> flush/commit
  -> response
```

### outer test transaction이 service boundary를 덮을 수 있다

service가 `REQUIRED`라면 이미 test transaction이 있으므로 새 transaction을 만들지 않고 test transaction에 참여할 수 있습니다. 그래서 production에서는 service 종료 때 commit되는데 test에서는 method 끝까지 transaction이 열려 있을 수 있습니다.

이 차이는 lazy association 접근을 가릴 수 있습니다.

```java
Order order = service.getOrder(id);
order.getItems().size(); // test transaction이 아직 열려 있어 lazy load 성공
```

production controller가 transaction 밖에서 같은 접근을 하면 `LazyInitializationException`이 날 수 있습니다.

### commit 시점 constraint를 놓칠 수 있다

JPA SQL/constraint check가 flush/commit에 지연되는 경우 assertion 전에 예외가 나지 않을 수 있습니다.

```java
repository.save(duplicate);
// 여기까지 예외 없음
// test가 rollback되어 실제 commit 경로를 확인하지 못할 수 있음
```

필요한 test에서는 explicit `flush()`하거나 실제 commit 경계를 통과하는 integration scenario를 만들어야 합니다.

### async/new transaction은 test rollback 밖에서 움직일 수 있다

background thread나 `REQUIRES_NEW` transaction에서 commit한 data는 outer test transaction rollback으로 자동 정리되지 않을 수 있습니다. “@Transactional test니까 DB가 항상 원상복구”라고 단정하면 flaky test data가 남을 수 있습니다.

### 그래서 모든 integration test에서 rollback을 버려야 하는가

아닙니다. 많은 repository/service test에서는 빠르고 독립적인 cleanup 방법으로 매우 유용합니다. 중요한 것은 **검증하려는 behavior가 transaction boundary 자체인지**를 아는 것입니다.

| 검증 대상                        | rollback test 적합성         |
| -------------------------------- | ---------------------------- |
| 기본 repository mapping/query    | 유용함                       |
| domain/service state change      | 대체로 유용                  |
| production commit 후 behavior    | 별도 commit scenario 필요    |
| lazy loading outside transaction | rollback test가 가릴 수 있음 |
| async/REQUIRES_NEW persistence   | 별도 cleanup/검증 필요       |

TestContext transaction은 production transaction을 흉내 내는 마법이 아니라 **test 실행을 감싸는 별도의 transaction boundary**입니다.
