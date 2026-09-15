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

`public`은 단순히 “어디서나 호출 가능”이라는 편의 표시가 아닙니다. 다른 코드가 그 타입이나 메서드에 합법적으로 의존할 수 있다는 뜻입니다. 사용되기 시작한 공개 요소는 나중에 이름·매개변수·동작을 바꿀 때 호출자까지 고려해야 하므로 **공개 범위가 곧 변경 비용의 범위**가 될 수 있습니다.

```java
public class OrderValidator {
    public boolean validate(Order order) { ... }

    private boolean hasValidItems(Order order) { ... }
}
```

호출자가 필요한 것은 `validate()`라는 책임이고 `hasValidItems()`는 그 책임을 수행하는 내부 단계라면, 세부 구현을 공개할 이유가 없습니다. 외부 계약을 작게 유지할수록 내부 구현을 바꿀 자유도도 커집니다.

### 접근 제어는 사용할 수 있는 상태 변화도 제한한다

필드를 `private`으로 만들더라도 모든 값을 받는 public setter를 열어 두면 객체의 규칙은 쉽게 우회될 수 있습니다.

```java
class Order {
    private OrderStatus status;

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
```

대신 허용된 상태 변화만 공개할 수 있습니다.

```java
public void complete() {
    if (status != OrderStatus.PAID) {
        throw new IllegalStateException();
    }
    status = OrderStatus.COMPLETED;
}
```

따라서 캡슐화는 필드 가시성만의 문제가 아니라 **외부가 어떤 생성 경로와 상태 변경 경로를 사용할 수 있는가**까지 포함합니다.

### 접근 수준은 서로 다른 협력 범위를 표현한다

- `private`은 같은 클래스 내부 구현에 가깝습니다.
- package-private은 같은 패키지 안의 협력 코드에는 열되 외부 패키지 계약으로 만들 필요가 없을 때 사용할 수 있습니다.
- `protected`는 하위 클래스에 접근 지점을 제공하므로 상속 계층과의 계약이 됩니다.
- `public`은 접근 가능한 모든 호출자에게 공개하는 계약입니다.

특히 `protected`를 “public보다 조금 좁은 접근 수준”으로만 보면 안 됩니다. 하위 클래스가 해당 멤버에 의존하기 시작하면 상위 클래스는 그 확장점을 바꿀 때 하위 타입과의 호환성도 고려해야 합니다.

### 매개변수와 반환 타입도 공개 계약이다

```java
public ArrayList<Order> findAll() {
    ...
}
```

호출자가 `ArrayList` 고유 기능을 사용할 이유가 없다면 다음처럼 필요한 계약만 공개할 수 있습니다.

```java
public List<Order> findAll() {
    ...
}
```

공개 반환 타입은 호출자가 어떤 동작에 의존할 수 있는지를 결정합니다. 다만 이미 외부에 공개된 API라면 반환 타입을 더 추상적인 타입으로 바꾸는 것도 기존 소스와의 호환성을 깨뜨릴 수 있습니다. **새 설계에서 좁게 공개하는 것과 이미 공개된 계약을 변경하는 것은 다른 문제**입니다.

반환 값의 가변성 역시 계약의 일부입니다.

```java
public List<OrderLine> lines() {
    return List.copyOf(lines);
}
```

같은 `List<OrderLine>` 타입이어도 내부 가변 컬렉션을 그대로 반환하는 것과 수정할 수 없는 복사 결과를 반환하는 것은 호출자에게 다른 의미를 줍니다.

### 필요한 책임까지 숨기는 것이 목표는 아니다

가장 좁은 접근 수준을 기계적으로 고르는 것이 좋은 설계는 아닙니다. 실제 협력자가 사용해야 하는 책임은 분명하게 공개되어야 합니다. 반대로 테스트에서 private helper를 직접 호출하기 위해 public으로 바꾸는 것처럼, 내부 구현을 확인하려는 이유만으로 production API를 넓히는 것은 외부 계약을 불필요하게 키울 수 있습니다.

공개 범위를 판단할 때는 세 가지를 보면 됩니다. **누가 이 요소를 사용해야 하는가, 어떤 책임을 제공해야 하는가, 이 세부가 바뀔 때 그 호출자도 함께 바뀌는 것이 자연스러운가.** 마지막 질문의 답이 아니라면 공개 경계를 다시 볼 가치가 있습니다.

접근 제어는 보안이나 암호화를 대신하는 기능이 아닙니다. Java 프로그램 내부에서 **의존할 수 있는 범위와 변경 경계를 표현하는 언어 도구**라는 점이 핵심입니다.
