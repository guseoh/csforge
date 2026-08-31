---
kind: concept
contentKey: spring.core.testing.mock-boundary
topicContentKey: spring.core.testing
slug: mock-boundary
title: "mock과 외부 경계"
summary: "mock을 내부 구현 호출 순서에 결합하기보다 느리거나 비결정적이거나 독립적으로 실패하는 협력 경계를 격리하는 도구로 사용하고 fake/stub/real integration과 비교한다"
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

mock은 “test에서 dependency가 있으면 전부 바꾸는 것”이 아닙니다. 가장 유용한 경우는 **현재 test가 검증하려는 책임 밖에 있고, 느리거나 비결정적이거나 독립적으로 실패하는 collaborator**를 격리할 때입니다.

```java
class PaymentServiceTest {
    PaymentGateway gateway = mock(PaymentGateway.class);
    PaymentService service = new PaymentService(gateway);
}
```

외부 PG를 실제 호출하지 않고 승인/거절/timeout 상황을 원하는 대로 만들 수 있습니다.

### state/result를 검증할지 interaction을 검증할지 구분한다

```java
verify(repository).save(any());
verify(notifier).send(any());
```

interaction verification이 필요한 경우도 있지만 내부 method 호출 횟수까지 과하게 고정하면 refactoring이 test를 깨뜨립니다.

예를 들어 repository가 `save()` 한 번에서 bulk `saveAll()`로 바뀌어도 observable result가 같다면 business test가 구현 detail 때문에 실패할 필요는 없을 수 있습니다.

### mock이 실제 framework contract를 대체해 버리는 경우

JPA repository를 mock하면 SQL, mapping, unique constraint, lazy loading은 전혀 검증하지 않습니다.

```text
Mock Repository test
  -> service가 repository method를 호출했는지 검증

Real persistence test
  -> mapping/query/constraint/transaction behavior 검증
```

둘은 경쟁 관계가 아니라 다른 failure mode를 잡습니다.

### fake와 stub이 더 읽기 쉬운 때도 있다

복잡한 `when(...).thenReturn(...)`가 많아지면 간단한 in-memory fake가 domain scenario를 더 잘 표현할 수 있습니다.

```java
FakeOrderRepository repository = new FakeOrderRepository();
repository.save(existingOrder);
```

fake는 실제 DB semantics를 흉내 내지 못하므로 persistence test를 대체하지 않지만 service behavior를 읽기 쉽게 만들 수 있습니다.

### 외부 API mock도 protocol contract를 놓칠 수 있다

`PaymentGateway` interface mock만 쓰면 HTTP header, JSON field, timeout configuration이 실제 vendor contract와 맞는지는 확인하지 못합니다. adapter test에서는 mock HTTP server/contract fixture로 실제 serialization을 검증하는 편이 필요할 수 있습니다.

```text
Domain/Application test -> PaymentGateway interface fake/mock
Adapter test            -> HTTP stub/mock server
Production smoke        -> sandbox/real integration (필요시)
```

### mock이 너무 많이 필요하면 design signal일 수 있다

service 하나를 test하기 위해 12개 mock을 만들고 호출 순서를 전부 설정해야 한다면 class가 너무 많은 collaborator를 orchestration하거나 responsibility가 섞였을 가능성이 있습니다. test difficulty가 production design complexity를 드러내는 경우입니다.

mock은 test를 빠르게 만드는 도구이지만, 핵심 질문은 **무엇을 진짜로 검증하고 무엇을 의도적으로 가짜로 두었는가**입니다.
