---
kind: concept
contentKey: java.core.metadata-compatibility.annotations-retention-target
topicContentKey: java.core.metadata-compatibility
slug: annotations-retention-target
title: "Annotations, Retention, and Target"
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
# Annotation은 붙이는 순간 동작하는 코드일까

Spring을 배우면 `@Service`, `@Transactional`, `@Valid`처럼 annotation을 매우 자주 만납니다. 그래서 annotation 자체가 어떤 기능을 실행한다고 생각하기 쉽습니다.

하지만 Java 관점에서 annotation은 먼저 **프로그램 요소에 붙이는 metadata**입니다. 그 metadata를 compiler, annotation processor, framework 같은 다른 주체가 읽고 의미를 부여합니다.

### annotation은 "추가 정보"를 표현한다

직접 annotation을 하나 정의해 보겠습니다.

```java
@interface Audited {
    String value();
}

@Audited("order")
class OrderService {
}
```

`@Audited("order")`는 `OrderService`에 metadata를 붙입니다.

그런데 이 코드만으로 log가 남거나 transaction이 시작되지는 않습니다. 실제 behavior가 필요하다면 누군가 이 annotation을 읽고 동작해야 합니다.

```text
@Audited metadata
      │
      ├─ compiler가 읽을 수도 있음
      ├─ annotation processor가 읽을 수도 있음
      └─ runtime framework가 reflection으로 읽을 수도 있음
```

### `@Target`은 어디에 붙일 수 있는지 제한한다

예를 들어 method에만 사용할 annotation을 만들 수 있습니다.

```java
@Target(ElementType.METHOD)
@interface Audited {
}
```

이 경우 class 자체에 붙이는 식의 잘못된 사용을 compiler가 막을 수 있습니다.

`ElementType`에는 class/type, method, field, parameter, constructor, annotation type, type use 등 여러 위치가 있습니다.

모든 값을 외우는 것보다 **annotation이 어떤 프로그램 요소를 설명하려는지**를 보고 target을 정하는 것이 중요합니다.

예를 들어:

- method 실행을 표시: `METHOD`
- DTO field constraint: `FIELD` 또는 실제 validation library 계약에 맞는 target
- parameter 정보: `PARAMETER`
- 타입 사용 위치 자체를 표시: `TYPE_USE`

처럼 목적과 연결합니다.

### `@Retention`은 metadata가 언제까지 남는지 정한다

Annotation이 source에 존재한다고 runtime reflection에서 반드시 찾을 수 있는 것은 아닙니다.

`RetentionPolicy`에는 세 가지가 있습니다.

| 정책 | 의미 |
|---|---|
| `SOURCE` | source 단계까지만 필요하고 class file에 유지되지 않아도 됨 |
| `CLASS` | class file에는 기록되지만 runtime reflection에서 사용할 필요는 없음 |
| `RUNTIME` | runtime에도 유지되어 reflection 등으로 조회 가능 |

예를 들어 runtime framework가 annotation을 읽어야 한다면:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {
}
```

처럼 `RUNTIME` retention이 필요합니다.

### compile-time 도구와 runtime framework는 필요한 retention이 다를 수 있다

Annotation processor가 source compile 중에만 annotation을 읽고 generated code를 만든다면 `SOURCE` retention도 충분할 수 있습니다.

```text
source annotation
     │
annotation processor
     │
     ▼
generated source/class
```

반면 Spring 같은 runtime framework가 load된 class에서 annotation metadata를 직접 읽으려면 runtime에 metadata가 남아 있어야 합니다.

```text
class loaded
     │
reflection
     │
     ▼
RUNTIME annotation 조회
```

따라서 "annotation이면 RUNTIME이 제일 좋다"가 아니라 **누가 언제 읽을 것인가**를 기준으로 retention을 정합니다.

### `@Target`과 `@Retention`도 annotation이다

Annotation을 설명하기 위해 annotation에 붙이는 annotation을 meta-annotation이라고 부릅니다.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}
```

여기서 `@Target`과 `@Retention`은 `Audited`라는 annotation type 자체의 사용 규칙을 설명하는 meta-annotation입니다.

Java에는 이 밖에도 `@Inherited`, `@Repeatable`, `@Documented` 같은 meta-annotation이 있습니다. 하지만 이름만 암기하기보다 실제 조회/상속 규칙이 필요할 때 해당 계약을 확인하면 됩니다.

### Runtime annotation도 자동으로 상속되는 것은 아니다

부모 class에 runtime annotation이 붙었다고 자식 class에서 모든 annotation을 자동으로 동일하게 읽을 수 있는 것은 아닙니다.

`@Inherited`는 특정 class-level annotation inheritance와 관련된 별도 규칙을 제공합니다. Method annotation inheritance까지 모든 위치에 일반적으로 적용되는 기능이 아닙니다.

Framework도 Java reflection 기본 규칙 위에 자체적인 annotation 탐색/합성 규칙을 추가할 수 있습니다. 예를 들어 Spring의 meta-annotation 탐색은 Java `AnnotatedElement` 기본 조회만으로 설명하면 부족할 수 있습니다.

따라서 **Java annotation contract와 framework annotation resolution을 구분**해야 합니다.

### Annotation 값에도 제약이 있다

Annotation element의 타입은 임의의 객체 타입을 자유롭게 사용할 수 있는 일반 field와 다릅니다. Primitive, String, Class, enum, annotation, 그리고 이들의 배열처럼 Java annotation에서 허용하는 타입 범위가 있습니다.

```java
@interface Route {
    String path();
    int timeout() default 1000;
}
```

기본값을 둘 수도 있습니다.

Annotation은 일반 객체처럼 runtime에서 마음대로 mutable state를 저장하는 용도가 아닙니다.

### Spring annotation을 이해할 때 무엇을 구분해야 할까

예를 들어 `@Transactional`을 보겠습니다.

```text
Java annotation
- metadata를 표현

Spring Framework
- metadata를 탐색
- transaction advisor/proxy 구성
- method 호출을 가로채 transaction behavior 적용
```

따라서 "`@Transactional` annotation이 transaction을 연다"라는 설명은 학습용 축약일 뿐이고, 실제로는 Spring infrastructure가 annotation을 해석해서 behavior를 제공합니다.

이 구분을 해두면 custom annotation도 "붙이면 실행된다"가 아니라 "누가 처리할 것인가"부터 설계하게 됩니다.

### 문제를 풀 때 확인할 것

1. annotation 자체와 annotation을 처리하는 주체를 구분합니다.
2. 어디에 붙여야 하는지 `@Target`을 확인합니다.
3. compile-time에만 필요한지 runtime에도 필요한지 `@Retention`을 봅니다.
4. Runtime reflection으로 찾으려면 실제 retention이 `RUNTIME`인지 확인합니다.
5. annotation inheritance를 자동으로 가정하지 않습니다.
6. Java 기본 annotation 조회와 Spring 같은 framework의 추가 탐색 규칙을 구분합니다.

### 면접에서 설명한다면

Annotation은 class나 method 같은 프로그램 요소에 붙이는 metadata입니다. `@Target`은 annotation을 사용할 수 있는 위치를 제한하고, `@Retention`은 metadata를 source까지만 둘지 class file에 남길지 runtime reflection에서도 볼 수 있게 할지를 결정합니다. Annotation 자체가 behavior를 실행하는 것은 아니며 compiler, annotation processor, Spring 같은 framework가 metadata를 읽어 실제 기능을 구현합니다.