---
kind: concept
contentKey: backend.core.layering.orchestration-rule
topicContentKey: backend.core.layering
slug: orchestration-rule
title: "유스케이스 조정과 비즈니스 규칙"
summary: "애플리케이션 계층은 여러 협력자 호출과 트랜잭션 경계를 조정하고, 도메인은 객체가 항상 지켜야 할 불변식과 상태 전이 규칙을 소유한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://learn.microsoft.com/ko-kr/azure/architecture/microservices/model/tactical-domain-driven-design"
    title: "Microsoft Learn: 전술 DDD를 사용하여 마이크로 서비스 설계"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "애플리케이션 서비스가 유스케이스를 조정하고 도메인 서비스·엔터티가 비즈니스 규칙을 담당하는 역할 구분을 확인한다."
---
# 유스케이스 조정과 비즈니스 규칙

애플리케이션 서비스와 도메인 객체에는 모두 업무 코드가 들어가므로 책임이 쉽게 섞입니다. 구분 기준은 **여러 협력자를 어떤 순서로 호출할 것인가**와 **어떤 상태가 유효한가**를 나누는 것입니다.

주문 취소 유스케이스를 보겠습니다.

```java
@Transactional
public void cancel(long orderId) {
    Order order = orderRepository.getById(orderId);
    order.cancel(clock.instant());
    orderRepository.save(order);
}
```

애플리케이션 서비스는 주문을 조회하고, 도메인 동작을 호출하고, 저장소 변경을 하나의 트랜잭션 경계 안에서 조정합니다. 반면 "배송이 시작된 주문은 취소할 수 없다"는 규칙은 `Order`가 소유하는 편이 자연스럽습니다.

```java
public void cancel(Instant cancelledAt) {
    if (status == OrderStatus.SHIPPING) {
        throw new IllegalStateException("배송 시작 후에는 취소할 수 없습니다.");
    }
    status = OrderStatus.CANCELLED;
    this.cancelledAt = cancelledAt;
}
```

이 규칙이 도메인 동작 안에 있으면 HTTP API, 배치, 관리자 기능처럼 진입점이 달라져도 같은 상태 전이를 사용합니다.

### 애플리케이션 계층은 협력 순서와 실패 경계를 조정한다

하나의 유스케이스가 여러 경계를 넘으면 호출 순서가 결과를 바꿀 수 있습니다.

```text
주문 취소 상태 확정 후 환불을 직접 요청하는 경우
1. 주문 조회 + 취소 가능 여부 확인
2. DB 트랜잭션에서 취소 상태 확정 후 commit
3. 외부 환불 API 요청
4. 실패·응답 유실 시 별도로 저장한 작업 상태와 원격 결과를 대조해 복구

Transactional outbox를 선택한 경우
1. 주문 조회 + 취소 가능 여부 확인
2. 같은 DB 트랜잭션에서 취소 상태 변경 + 환불 요청 의도(outbox) 기록
3. 두 기록을 함께 commit (실패하면 둘 다 rollback)
4. 별도 relay/worker가 outbox를 읽고 환불 요청 전달
5. 중복 전달·응답 유실은 작업 식별자와 멱등성/대사 정책으로 처리
```

예를 들어 외부 환불 API를 긴 DB 트랜잭션 안에서 먼저 호출하면, 외부 환불은 성공했는데 이후 DB 트랜잭션이 롤백되는 상태가 생길 수 있습니다. 반대로 DB를 먼저 확정하면 환불 실패를 어떻게 복구할지 별도 정책이 필요합니다. 이때 **outbox 기록까지 commit 뒤로 미루면** commit 성공 직후 프로세스가 중단됐을 때 환불 요청 의도를 잃습니다. Outbox를 사용한다면 **주문 변경과 outbox 기록을 동일한 로컬 DB 트랜잭션으로 확정**해야 하고, 별도 전달자는 at-least-once 실행을 전제로 원격 중복 효과를 방지해야 합니다. Outbox는 DB와 외부 결제를 하나의 분산 트랜잭션으로 만드는 장치가 아닙니다.

이처럼 **여러 저장소·외부 시스템의 호출 순서, 트랜잭션 경계, 실패 후 복구 방향**은 유스케이스 전체를 보는 애플리케이션 계층의 책임에 가깝습니다.

### 도메인은 상태 자체의 유효성을 보호한다

서비스 곳곳에서 다음과 같은 조건을 반복하면 규칙이 흩어집니다.

```java
if (order.getStatus() == OrderStatus.SHIPPING) {
    ...
}
```

이 상태에서는 새로운 진입점이 추가될 때 같은 조건을 빠뜨리기 쉽습니다. 반대로 저장소 호출이나 HTTP client 호출까지 엔티티 메서드 안에 넣으면 도메인 객체가 인프라 구현까지 알아야 합니다.

| 질문 | Domain에 가까움 | Application에 가까움 |
| --- | ---: | ---: |
| 이 상태 전이가 허용되는가? | ✓ | |
| 금액이 음수가 될 수 있는가? | ✓ | |
| 여러 저장소를 어떤 순서로 호출하는가? | | ✓ |
| DB 트랜잭션 경계는 어디인가? | | ✓ |
| 외부 호출 실패 후 무엇을 복구하는가? | 상태 규칙 일부 | ✓ |

좋은 애플리케이션 서비스의 목표는 무조건 한두 줄로 만드는 것이 아닙니다. **유스케이스의 조정 흐름은 읽히되, 객체가 스스로 지켜야 할 규칙은 도메인 동작으로 위임되어 있는 상태**가 더 중요합니다.
