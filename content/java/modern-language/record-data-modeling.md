---
kind: concept
contentKey: java.core.modern-language.record-data-modeling
topicContentKey: java.core.modern-language
slug: record-data-modeling
title: "Record data modeling"
summary: "record가 데이터 중심 타입의 반복 코드를 줄이는 방식과 얕은 불변성의 한계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: record declaration·component·canonical constructor 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html"
    title: "Java SE 25 API: Record"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: record의 공통 기반 타입과 의미 확인
---
# Record data modeling

API 응답처럼 "이름, 가격, 상태를 하나의 값 묶음으로 전달한다"는 목적의 타입을 만들 때 일반 클래스는 필드, 생성자, 접근자, `equals`, `hashCode`, `toString` 같은 반복 코드가 많이 생깁니다. 이런 타입은 복잡한 생명주기보다 **어떤 데이터로 구성되어 있는지**가 더 중요합니다.

Java의 `record`는 이런 데이터 중심 타입을 간결하게 표현하기 위해 만들어졌습니다. 하지만 "record를 쓰면 완전한 불변 객체가 된다"거나 "모든 DTO와 엔티티를 record로 바꾸면 된다"고 이해하면 곤란합니다.

### record component가 타입의 상태를 정의한다

```java
record ProductSummary(long id, String name, int price) { }
```

괄호 안의 `id`, `name`, `price`를 **record component**라고 합니다. 이 선언을 바탕으로 Java는 필요한 상태와 생성·조회에 필요한 기본 멤버를 제공합니다.

```java
ProductSummary product = new ProductSummary(1L, "keyboard", 10000);

long id = product.id();
String name = product.name();
```

일반 JavaBean처럼 `getId()`가 자동으로 생기는 것이 아니라 component 이름과 같은 `id()`, `name()` 형태의 접근자가 제공됩니다. 또한 component를 기반으로 한 `equals`, `hashCode`, `toString` 구현도 제공됩니다.

이 덕분에 record의 선언만 봐도 "이 타입을 구성하는 값이 무엇인지"가 잘 드러납니다.

### 생성 규칙이 필요하면 constructor에서 지킨다

record도 아무 값이나 받아야 하는 것은 아닙니다. 데이터가 만들어질 때 지켜야 하는 조건이 있다면 생성 시점에 검증할 수 있습니다.

```java
record Money(long amount, String currency) {
    Money {
        if (amount < 0) {
            throw new IllegalArgumentException("amount must be >= 0");
        }
        Objects.requireNonNull(currency);
    }
}
```

위처럼 매개변수 목록을 다시 적지 않는 형태를 **compact constructor**라고 합니다. 여기서는 component에 최종 값이 저장되기 전에 입력값을 검증하거나 필요한 정규화를 할 수 있습니다.

record가 간결하다고 해서 생성 규칙까지 없애야 하는 것은 아닙니다. 오히려 값 객체로 사용할 때는 "어떤 상태가 유효한가"를 생성 시점에 지키는 것이 중요합니다.

### `final` component와 깊은 불변성은 다르다

record component에 대응하는 필드는 재대입할 수 없지만, 참조가 가리키는 객체까지 자동으로 불변이 되는 것은 아닙니다.

```java
record Tags(List<String> values) { }

List<String> source = new ArrayList<>();
source.add("java");

Tags tags = new Tags(source);
source.add("spring");

System.out.println(tags.values()); // [java, spring]
```

`Tags` 안에서 `values` 필드가 다른 List를 가리키도록 재대입할 수는 없습니다. 하지만 원래 전달된 `ArrayList` 자체는 여전히 변경 가능합니다. 이런 성질을 **얕은 불변성(shallow immutability)** 관점에서 이해해야 합니다.

외부 변경으로부터 상태를 보호해야 한다면 생성 경계에서 복사할 수 있습니다.

```java
record Tags(List<String> values) {
    Tags {
        values = List.copyOf(values);
    }
}
```

이제 원본 리스트를 나중에 변경해도 record가 보관한 리스트에는 반영되지 않습니다. 다만 리스트 안의 원소 객체 자체가 mutable하다면 그 객체의 내부 상태까지 깊게 복사되는 것은 아닙니다.

### record가 잘 맞는 타입과 그렇지 않은 타입

record는 다음처럼 **값 전달과 데이터 표현이 중심인 타입**에 잘 맞습니다.

- API Request/Response
- application query result
- 여러 값을 하나의 의미 있는 값으로 묶는 value carrier
- 좌표, 기간처럼 identity보다 값 자체가 중요한 모델

반대로 객체의 identity와 긴 생명주기, 지연 로딩, 프록시, 상태 전환이 중요한 모델에는 기계적으로 적용하지 않는 편이 좋습니다. 예를 들어 JPA Entity는 persistence 요구사항과 생명주기가 있으므로 "코드가 짧아진다"는 이유만으로 record로 바꾸는 대상이 아닙니다.

### 일반 클래스와 record를 선택하는 기준

| 질문                           | record가 잘 맞는 경우 | 일반 클래스가 더 자연스러운 경우 |
| ------------------------------ | --------------------- | -------------------------------- |
| 타입의 중심은?                 | 구성 값               | 행동과 생명주기                  |
| 상속 확장이 필요한가?          | 보통 필요 없음        | 계층 설계가 필요할 수 있음       |
| 상태 변경이 중요한가?          | 생성 후 값 중심       | 명시적인 상태 전환이 핵심        |
| 반복적인 데이터 멤버가 많은가? | record가 줄여 줌      | 직접 설계가 필요                 |

record class는 일반적인 class 상속용 기반 타입으로 사용하는 구조도 아닙니다. "데이터 중심 타입"이라는 목적을 보고 선택하는 것이 좋습니다.

### 백엔드에서 특히 주의할 점

record를 Response DTO로 사용하면 간결하지만, 내부에 mutable collection을 그대로 넣어 반환할 때는 ownership을 생각해야 합니다. application/domain collection을 그대로 노출하면 호출 측의 변경 가능성이나 이후 내부 상태 변경과 얽힐 수 있습니다.

또 record가 `equals/hashCode`를 자동으로 제공한다는 이유로 어떤 객체든 값 객체가 되는 것은 아닙니다. 어떤 필드가 동등성을 결정해야 하는지, 그 동등성 의미가 도메인과 맞는지를 먼저 판단해야 합니다.

### 문제를 풀 때 확인할 것

1. record component가 무엇인지 확인한다.
2. component가 primitive인지 mutable reference인지 구분한다.
3. constructor에서 입력값을 복사하거나 정규화하는지 확인한다.
4. 자동 생성되는 accessor와 `equals/hashCode/toString`의 기준이 component라는 점을 기억한다.
5. `final` 필드와 참조 대상 객체의 불변성을 구분한다.

### 자주 헷갈리는 부분

- record는 내부 객체까지 자동으로 깊게 불변으로 만들지 않습니다.
- accessor 이름은 기본적으로 `getX()`가 아니라 `x()`입니다.
- record도 constructor에서 유효성 검증을 할 수 있습니다.
- record는 단순히 "Lombok을 언어에 넣은 것"이 아니라 데이터 중심 타입을 명시하는 Java 언어 기능입니다.
- 모든 JPA Entity나 도메인 객체를 record로 바꾸는 것이 좋은 설계는 아닙니다.

### 면접에서 설명한다면

record는 데이터 중심 클래스를 간결하게 선언하고 component를 기반으로 생성자, 접근자, `equals/hashCode/toString` 같은 반복 코드를 줄여 주는 언어 기능이라고 설명할 수 있습니다. 다만 component 필드가 재대입되지 않는 것과 내부 객체가 불변인 것은 다르므로 mutable collection 등을 보관한다면 방어적 복사가 필요할 수 있습니다.
