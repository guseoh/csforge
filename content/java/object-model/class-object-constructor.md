---
kind: concept
contentKey: java.core.object-model.class-object-constructor
topicContentKey: java.core.object-model
slug: class-object-constructor
title: "클래스, 객체와 생성자"
summary: "클래스를 객체의 설계로 이해하고 생성자가 새 객체를 유효한 초기 상태로 만드는 역할을 구분한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "JLS 8 Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스와 생성자 규칙 확인
---
# 클래스, 객체와 생성자

Java에서 클래스와 객체를 단순히 “붕어빵 틀과 붕어빵”으로만 기억하면 실제 설계에서 필요한 판단까지 이어지기 어렵습니다. 클래스는 **어떤 상태를 가지고 어떤 동작을 제공할지 정의하는 타입**이고, 객체는 그 클래스를 바탕으로 실제 실행 중 만들어진 하나의 인스턴스입니다.

```java
class Order {
    private long id;
    private int quantity;
}

Order first = new Order();
Order second = new Order();
```

`Order`라는 클래스는 하나지만 `first`, `second`가 가리키는 객체는 서로 다른 두 객체입니다. 각 객체는 자신의 인스턴스 필드 상태를 가질 수 있습니다.

### 생성자는 객체를 사용할 수 있는 상태로 만드는 곳이다

생성자는 단순히 필드에 값을 복사하는 문법이 아닙니다. **새 객체가 만들어질 때 필요한 초기 조건을 만족시키는 진입점**으로 보는 편이 좋습니다.

```java
class Order {
    private final long id;
    private int quantity;

    Order(long id, int quantity) {
        if (id <= 0) {
            throw new IllegalArgumentException("id는 양수여야 합니다.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity는 양수여야 합니다.");
        }
        this.id = id;
        this.quantity = quantity;
    }
}
```

이 생성자를 통과한 `Order`는 최소한 `id > 0`, `quantity > 0`이라는 규칙을 만족합니다. 이런 식으로 객체가 항상 지켜야 할 조건을 **불변 조건(invariant)** 이라고 부릅니다.

객체를 만든 뒤 setter를 여러 번 호출해야 비로소 유효해지는 구조는 중간에 잘못된 상태가 존재할 수 있습니다.

```java
Order order = new Order();
order.setId(10L);
// 여기에서 quantity 설정을 빼먹을 수 있음
```

필수 값이 있다면 생성 과정에서 함께 받는 편이 객체의 유효성을 지키기 쉽습니다.

### `new`는 변수 선언과 다른 일이다

```java
Order order;
```

이 코드는 `Order` 타입의 지역 변수만 선언한 것입니다. 아직 `Order` 객체가 만들어진 것은 아닙니다.

```java
Order order = new Order(1L, 2);
```

`new Order(...)`가 객체 생성을 시작하고 생성자가 실행됩니다. 그 결과 얻은 참조 값이 `order` 변수에 저장됩니다.

```text
new Order(1, 2)
      │
      ├─ 객체 생성 및 필드 초기화 과정
      ├─ 생성자 실행
      ▼
Order 객체 ─────> 참조 값 ─────> order 변수
```

정확한 메모리 할당 방식은 JVM 구현의 영역입니다. Java 언어 학습에서는 `new`가 객체 생성 표현식이고 생성자가 초기화 과정에 참여한다는 수준을 구분하면 됩니다.

### 기본 생성자는 언제 생길까

생성자를 하나도 선언하지 않은 클래스에는 컴파일러가 기본 생성자를 제공할 수 있습니다.

```java
class Member {
}

Member member = new Member();
```

하지만 생성자를 하나라도 직접 선언하면 매개변수 없는 생성자가 자동으로 추가되는 것이 아닙니다.

```java
class Member {
    Member(String name) {}
}

// new Member(); // 컴파일 오류
```

프레임워크가 매개변수 없는 생성자를 요구하는 경우가 있지만, 그것은 해당 프레임워크의 규칙입니다. Java 언어 자체의 객체 설계와 섞어서 “모든 엔티티는 기본 생성자가 필요하다”처럼 일반화하면 안 됩니다.

### 실무에서 생성자를 볼 때 확인할 것

생성자를 설계하거나 리뷰할 때는 “필드가 몇 개냐”보다 다음 질문이 중요합니다.

- 이 객체가 존재하려면 반드시 필요한 값은 무엇인가?
- 잘못된 값을 생성 시점에 막을 수 있는가?
- 생성 뒤에 별도 setter를 호출해야만 유효해지는 상태가 있는가?
- 생성 로직이 너무 복잡해져 별도의 이름 있는 생성 API가 더 이해하기 쉬운가?

생성자가 객체의 유효성을 지키는 첫 경계라는 점을 이해하면 정적 팩터리 메서드나 빌더를 언제 고려해야 하는지도 자연스럽게 연결됩니다.
