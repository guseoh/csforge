---
kind: concept
contentKey: spring.core.testing.mock-boundary
topicContentKey: spring.core.testing
slug: mock-boundary
title: "mock과 외부 경계"
summary: "mock을 내부 구현 호출 순서에 결합하기보다 느리거나 비결정적이거나 독립적으로 실패하는 협력 경계를 격리하는 도구로 사용하고 fake/stub/실제 통합 테스트와 비교한다"
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-mockitobean.html"
    title: "Spring Framework Reference: @MockitoBean and @MockitoSpyBean"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring test context에서 Bean을 Mockito double로 override하는 공식 방식 확인"
---
# mock과 외부 경계

mock은 “테스트에서 의존성이 있으면 전부 바꾸는 것”이 아닙니다. 가장 유용한 경우는 **현재 테스트가 검증하려는 책임 밖에 있고, 느리거나 비결정적이거나 독립적으로 실패하는 협력 객체**를 격리할 때입니다.

```java
class PaymentServiceTest {
    PaymentGateway gateway = mock(PaymentGateway.class);
    PaymentService service = new PaymentService(gateway);
}
```

외부 PG를 실제 호출하지 않고 승인·거절·timeout 상황을 원하는 대로 만들 수 있습니다.

### 상태와 결과를 검증할지, 상호작용을 검증할지 구분한다

```java
verify(repository).save(any());
verify(notifier).send(any());
```

호출 상호작용을 검증해야 하는 경우도 있지만 내부 메서드 호출 횟수까지 과하게 고정하면 리팩터링이 테스트를 깨뜨립니다.

예를 들어 Repository가 `save()` 한 번에서 bulk `saveAll()`로 바뀌어도 관찰 가능한 결과가 같다면 업무 테스트가 구현 세부 때문에 실패할 필요는 없을 수 있습니다.

### mock이 실제 Framework 계약을 대체해 버리는 경우

JPA Repository를 mock하면 SQL, 매핑, UNIQUE 제약, 지연 로딩은 전혀 검증하지 않습니다.

```text
Mock Repository 테스트
  -> Service가 Repository 메서드를 호출했는지 검증

실제 영속성 테스트
  -> 매핑/쿼리/제약/트랜잭션 동작 검증
```

둘은 경쟁 관계가 아니라 서로 다른 실패 유형을 잡습니다.

### fake와 stub이 더 읽기 쉬운 때도 있다

복잡한 `when(...).thenReturn(...)`가 많아지면 간단한 인메모리 fake가 도메인 시나리오를 더 잘 표현할 수 있습니다.

```java
FakeOrderRepository repository = new FakeOrderRepository();
repository.save(existingOrder);
```

fake는 실제 DB 의미를 흉내 내지 못하므로 영속성 테스트를 대체하지 않지만 Service 동작을 읽기 쉽게 만들 수 있습니다.

### 외부 API mock도 프로토콜 계약을 놓칠 수 있다

`PaymentGateway` 인터페이스 mock만 쓰면 HTTP header, JSON field, timeout 설정이 실제 외부 서비스 계약과 맞는지는 확인하지 못합니다. Adapter 테스트에서는 mock HTTP server나 계약 fixture로 실제 직렬화를 검증하는 편이 필요할 수 있습니다.

```text
Domain/Application 테스트 -> PaymentGateway interface fake/mock
Adapter 테스트            -> HTTP stub/mock server
운영 전 smoke 테스트       -> sandbox/실제 통합 (필요한 경우)
```

### mock이 너무 많이 필요하면 설계 신호일 수 있다

Service 하나를 테스트하기 위해 12개 mock을 만들고 호출 순서를 전부 설정해야 한다면 클래스가 너무 많은 협력 객체를 조정하거나 책임이 섞였을 가능성이 있습니다. 테스트 난이도가 운영 코드의 설계 복잡도를 드러내는 경우입니다.

mock은 테스트를 빠르게 만드는 도구이지만, 핵심 질문은 **무엇을 실제로 검증하고 무엇을 의도적으로 가짜로 두었는가**입니다.
