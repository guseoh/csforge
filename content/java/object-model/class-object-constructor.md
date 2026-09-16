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
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스와 생성자 규칙 확인
  - url: "https://tecoble.techcourse.co.kr/post/2021-05-17-constructor/"
    title: "Tecoble: java에서 객체를 생성하는 다양한 방법"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 생성자 overload와 이름 있는 생성 API를 비교하는 입문 예시 보충
---
# 클래스, 객체와 생성자

클래스는 **어떤 상태를 가지고 어떤 동작을 제공할지 정의하는 타입**이고, 객체는 실행 중 실제로 만들어진 하나의 인스턴스입니다. 같은 클래스로 여러 객체를 만들면 각 객체는 자신의 인스턴스 상태를 가질 수 있습니다.

```java
class Order {
    private long id;
    private int quantity;
}

Order first = new Order();
Order second = new Order();
```

`Order`라는 클래스 정의는 하나지만 `first`와 `second`가 가리키는 객체는 서로 다릅니다.

### 생성자는 객체의 초기 상태를 만든다

생성자는 단순히 필드에 값을 복사하는 문법으로만 볼 필요가 없습니다. 객체가 생성될 때 반드시 필요한 값과 조건이 있다면, 생성 과정에서 유효한 상태를 만들 수 있습니다.

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

이 생성자를 정상적으로 통과한 `Order`는 최소한 `id > 0`, `quantity > 0`이라는 조건을 만족합니다. 객체가 계속 지켜야 하는 이런 조건을 **불변 조건(invariant)** 이라고 부릅니다.

필수 값을 나중의 setter 호출에 맡기면 중간에 유효하지 않은 상태가 생기거나 초기화를 빠뜨릴 수 있습니다. 객체가 존재하려면 반드시 필요한 값이라면 생성 시점에 요구할 수 있는지 먼저 보는 편이 안전합니다.

### 변수 선언과 객체 생성은 다른 일이다

```java
Order order;
```

이 코드는 `Order` 타입의 지역 변수를 선언했을 뿐이며 객체를 만들지 않습니다.

```java
Order order = new Order(1L, 2);
```

`new Order(...)`는 새 객체 생성을 시작하는 클래스 인스턴스 생성 표현식이고, 생성자가 객체 초기화 과정에 참여합니다. 그 결과 얻은 참조 값이 `order` 변수에 저장됩니다.

```text
new Order(1, 2)
      │
      ├─ 객체 생성·초기화 과정
      ├─ 생성자 실행
      ▼
 Order 객체
      ▲
      │ 참조 값
    order
```

객체가 실제 JVM 메모리에서 어떤 방식으로 배치되는지는 JVM 구현의 문제입니다. Java 언어 수준에서는 변수 선언, 객체 생성 표현식, 생성자 실행을 구분해서 이해하면 됩니다.

### 기본 생성자는 항상 생기는 것이 아니다

클래스에 생성자를 하나도 선언하지 않으면 컴파일러가 기본 생성자를 제공할 수 있습니다.

```java
class Member {
}

Member member = new Member();
```

하지만 생성자를 하나라도 직접 선언하면 매개변수 없는 생성자가 자동으로 함께 추가되는 것은 아닙니다.

```java
class Member {
    Member(String name) {}
}

// new Member(); // 컴파일 오류
```

특정 프레임워크가 매개변수 없는 생성자를 요구할 수는 있지만, 그것은 프레임워크 계약이며 Java 언어의 기본 생성자 규칙과는 구분해야 합니다.

### 생성 경로의 의미가 여러 개라면 이름을 줄 수 있다

매개변수만으로 생성 의도를 읽기 어렵다면 정적 팩터리 메서드처럼 이름 있는 생성 API를 검토할 수 있습니다.

```java
Order order = Order.draft(1L, 2);
```

그렇다고 생성자보다 정적 팩터리가 항상 좋은 것은 아닙니다. 생성 규칙이 단순하면 생성자가 가장 직접적입니다. 핵심은 **객체가 어떤 상태로 태어나야 하는지와 호출부에서 그 생성 의도가 충분히 드러나는지**입니다.
