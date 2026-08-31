---
kind: concept
contentKey: java.core.api-design.minimize-accessibility-api-surface
topicContentKey: java.core.api-design
slug: minimize-accessibility-api-surface
title: "필요한 범위만 공개하기"
summary: "클래스와 멤버의 접근 범위를 필요한 만큼만 열어 내부 변경 자유도와 API 호환성을 지키는 이유를 이해한다"
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

`public`은 단순히 “어디서나 호출 가능”이라는 편의 기능이 아닙니다. 한 번 공개한 타입이나 메서드는 다른 코드가 의존하기 시작할 수 있고, 이후 이름·매개변수·동작을 바꾸기 어려워집니다. 그래서 **공개 API는 장기적인 약속**에 가깝습니다.

### 내부 구현까지 public이면 변경 비용이 커진다

```java
public class OrderValidator {
    public boolean internalStep1(Order order) { ... }
    public boolean internalStep2(Order order) { ... }
}
```

원래는 `validate()` 내부 구현 단계였는데 모든 메서드를 public으로 만들면 다른 코드가 `internalStep1()`을 직접 호출할 수 있습니다. 나중에 검증 순서를 바꾸거나 메서드를 없애려 할 때 호출부를 모두 고려해야 합니다.

```java
public boolean validate(Order order) { ... }
private boolean hasValidItems(Order order) { ... }
```

외부가 알아야 할 계약만 공개하고 구현 세부는 숨기면 내부 구조를 바꿀 자유가 커집니다.

### 접근 제어는 캡슐화 경계를 표현한다

Java에서는 `private`, package 접근, `protected`, `public` 등 여러 범위를 제공합니다. 중요한 것은 무조건 가장 좁게 만들라는 기계적인 규칙보다 **실제로 누가 이 멤버를 알아야 하는가**입니다.

예를 들어 같은 패키지의 협력 클래스만 사용해야 하는 구현 타입을 public으로 노출할 필요가 없을 수 있습니다. 반대로 외부 모듈이 사용해야 하는 안정된 계약이라면 public이 맞습니다.

### 반환 타입도 API surface다

```java
public ArrayList<Order> findAll() { ... }
```

호출자가 `ArrayList` 구현에 의존할 이유가 없다면 `List<Order>`처럼 필요한 계약만 노출하는 편이 구현을 바꾸기 쉽습니다.

```java
public List<Order> findAll() { ... }
```

다만 구체 타입의 특별한 기능이 API 계약에 실제로 필요하다면 구체 타입을 반환할 수도 있습니다. 추상 타입을 쓰는 것 자체가 목적은 아닙니다.

### 백엔드 개발에서 연결되는 지점

서비스 내부 helper, 도메인 생성 메서드, 라이브러리 모듈의 타입을 모두 public으로 열면 사용 가능한 경계가 넓어집니다. 특히 여러 모듈이나 외부 사용자가 있는 라이브러리에서는 공개 API 변경이 호환성 문제로 이어집니다.

단일 애플리케이션 안에서도 공개 범위를 줄이면 “이 메서드는 어디서 호출될 수 있지?”를 추적하기 쉬워집니다.

### 코드 리뷰에서 확인할 것

- 이 타입이나 메서드를 외부에서 실제로 사용해야 하는가?
- 내부 구현 세부가 public 계약으로 새어나오고 있지 않은가?
- 반환 타입이 필요 이상으로 구체적이지 않은가?
- 향후 변경해야 할 가능성이 큰 세부를 공개하고 있지 않은가?

접근 제어는 보안 기능 전체를 대신하지는 않습니다. `private`이라고 공격자가 데이터를 볼 수 없다는 뜻이 아니라 **Java 코드 수준의 사용 경계를 표현하는 도구**입니다.
