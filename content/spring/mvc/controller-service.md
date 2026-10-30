---
kind: concept
contentKey: spring.core.mvc.controller-service
topicContentKey: spring.core.mvc
slug: controller-service
title: "Controller와 애플리케이션 서비스"
summary: "Controller는 HTTP 입출력 계약을 다루고 애플리케이션 서비스는 기능 흐름 조정과 트랜잭션 경계를 담당하도록 책임을 나누는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html"
    title: "Spring Framework Reference: Annotated Controllers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring MVC annotation 기반 Controller의 요청 매핑·인자·반환 계약 확인"
---
# Controller와 애플리케이션 서비스

Controller는 HTTP 요청이 애플리케이션으로 들어오는 경계입니다. 따라서 URI, 경로 변수, query parameter, header, body를 읽고 HTTP 상태 코드와 응답 표현을 만드는 책임은 자연스럽습니다. 문제가 생기는 지점은 Controller가 **영속성 처리, 트랜잭션 조정, 도메인 상태 전이까지 모두 직접 수행하기 시작할 때**입니다.

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

이 메서드는 HTTP 요청 해석뿐 아니라 도메인 객체 생성, 저장, 외부 결제 호출까지 소유합니다. 나중에 스케줄러나 배치가 같은 주문 생성 기능을 실행하려면 Controller 안의 코드를 재사용하기 어려워집니다.

### HTTP 경계와 기능 실행 경계를 분리한다

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
HTTP 요청
   │ 파싱 / 요청 형태 검증 / 변환
   ▼
Controller
   │ Command
   ▼
애플리케이션 서비스
   │ Repository·도메인·외부 경계 조정
   ▼
도메인 동작
```

이제 Controller는 HTTP 표현을 애플리케이션 명령과 결과로 변환하고, 애플리케이션 서비스는 기능 실행 흐름을 담당합니다.

### 검증도 어느 경계의 규칙인지 나눈다

`@NotBlank email`, JSON 형식, page size 상한처럼 **외부 요청 모양**에 가까운 검증은 요청 DTO나 Controller 경계에서 처리할 수 있습니다. 반면 “이미 취소된 주문은 결제할 수 없다” 같은 불변식은 요청이 REST인지 배치인지와 무관하므로 도메인·애플리케이션 경계에서 보호해야 합니다.

```text
HTTP 형식 오류       -> API 검증
현재 사용자의 권한   -> Security·애플리케이션 경계
주문의 상태 전이 규칙 -> 도메인
UNIQUE 제약          -> DB
```

### 애플리케이션 서비스가 모든 업무 규칙을 가져야 하는 것도 아니다

계층을 나눈다고 서비스 메서드에 수백 줄의 if문을 옮기면 Controller 비대화가 서비스 비대화로 바뀔 뿐입니다.

```java
@Transactional
public void cancel(OrderId id) {
    Order order = repository.get(id);
    order.cancel(clock.instant()); // 상태 전이 규칙은 도메인이 소유
}
```

애플리케이션 서비스는 트랜잭션 경계, Repository 협력, 외부 시스템 호출 같은 **기능 흐름 조정**을 맡고 Entity와 값 객체가 자신의 불변식을 지키게 할 수 있습니다.

### 경계를 나누는 이유는 재사용보다 변경 이유다

HTTP 상태 코드나 JSON 모양이 바뀌는 이유와 주문 정책이 바뀌는 이유, DB 접근 방식이 바뀌는 이유는 서로 다릅니다. 계층 분리는 클래스 수를 늘리는 규칙이 아니라 **서로 다른 변경 이유를 같은 메서드에서 분리하는 것**입니다.

작은 CRUD라면 Controller→Service→Repository를 기계적으로 세 겹 만들 필요는 없습니다. 하지만 Controller가 영속성·트랜잭션·도메인 객체 생성과 상태 전이를 직접 소유하기 시작한다면 HTTP 경계와 기능 실행 경계가 섞였는지 다시 봐야 합니다.
