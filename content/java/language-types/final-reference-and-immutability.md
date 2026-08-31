---
kind: concept
contentKey: java.core.language-types.final-reference-and-immutability
topicContentKey: java.core.language-types
slug: final-reference-and-immutability
title: "final과 불변 객체는 같은 말이 아니다"
summary: "final이 변수의 재대입을 막는 규칙과 객체 상태의 불변성, final 메서드·클래스의 의미를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4"
    title: "JLS 4.12.4 final Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: final 변수의 한 번만 할당되는 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "JLS 8 Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: final class와 final method 규칙 확인
---
# final과 불변 객체는 같은 말이 아니다

`final`을 보면 “변경할 수 없다”고 외우기 쉽지만, **무엇을 변경하지 못하는지**를 정확히 구분해야 합니다. `final` 변수는 한 번 값이 정해진 뒤 그 변수에 다른 값을 다시 넣지 못하게 합니다. 참조 타입이라면 참조 값의 재대입을 막는 것이지, 그 참조가 가리키는 객체의 내부 상태까지 자동으로 고정하는 것은 아닙니다.

### 원시 타입의 final

```java
final int limit = 100;
// limit = 200; // 컴파일 오류
```

`limit` 변수에는 한 번 값이 들어간 뒤 다른 값을 다시 넣을 수 없습니다.

생성자에서 값을 정하는 필드도 가능합니다.

```java
class Order {
    private final long id;

    Order(long id) {
        this.id = id;
    }
}
```

객체를 만들 때 `id`가 정해지고 이후 다른 값으로 재대입할 수 없습니다.

### final 참조가 가리키는 객체는 바뀔 수 있다

```java
final List<String> names = new ArrayList<>();
names.add("kim");       // 가능
// names = new ArrayList<>(); // 불가능
```

여기서 `final`이 막는 것은 `names` 변수에 새로운 `List` 참조를 넣는 일입니다. 이미 가리키고 있는 `ArrayList`의 `add`를 막지는 않습니다.

```text
final names ─────> ArrayList
    │                │
    │ 재대입 금지     └─ 내부 원소 변경 가능
    ▼
다른 List 참조 X
```

따라서 `final List`를 “불변 리스트”라고 부르면 안 됩니다.

### 불변성은 객체의 설계 문제다

**불변 객체(immutable object)** 는 생성된 뒤 외부에서 관찰할 수 있는 상태가 바뀌지 않도록 설계된 객체입니다. 단순히 필드에 `final`을 붙이는 것만으로 충분하지 않을 수 있습니다.

```java
final class MemberNames {
    private final List<String> names;

    MemberNames(List<String> names) {
        this.names = List.copyOf(names);
    }

    List<String> names() {
        return names;
    }
}
```

외부에서 받은 가변 리스트를 그대로 저장하면 호출자가 나중에 그 리스트를 바꾸면서 객체 상태까지 바꿀 수 있습니다. 그래서 필요하면 복사해서 소유권을 분리해야 합니다. 또한 내부 객체 자체가 가변이면 깊은 수준의 불변성은 별도로 검토해야 합니다.

### final 메서드와 final 클래스는 의미가 다르다

`final`은 변수뿐 아니라 메서드와 클래스에도 사용할 수 있습니다.

```java
class Parent {
    final void validate() {}
}

final class Utility {}
```

`final` 인스턴스 메서드는 하위 클래스에서 override할 수 없게 합니다. `final` 클래스는 다른 클래스가 그 클래스를 상속하지 못하게 합니다. 따라서 변수의 `final`, 메서드의 `final`, 클래스의 `final`을 모두 “값을 못 바꾼다”로 묶어 설명하면 정확하지 않습니다.

### 실무에서 final을 쓰는 이유

재대입할 이유가 없는 필드나 지역 변수에 `final`을 사용하면 객체가 어떤 의존성이나 값을 계속 유지해야 하는지 의도가 분명해집니다. 특히 생성자에서 주입받은 협력 객체를 `final` 필드에 두면 생성 이후 다른 객체로 바뀌지 않는다는 사실을 코드에서 확인하기 쉽습니다.

하지만 동시성 안전성이나 객체 불변성까지 `final` 하나로 해결된다고 생각해서는 안 됩니다. `final` 필드의 동시성 관련 특별한 의미는 Java Memory Model 주제에서 별도로 다룹니다.
