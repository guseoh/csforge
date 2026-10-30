---
kind: concept
contentKey: spring.core.why.coupling
topicContentKey: spring.core.why
slug: coupling
title: "결합도와 변경 비용"
summary: "직접 생성과 구체 구현 의존이 왜 변경을 여러 곳으로 전파하는지 보고, 무엇을 실제로 분리해야 하는지 판단한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html"
    title: "Spring Framework Reference: Dependencies and Configuration in Detail"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "생성자·factory 의존성을 외부에서 설정하는 Spring의 기본 협력 구조 확인"
---
# 결합도와 변경 비용

결합도가 문제라는 말은 “객체끼리 연결되면 나쁘다”는 뜻이 아닙니다. 주문 서비스가 Repository를 전혀 모르고 주문을 저장할 수는 없습니다. 실제 문제는 **한 변경 이유가 관련 없는 코드까지 함께 흔드는가**입니다.

다음 코드는 주문 서비스가 JDBC 구현을 직접 선택합니다.

```java
class OrderService {
    private final OrderRepository repository = new JdbcOrderRepository(dataSource());
}
```

개발 중 메모리 기반 Repository를 쓰고 싶거나 운영 환경에서 JPA 구현으로 바꾸고 싶다면 `OrderService`를 수정해야 합니다. Repository 구현 선택이라는 인프라 결정이 주문 기능 코드의 변경 이유가 됩니다.

### 직접 생성은 의존성뿐 아니라 선택 정책까지 묶는다

`new` 자체가 문제인 것은 아닙니다. `Money`, `OrderLine`처럼 서비스가 자신의 내부 값 객체를 생성하는 것은 자연스럽습니다. 구분해야 하는 것은 **협력 객체의 구현을 선택하는 생성**입니다.

```java
// 내부 값 생성: OrderService의 책임일 수 있다.
Order order = Order.place(memberId, lines);

// 외부 협력 구현 선택: 다른 책임일 가능성이 높다.
PaymentGateway gateway = new KakaoPayGateway(apiKey);
```

두 번째 코드를 서비스가 소유하면 결제 사업자 변경, 인증 정보 설정, 테스트 대역 선택이 모두 서비스 변경으로 이어집니다.

### 결합도는 변경 시나리오로 보는 것이 가장 정확하다

| 변경                     | 직접 생성 구조             | 외부 조립 구조              |
| ------------------------ | -------------------------- | --------------------------- |
| DB 구현 교체             | 주문 기능 클래스 수정      | 조립·설정 코드 변경         |
| 테스트용 가짜 구현 사용  | 운영 코드 우회 필요        | 생성자에 가짜 구현 전달     |
| 외부 API 인증 정보 변경  | 생성 코드와 섞일 수 있음   | 설정 경계에서 처리          |
| 업무 규칙 변경           | 서비스·도메인 변경         | 동일하게 서비스·도메인 변경 |

마지막 행이 중요합니다. DI를 적용했다고 업무 규칙 변경까지 사라지는 것은 아닙니다. **서로 독립적으로 바뀔 이유가 있는 책임을 분리**했을 뿐입니다.

### 인터페이스를 만들면 자동으로 느슨해지는 것도 아니다

```java
interface PaymentGateway { ... }

class OrderService {
    private final PaymentGateway gateway = new StripePaymentGateway();
}
```

타입은 인터페이스지만 구현 선택은 여전히 서비스가 합니다. 반대로 구체 클래스를 생성자로 받더라도 외부에서 수명·설정을 조립할 이유가 충분할 수 있습니다. “인터페이스 사용 여부”와 “의존 객체의 구현을 누가 선택하는가”는 같은 질문이 아닙니다.

### 지나친 분리도 비용이 있다

모든 클래스 앞에 interface/factory/provider를 추가하면 코드 탐색이 어려워지고 실제 변경점보다 추상화 수가 많아집니다. 결합도를 낮추는 목적은 미래 가능성을 모두 대비하는 것이 아니라 **현재 독립적으로 변경되는 책임을 분리하는 것**입니다.

백엔드 코드 리뷰에서는 “이 클래스가 이 객체를 사용해야 하는가?”와 “이 클래스가 이 구현을 선택해야 하는가?”를 따로 물으면 좋습니다. 첫 질문의 답이 그렇더라도 두 번째 답은 아닐 수 있고, 바로 그 지점에서 Spring의 외부 조립이 의미를 갖습니다.
