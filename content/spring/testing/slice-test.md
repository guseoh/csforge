---
kind: concept
contentKey: spring.core.testing.slice-test
topicContentKey: spring.core.testing
slug: slice-test
title: "슬라이스 테스트와 컨텍스트 테스트"
summary: "테스트가 실제로 어떤 Spring 컨텍스트와 인프라를 로드하는지 기준으로 웹/JPA 슬라이스와 전체 컨텍스트 테스트의 검증 범위·속도·신뢰도를 비교한다"
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
  - url: "https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-mockitobean.html"
    title: "Spring Framework Reference: @MockitoBean and @MockitoSpyBean"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "현재 Spring Framework에서 slice context의 collaborator Bean을 Mockito mock으로 교체하는 방식 확인"
---
# 슬라이스 테스트와 컨텍스트 테스트

Spring 테스트를 나눌 때 “단위 테스트는 빠르고 통합 테스트는 느리다”만으로는 실제 선택이 어렵습니다. 먼저 **이번 테스트가 어떤 Spring 구성요소와 외부 경계를 실제로 검증해야 하는가**를 봐야 합니다.

예를 들어 Controller의 요청 매핑, 검증, JSON 오류 계약만 확인하고 싶다면 전체 데이터베이스와 애플리케이션 컨텍스트가 필요하지 않을 수 있습니다.

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest { ... }
```

반대로 실제 JPA 매핑과 쿼리가 PostgreSQL에서 동작하는지 확인하려면 웹 계층보다 영속성 설정과 데이터베이스가 중요합니다.

```java
@DataJpaTest
class OrderRepositoryTest { ... }
```

### 슬라이스 테스트는 “mock 테스트”와 같은 말이 아니다

슬라이스는 애플리케이션 컨텍스트에서 특정 영역의 자동 설정과 컴포넌트만 집중적으로 로드합니다.

```text
@WebMvcTest
  -> MVC 인프라 + 선택한 Controller
  -> Service 협력 객체는 mock/stub으로 대체할 수 있음

@DataJpaTest
  -> JPA/Repository/영속성 인프라 중심
  -> 실제 Entity 매핑과 쿼리를 검증
```

`@DataJpaTest`가 Repository를 mock한다는 뜻은 아닙니다. 어떤 슬라이스인지에 따라 실제 Framework 통합을 꽤 깊게 검증할 수 있습니다.

### `@SpringBootTest`는 모든 문제의 상위호환이 아니다

전체 애플리케이션 컨텍스트를 띄우면 설정 연결과 여러 컴포넌트의 통합을 확인할 수 있지만 비용이 큽니다.

```text
작은 매핑 오류 하나 확인
    vs
전체 컨텍스트 + DB + 메시징 + 외부 시스템 대역 시작
```

모든 테스트를 `@SpringBootTest`로 만들면 피드백이 느리고 실패 원인이 넓어집니다. 반대로 슬라이스만 사용하면 여러 계층이 실제로 함께 연결되는 문제를 놓칠 수 있습니다.

### 선택 기준은 실제 위험이다

| 검증하려는 위험                          | 적합한 시작점                              |
| ---------------------------------------- | ------------------------------------------ |
| 순수 도메인 불변식                      | 일반 단위 테스트                           |
| MVC 매핑/검증/오류 계약                  | 웹 슬라이스                                |
| JPA 매핑/쿼리/제약                       | JPA 통합/슬라이스 + 실제 DB 고려           |
| 설정/프록시/트랜잭션 연결                | Spring 컨텍스트 통합 테스트                |
| 핵심 유스케이스 전체                     | 필요한 범위의 end-to-end/통합 테스트       |

같은 기능도 운영에서 실패 가능성이 높은 경계에는 더 실제에 가까운 테스트가 필요합니다.

### 테스트 대역이 많아질수록 “무엇을 검증했나”를 확인한다

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @MockitoBean
    OrderService service;
}
```

이 테스트는 Controller에서 Service로 이어지는 실제 트랜잭션·도메인 동작을 검증하지 않습니다. 대신 HTTP 매핑과 직렬화 계약에 집중할 수 있습니다. 이것을 알고 사용하면 좋은 슬라이스이고, “주문 기능 전체가 검증됐다”고 착각하면 검증 공백이 생깁니다.

### 실제 DB 차이를 무시하지 않는다

H2 같은 인메모리 DB와 운영 PostgreSQL은 SQL 방언, 제약, 잠금, 트랜잭션 동작이 다를 수 있습니다. JPA 테스트가 이런 차이에 민감하다면 Testcontainers 등으로 운영에 가까운 DB를 쓰는 편이 낫습니다.

테스트 annotation을 선택할 때는 “무엇이 빠른가”보다 **이번 실패를 잡으려면 실제로 어느 경계까지 살아 있어야 하는가**를 먼저 정합니다.
