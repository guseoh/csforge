---
kind: concept
contentKey: java.core.object-model.initialization-order-constructor-chaining
topicContentKey: java.core.object-model
slug: initialization-order-constructor-chaining
title: "초기화 순서와 생성자 연결"
summary: "클래스 초기화와 객체 초기화 단계를 구분하고 this·super 생성자 호출이 이어지는 순서를 추적한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.4"
    title: "JLS 12.4 Initialization of Classes and Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스 초기화 시점과 순서 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5"
    title: "JLS 12.5 Creation of New Class Instances"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 인스턴스 생성과 생성자 실행 순서 확인
---
# 초기화 순서와 생성자 연결

Java에서 “초기화”라는 말은 하나의 단계만 뜻하지 않습니다. 클래스의 static 상태가 준비되는 **클래스 초기화**와, `new`로 객체를 만들 때 인스턴스 필드와 생성자가 처리되는 **객체 초기화**를 구분해야 합니다.

### 클래스 초기화는 객체 생성보다 별도의 과정이다

```java
class Counter {
    static int base = loadBase();
    int value = base;

    Counter() {
        value++;
    }
}
```

`Counter` 클래스가 처음 적극적으로 사용될 때 static 필드 초기화와 static 초기화 블록이 실행됩니다. 이후 `new Counter()`를 할 때마다 인스턴스 필드 초기화와 생성자가 실행됩니다.

즉 static 초기화가 객체마다 반복되는 것이 아닙니다.

```text
클래스 초기화
static 필드 / static 블록
        │
        ▼
클래스 사용 가능
        │
        ├─ new → 객체 1 초기화
        └─ new → 객체 2 초기화
```

정확한 클래스 초기화 시점에는 언어 명세의 조건이 있으므로 단순히 “클래스 파일을 읽는 순간 static이 실행된다”고 외우면 안 됩니다. JVM의 class loading과 initialization 단계는 별도 JVM 주제에서 더 깊게 다룹니다.

### 객체 생성에서는 상위 클래스 초기화가 먼저 연결된다

상속 관계가 있는 객체를 만들면 하위 클래스 생성자만 바로 실행되는 것이 아닙니다.

```java
class Parent {
    Parent() {
        System.out.println("Parent");
    }
}

class Child extends Parent {
    Child() {
        System.out.println("Child");
    }
}

new Child();
```

일반적으로 상위 클래스 생성자 과정이 먼저 수행된 뒤 하위 클래스 생성자 본문으로 이어집니다. 그래서 출력은 `Parent`, `Child` 순서입니다.

### `this(...)`와 `super(...)`는 생성 경로를 연결한다

같은 클래스의 다른 생성자를 호출할 때는 `this(...)`, 직접 상위 클래스 생성자를 선택할 때는 `super(...)`를 사용합니다.

```java
class Order {
    private final long id;
    private final int quantity;

    Order(long id) {
        this(id, 1);
    }

    Order(long id, int quantity) {
        this.id = id;
        this.quantity = quantity;
    }
}
```

`Order(10L)`은 `Order(10L, 1)`로 생성 책임을 모읍니다. 이런 방식은 같은 검증·초기화 코드를 여러 생성자에 복사하는 일을 줄여 줍니다.

Java 25의 생성자 본문 규칙은 예전 설명보다 유연해진 부분이 있으므로 “생성자 첫 줄에는 무조건 `super()`나 `this()`만 올 수 있다”는 오래된 문장을 일반 규칙처럼 사용하면 안 됩니다. 다만 객체가 완전히 초기화되기 전에 현재 객체를 잘못 사용하는 것은 여전히 제한됩니다. 구체적인 문법 문제는 Java 25 명세를 기준으로 판단해야 합니다.

### 생성자에서 override 가능한 메서드를 호출하면 위험하다

상위 클래스 생성자가 override 가능한 인스턴스 메서드를 호출하면 하위 클래스의 override 메서드가 실행될 수 있습니다. 그런데 그 시점에는 하위 클래스의 필드 초기화가 아직 끝나지 않았을 수 있습니다.

```java
class Parent {
    Parent() {
        print();
    }

    void print() {}
}

class Child extends Parent {
    private String name = "kim";

    @Override
    void print() {
        System.out.println(name); // 생성 중에는 기대와 다른 상태일 수 있음
    }
}
```

그래서 생성 중인 객체에서 다형적 동작을 호출하는 것은 피하는 편이 안전합니다.

### 문제를 풀 때는 단계별로 적는다

초기화 순서 문제가 나오면 머릿속으로 한 번에 계산하지 말고 다음을 나눠 적습니다.

1. 해당 클래스의 static 초기화가 이미 되었는가?
2. 상위 클래스 객체 초기화 단계가 무엇인가?
3. 현재 클래스의 인스턴스 필드/초기화 블록은 언제 실행되는가?
4. 어떤 생성자 경로가 `this` 또는 `super`로 연결되는가?
5. 생성자 안에서 다형적 메서드 호출이 있는가?

이렇게 상태를 나누면 복잡한 출력 순서 문제도 추적하기 쉬워집니다.
