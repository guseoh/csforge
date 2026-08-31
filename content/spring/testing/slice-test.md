---
kind: concept
contentKey: spring.core.testing.slice-test
topicContentKey: spring.core.testing
slug: slice-test
title: "slice test와 context test"
summary: "테스트가 실제로 어떤 Spring context와 infrastructure를 로드하는지 기준으로 web/JPA slice와 full context test의 검증 범위·속도·신뢰도를 비교한다"
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html"
    title: "Spring Boot Reference: Testing Spring Boot Applications"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@SpringBootTest와 test slices의 context loading 범위 확인"
  - url: "https://docs.spring.io/spring-boot/appendix/test-auto-configuration/slices.html"
    title: "Spring Boot Reference: Test Slices"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "slice annotation별 auto-configuration 범위 확인"
---
# slice test와 context test

Spring test를 나눌 때 “unit test는 빠르고 integration test는 느리다”만으로는 실제 선택이 어렵습니다. 먼저 **이번 test가 어떤 Spring 구성요소와 외부 경계를 진짜로 검증해야 하는가**를 봐야 합니다.

예를 들어 controller의 request mapping, validation, JSON error contract만 확인하고 싶다면 전체 database/application context가 필요하지 않을 수 있습니다.

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest { ... }
```

반대로 실제 JPA mapping과 query가 PostgreSQL에서 동작하는지 확인하려면 web layer보다 persistence configuration과 database가 중요합니다.

```java
@DataJpaTest
class OrderRepositoryTest { ... }
```

### slice test는 “mock test”와 같은 말이 아니다

slice는 application context에서 특정 영역의 auto-configuration/component만 집중적으로 로드합니다.

```text
@WebMvcTest
  -> MVC infrastructure + selected controller
  -> service collaborator는 mock/stub로 대체할 수 있음

@DataJpaTest
  -> JPA/repository/persistence infrastructure 중심
  -> 실제 Entity mapping/query를 검증
```

`@DataJpaTest`가 repository를 mock한다는 뜻은 아닙니다. 어떤 slice인지에 따라 실제 framework integration을 꽤 깊게 검증할 수 있습니다.

### `@SpringBootTest`는 모든 문제의 상위호환이 아니다

full application context를 띄우면 configuration wiring과 여러 component integration을 확인할 수 있지만 비용이 큽니다.

```text
작은 mapping 오류 하나 확인
    vs
전체 context + DB + messaging + external stub 시작
```

모든 test를 `@SpringBootTest`로 만들면 feedback이 느리고 실패 원인이 넓어집니다. 반대로 slice만 사용하면 여러 layer가 실제로 함께 연결되는 문제를 놓칠 수 있습니다.

### 선택 기준은 실제 risk다

| 검증하려는 위험                        | 적합한 시작점                        |
| -------------------------------------- | ------------------------------------ |
| pure domain invariant                  | plain unit test                      |
| MVC mapping/validation/error contract  | web slice                            |
| JPA mapping/query/constraint           | JPA integration/slice + real DB 고려 |
| configuration/proxy/transaction wiring | Spring context integration           |
| 핵심 use case 전체                     | targeted end-to-end/integration      |

같은 기능도 production failure 가능성이 높은 경계에는 더 실제에 가까운 test가 필요합니다.

### test double이 많아질수록 “무엇을 검증했나”를 확인한다

```java
@WebMvcTest
@MockBean OrderService service;
```

이 test는 controller→service 실제 transaction/domain behavior를 검증하지 않습니다. 그 대신 HTTP mapping/serialization contract에 집중할 수 있습니다. 이것을 알고 사용하면 좋은 slice이고, “주문 기능 전체가 검증됐다”고 착각하면 coverage gap이 됩니다.

### 실제 DB 차이를 무시하지 않는다

H2 같은 in-memory DB와 production PostgreSQL은 SQL dialect, constraint, locking, transaction behavior가 다를 수 있습니다. JPA test가 이런 차이에 민감하다면 Testcontainers 등으로 production에 가까운 DB를 쓰는 편이 낫습니다.

테스트 annotation을 선택할 때는 “무엇이 빠른가”보다 **이번 실패를 잡으려면 실제로 어느 경계까지 살아 있어야 하는가**를 먼저 정합니다.
