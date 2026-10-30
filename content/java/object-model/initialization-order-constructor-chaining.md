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
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.7.1"
    title: "JLS 8.8.7.1 Constructor Invocations"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "Java 25의 유연한 생성자 본문(flexible constructor body)과 초기 생성 문맥(early construction context) 규칙 확인"
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.5.6.1"
    title: "JLS 6.5.6.1 Simple Expression Names"
    referenceType: OFFICIAL
    language: en
    displayOrder: 4
    relationNote: 전반부의 필드 단순 대입은 현재 클래스에 선언되고 초기화 식이 없는 필드로 제한되는 규칙 확인
---
# 초기화 순서와 생성자 연결

Java에서 “초기화”라는 말은 하나의 단계만 뜻하지 않습니다. 클래스의 `static` 상태가 준비되는 **클래스 초기화**와, `new`로 객체를 만들 때 인스턴스 필드와 생성자가 처리되는 **객체 초기화**를 구분해야 합니다.

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

`Counter` 클래스가 처음 적극적으로 사용될 때 `static` 필드 초기화와 `static` 초기화 블록이 실행됩니다. 이후 `new Counter()`를 할 때마다 인스턴스 필드 초기화와 생성자가 실행됩니다.

즉 `static` 초기화가 객체마다 반복되는 것이 아닙니다.

클래스 초기화가 끝난 뒤 객체를 여러 번 만들어도 정적 초기화는 객체마다 반복되지 않습니다. 각 `new`는 별도의 객체 초기화 경로를 진행합니다.

정확한 클래스 초기화 시점에는 언어 명세의 조건이 있으므로 단순히 “클래스 파일을 읽는 순간 `static`이 실행된다”고 외우면 안 됩니다. JVM의 클래스 로딩과 초기화 단계는 별도 JVM 주제에서 더 깊게 다룹니다.

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

Java 25에서는 명시적인 `this(...)`/`super(...)` 앞에 생성자 전반부(prologue)를 둘 수 있습니다. 인자 검증이나 허용된 현재 클래스 필드의 직접 대입은 가능하지만, 초기 생성 문맥에서 현재 객체의 인스턴스 메서드를 호출하거나 현재 객체를 임의로 읽고 노출할 수는 없습니다. 따라서 “첫 줄은 무조건 `super()`/`this()`”도, “생성자 앞부분에서 무엇이든 가능”도 정확하지 않습니다.

직접 대입도 현재 클래스에 선언되어 있고 **선언 시 초기화 식이 없는 필드**에 대한 단순 대입으로 제한됩니다. 상속된 필드나 `int x = 2;`처럼 초기화 식이 있는 필드에 전반부에서 대입할 수 없으며, `x++`처럼 기존 값을 읽는 갱신도 허용되지 않습니다. 전반부의 허용된 대입이 있다고 해서 상위 생성자의 재정의 메서드 호출이 일반적으로 안전해지는 것은 아닙니다.

객체 메모리가 준비되면 상속된 필드를 포함한 모든 인스턴스 필드에 먼저 기본값이 들어갑니다. 각 생성자 경로의 prologue와 `this(...)` 위임 또는 `super(...)` 호출을 따라 상위 초기화를 진행하고, 해당 클래스의 상위 생성자 호출이 반환되면 그 클래스의 필드 초기화 식과 인스턴스 초기화 블록을 **소스에 나온 순서**로 실행한 뒤 생성자 후반부(epilogue)를 실행합니다. `this(...)`로 위임한 생성자에서는 이 초기화를 중복 실행하지 않고 위임받은 생성자가 처리합니다. 전반부의 허용된 직접 대입과 `String name = "kim"` 같은 일반 필드 초기화 식은 서로 다른 시점입니다.

명시적인 생성자 호출이 없는 일반 생성자는 암시적 `super()` 뒤에 본문 전체를 실행합니다. 단순히 출력문이 앞에 있다는 이유로 전반부가 되는 것은 아닙니다. 명시적 `this(...)`와 `super(...)`를 한 생성자에서 연달아 호출하거나 순환 위임하는 것도 허용되지 않습니다.

### Java 25의 같은 객체를 따라 생성 경로를 추적한다

다음은 앞선 코드와 독립된 예제입니다. 클래스 초기화는 이미 끝났다고 두고 `new Child()` 한 번만 추적합니다. 전반부의 허용된 출력, `this` 위임과 `super` 호출, 필드 초기화 식과 블록, 두 생성자의 후반부를 구별할 수 있습니다.

```java
class Parent {
    Parent() { System.out.println("parent"); }
}

class Child extends Parent {
    String name = initialName();
    { System.out.println("block:" + name); }

    Child() {
        System.out.println("noarg prologue");
        this("kim");
        System.out.println("noarg epilogue");
    }

    Child(String name) {
        if (name == null) throw new IllegalArgumentException();
        System.out.println("target prologue");
        super();
        this.name = name;
        System.out.println("target epilogue:" + this.name);
    }

    static String initialName() {
        System.out.println("field");
        return "unset";
    }
}

new Child();
```

```csforge-viz
{
  "version": 1,
  "type": "java-object-model",
  "example": "initialization",
  "title": "Java 25 생성자 연결과 초기화 8단계",
  "description": "객체의 name은 기본값 null에서 필드 초기화 식의 unset, 생성자 대입의 kim으로 바뀝니다. this 위임으로 필드 초기화 식과 블록을 두 번 실행하지 않습니다."
}
```

출력 순서는 `noarg prologue` → `target prologue` → `parent` → `field` → `block:unset` → `target epilogue:kim` → `noarg epilogue`입니다. `Child(String name)`의 매개변수와 객체의 `name` 필드는 별개입니다.

### 생성자에서 재정의 가능한 메서드를 호출하면 위험하다

상위 클래스 생성자가 재정의 가능한 인스턴스 메서드를 호출하면 하위 클래스의 재정의 메서드가 실행될 수 있습니다. 그런데 그 시점에는 하위 클래스의 필드 초기화가 아직 끝나지 않았을 수 있습니다.

다음은 앞의 생성 경로 예제와 독립된 코드입니다. 전반부의 직접 대입이 없으므로 기본값과 필드 초기화 식의 차이를 관찰합니다.

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
        System.out.println(name);
    }
}
```

이 선언 뒤에 `Child child = new Child(); child.print();`를 실행하면 `null`, `kim` 순서로 출력됩니다.

| 단계 | `Child.name` | 관찰 |
| --- | --- | --- |
| 필드 기본값 설정 | `null` | 아직 필드 초기화 식 실행 전 |
| `Parent()`가 `print()` 호출 | `null` | 런타임 타입의 `Child.print()`로 dispatch되어 `null` 출력 |
| `Parent()` 반환 후 `Child` 필드 초기화 | `"kim"` | `name = "kim"` 실행 |
| 생성 완료 후 `child.print()` | `"kim"` | `kim` 출력 |

이 예제에는 전반부의 직접 필드 대입이 없습니다. 일반 필드 초기화가 상위 생성자 호출보다 먼저 실행되는 것은 아니므로, 생성 중인 객체에서 재정의 가능한 메서드를 호출하는 것은 피하는 편이 안전합니다.

### 문제를 풀 때는 단계별로 적는다

초기화 순서 문제가 나오면 머릿속으로 한 번에 계산하지 말고 다음을 나눠 적습니다.

1. 해당 클래스의 `static` 초기화가 이미 되었는가?
2. 같은 객체에서 상위 클래스 부분의 초기화 경로는 무엇인가?
3. 현재 클래스의 인스턴스 필드/초기화 블록은 언제 실행되는가?
4. 어떤 생성자 경로가 `this` 또는 `super`로 연결되는가?
5. 생성자 안에서 다형적 메서드 호출이 있는가?

이렇게 상태를 나누면 복잡한 출력 순서 문제도 추적하기 쉬워집니다.
