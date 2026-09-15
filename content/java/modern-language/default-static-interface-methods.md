---
kind: concept
contentKey: java.core.modern-language.default-static-interface-methods
topicContentKey: java.core.modern-language
slug: default-static-interface-methods
title: "Interface의 default·static 메서드"
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
# Interface의 default·static 메서드

Interface는 구현 타입이 따라야 할 계약을 표현하지만, 현대 Java에서는 메서드 구현도 일부 가질 수 있습니다. 특히 `default` method는 구현체가 상속받을 수 있는 기본 instance 동작을 제공하고, `static` method는 interface 자체에 속하는 정적 동작을 제공합니다.

둘 다 interface 본문에 구현 코드가 있다는 점은 같지만 **호출 방식과 상속 규칙은 다릅니다.**

### default method는 구현체가 물려받는 기본 동작이다

```java
interface Auditable {
    default String label() {
        return "audit";
    }
}

class Order implements Auditable { }

System.out.println(new Order().label()); // audit
```

`Order`가 `label()`을 직접 구현하지 않아도 default implementation을 사용할 수 있고, 필요하면 override할 수 있습니다.

이 기능은 기존 interface를 진화시킬 때 특히 의미가 있습니다. 이미 많은 구현체가 있는 interface에 새 메서드를 추가하면서 모든 구현체가 반드시 서로 다른 구현을 제공할 필요가 없다면 합리적인 기본 동작을 제공할 수 있습니다.

### 여러 default 구현이 보이면 선택 규칙이 필요하다

Java는 여러 interface를 구현할 수 있으므로 같은 signature의 default method가 겹칠 수 있습니다.

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

서로 우열을 정할 수 없는 `A`와 `B`의 default가 충돌하므로 `Service`가 직접 해결합니다.

충돌을 판단할 때는 다음 원리를 이해하면 됩니다. 클래스가 이미 같은 구체 메서드를 제공하면 그 클래스 메서드가 interface default보다 우선하고, interface 계층에서는 더 구체적인 하위 interface의 구현을 선택할 수 있습니다. 그래도 서로 관련 없는 default 후보가 남으면 구현 클래스가 명시적으로 override해야 합니다.

### static interface method는 구현 객체에 상속되는 instance method가 아니다

```java
interface Auditable {
    static boolean valid(String value) {
        return value != null && !value.isBlank();
    }
}

boolean ok = Auditable.valid("order");
```

static method는 interface 이름으로 호출합니다. 구현 클래스나 구현 객체에서 다형적으로 dispatch되는 default method와 다릅니다.

```java
class Order implements Auditable { }

// Order.valid("order");
// new Order().valid("order");
```

따라서 "interface 안에 구현이 있다"는 공통점만 보고 default와 static을 같은 상속 모델로 생각하면 안 됩니다.

### default method를 쓸 수 있다는 것과 그 위치가 좋은 설계인 것은 별개다

여러 구현체가 자연스럽게 공유할 수 있는 기본 의미라면 default method가 유용합니다. 반대로 구현마다 서로 다른 상태·외부 의존성·복잡한 업무 흐름이 필요한데 interface default에 억지로 공통 코드를 넣으면 계약과 구현 책임이 섞일 수 있습니다.

즉 default method의 핵심은 "interface에도 코드를 넣을 수 있다"가 아니라 **구현체가 상속받을 기본 instance 계약을 제공한다**는 데 있고, static method는 **interface와 관련된 정적 동작을 그 타입 이름 아래에 둔다**는 점에 있습니다. 두 규칙을 구분하면 충돌과 호출 문제도 함께 정리됩니다.
