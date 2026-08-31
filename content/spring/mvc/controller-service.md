---
kind: concept
contentKey: spring.core.mvc.controller-service
topicContentKey: spring.core.mvc
slug: controller-service
title: "Controller와 application service"
summary: "Controller는 HTTP input/output contract를 다루고 application service는 use-case orchestration과 transaction 협력을 담당하도록 경계를 나누는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html"
    title: "Spring Framework Reference: Annotated Controllers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring MVC annotated controller의 request mapping/argument/return contract 확인"
---
# Controller와 application service

Controller는 HTTP 요청이 application으로 들어오는 경계입니다. 그래서 URI/path/query/header/body를 읽고 HTTP status와 response representation을 만드는 책임은 자연스럽습니다. 문제가 생기는 지점은 controller가 **persistence, transaction orchestration, domain state transition까지 모두 직접 수행하기 시작할 때**입니다.

```java
@PostMapping("/orders")
ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
    Order order = new Order();
    order.setStatus("CREATED");
    orderRepository.save(order);
    paymentClient.charge(request.card());
    return ResponseEntity.ok(...);
}
```

이 method는 HTTP parsing뿐 아니라 domain creation, persistence, external API orchestration까지 소유합니다. 나중에 scheduler나 batch가 같은 주문 생성 use case를 실행하려면 controller logic을 재사용하기 어려워집니다.

### HTTP 경계와 use-case 경계를 분리한다

```java
@RestController
class OrderController {
    private final PlaceOrderService service;

    @PostMapping("/orders")
    ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        PlaceOrderResult result = service.place(request.toCommand());
        return ResponseEntity
                .created(URI.create("/orders/" + result.orderId()))
                .body(OrderResponse.from(result));
    }
}
```

```text
HTTP Request
   │ parse / validate shape / map
   ▼
Controller
   │ Command
   ▼
Application Service
   │ orchestrate repositories/domain/external boundaries
   ▼
Domain behavior
```

이제 controller는 HTTP representation을 application command/result로 변환하고 application service는 use-case 흐름을 담당합니다.

### validation도 어느 경계의 규칙인지 나눈다

`@NotBlank email`, JSON 형식, page size upper bound처럼 **외부 요청 모양**에 가까운 검증은 request DTO/controller 경계에서 처리할 수 있습니다. 반면 “이미 취소된 주문은 결제할 수 없다” 같은 invariant는 request가 REST인지 batch인지와 무관하므로 domain/application에 있어야 합니다.

```text
HTTP 형식 오류          -> API validation
현재 사용자의 권한      -> security/application boundary
주문의 상태 전이 규칙    -> domain
unique constraint       -> DB
```

### application service가 모든 business rule을 가져야 하는 것도 아니다

layer를 나눈다고 service method에 수백 줄의 if문을 옮기면 controller 비대화가 service 비대화로 바뀔 뿐입니다.

```java
@Transactional
public void cancel(OrderId id) {
    Order order = repository.get(id);
    order.cancel(clock.instant()); // 상태 전이 규칙은 domain이 소유
}
```

application service는 transaction boundary, repository coordination, external collaborator 호출 같은 **use-case orchestration**을 맡고 entity/value object가 자신의 invariant를 지키게 할 수 있습니다.

### 경계를 나누는 이유는 재사용보다 변경 이유다

HTTP status/JSON shape가 바뀌는 이유와 주문 정책이 바뀌는 이유, DB 접근 방식이 바뀌는 이유는 서로 다릅니다. layer 분리는 class 개수를 늘리는 규칙이 아니라 **서로 다른 변경 이유를 같은 method에서 분리하는 것**입니다.

작은 CRUD라면 controller→service→repository가 기계적으로 세 겹일 필요는 없지만, controller가 persistence/transaction/domain creation을 직접 소유하기 시작하면 HTTP 경계와 use-case 경계가 섞였는지 다시 볼 필요가 있습니다.
