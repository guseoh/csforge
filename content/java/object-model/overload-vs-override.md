---
kind: concept
contentKey: java.core.object-model.overload-vs-override
topicContentKey: java.core.object-model
slug: overload-vs-override
title: "오버로딩과 오버라이딩"
summary: "컴파일 시점의 overload 선택과 실행 시점의 override된 인스턴스 메서드 선택을 구분해 호출 결과를 예측한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12"
    title: "JLS 15.12 Method Invocation Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: overload resolution과 method invocation 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8"
    title: "JLS 8.4.8 Inheritance, Overriding, and Hiding"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: override 규칙 확인
---
# 오버로딩과 오버라이딩

이름이 비슷하지만 오버로딩(overloading)과 오버라이딩(overriding)은 **메서드가 선택되는 시점부터 다릅니다.** 두 개념을 “같은 이름의 메서드를 다시 만든다”로 묶어 외우면 복합 호출 문제에서 쉽게 헷갈립니다.

### 오버로딩은 어떤 메서드 서명을 호출할지 고른다

```java
void print(Object value) {
    System.out.println("Object");
}

void print(String value) {
    System.out.println("String");
}
```

호출할 때 컴파일러는 인자 표현식의 타입과 적용 가능한 메서드 후보를 보고 어떤 overload를 사용할지 정합니다.

```java
Object value = "hello";
print(value); // Object overload
```

실제 객체가 `String`이어도 변수 표현식의 컴파일 시점 타입이 `Object`라면 overload 선택에서는 그 타입 정보가 중요합니다.

### 오버라이딩은 선택된 인스턴스 메서드의 실제 구현을 고른다

```java
class Parent {
    void print(Object value) {
        System.out.println("parent");
    }
}

class Child extends Parent {
    @Override
    void print(Object value) {
        System.out.println("child");
    }
}

Parent p = new Child();
p.print("hello"); // child
```

먼저 `print(Object)`라는 메서드 호출이 정해지고, 실행할 때 실제 객체가 `Child`이므로 override된 `Child.print(Object)`가 선택됩니다.

### 둘이 섞이면 두 단계로 풀어야 한다

```java
class Parent {
    void call(Object value) { System.out.println("P-Object"); }
    void call(String value) { System.out.println("P-String"); }
}

class Child extends Parent {
    @Override
    void call(Object value) { System.out.println("C-Object"); }
}

Parent target = new Child();
Object value = "java";
target.call(value);
```

이 문제를 한 번에 보지 말고 나눕니다.

1. 컴파일 시점: `target`은 `Parent`, `value`는 `Object`이므로 `call(Object)` overload가 선택됩니다.
2. 실행 시점: 실제 객체는 `Child`이고 `call(Object)`를 override했으므로 `Child.call(Object)`가 실행됩니다.

결과는 `C-Object`입니다.

### 반환 타입만 바꿔서는 overload할 수 없다

```java
// int find() {}
// String find() {}
```

매개변수 목록이 같고 반환 타입만 다른 메서드를 두 개 선언해 호출을 구분할 수는 없습니다. 호출하는 쪽에서 반환 타입만으로 어느 메서드를 선택해야 하는지 결정할 수 없기 때문입니다.

### 면접에서 설명한다면

오버로딩은 같은 이름의 여러 메서드 중 어떤 메서드 서명을 호출할지 컴파일 시점에 결정하는 과정이고, 오버라이딩은 상속 관계에서 같은 인스턴스 메서드의 하위 구현을 제공하며 실제 객체 타입에 따라 실행 시점에 선택되는 것이라고 설명하면 됩니다.

문제에서는 항상 **먼저 overload resolution, 그다음 override dispatch** 순서로 추적하면 좋습니다.
