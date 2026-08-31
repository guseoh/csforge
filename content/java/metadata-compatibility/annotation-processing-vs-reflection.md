---
kind: concept
contentKey: java.core.metadata-compatibility.annotation-processing-vs-reflection
topicContentKey: java.core.metadata-compatibility
slug: annotation-processing-vs-reflection
title: "Annotation processing versus reflection"
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
# 같은 annotation을 읽어도 처리 시점이 다르면 무엇이 달라질까

Annotation은 metadata입니다. 그런데 그 metadata를 **언제 읽느냐**에 따라 전체 설계가 달라집니다.

어떤 도구는 Java source를 compile하는 동안 annotation을 읽어 새 코드를 생성합니다. 다른 framework는 프로그램이 실행된 뒤 load된 `Class`의 annotation을 reflection으로 읽습니다.

이 둘을 각각 annotation processing과 runtime reflection 관점으로 구분할 수 있습니다.

### Annotation processing은 compile 과정에 참여한다

```text
Java source + annotations
          │
          ▼
       javac
          │
   Annotation Processor
          │
          ├─ source model 검사
          ├─ compile-time 오류 보고
          └─ generated source 생성 가능
                  │
                  ▼
              compile
                  │
                  ▼
            class artifacts
```

Processor는 `javax.annotation.processing` API를 통해 compile round에 참여합니다.

예를 들어 다음과 같은 annotation이 있다고 해 보겠습니다.

```java
@GenerateMapper
interface UserMapperSpec {
}
```

Processor가 compile 시점에 이를 읽고:

```java
final class GeneratedUserMapper implements UserMapperSpec {
    // generated implementation
}
```

같은 source를 생성할 수 있습니다.

실행 시점에는 이미 생성된 class를 일반 Java 코드처럼 사용할 수 있습니다.

### compile-time에 오류를 더 일찍 발견할 수 있다

Processor는 source/type model을 보는 시점에 규칙을 검증할 수 있습니다.

예를 들어 특정 annotation이 붙은 type에 필수 method가 없으면 compile error를 발생시킬 수 있습니다.

```text
잘못된 source
    │
processor validation
    │
    └─ compile 실패
```

Runtime까지 애플리케이션을 띄운 뒤 reflection lookup에서 실패하는 것보다 오류를 빨리 발견할 수 있는 장점이 있습니다.

다만 processor 자체의 build 설정과 generated source 관리가 필요하고, compile 시간이 늘거나 IDE/build tool integration 문제를 고려해야 할 수도 있습니다.

### Reflection은 이미 실행 중인 class를 본다

Reflection은 프로그램 runtime에 load된 `Class`를 사용합니다.

```java
Class<?> type = UserService.class;
Audited annotation = type.getAnnotation(Audited.class);
```

흐름은 다음과 다릅니다.

```text
class artifact
     │
JVM load
     │
     ▼
Class<?> runtime object
     │
reflection
     ▼
metadata/member 조사
```

따라서 reflection 기반 framework는 애플리케이션 startup이나 실제 요청 중에 class 구조를 검사할 수 있습니다.

### 두 방식의 가장 큰 차이는 "결정 시점"이다

| 구분              | Annotation Processing | Reflection                                         |
| ----------------- | --------------------- | -------------------------------------------------- |
| 주요 시점         | compile time          | runtime                                            |
| 보는 대상         | source/type model     | load된 Class/member                                |
| 오류 발견         | compile 중 가능       | 실행 중 가능                                       |
| code generation   | 대표적인 사용 방식    | 자체적으로 compile-time source 생성하는 API는 아님 |
| runtime lookup    | 줄일 수 있음          | 필요할 수 있음                                     |
| 동적 runtime 정보 | 제한적                | 실제 loaded type을 볼 수 있음                      |

어느 쪽이 무조건 더 좋은 것이 아니라 문제의 성격이 다릅니다.

### Retention과 처리 시점을 연결해야 한다

Compile-time processor가 source의 annotation을 읽는다면 annotation이 runtime까지 남을 필요가 없을 수 있습니다.

```java
@Retention(RetentionPolicy.SOURCE)
@interface GenerateMapper {}
```

SOURCE annotation도 compile 시점 processor에는 의미가 있을 수 있습니다.

반대로 runtime reflection으로 annotation을 찾아야 한다면 일반적으로 `RUNTIME` retention이 필요합니다.

```java
@Retention(RetentionPolicy.RUNTIME)
@interface Audited {}
```

그래서 "RUNTIME retention이 더 강하니 항상 RUNTIME으로 한다"가 아니라 **annotation consumer가 어느 시점에 필요한가**를 봅니다.

### Code generation은 runtime reflection 비용을 줄일 수 있지만 공짜는 아니다

Compile-time generator는 runtime에 이미 만들어진 코드를 직접 호출할 수 있게 합니다.

```text
Reflection approach
request/startup -> inspect metadata -> invoke dynamically

Generated approach
compile -> source generation -> ordinary method call at runtime
```

이 방식은 runtime lookup과 reflection dependency를 줄이고 compile-time type checking을 활용할 수 있습니다.

하지만 다음 비용도 있습니다.

- generated source가 많아짐
- build 과정이 복잡해질 수 있음
- processor version과 compiler/build tool compatibility
- 오류 메시지가 generated code와 얽힐 수 있음

따라서 "reflection은 느리니 무조건 annotation processor" 같은 결론은 피합니다.

### Runtime 동적 확장에는 reflection이 자연스러울 수 있다

프로그램이 실행된 후 실제 plugin class나 사용자 class를 처음 알게 되는 경우에는 compile-time processor가 모든 type을 미리 생성하기 어렵습니다.

```text
runtime plugin jar load
       │
       ▼
unknown-at-build-time Class
       │
       ▼
reflection/framework inspection
```

반대로 DTO mapper처럼 build 시점에 type이 모두 알려져 있다면 code generation이 잘 맞을 수 있습니다.

문제의 **동적 정도**를 보고 선택합니다.

### Framework 하나가 둘을 같이 사용할 수도 있다

실제 ecosystem에서는 "processor 기반 framework"와 "reflection framework"가 완전히 둘 중 하나로만 나뉘지 않습니다.

Compile-time에 metadata/index/generated class를 만들고 runtime에 일부 reflection을 함께 사용할 수도 있습니다. 그래서 library 이름만 보고 판단하지 말고:

- build 중 어떤 generated artifact가 생기는가
- runtime에 reflection lookup이 있는가
- annotation retention은 무엇인가

를 실제로 확인합니다.

### Spring과 연결할 때 경계를 구분한다

전통적인 Spring Framework의 많은 기능은 runtime Bean metadata, reflection, proxy와 깊게 연결됩니다. 반면 Spring ecosystem 안에서도 configuration metadata generation이나 AOT processing처럼 build-time 처리를 사용하는 기능이 존재할 수 있습니다.

그래서 "Spring은 reflection framework"라는 한 문장으로 모든 기능을 고정하지 않고 기능별 처리 시점을 봅니다.

### 문제를 풀 때 확인할 것

1. Annotation을 누가 읽는지 확인합니다.
2. 읽는 시점이 compile인지 runtime인지 구분합니다.
3. generated source/class가 build artifact로 만들어지는지 봅니다.
4. Runtime reflection이 필요하다면 retention이 맞는지 확인합니다.
5. Compile-time error 발견과 runtime flexibility 중 어떤 장점이 필요한지 봅니다.
6. Library 이름이 아니라 실제 phase와 artifact를 확인합니다.

### 면접에서 설명한다면

Annotation processing은 `javac` compile 과정에서 annotation과 source/type model을 읽어 검증하거나 새 source를 생성할 수 있는 방식입니다. Reflection은 애플리케이션이 실행된 뒤 load된 `Class`, method, field, annotation을 runtime에 조사합니다. Processing은 오류를 compile 시점에 발견하고 generated code를 만들 수 있는 반면 build 과정이 추가되고, reflection은 runtime에 동적으로 알려지는 type을 다루기 쉽습니다. 어떤 방식을 쓸지는 처리 시점과 필요한 유연성을 보고 결정합니다.
