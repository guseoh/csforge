---
kind: concept
contentKey: spring.core.testing.test-transaction
topicContentKey: spring.core.testing
slug: test-transaction
title: "테스트 트랜잭션 격리"
summary: "Spring 테스트 트랜잭션의 자동 rollback이 데이터 정리에는 편리하지만 운영 commit/flush/lazy-loading/비동기 경계를 가릴 수 있다는 점을 이해한다"
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
# 테스트 트랜잭션 격리

Spring 통합 테스트에 `@Transactional`을 붙이면 테스트 메서드를 트랜잭션 안에서 실행하고 끝날 때 rollback해 DB를 깨끗하게 유지할 수 있습니다.

```java
@Transactional
@SpringBootTest
class OrderServiceTest {
    @Test
    void placeOrder() { ... }
}
```

편리하지만 이 구조가 운영 요청의 트랜잭션 생명주기와 같다는 뜻은 아닙니다.

```text
테스트
  T_test 시작
    -> Service 호출
    -> Repository 호출
    -> 검증
  T_test rollback

운영
  Controller
    -> Service proxy가 T_service 시작
    -> Service 반환
    -> flush/commit
  -> 응답
```

### 바깥 테스트 트랜잭션이 Service 경계를 덮을 수 있다

Service가 `REQUIRED`라면 이미 테스트 트랜잭션이 있으므로 새 트랜잭션을 만들지 않고 기존 테스트 트랜잭션에 참여할 수 있습니다. 그래서 운영에서는 Service 종료 때 commit되는데 테스트에서는 메서드가 끝날 때까지 트랜잭션이 열려 있을 수 있습니다.

이 차이는 지연 로딩 문제를 가릴 수 있습니다.

```java
Order order = service.getOrder(id);
order.getItems().size(); // 테스트 트랜잭션이 아직 열려 있어 lazy load 성공
```

운영 Controller가 트랜잭션 밖에서 같은 접근을 하면 `LazyInitializationException`이 날 수 있습니다.

### commit 시점 제약을 놓칠 수 있다

JPA SQL과 제약 확인이 flush/commit까지 지연되는 경우 검증 코드 전에는 예외가 나지 않을 수 있습니다.

```java
repository.save(duplicate);
// 여기까지 예외 없음
// 테스트가 rollback되어 실제 commit 경로를 확인하지 못할 수 있음
```

필요한 테스트에서는 명시적으로 `flush()`하거나 실제 commit 경계를 통과하는 통합 시나리오를 만들어야 합니다.

### 비동기 작업과 새 트랜잭션은 테스트 rollback 밖에서 움직일 수 있다

백그라운드 스레드나 `REQUIRES_NEW` 트랜잭션에서 commit한 데이터는 바깥 테스트 트랜잭션 rollback으로 자동 정리되지 않을 수 있습니다. “`@Transactional` 테스트니까 DB가 항상 원상복구된다”고 단정하면 테스트 데이터가 남아 다음 테스트를 흔들 수 있습니다.

### 그래서 모든 통합 테스트에서 rollback을 버려야 하는가

아닙니다. 많은 Repository/Service 테스트에서는 빠르고 독립적인 정리 방법으로 매우 유용합니다. 중요한 것은 **검증하려는 동작이 트랜잭션 경계 자체인지**를 아는 것입니다.

| 검증 대상                          | rollback 테스트 적합성         |
| ---------------------------------- | ------------------------------ |
| 기본 Repository 매핑/쿼리         | 유용함                         |
| 도메인/Service 상태 변경          | 대체로 유용                    |
| 운영 commit 이후 동작              | 별도 commit 시나리오 필요      |
| 트랜잭션 밖 지연 로딩             | rollback 테스트가 가릴 수 있음 |
| 비동기/REQUIRES_NEW 영속화        | 별도 정리/검증 필요            |

TestContext 트랜잭션은 운영 트랜잭션을 흉내 내는 마법이 아니라 **테스트 실행을 감싸는 별도의 트랜잭션 경계**입니다.
