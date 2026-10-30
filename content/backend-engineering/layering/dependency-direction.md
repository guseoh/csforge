---
kind: concept
contentKey: backend.core.layering.dependency-direction
topicContentKey: backend.core.layering
slug: dependency-direction
title: "의존성 방향"
summary: "계층을 폴더 이름이 아니라 변경 이유와 의존성의 방향으로 나누고, API·애플리케이션·도메인이 바깥 구현 세부에 끌려가지 않게 설계하는 기준을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://learn.microsoft.com/ko-kr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"
    title: "Microsoft Learn: DDD 지향 마이크로 서비스 디자인"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "애플리케이션·도메인·인프라 계층의 책임과 도메인 모델을 인프라 세부에서 분리하는 원칙을 확인한다."
---
# 의존성 방향

백엔드 코드를 `controller`, `service`, `repository` 폴더로 나눴다고 계층이 자동으로 분리되는 것은 아닙니다. 더 중요한 기준은 **어떤 변경이 어디까지 전파되어야 하는가**입니다. HTTP 응답 형식이 바뀌었다고 도메인 규칙까지 수정해야 하거나, JPA 구현을 바꿨다고 API 모델까지 흔들린다면 패키지는 나뉘어 있어도 책임은 강하게 결합된 상태입니다.

CSForge에서 기본으로 삼는 방향은 다음과 같습니다.

```text
API
 │ HTTP parsing / validation / request-response mapping
 ▼
Application
 │ use-case orchestration / transaction boundary
 ▼
Domain
   invariant / valid creation / state transition

Infrastructure
 └─ DB, HTTP client 같은 바깥 기술을 안쪽에서 필요한 계약에 맞춰 구현
```

이 그림은 단순한 호출 순서를 뜻하지 않습니다. 실행 중에는 애플리케이션 서비스가 저장소를 호출하지만, **도메인 규칙이 JPA나 HTTP 타입을 알아야 하는 방향으로 의존성이 뒤집히지 않게 한다**는 것이 핵심입니다.

### 변경 이유를 계층마다 분리한다

주문 생성 요청을 예로 들면 API 계층은 JSON을 읽고 입력 형식을 검증하며 HTTP 상태 코드를 선택합니다. 애플리케이션 계층은 주문 생성 유스케이스를 조정하고 저장소 호출과 트랜잭션 경계를 관리합니다. 도메인은 "빈 주문은 만들 수 없다"처럼 어느 진입점에서 호출해도 지켜야 할 규칙을 소유합니다.

이 규칙을 Controller에 두면 같은 기능을 배치나 관리 도구에서 사용할 때 다시 구현해야 합니다. 반대로 도메인 객체가 `ResponseEntity`, `JpaRepository`, 외부 SDK 타입을 직접 알기 시작하면 도메인 규칙을 테스트하고 이해하는 데 바깥 기술까지 함께 끌려옵니다.

### API 모델과 영속성 모델을 바로 연결하지 않는다

```java
@PostMapping("/orders")
public OrderEntity create(@RequestBody OrderEntity entity) {
    return orderRepository.save(entity);
}
```

짧은 코드지만 외부 요청이 영속성 모델을 직접 구성합니다. 클라이언트가 `status`, `createdAt`처럼 서버가 결정해야 할 값을 보내는 문제도 생길 수 있고, 엔티티 컬럼 변경이 곧 API 계약 변경으로 이어집니다.

대신 다음처럼 경계를 통과할 때 필요한 의미만 변환할 수 있습니다.

```text
HTTP Request
   ↓
Request DTO
   ↓
Application Command
   ↓
Domain creation / behavior
   ↓
Persistence adapter
```

각 단계가 분리되면 API 표현, 유스케이스 입력, 도메인 상태, DB 저장 구조를 서로 다른 변경 이유로 다룰 수 있습니다.

### 모든 곳에 인터페이스를 만드는 것이 목적은 아니다

의존성 방향을 지킨다고 모든 클래스 앞에 인터페이스를 붙일 필요는 없습니다. 실제로 바깥 구현 세부를 차단해야 하거나 여러 구현을 선택해야 하는 경계에 계약을 두면 됩니다. 단순 내부 보조 클래스까지 기계적으로 추상화하면 이동 경로만 늘고 책임은 오히려 흐려질 수 있습니다.

| 경계 | 안쪽이 알고 싶은 것 | 바깥에 남겨 둘 세부 |
| --- | --- | --- |
| API → Application | 어떤 유스케이스를 수행할지 | HTTP body, header, status |
| Application → Domain | 어떤 상태 변화가 유효한지 | 트랜잭션 annotation, 프레임워크 타입 |
| Application → Persistence | 어떤 데이터를 저장·조회할지 | JPA query method, `EntityManager` |
| Application → External | 어떤 외부 기능이 필요한지 | 공급자 SDK, HTTP client |

코드 리뷰에서는 "이 클래스가 이 객체를 사용해야 하는가?"와 함께 **"이 클래스가 바깥 구현 세부까지 알아야 하는가?"**를 묻는 것이 좋습니다. 계층의 목적은 파일을 많이 나누는 것이 아니라, 서로 다른 변경 이유가 필요 이상으로 안쪽 정책까지 전파되지 않게 만드는 것입니다.
