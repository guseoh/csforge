---
kind: concept
contentKey: java.core.generics.generic-invariance
topicContentKey: java.core.generics
slug: generic-invariance
title: "제네릭 불공변성과 잘못된 쓰기 방지"
summary: "String이 Object의 하위 타입이어도 List<String>이 List<Object>의 하위 타입이 아닌 이유를 안전하지 않은 쓰기 가능성으로 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10"
    title: "JLS 4.10 Subtyping"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 매개변수화 타입의 하위 타입 관계 확인
---
# 제네릭 불공변성과 잘못된 쓰기 방지

`String`은 `Object`의 하위 타입입니다. 그렇다면 `List<String>`도 `List<Object>`로 사용할 수 있을 것 같지만 Java 제네릭에서는 허용되지 않습니다.

```java
List<String> names = new ArrayList<>();
// List<Object> values = names; // 컴파일 오류
```

이런 기본 타입 관계를 **불공변(invariance)** 이라고 합니다. 이유는 문법이 까다로워서가 아니라, 이 대입을 허용하면 원래 컬렉션의 타입 약속을 깨는 쓰기가 가능해지기 때문입니다.

### 허용된다고 가정하면 문제가 바로 드러난다

```java
List<String> names = new ArrayList<>();
// 가정: List<Object> values = names;
```

`values`가 정말 `List<Object>`라면 다음 쓰기는 합법이어야 합니다.

```java
values.add(Integer.valueOf(10));
```

하지만 실제 객체는 `String`을 담는다고 약속한 `List<String>`입니다. 이제 `names.get(0)`을 `String`으로 읽는 계약이 깨집니다.

```text
List<String> names
       │
       └── 같은 List를 List<Object>로 허용했다고 가정
                  │
                  └── Integer 저장 가능
                         ↓
             List<String> 계약 붕괴
```

그래서 컴파일러가 애초에 `List<String> → List<Object>` 대입을 막습니다.

### 배열과 비교하면 오류를 막는 시점이 다르다

참조형 배열은 공변성을 허용합니다.

```java
String[] names = new String[1];
Object[] values = names;
values[0] = 10; // 실행 중 ArrayStoreException
```

배열은 실제 component type을 런타임에 알고 있어 잘못된 저장을 실행 중 검사합니다. 제네릭 컬렉션은 기본 타입 관계를 불공변으로 두어 같은 종류의 위험을 많은 경우 컴파일 시점에 막습니다.

| 관점 | `String[] → Object[]` | `List<String> → List<Object>` |
| --- | --- | --- |
| 타입 관계 | 허용 | 허용하지 않음 |
| 잘못된 값 쓰기 | 컴파일될 수 있음 | 대입 단계에서 차단 |
| 오류 발견 | 실행 중 가능 | 컴파일 시점 |

### 읽기 범위를 넓히고 싶다면 wildcard가 필요하다

불공변이라고 해서 서로 다른 원소 타입의 List를 하나의 API로 다룰 수 없는 것은 아닙니다. 읽기만 필요한 API라면 wildcard로 허용 범위를 표현할 수 있습니다.

```java
void printAll(List<?> values) {
    for (Object value : values) {
        System.out.println(value);
    }
}
```

`List<?>`는 "정확한 원소 타입은 모르지만 어떤 타입의 List"라는 의미입니다. 어떤 값을 안전하게 읽거나 쓸 수 있는지는 다음 wildcard Concept에서 이어서 다룹니다.

제네릭 대입이 왜 금지되는지 헷갈리면 **그 대입을 허용했을 때 새 참조를 통해 무엇을 추가할 수 있는지** 생각해 보세요. 원래 컬렉션의 타입 계약을 깨는 값이 들어갈 수 있다면 불공변성이 필요한 이유가 보입니다.
