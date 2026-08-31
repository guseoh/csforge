---
kind: concept
contentKey: java.core.modern-language.default-static-interface-methods
topicContentKey: java.core.modern-language
slug: default-static-interface-methods
title: "Default and static interface methods"
summary: "interface에 구현을 둘 수 있는 이유와 default 충돌·static 호출 규칙을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: default·static method와 interface inheritance 규칙 확인
---
# Default and static interface methods

interface는 구현 클래스가 따라야 할 계약을 표현하는 데 사용됩니다. 그런데 이미 많은 구현체가 사용 중인 interface에 새로운 메서드를 하나 추가하면 기존 구현체가 전부 새 메서드를 구현해야 하는 문제가 생길 수 있습니다.

`default method`는 이런 상황에서 **interface가 기본 구현을 제공할 수 있게 하는 기능**입니다. `static interface method`는 interface와 밀접한 도우미 기능을 그 interface 이름 아래에 둘 수 있게 합니다. 둘 다 interface 안에 구현 코드가 있다는 점은 같지만 호출과 상속 방식은 다릅니다.

### default method는 구현체가 물려받을 수 있는 기본 동작이다

```java
interface Auditable {
    default String label() {
        return "audit";
    }
}

class Order implements Auditable {
}

System.out.println(new Order().label()); // audit
```

`Order`가 `label()`을 직접 구현하지 않아도 interface의 default implementation을 사용할 수 있습니다. 필요하면 구현 클래스가 override해서 자신에게 맞는 동작으로 바꿀 수도 있습니다.

이 기능은 특히 기존 interface를 진화시킬 때 유용합니다. 새 메서드를 추가하면서도 "모든 기존 구현체가 반드시 각자 다른 구현을 제공해야 하는가?"에 대한 답이 아니면 합리적인 기본 동작을 제공할 수 있습니다.

### default method가 두 개 겹치면 어떤 구현을 쓸지 정해야 한다

Java는 여러 interface를 구현할 수 있기 때문에 같은 signature의 default method가 서로 충돌할 수 있습니다.

```java
interface A {
    default String name() { return "A"; }
}

interface B {
    default String name() { return "B"; }
}

class Service implements A, B {
    @Override
    public String name() {
        return A.super.name();
    }
}
```

`Service`는 `A`와 `B` 중 어떤 기본 구현을 사용할지 스스로 결정해야 합니다. 이렇게 명시적으로 override하면 충돌이 숨겨지지 않습니다.

충돌 규칙을 문제에서 판단할 때는 다음 순서의 의미를 기억하면 좋습니다.

- 클래스가 이미 구체적인 메서드를 제공한다면 interface default보다 클래스 메서드가 우선합니다.
- interface끼리는 더 구체적인 하위 interface의 default가 적용될 수 있습니다.
- 서로 우열을 정할 수 없는 default가 충돌하면 구현 클래스가 직접 해결해야 합니다.

단순 암기보다 "같은 호출에 두 구현 후보가 보일 때 Java가 하나를 안전하게 정할 수 있는가"를 보는 것이 핵심입니다.

### static interface method는 구현 객체에 상속되는 instance method가 아니다

```java
interface Auditable {
    static boolean valid(String value) {
        return value != null && !value.isBlank();
    }
}

boolean ok = Auditable.valid("order");
```

static method는 interface 이름으로 호출합니다. 구현 객체에서 다형적으로 dispatch되는 default method와 성격이 다릅니다.

```java
class Order implements Auditable { }

// Order.valid("order");      // interface static method를 이런 식으로 상속받는 개념이 아님
// new Order().valid("order");
```

따라서 "interface 안에 구현이 있다"는 이유만으로 default와 static을 같은 상속 규칙으로 생각하면 안 됩니다.

### default method를 넣을 수 있다고 모든 공통 코드를 넣어야 하는 것은 아니다

interface의 기본 구현이 너무 많은 상태나 숨은 전제에 의존하면 계약이 오히려 이해하기 어려워질 수 있습니다. default method가 여러 구현체에 **정말 자연스러운 공통 의미**를 제공하는지 먼저 봐야 합니다.

예를 들어 어떤 구현은 저장소를 호출해야 하고 다른 구현은 외부 API를 호출해야 하는데 억지로 default method 하나에 흐름을 넣으면 각 구현의 책임이 흐려질 수 있습니다.

독립적인 계산 도우미라면 static method나 별도 utility가 나을 수 있고, 중요한 비즈니스 동작이라면 구현 객체가 명시적으로 책임지는 편이 더 읽기 쉬울 수 있습니다.

### Spring의 proxy나 다중 Bean 문제와는 다른 층위다

Spring에서도 interface가 많이 등장하지만 Java의 default method 규칙 자체는 **Java 언어의 메서드 상속·선택 규칙**입니다. Spring AOP proxy가 어떤 메서드를 가로채는지, Bean이 어떤 구현체를 주입하는지는 별도의 framework 동작입니다.

이 층위를 분리하면 면접에서도 "Java interface default method" 질문에 Spring 기능을 섞어 답하는 실수를 줄일 수 있습니다.

### 문제를 풀 때 확인할 것

1. 호출하려는 메서드가 default인지 static인지 구분한다.
2. 구현 클래스가 같은 메서드를 직접 정의했는지 본다.
3. 여러 interface가 같은 default를 제공하는지 확인한다.
4. 더 구체적인 interface가 있는지 본다.
5. 충돌을 해결하는 override와 `InterfaceName.super.method()` 호출이 있는지 확인한다.

### 자주 헷갈리는 부분

- interface static method는 구현 클래스가 상속받아 instance method처럼 호출하는 기능이 아닙니다.
- default method가 여러 개 충돌한다고 Java가 임의의 하나를 고르지는 않습니다.
- default method는 interface에 instance field를 추가하는 기능이 아닙니다.
- default implementation을 제공할 수 있다는 사실과 그 위치가 좋은 설계라는 판단은 별개입니다.

### 면접에서 설명한다면

Default method는 interface가 기본 instance 구현을 제공할 수 있게 하여 기존 interface를 진화시키는 데 도움을 주는 기능입니다. 여러 interface의 default가 충돌하면 클래스 메서드 우선, 더 구체적인 interface 등의 규칙을 적용하고 그래도 모호하면 구현 클래스가 직접 override해야 합니다. Static interface method는 interface 이름으로 호출하는 정적 메서드로 default method처럼 구현 객체에 상속되는 것이 아닙니다.
