---
kind: concept
contentKey: java.core.metadata-compatibility.jpms-classpath-modulepath
topicContentKey: java.core.metadata-compatibility
slug: jpms-classpath-modulepath
title: "JPMS·Classpath·Module Path"
summary: "classpath와 JPMS module path의 차이, named/unnamed module, requires/exports를 이해하고 module 경계가 dependency와 접근 가능성을 어떻게 명시하는지 설명한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html"
    title: "Java SE 25 JLS Chapter 7: Packages and Modules"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: module declaration과 package/module 관계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Module.html"
    title: "Java SE 25 API: Module"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: named·unnamed module runtime metadata 확인
---
# JPMS·Classpath·Module Path

Classpath는 Java class와 jar를 찾기 위한 전통적인 실행 경로입니다. 단순하고 널리 사용되지만 "이 component가 어떤 module에 의존하는가", "외부에 공개할 package는 무엇인가"를 classpath 자체가 강하게 표현하지는 않습니다.

JPMS(Java Platform Module System)는 **dependency와 package 접근 경계를 module 단위로 명시**할 수 있게 합니다.

### Classpath는 class 탐색 경로가 중심이다

```text
classpath
├─ app.jar
├─ lib-a.jar
└─ lib-b.jar
      │
      ▼
ClassLoader가 class 탐색
```

Classpath에 jar가 있다는 사실은 class를 찾을 source가 있다는 뜻이지만 `app.jar`가 어느 library에 의존하고 어느 package만 public API인지까지 표현하지 않습니다.

### Named module은 dependency와 공개 package를 선언한다

```java
module com.example.app {
    requires com.example.library;
}
```

Library는 다음처럼 외부에 공개할 package를 선언할 수 있습니다.

```java
module com.example.library {
    exports com.example.library.api;
}
```

```text
com.example.app
      │ requires
      ▼
com.example.library
      │ exports
      ▼
com.example.library.api
```

`requires`는 다른 module에 대한 dependency/readability를, `exports`는 자신의 어떤 package를 다른 module의 일반 code에 공개할지를 표현합니다.

### `public`과 `exports`는 서로 다른 접근 경계다

```java
public class InternalEngine {
}
```

Class가 `public`이어도 해당 package가 named module에서 export되지 않았다면 module 밖의 일반 code가 접근할 수 없습니다.

```text
module library
├─ exports api.package
└─ internal.package
      └─ public InternalEngine
```

Java access modifier와 module package boundary를 함께 만족해야 한다는 뜻입니다.

### `opens`는 deep reflection과 연결된다

`exports`는 다른 module이 public/protected API를 일반 code로 사용하는 경계이고, `opens`는 runtime의 deep reflection을 허용하는 경계와 연결됩니다.

```text
exports -> 일반 compile/runtime 접근
opens   -> runtime deep reflection 허용
```

그래서 reflection code에서 `setAccessible(true)`를 호출했다고 JPMS strong encapsulation을 항상 무시할 수 있는 것은 아닙니다. Framework가 private constructor나 field를 reflection으로 사용한다면 package가 필요한 module에 open되어 있는지 확인해야 합니다.

### Classpath code는 unnamed module에 속한다

Named module에 속하지 않는 type은 defining ClassLoader의 unnamed module에 속합니다. Java 25 `Module` API는 unnamed module이 name을 가지지 않으며, 일반적으로 classpath에서 load된 type이 여기에 속한다고 설명합니다.

```text
classpath classes/jars
       │
       ▼
Unnamed Module
```

Unnamed module은 기존 classpath application과의 호환성을 위해 named module보다 느슨한 접근 모델을 가집니다. 따라서 `module-info.java`를 사용하지 않는 Spring Boot 애플리케이션도 Java runtime의 module 개념과 완전히 무관한 것은 아닙니다.

### Module path에서는 module graph를 해석한다

Named module을 module path에 두면 launcher/compiler는 module descriptor를 읽고 dependency graph를 구성합니다.

```text
module path
├─ app.jar
├─ library.jar
└─ ...
     │
     ▼
module resolution
     │
     ▼
module graph
```

즉 classpath와 module path는 단순히 옵션 이름만 다른 class search list가 아닙니다. Module path에는 module identity, readability, exports/opens 같은 추가 계약이 존재합니다.

### JPMS 도입은 framework 요구와 함께 판단한다

Spring, ORM, serializer처럼 reflection을 많이 사용하는 framework에서는 named module을 도입했을 때 필요한 package openness와 dependency module metadata를 함께 확인해야 합니다.

또 모든 backend project가 JPMS를 사용해야 하는 것도 아닙니다. 다음을 보고 실제 가치가 있는지 판단합니다.

- 강한 module encapsulation이 필요한가
- dependencies가 module metadata를 안정적으로 제공하는가
- reflection framework 설정 비용이 어느 정도인가
- library API 경계를 module 수준에서 공개할 필요가 있는가

### 정리

Classpath는 class와 jar를 찾는 전통적인 실행 경로이고, JPMS는 named module의 dependency와 package 접근 경계를 module graph에 명시합니다. `requires`는 dependency/readability를, `exports`는 외부에 공개할 package를, `opens`는 deep reflection 경계를 표현합니다. Classpath type은 unnamed module과 연결되며, JPMS 도입 여부는 실제 encapsulation 이점과 framework/dependency 호환성 비용을 보고 결정해야 합니다.
