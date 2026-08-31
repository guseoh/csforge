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

이 제한을 **불공변(invariance)** 이라고 합니다. 이유는 제네릭 문법이 까다로워서가 아니라, 허용했을 때 타입 안전성을 깨는 쓰기가 가능해지기 때문입니다.

### 만약 허용된다고 가정해 보자

```java
List<String> names = new ArrayList<>();
// 가정: List<Object> values = names;
```

`values`가 정말 `List<Object>`라면 다음 코드는 합법이어야 합니다.

```java
values.add(Integer.valueOf(10));
```

하지만 실제 객체는 `String`만 담는다고 약속한 `List<String>`입니다. 이제 `names.get(0)`을 `String`으로 읽는 계약이 깨집니다.

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

### 배열과 비교하면 이유가 더 잘 보인다

참조형 배열은 공변성을 허용합니다.

```java
String[] names = new String[1];
Object[] values = names;
values[0] = 10; // 실행 중 ArrayStoreException
```

배열은 이런 위험을 런타임 저장 검사로 막습니다. 제네릭 컬렉션은 기본 타입 관계를 불공변으로 두어 많은 잘못된 쓰기를 컴파일 시점에 막습니다.

| 관점           | `String[] → Object[]` | `List<String> → List<Object>` |
| -------------- | --------------------- | ----------------------------- |
| 타입 관계      | 허용                  | 허용하지 않음                 |
| 잘못된 값 쓰기 | 컴파일될 수 있음      | 대입 단계에서 차단            |
| 오류 발견      | 실행 중 가능          | 컴파일 시점                   |

### 읽기만 하고 싶은 경우까지 막히는 것은 불편하지 않을까

실제로 `List<String>`과 `List<Integer>`에서 값을 `Object`로 읽기만 하고 싶은 API는 존재할 수 있습니다. 이런 요구를 해결하기 위해 wildcard를 사용합니다.

```java
void printAll(List<?> values) {
    for (Object value : values) {
        System.out.println(value);
    }
}
```

`List<?>`는 “원소 타입이 정확히 무엇인지는 모르지만 어떤 타입의 List”라는 의미입니다. 안전하게 무엇을 읽고 쓸 수 있는지는 wildcard 주제에서 다룹니다.

### 문제를 풀 때는 쓰기 가능성을 상상한다

왜 어떤 제네릭 대입이 안 되는지 헷갈리면 **그 대입을 허용했을 때 새 참조를 통해 어떤 값을 쓸 수 있는지** 생각해 보세요. 그 쓰기가 원래 컬렉션의 타입 약속을 깨뜨린다면 불공변성이 필요한 이유가 보입니다.
