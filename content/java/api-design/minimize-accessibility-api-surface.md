---
kind: concept
contentKey: java.core.api-design.minimize-accessibility-api-surface
topicContentKey: java.core.api-design
slug: minimize-accessibility-api-surface
title: "필요한 범위만 공개하기"
summary: "접근 제어를 단순 숨김이 아니라 외부 의존 가능 범위를 설계하는 도구로 보고, 생성 경로·반환 타입·protected 확장점·호환성 비용까지 함께 판단한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.6"
    title: "JLS 6.6 Access Control"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java 접근 제어 규칙 확인
---
# 필요한 범위만 공개하기

`public`은 단순히 “어디서나 호출 가능”이라는 편의 옵션이 아닙니다. 다른 코드가 그 타입·메서드·constructor를 사용할 수 있다는 뜻이고, 사용되기 시작한 순간부터 그 모양과 동작은 변경 비용을 갖습니다. 그래서 공개 API surface는 **다른 코드가 합법적으로 의존할 수 있는 범위**라고 보는 편이 정확합니다.

```java
public class OrderValidator {
    public boolean internalStep1(Order order) { ... }
    public boolean internalStep2(Order order) { ... }
}
```

원래 두 메서드가 `validate()`의 내부 단계였는데 public으로 열려 있으면 호출자는 `internalStep2()`만 직접 부르거나 원래 의도한 순서를 건너뛸 수 있습니다. 나중에 검증 순서를 합치거나 method를 삭제하고 싶어도 외부 호출 가능성을 고려해야 합니다.

```java
public boolean validate(Order order) { ... }

private boolean hasValidItems(Order order) { ... }
```

외부에는 안정된 책임만 제공하고 세부 단계를 숨기면 내부 구현은 더 자유롭게 바꿀 수 있습니다.

### 접근 범위는 객체의 사용 가능한 상태 전이까지 결정할 수 있다

접근 제어는 단순한 코드 정리 기능이 아닙니다. 생성 경로와 상태 변경 경로를 얼마나 열어 둘지도 결정합니다.

```java
class Order {
    private OrderStatus status;

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
```

`status` field가 private이어도 `setStatus()`가 모든 값을 허용한다면 외부 코드는 `DRAFT -> COMPLETED` 같은 금지 전이를 직접 만들 수 있습니다.

```java
public void complete() {
    if (status != OrderStatus.PAID) {
        throw new IllegalStateException();
    }
    status = OrderStatus.COMPLETED;
}
```

캡슐화는 field를 private으로 만드는 데서 끝나지 않습니다. **외부에 어떤 행동을 공개하고 어떤 우회 경로를 닫는가**까지 포함합니다.

같은 이유로 domain 객체의 constructor를 무조건 public으로 둘 필요도 없습니다. 특정 factory를 통해서만 유효한 초기 상태를 만들고 싶다면 constructor 범위를 더 좁게 두는 것이 생성 invariant를 보호할 수 있습니다.

### `private`, package-private, `protected`, `public`은 서로 다른 협력 범위를 표현한다

가장 좁은 접근 범위를 기계적으로 선택하는 것이 목표는 아닙니다. 실제로 누가 알아야 하는지를 표현하는 것이 목표입니다.

- `private`은 같은 class 구현 세부에 가깝습니다.
- package-private은 같은 package의 협력 코드끼리 공유하되 외부 package의 계약으로 만들 필요가 없을 때 유용합니다.
- `protected`는 subclass에 확장 지점을 제공하므로 단순 내부 구현보다 더 강한 장기 계약이 될 수 있습니다.
- `public`은 접근 가능한 모든 호출자에게 노출하는 계약입니다.

특히 `protected`를 “public보다 조금 좁으니 안전하다”라고만 보면 안 됩니다. subclass가 override하거나 호출하도록 열어 둔 method는 상위 class의 구현 순서와 invariant에 하위 class를 결합시킬 수 있습니다. 나중에 signature나 호출 시점을 바꾸면 확장 class가 깨질 수 있습니다.

### 반환 타입과 매개변수 타입도 API surface다

```java
public ArrayList<Order> findAll() {
    ...
}
```

호출자가 `ArrayList` 고유 기능을 사용할 필요가 없다면 다음처럼 필요한 역할만 반환할 수 있습니다.

```java
public List<Order> findAll() {
    ...
}
```

이 선택은 단순한 “interface가 더 좋다” 규칙이 아닙니다. 공개 반환 타입은 호출자가 컴파일 시 사용할 수 있는 계약을 결정합니다. `ArrayList`를 반환하면 호출자는 `ensureCapacity()`처럼 구체 구현에 의존할 수 있고, 나중에 다른 List 구현으로 교체하기 어려워집니다.

반대로 이미 공개된 library method가 `ArrayList<String>`을 반환하고 외부 코드가 실제로 다음처럼 사용한다면 상황이 다릅니다.

```java
ArrayList<String> values = library.entries();
values.add("x");
```

기존 method의 반환 타입을 갑자기 `List<String>`으로 바꾸면 새 반환 타입이 더 추상적이어도 기존 source가 컴파일되지 않을 수 있습니다. API를 한번 공개한 뒤에는 **더 좋은 설계로 보이는 변경도 호환성 변경**이 될 수 있습니다.

이런 경우 기존 계약을 유지하면서 새로운 API를 추가하고 이전 경로를 deprecate하는 식의 migration이 필요할 수 있습니다.

### mutability도 반환 계약의 일부다

다음 두 method는 반환 타입이 같아도 계약이 다를 수 있습니다.

```java
List<Order> orders();
```

하나는 내부 live collection을 그대로 반환할 수 있고, 다른 하나는 independent copy나 unmodifiable snapshot을 반환할 수 있습니다. 접근 제한을 잘했더라도 mutable 내부 객체를 반환하면 외부 코드가 간접적으로 내부 상태를 바꿀 수 있습니다.

```java
public List<OrderLine> lines() {
    return List.copyOf(lines);
}
```

따라서 API surface를 줄인다는 것은 method 수만 줄이는 작업이 아닙니다. **공개한 값의 타입, identity, mutability, 예외와 상태 변화 의미**까지 호출자와의 계약이 됩니다.

### public 구현 타입 하나가 package 전체를 외부 계약으로 끌어낼 수 있다

예를 들어 public method signature가 내부 전용 class를 사용하려고 하면 그 타입도 외부에서 접근 가능해야 할 수 있습니다.

```java
public InternalQueryPlan plan() { ... }
```

이 반환 타입이 정말 application 외부가 알아야 하는 개념이 아니라면 구현 세부가 API를 통해 새어 나온 것입니다. 한 번 이런 타입이 여러 곳에 퍼지면 내부 구조를 고칠 때 호출자까지 따라 바꿔야 합니다.

백엔드 application에서도 같은 문제가 있습니다. Controller response에 persistence entity나 vendor SDK type을 그대로 내보내면 계층 내부 구현이 HTTP 계약으로 승격됩니다. 이는 단순 visibility modifier보다 더 넓은 의미의 API surface 누출입니다.

### 테스트 때문에 visibility를 넓히기 전에 책임을 확인한다

private helper를 직접 단위 테스트하려고 public으로 바꾸는 경우가 있습니다. 하지만 helper가 정말 독립적으로 검증할 만큼 중요한 규칙이라면 별도 응집된 객체나 package-level collaboration으로 분리해야 하는 것은 아닌지 먼저 봐야 합니다. 단지 구현 단계 하나를 테스트하려는 목적이라면 public API를 늘리지 않고 외부에서 관찰 가능한 행동으로 검증하는 편이 더 안정적일 수 있습니다.

테스트 가능성이 필요하다는 이유만으로 production 계약을 넓히면 테스트가 구현 세부에 결합되고 실제 사용자에게도 필요 없는 API가 생깁니다.

### 작은 surface는 변경 자유도를 확보하지만, 필요한 계약까지 숨기면 안 된다

모든 class를 package-private으로 만들고 모든 method를 private으로 줄이면 좋은 설계가 되는 것은 아닙니다. 실제 협력자가 사용해야 하는 책임은 명시적으로 공개되어야 합니다.

판단 기준은 다음 질문으로 정리할 수 있습니다. 이 타입이나 method를 **누가** 호출해야 하는가, 호출자가 정말 알아야 하는 **어떤 책임**을 제공하는가, 이 세부가 바뀔 때 외부 호출자까지 함께 바뀌어야 하는가를 봅니다. 마지막 질문에 “아니어야 한다”라고 답하면서도 public으로 노출되어 있다면 경계를 다시 볼 가치가 있습니다.

접근 제어는 보안 전체를 대신하지도 않습니다. `private` field라고 해서 공격자로부터 데이터가 암호화되는 것은 아닙니다. 이것은 Java 프로그램 안에서 **의존과 변경의 경계를 표현하는 언어 도구**입니다. 좋은 API는 필요한 책임은 분명하게 열고, 외부가 알아야 할 이유가 없는 생성·상태·구현 세부는 계약이 되기 전에 닫습니다.
