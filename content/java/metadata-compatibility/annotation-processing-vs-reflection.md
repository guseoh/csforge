---
kind: concept
contentKey: java.core.metadata-compatibility.annotation-processing-vs-reflection
topicContentKey: java.core.metadata-compatibility
slug: annotation-processing-vs-reflection
title: "Annotation Processing과 Reflection"
summary: "annotation을 compile 시점에 읽어 code를 생성하는 annotation processing과 실행 중 metadata를 읽는 reflection의 시점·산출물·trade-off를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/javax/annotation/processing/package-summary.html"
    title: "Java SE 25 API: javax.annotation.processing"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: compile-time annotation processing API 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/package-summary.html"
    title: "Java SE 25 API: java.lang.reflect"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: runtime reflection phase와 결과 확인
---
# Annotation Processing과 Reflection

같은 annotation metadata라도 **언제 읽느냐**에 따라 설계가 크게 달라집니다. Compile 중 processor가 metadata를 읽어 코드를 만들 수도 있고, 실행 중 framework가 `Class`와 annotation을 reflection으로 조사할 수도 있습니다.

### Annotation processing은 compile 과정에 참여한다

Annotation processor는 `javac`의 processing round에 참여해 source/type model을 읽고 검증하거나 새 source를 생성할 수 있습니다.

```text
source + annotation
       │
       ▼
      javac
       │
annotation processor
  ├─ 규칙 검증
  ├─ compile error 보고
  └─ source 생성
       │
       ▼
   class artifact
```

예를 들어 build 시점에 mapper type이 모두 알려져 있다면 processor가 구현체를 생성하고 runtime에는 이미 만들어진 일반 Java class를 사용할 수 있습니다.

이 방식의 중요한 장점은 잘못된 metadata나 type 관계를 **compile time에 발견할 수 있다는 것**입니다. 대신 processor 설정, generated source, IDE/build tool integration이라는 build-time 복잡성이 추가됩니다.

### Reflection은 load된 runtime type을 조사한다

Reflection은 프로그램 실행 중 `Class`, `Method`, `Field`, annotation 같은 runtime metadata를 봅니다.

```java
Class<?> type = UserService.class;
Audited audited = type.getAnnotation(Audited.class);
```

```text
class artifact
      │
    JVM load
      │
      ▼
   Class<?> object
      │
  reflection
      ▼
runtime metadata
```

Build 시점에 어떤 type이 들어올지 알 수 없는 plugin이나 framework extension에는 이 동적 성질이 유용합니다.

### 차이의 핵심은 결정 시점과 산출물이다

| 구분 | Annotation Processing | Reflection |
| --- | --- | --- |
| 주요 시점 | compile time | runtime |
| 보는 대상 | source/type model | load된 Class/member |
| 오류 발견 | compile 중 가능 | 실행 중 발견 가능 |
| 대표 산출물 | generated source/class | runtime metadata lookup/invocation |
| 동적 type 대응 | build 시점 정보에 제한 | 실제 load된 type 조사 가능 |

둘은 경쟁 기술이라기보다 서로 다른 시점의 도구입니다.

### Retention은 consumer 시점과 맞아야 한다

Compile-time processor만 annotation을 읽는다면 runtime retention이 필요하지 않을 수 있습니다.

```java
@Retention(RetentionPolicy.SOURCE)
@interface GenerateMapper {}
```

반대로 runtime reflection으로 annotation을 찾아야 한다면 `RUNTIME` retention이 필요합니다.

```java
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}
```

그래서 retention을 고를 때는 "더 오래 남는 것이 좋은가"보다 **실제 consumer가 언제 metadata를 읽는가**를 봅니다.

### Generated code는 runtime 비용을 줄일 수 있지만 공짜가 아니다

Build 시점에 코드를 생성하면 runtime reflection lookup을 줄이고 compiler type checking을 활용할 수 있습니다. 하지만 generated artifact 증가, compile 시간, processor/compiler 호환성 비용이 생깁니다.

반대로 reflection은 runtime flexibility가 높지만 member lookup과 접근 실패가 실행 시점에 나타날 수 있습니다. Framework가 metadata를 startup에 한 번 읽고 cache하는지, hot path에서 매번 reflection하는지도 성능 판단에 영향을 줍니다.

따라서 "reflection은 느리니 무조건 processor" 또는 "processor가 최신이니 항상 더 낫다" 같은 선택은 피합니다.

### 하나의 framework가 두 방식을 섞을 수도 있다

실제 ecosystem에서는 compile-time metadata/index를 만들고 runtime에 일부 reflection을 사용하는 혼합 구조가 흔할 수 있습니다. Library 이름으로 분류하기보다 다음을 확인합니다.

- build 중 어떤 artifact가 생성되는가
- runtime에 reflection lookup이 남는가
- annotation retention이 어느 phase를 위한 것인가

Spring도 runtime reflection/proxy만 사용하는 하나의 방식으로 고정해서 설명하기 어렵고, 기능에 따라 build-time/AOT 처리가 함께 존재할 수 있습니다.

### 정리

Annotation processing은 compile 과정에서 source/type model을 읽어 검증하거나 코드를 생성하는 방식이고, reflection은 실행 중 load된 `Class`와 member metadata를 조사하는 방식입니다. Processing은 오류를 일찍 발견하고 generated code를 만들 수 있지만 build 복잡성이 늘고, reflection은 runtime에 동적으로 알려지는 type을 다루기 쉽습니다. 선택 기준은 기술 이름보다 **metadata를 언제 알고, 언제 결정해야 하는가**입니다.
