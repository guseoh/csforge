---
kind: concept
contentKey: java.core.enum-modeling.enumset
topicContentKey: java.core.enum-modeling
slug: enumset
title: "EnumSet으로 enum 집합 표현하기"
summary: "원소 타입이 하나의 enum으로 제한된 집합에서 EnumSet이 타입 의도와 집합 연산을 명확하게 표현하는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumSet.html"
    title: "Java SE 25 API: EnumSet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: EnumSet의 계약과 지원 연산 확인
---
# EnumSet으로 enum 집합 표현하기

여러 enum 값 중 일부를 묶어 표현해야 할 때 `Set<OrderStatus>`를 사용할 수 있습니다. 이때 원소가 하나의 enum 타입으로 제한된다는 사실이 분명하다면 `EnumSet`이라는 전용 구현을 사용할 수 있습니다.

```java
EnumSet<OrderStatus> terminal = EnumSet.of(
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED
);
```

코드만 봐도 “종료 상태들의 집합”이라는 의미가 분명하고 `contains`, `add`, `remove` 같은 `Set` 연산을 그대로 사용할 수 있습니다.

### 비트 플래그보다 타입이 안전하다

과거에는 여러 옵션을 하나의 정수 비트로 표현하기도 했습니다.

```java
int READ = 1;
int WRITE = 2;
int permissions = READ | WRITE;
```

가능은 하지만 서로 관계없는 정수도 섞일 수 있고 의미를 추적하기 어렵습니다. enum과 `EnumSet`을 사용하면 허용되는 값의 타입이 분명합니다.

### EnumSet은 enum 전용이다

```java
EnumSet<OrderStatus> statuses = EnumSet.noneOf(OrderStatus.class);
```

`EnumSet`은 임의 객체를 담는 일반 집합이 아니라 **하나의 enum 타입 상수들**을 위한 컬렉션입니다. `null` 원소도 일반적인 Set처럼 자유롭게 다루는 타입이 아닙니다.

내부 표현은 JDK 구현에서 enum 특성을 이용해 매우 효율적으로 만들 수 있지만, 학습할 때 특정 비트 배치를 Java 언어 보장처럼 외울 필요는 없습니다. 중요한 것은 API 계약과 사용 의도입니다.

### 유용한 생성 방법

```java
EnumSet.allOf(OrderStatus.class);
EnumSet.noneOf(OrderStatus.class);
EnumSet.range(OrderStatus.READY, OrderStatus.PAID);
EnumSet.complementOf(terminal);
```

가능한 값 전체가 이미 enum으로 닫혀 있기 때문에 이런 집합 생성 연산을 자연스럽게 제공할 수 있습니다.

### 언제 사용할까

권한, 기능 플래그, 허용 상태 집합처럼 **여러 enum 값을 중복 없이 묶고 membership을 자주 확인할 때** 적합합니다. 값 하나만 필요하다면 그냥 enum 필드 하나가 더 단순합니다.

문제에서는 `EnumSet`을 일반 `HashSet`보다 항상 빠른 도구로 외우기보다 **enum 집합이라는 모델 자체를 더 정확하게 표현하는가**를 먼저 보세요.
