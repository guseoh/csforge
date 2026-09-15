---
kind: concept
contentKey: java.core.modern-language.record-data-modeling
topicContentKey: java.core.modern-language
slug: record-data-modeling
title: "Record로 데이터 모델링하기"
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
# Record로 데이터 모델링하기

여러 값을 하나의 데이터 단위로 전달하는 타입은 필드, 생성자, 접근자, `equals`, `hashCode`, `toString` 같은 반복 코드가 많아지기 쉽습니다. Java의 `record`는 이런 **데이터 중심 타입의 구성 값을 선언 자체에 드러내는 기능**입니다.

```java
record ProductSummary(long id, String name, int price) { }
```

괄호 안의 `id`, `name`, `price`를 record component라고 합니다. 이 component를 바탕으로 생성자와 접근자, `equals`, `hashCode`, `toString`이 제공됩니다.

```java
ProductSummary product = new ProductSummary(1L, "keyboard", 10_000);

long id = product.id();
String name = product.name();
```

일반 JavaBean처럼 `getId()`가 자동으로 생기는 것이 아니라 component 이름과 같은 `id()`, `name()` 형태의 접근자를 사용합니다.

### 생성 규칙은 compact constructor에서 지킬 수 있다

record라고 해서 아무 값이나 허용해야 하는 것은 아닙니다.

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

이처럼 매개변수 목록을 다시 적지 않는 생성 형태를 compact constructor라고 합니다. component에 최종 값이 저장되기 전에 입력을 검증하거나 정규화할 수 있습니다.

즉 record의 간결함은 invariant를 포기한다는 뜻이 아닙니다. **이 타입이 유효한 데이터로만 만들어져야 한다면 생성 경계에서 그 규칙을 지킬 수 있습니다.**

### record는 자동으로 깊은 불변 객체가 되지 않는다

component에 대응하는 필드는 재대입되지 않지만, 참조가 가리키는 객체 자체는 가변일 수 있습니다.

```java
record Tags(List<String> values) { }

List<String> source = new ArrayList<>();
source.add("java");

Tags tags = new Tags(source);
source.add("spring");

System.out.println(tags.values()); // [java, spring]
```

`values`가 다른 List를 가리키도록 바꿀 수는 없지만 같은 `ArrayList`의 상태는 외부에서 변경됐습니다. 그래서 record의 상태 보존을 **얕은 불변성(shallow immutability)** 과 구분해서 봐야 합니다.

필요하다면 생성 시점에 복사할 수 있습니다.

```java
record Tags(List<String> values) {
    Tags {
        values = List.copyOf(values);
    }
}
```

다만 `List.copyOf`도 원소 객체까지 재귀적으로 깊은 복사하는 것은 아닙니다. 어느 수준까지 상태를 보호해야 하는지는 타입의 계약에 따라 결정합니다.

### record가 잘 맞는지는 타입의 중심이 무엇인지 본다

record는 API 요청·응답, query result, 좌표나 기간처럼 **구성 값 자체가 타입의 의미를 강하게 결정하는 경우**에 자연스럽습니다.

반대로 긴 생명주기와 상태 전이, 상속 계층, 복잡한 identity가 핵심인 객체라면 일반 class가 더 명시적인 모델이 될 수 있습니다. record가 짧다는 이유만으로 모든 DTO나 도메인 객체에 기계적으로 적용하는 것이 목적은 아닙니다.

record를 선택할 때는 세 가지를 보면 됩니다. 이 타입은 어떤 component로 구성되는가, 생성 시 지켜야 할 invariant가 있는가, 그리고 component 중 mutable reference가 있다면 외부 변경으로부터 어느 정도 보호해야 하는가. 이 기준이 잡히면 record의 간결함과 실제 데이터 계약을 함께 설계할 수 있습니다.
