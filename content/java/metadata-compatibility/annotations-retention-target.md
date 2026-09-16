---
kind: concept
contentKey: java.core.metadata-compatibility.annotations-retention-target
topicContentKey: java.core.metadata-compatibility
slug: annotations-retention-target
title: "Annotation의 Retention과 Target"
summary: "annotation이 metadata라는 점과 @Target·@Retention이 어디에 붙고 언제까지 남는지를 결정한다는 점을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/package-summary.html"
    title: "Java SE 25 API: java.lang.annotation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: annotation support와 meta-annotation 개요 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/annotation/RetentionPolicy.html"
    title: "Java SE 25 API: RetentionPolicy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: SOURCE·CLASS·RUNTIME 보존 정책 확인
---
# Annotation의 Retention과 Target

Spring을 사용하면 `@Service`, `@Transactional`, `@Valid`처럼 annotation을 자주 만나기 때문에 annotation 자체가 기능을 실행한다고 생각하기 쉽습니다. Java 관점에서 annotation은 먼저 **class, method, field 같은 프로그램 요소에 붙이는 metadata**입니다. 실제 behavior는 compiler, annotation processor, framework처럼 그 metadata를 읽는 주체가 구현합니다.

### Annotation은 metadata이고 실행 주체는 따로 있다

```java
@interface Audited {
    String value();
}

@Audited("order")
class OrderService {
}
```

이 코드는 `OrderService`에 `Audited` metadata를 붙입니다. 이 사실만으로 log나 transaction이 자동으로 시작되지는 않습니다.

```text
Annotation metadata
       │
       ├─ compiler
       ├─ annotation processor
       └─ runtime framework
              │
              ▼
          실제 behavior
```

그래서 custom annotation을 설계할 때도 "무엇을 붙일까"와 함께 **누가 언제 읽을 것인가**를 정해야 합니다.

### `@Target`은 annotation을 붙일 수 있는 위치를 제한한다

```java
@Target(ElementType.METHOD)
@interface Audited {
}
```

이 annotation은 method에 사용하도록 제한됩니다. `ElementType`에는 type, method, field, parameter, constructor, annotation type, type use 등 여러 위치가 있습니다.

모든 enum 값을 암기하기보다 annotation의 의미가 어떤 프로그램 요소를 설명하는지 먼저 정합니다.

```text
method 실행 특성 -> METHOD
parameter 의미    -> PARAMETER
field metadata    -> FIELD
타입 사용 자체    -> TYPE_USE
```

### `@Retention`은 metadata가 언제까지 남는지 정한다

Retention policy는 annotation을 어느 단계까지 유지할지 결정합니다.

| 정책 | 핵심 의미 |
| --- | --- |
| `SOURCE` | source 단계 이후 binary에 남길 필요가 없음 |
| `CLASS` | class file에는 기록되지만 runtime reflection 노출은 요구하지 않음 |
| `RUNTIME` | runtime reflection에서 조회할 수 있도록 유지 |

Runtime framework가 annotation을 직접 읽어야 한다면 보통 `RUNTIME` retention이 필요합니다.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {
}
```

반대로 compile-time annotation processor만 읽고 generated code를 만든다면 annotation이 runtime까지 남을 이유가 없을 수 있습니다.

### Retention은 강할수록 좋은 설정이 아니다

```text
Compile-time processor
source annotation -> processor -> generated code

Runtime framework
class metadata -> reflection -> framework behavior
```

`RUNTIME`이 가장 오래 남는다고 모든 annotation에 무조건 적합한 것은 아닙니다. Metadata consumer가 compile time에만 존재한다면 SOURCE나 CLASS가 더 정확한 계약일 수 있습니다.

또 `@Retention`을 생략하면 Java는 기본적으로 `CLASS` retention을 적용합니다. 따라서 runtime 조회가 필요한 annotation에서 retention을 명시하지 않으면 기대한 reflection 결과를 얻지 못할 수 있습니다.

### `@Target`과 `@Retention`도 annotation이다

Annotation type의 사용 규칙을 설명하는 annotation을 meta-annotation이라고 부릅니다.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}
```

여기서 `@Target`, `@Retention`이 `Audited` 자체를 설명합니다. `@Inherited`, `@Repeatable`, `@Documented`도 meta-annotation이지만 각각 별도 계약을 가집니다.

특히 `@Inherited`는 class-level annotation inheritance와 관련된 규칙이지 method annotation까지 모든 위치에 일반적으로 적용되는 상속 기능이 아닙니다.

### Java annotation 규칙과 framework 탐색 규칙을 구분한다

Java reflection이 annotation을 찾는 기본 규칙 위에 Spring 같은 framework가 meta-annotation 탐색이나 합성 규칙을 추가할 수 있습니다.

```text
Java
  -> annotation metadata와 reflection 기본 계약

Spring
  -> 그 metadata를 탐색·합성하고 기능 적용
```

따라서 `@Transactional`이 transaction을 "직접 연다"고 설명하기보다 Spring infrastructure가 annotation metadata를 해석해 proxy/interceptor behavior를 적용한다고 이해하는 편이 정확합니다.

### 정리

Annotation은 프로그램 요소에 붙이는 metadata입니다. `@Target`은 사용할 수 있는 위치를, `@Retention`은 metadata가 어느 단계까지 남는지를 결정합니다. Runtime reflection이 필요하면 `RUNTIME` retention이 필요하고, compile-time processor만 소비한다면 runtime 보존이 필요하지 않을 수 있습니다. Annotation 자체와 annotation을 해석해 실제 기능을 수행하는 compiler/framework를 구분하는 것이 핵심입니다.
