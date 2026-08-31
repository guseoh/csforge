---
kind: concept
contentKey: java.core.functional.behavior-parameterization
topicContentKey: java.core.functional
slug: behavior-parameterization
title: "행동을 매개변수로 전달하기"
summary: "비슷한 반복 흐름에서 달라지는 조건이나 변환 행동만 함수형 인터페이스로 전달해 중복을 줄이는 설계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html"
    title: "Java SE 25 API: java.util.function"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 행동 전달에 사용할 표준 함수형 인터페이스 확인
---
# 행동을 매개변수로 전달하기

비슷한 메서드가 조건 하나 때문에 계속 늘어나는 코드를 생각해 보겠습니다.

```java
List<Order> paidOrders(List<Order> orders) { ... }
List<Order> cancelledOrders(List<Order> orders) { ... }
List<Order> expensiveOrders(List<Order> orders) { ... }
```

세 메서드 모두 목록을 순회하고 조건에 맞는 값만 고르는 흐름이라면 **변하지 않는 반복 흐름과 달라지는 조건을 분리**할 수 있습니다.

### 데이터만 아니라 행동도 인자로 받는다

```java
static List<Order> filter(
        List<Order> orders,
        Predicate<Order> condition
) {
    List<Order> result = new ArrayList<>();
    for (Order order : orders) {
        if (condition.test(order)) {
            result.add(order);
        }
    }
    return result;
}
```

호출할 때 필요한 조건을 전달합니다.

```java
filter(orders, order -> order.status() == PAID);
filter(orders, order -> order.totalPrice() >= 100_000);
```

이런 설계를 **행동 매개변수화(behavior parameterization)** 라고 부릅니다. 메서드가 단순한 값뿐 아니라 “어떻게 판단할지”라는 행동을 입력으로 받습니다.

### Strategy와도 연결된다

객체를 만들어 전략을 전달하는 것도 같은 문제를 해결하는 방식입니다.

```java
PriceCalculator calculator = new PriceCalculator(discountPolicy);
```

lambda와 함수형 인터페이스는 **상태가 거의 없고 동작 하나로 표현 가능한 작은 전략**을 간결하게 전달할 때 특히 편합니다. 여러 메서드와 상태를 가진 역할이라면 명시적인 전략 객체가 더 자연스러울 수 있습니다.

### 콜백이 많아지면 흐름을 잃을 수도 있다

행동 전달이 유연하다고 해서 모든 로직을 lambda로 중첩하면 실제 실행 순서를 찾기 어려워집니다.

```java
execute(
    value -> validate(value, x -> transform(x, y -> save(y)))
);
```

이런 코드는 일반 메서드와 이름 있는 객체로 풀어 쓰는 편이 더 읽기 좋을 수 있습니다. **중복되는 흐름과 변화 지점을 분리하는 것이 목적이지 lambda 사용 자체가 목적이 아닙니다.**

### 백엔드 코드에서는 어디에 보일까

정렬 기준 `Comparator`, 재시도할 작업, 조건부 처리, 컬렉션 필터링, transaction template의 callback 등 다양한 API가 행동 전달 방식을 사용합니다. Spring 같은 framework에서도 callback API를 자주 만나지만 원리는 Java 함수형 인터페이스와 객체 협력에서 시작합니다.

### 문제를 풀 때는 고정 부분과 변화 부분을 찾는다

비슷한 코드가 반복될 때 전체 메서드를 복제하기 전에 “반복 흐름은 같은데 어떤 판단이나 변환만 달라지는가?”를 표시해 보세요. 그 부분이 행동 매개변수화의 후보입니다.
