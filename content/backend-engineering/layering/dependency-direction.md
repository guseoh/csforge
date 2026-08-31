---
kind: concept
contentKey: backend.core.layering.dependency-direction
topicContentKey: backend.core.layering
slug: dependency-direction
title: dependency direction
summary: 백엔드 코드를 controller, service, repository 폴더로 나눴다고 해서 계층이 자동으로 분리되는 것은 아니다. 변경 이유와 구현 세부의 전파 방향을 분리하는 것이 핵심이다.
level: 1
status: PUBLISHED
displayOrder: 10
references: []
---
# dependency direction

백엔드 코드를 `controller`, `service`, `repository` 폴더로 나눴다고 해서 계층이 자동으로 분리되는 것은 아닙니다. 더 중요한 것은 **어느 코드가 어느 코드의 변경 이유를 알아야 하는가**입니다. HTTP가 바뀌었다고 도메인 규칙이 흔들리고, JPA 구현을 바꿨다고 API 모델까지 연쇄 수정된다면 패키지만 나뉘었을 뿐 의존 방향은 분리되지 않은 상태입니다.

### 왜 의존 방향이 필요한가

예를 들어 주문 생성 유스케이스가 있다고 해봅시다. Controller는 JSON을 읽고 HTTP status를 선택해야 하지만, “빈 주문은 만들 수 없다”는 규칙까지 Controller가 소유하면 동일 규칙을 batch나 CLI에서 다시 구현하게 됩니다. 반대로 Domain이 `ResponseEntity`, `JpaRepository`, 외부 SDK 타입을 직접 알기 시작하면 도메인 규칙을 테스트하고 재사용하기 위해 프레임워크까지 끌어와야 합니다.

```text
HTTP Request
    │
    ▼
API ───────────────┐
    │              │ Request/Response mapping
    ▼              │
Application        │ use-case orchestration / transaction boundary
    │              │
    ▼              │
Domain             │ invariant / state transition
    ▲              │
    │              │
Persistence ───────┘ DB 구현은 안쪽 계약을 구현
```

여기서 화살표가 호출 순서와 완전히 같다는 뜻은 아닙니다. 실행 중에는 Application이 Repository를 호출하지만, 설계상 안쪽 정책이 바깥 구현 세부에 끌려가지 않도록 계약을 둡니다.

### DTO와 Entity를 그대로 연결하면 생기는 결합

```java
@PostMapping("/orders")
public OrderEntity create(@RequestBody OrderEntity entity) {
    return orderRepository.save(entity);
}
```

짧아 보이지만 HTTP 입력이 persistence model을 직접 구성합니다. 클라이언트가 `status`, `createdAt` 같은 값을 보내는 것을 막기 어렵고, Entity column 변경이 API contract 변경으로 번집니다. 대신 API DTO → application command → domain creation을 분리하면 각 경계가 무엇을 허용하는지 명확해집니다.

### 어디까지 추상화해야 하나

모든 클래스에 interface를 붙이는 것이 dependency inversion은 아닙니다. 실제로 교체되거나 외부 구현 세부를 차단해야 하는 경계에만 계약을 두는 편이 낫습니다. 단순한 내부 helper까지 interface를 만들면 이동 경로만 늘고 책임은 더 흐려질 수 있습니다.

| 경계                      | 안쪽이 알고 싶은 것  | 감추고 싶은 구현 세부                  |
| ------------------------- | -------------------- | -------------------------------------- |
| API → Application         | 주문 생성 유스케이스 | HTTP body, status, header              |
| Application → Domain      | 유효한 주문 상태     | transaction annotation, repository API |
| Application → Persistence | 저장/조회 계약       | JPA query method, EntityManager        |
| Application → External    | 결제 요청 계약       | vendor SDK, HTTP client                |

### 코드 리뷰에서 확인할 질문

의존 방향을 볼 때는 “폴더가 몇 개인가”보다 **이 변경의 이유가 왜 여기까지 전파되는가**를 묻습니다. Controller가 business rule을 알아야 하거나 Domain이 framework 타입을 반환한다면 경계가 새고 있을 가능성이 큽니다. 반대로 작은 애플리케이션에서 실제 변경 이유가 하나뿐인데 계층을 지나치게 쪼개는 것도 비용입니다.
