---
kind: concept
contentKey: java.core.enum-modeling.enummap
topicContentKey: java.core.enum-modeling
slug: enummap
title: "EnumMap으로 enum key 매핑하기"
summary: "key가 하나의 enum 타입으로 제한된 Map에서 EnumMap을 사용해 key 범위와 의도를 분명하게 표현한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumMap.html"
    title: "Java SE 25 API: EnumMap"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: EnumMap의 key 제한과 iteration order 계약 확인
---
# EnumMap으로 enum key 매핑하기

enum 값마다 다른 설정이나 행동 객체를 연결해야 할 때 `Map<Enum, Value>` 형태가 자주 등장합니다. key가 한 enum 타입으로 고정되어 있다면 `EnumMap`이 그 의도를 직접 표현합니다.

```java
EnumMap<Grade, Integer> discountRates = new EnumMap<>(Grade.class);
discountRates.put(Grade.BASIC, 0);
discountRates.put(Grade.VIP, 10);
```

`Grade`가 아닌 다른 타입은 key로 들어갈 수 없으므로 가능한 key 범위가 명확합니다.

### switch가 커질 때 대안이 될 수 있다

```java
int rate = switch (grade) {
    case BASIC -> 0;
    case VIP -> 10;
    case VVIP -> 20;
};
```

값이 단순하고 고정되어 있으면 switch가 오히려 가장 읽기 좋을 수 있습니다. 하지만 런타임에 매핑을 구성하거나 enum별 전략 객체를 연결해야 한다면 `EnumMap`이 자연스러울 수 있습니다.

```java
EnumMap<PaymentType, PaymentHandler> handlers = ...;
PaymentHandler handler = handlers.get(type);
```

### 순서를 일반 Map과 동일하게 가정하지 않는다

`EnumMap`은 enum 상수의 자연스러운 선언 순서를 기준으로 key를 다룹니다. 이것은 `HashMap`의 iteration order와 다른 특징입니다. 다만 비즈니스 정렬 규칙을 단순히 enum 선언 순서에 의존하게 만들지는 않는 편이 좋습니다. 상수 순서를 리팩터링하면 의미가 바뀔 수 있기 때문입니다.

### null과 누락 key를 구분한다

Map 조회 결과가 `null`이라면 key가 없거나 값 자체가 null일 수 있습니다. `EnumMap`의 key는 null을 허용하지 않지만 value는 null일 수 있으므로 필요하면 `containsKey`로 구분해야 합니다.

### 사용 기준

- key 종류가 하나의 enum으로 닫혀 있다.
- enum별 설정·전략·값을 lookup해야 한다.
- 일반 문자열 key보다 타입 안전성을 얻고 싶다.

이런 상황이면 `HashMap<Grade, ...>`도 기능상 가능하지만 `EnumMap`이 모델 의도를 더 분명하게 전달할 수 있습니다.
