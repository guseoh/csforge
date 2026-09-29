---
kind: concept
contentKey: java.core.metadata-compatibility.annotations-retention-target
topicContentKey: java.core.metadata-compatibility
slug: annotations-retention-target
title: "애너테이션의 보존 정책(Retention)과 적용 대상(Target)"
summary: "애너테이션이 메타데이터라는 점과 `@Target`·`@Retention`이 부착 위치와 보존 기간을 정한다는 점을 이해한다"
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
# 애너테이션의 보존 정책(Retention)과 적용 대상(Target)

Spring을 사용하면 `@Service`, `@Transactional`, `@Valid`처럼 애너테이션을 자주 만나기 때문에 애너테이션 자체가 기능을 실행한다고 생각하기 쉽습니다. Java 관점에서 애너테이션은 먼저 **클래스·메서드·필드 같은 프로그램 요소에 붙이는 메타데이터**입니다. 실제 동작은 컴파일러, 애너테이션 프로세서, 프레임워크처럼 그 메타데이터를 읽는 주체가 구현합니다.

### 애너테이션은 메타데이터이며 실행 주체는 따로 있다

```java
@interface Audited {
    String value();
}

@Audited("order")
class OrderService {
}
```

이 코드는 `OrderService`에 `Audited` 메타데이터를 붙입니다. 이것만으로 로그나 트랜잭션이 자동으로 시작되지는 않습니다.

```text
애너테이션 메타데이터
       │
       ├─ 컴파일러
       ├─ 애너테이션 프로세서
       └─ 실행 시점 프레임워크
              │
              ▼
          실제 동작
```

그래서 custom annotation을 설계할 때도 "무엇을 붙일까"와 함께 **누가 언제 읽을 것인가**를 정해야 합니다.

### `@Target`은 애너테이션을 붙일 수 있는 위치를 제한한다

```java
@Target(ElementType.METHOD)
@interface Audited {
}
```

이 애너테이션은 메서드에만 사용할 수 있습니다. `ElementType`에는 타입, 메서드, 필드, 매개변수, 생성자, 애너테이션 타입, 타입 사용 위치 등이 있습니다.

모든 enum 값을 암기하기보다 annotation의 의미가 어떤 프로그램 요소를 설명하는지 먼저 정합니다.

```text
method 실행 특성 -> METHOD
parameter 의미    -> PARAMETER
필드 메타데이터   -> FIELD
타입 사용 자체    -> TYPE_USE
```

### `@Retention`은 메타데이터를 어느 단계까지 보존할지 정한다

보존 정책(Retention policy)은 애너테이션 정보를 어느 단계까지 유지할지 결정합니다.

| 정책 | 핵심 의미 |
| --- | --- |
| `SOURCE` | 소스 처리 이후 class file에 남길 필요가 없음 |
| `CLASS` | class file에는 기록하지만 실행 시점 리플렉션 조회는 보장하지 않음 |
| `RUNTIME` | 실행 시점 리플렉션으로 조회할 수 있도록 유지 |

실행 시점 프레임워크가 애너테이션을 직접 읽어야 한다면 보통 `RUNTIME` 보존 정책이 필요합니다.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {
}
```

반대로 컴파일 시점 애너테이션 프로세서만 읽어 코드를 생성한다면 애너테이션 정보를 실행 시점까지 보존할 필요가 없을 수 있습니다.

### 보존 기간이 길수록 좋은 설정은 아니다

```text
컴파일 시 애너테이션 프로세서
소스 애너테이션 -> 프로세서 -> 생성 코드

실행 시점 프레임워크
클래스 메타데이터 -> 리플렉션 -> 프레임워크 동작
```

`RUNTIME`이 가장 오래 정보를 남긴다고 모든 애너테이션에 적합한 것은 아닙니다. 메타데이터 사용 주체가 컴파일 시점에만 동작한다면 `SOURCE`나 `CLASS`가 더 알맞은 계약일 수 있습니다.

`@Retention`을 생략하면 Java는 기본적으로 `CLASS` 보존 정책을 적용합니다. 따라서 실행 시점 조회가 필요한 애너테이션에 보존 정책을 명시하지 않으면 기대한 리플렉션 결과를 얻지 못할 수 있습니다.

### `@Target`과 `@Retention`도 annotation이다

애너테이션 타입의 사용 규칙을 지정하는 애너테이션을 메타 애너테이션(meta-annotation)이라고 부릅니다.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}
```

여기서 `@Target`, `@Retention`이 `Audited` 자체를 설명합니다. `@Inherited`, `@Repeatable`, `@Documented`도 meta-annotation이지만 각각 별도 계약을 가집니다.

특히 `@Inherited`는 클래스 수준 애너테이션의 상속과 관련된 규칙입니다. 메서드 애너테이션 등 모든 위치에 일반적으로 적용되는 상속 기능은 아닙니다.

### Java annotation 규칙과 framework 탐색 규칙을 구분한다

Java 리플렉션의 기본 애너테이션 조회 규칙 위에 Spring 같은 프레임워크가 메타 애너테이션 탐색이나 합성 규칙을 더할 수 있습니다.

```text
Java
  -> annotation metadata와 reflection 기본 계약

Spring
  -> 그 metadata를 탐색·합성하고 기능 적용
```

따라서 `@Transactional`이 트랜잭션을 "직접 연다"고 설명하기보다 Spring 인프라가 애너테이션 메타데이터를 해석해 프록시·인터셉터 동작을 적용한다고 이해하는 편이 정확합니다.

### 정리

애너테이션은 프로그램 요소에 붙이는 메타데이터입니다. `@Target`은 사용할 수 있는 위치를, `@Retention`은 메타데이터가 어느 단계까지 남는지를 결정합니다. 실행 중 리플렉션이 필요하면 `RUNTIME` 보존 정책이 필요하고, 컴파일 시 애너테이션 프로세서만 사용한다면 실행 시점까지 보존하지 않아도 될 수 있습니다. 애너테이션 자체와 이를 해석해 기능을 수행하는 컴파일러·프레임워크를 구분하는 것이 핵심입니다.
