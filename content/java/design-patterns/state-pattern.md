---
kind: concept
contentKey: java.core.design-patterns.state-pattern
topicContentKey: java.core.design-patterns
slug: state-pattern
title: "State 패턴과 상태별 행동"
summary: "상태별 조건문과 전이가 복잡해질 때 현재 상태를 객체로 분리해 행동과 전이 규칙을 모으는 방법과 적용 한계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "JLS 8 Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스 기반 상태 객체 구현의 언어 기반 확인
---
# State 패턴과 상태별 행동

객체 상태가 몇 개 없을 때는 enum과 조건문만으로도 충분합니다.

```java
if (status == READY) { ... }
else if (status == PAID) { ... }
else if (status == CANCELLED) { ... }
```

하지만 상태마다 가능한 행동과 다음 상태 전이가 계속 늘어나면 하나의 클래스에 큰 `switch`가 반복될 수 있습니다. State 패턴은 **현재 상태를 별도 객체로 표현하고 상태별 행동을 그 객체에 맡기는 방식**입니다.

```text
Order(Context)
   │ 현재 state
   ▼
OrderState
   ├─ ReadyState
   ├─ PaidState
   └─ CancelledState
```

### 상태 객체가 행동을 소유한다

```java
interface OrderState {
    void cancel(OrderContext context);
}
```

`PaidState`는 취소를 허용하고 `CancelledState`는 거부하는 식으로 상태별 규칙을 각각 둘 수 있습니다. 상태 전이가 일어나면 context가 가리키는 state도 바뀝니다.

### 장점은 큰 조건문을 분산하는 것이 아니라 응집시키는 데 있다

State 클래스를 많이 만든다고 자동으로 좋은 설계가 되지는 않습니다. 가치가 있는 경우는 **특정 상태의 행동과 전이 규칙이 함께 자주 변경될 때**입니다. 그 규칙을 상태 객체 안에 모으면 관련 코드가 가까워집니다.

### enum에 행동을 두는 방법이 더 간단할 수도 있다

상태 수가 적고 규칙이 단순하면 enum 자체에 `canCancel()` 같은 행동을 두는 것으로 충분할 수 있습니다.

```java
enum OrderStatus {
    READY, PAID, CANCELLED;

    boolean canCancel() { ... }
}
```

State 패턴은 객체와 클래스 수를 늘리므로 복잡성이 실제로 필요한지 판단해야 합니다.

### 상태와 workflow를 구분한다

결제 취소처럼 외부 시스템 호출, transaction, 여러 aggregate 조정이 필요한 유스케이스 전체를 State 객체 하나에 넣는 것은 과할 수 있습니다. State는 객체 내부의 상태별 행동과 전이를 모델링하는 도구이고, 애플리케이션 orchestration은 별도 책임일 수 있습니다.

문제에서는 “상태 조건문이 보이면 무조건 State”가 아니라 **상태별 행동이 독립적으로 커지고 전이 규칙이 복잡한가**를 먼저 판단하세요.
