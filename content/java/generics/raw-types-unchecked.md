---
kind: concept
contentKey: java.core.generics.raw-types-unchecked
topicContentKey: java.core.generics
slug: raw-types-unchecked
title: "Raw type과 unchecked 경고"
summary: "제네릭 타입 정보를 생략하면 컴파일 시점 타입 안전성을 잃고 unchecked 경고가 런타임 오류 가능성을 알리는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8"
    title: "JLS 4.8 Raw Types"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: raw type 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.9"
    title: "JLS 5.1.9 Unchecked Conversion"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: unchecked conversion 규칙 확인
---
# Raw type과 unchecked 경고

제네릭 클래스에서 타입 인자를 생략한 형태를 **raw type**이라고 합니다.

```java
List values = new ArrayList();
```

이 문법은 제네릭이 도입되기 전 Java 코드와 호환하기 위해 남아 있지만, 새 코드에서 사용하면 컴파일러가 제공하던 타입 안전성의 상당 부분을 잃습니다.

### 잘못된 타입이 섞여 들어갈 수 있다

```java
List values = new ArrayList();
values.add("java");
values.add(10);
```

raw List에는 서로 다른 타입이 들어갈 수 있습니다. 이후 이것을 `List<String>`으로 다룬다면 문제가 늦게 드러납니다.

```java
List<String> names = values; // unchecked 경고
String name = names.get(1);  // ClassCastException 가능
```

컴파일러의 **unchecked 경고**는 “이 변환이 반드시 실패한다”는 뜻은 아닙니다. 제네릭 타입 정보만으로는 컴파일러가 안전성을 완전히 검증할 수 없다는 신호입니다.

### 경고를 무조건 숨기면 안 된다

```java
@SuppressWarnings("unchecked")
```

이 애너테이션은 코드가 안전해지는 기능이 아닙니다. 경고 표시만 억제합니다. 외부 라이브러리나 레거시 API 때문에 어쩔 수 없이 unchecked cast를 해야 한다면 범위를 가능한 작게 두고 **왜 안전하다고 판단할 수 있는지**를 확인해야 합니다.

예를 들어 런타임 검사를 먼저 수행한 뒤 좁은 helper 메서드에서 cast하는 식으로 위험한 경계를 한곳에 모을 수 있습니다.

### raw type과 `List<?>`는 다르다

```java
List<?> unknown = List.of("a", "b");
```

`List<?>`는 원소 타입이 무엇인지 모른다는 사실을 제네릭 타입 시스템 안에서 표현합니다. 그래서 임의의 값을 추가하지 못하게 막습니다.

반면 raw `List`는 제네릭 검사를 우회해 과거 방식처럼 사용할 수 있어 더 위험합니다.

### 실무에서는 경고를 기술 부채 신호로 본다

빌드에 unchecked 경고가 계속 남아 있으면 실제 타입 오류와 오래된 코드 경계가 숨어 있을 수 있습니다. 모든 경고를 즉시 없앨 수 없더라도 새 코드에서 raw type을 만들지 않고, 필요한 억제는 좁고 설명 가능한 위치에 두는 것이 좋습니다.
