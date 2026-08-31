---
kind: concept
contentKey: java.core.metadata-compatibility.jpms-classpath-modulepath
topicContentKey: java.core.metadata-compatibility
slug: jpms-classpath-modulepath
title: "JPMS, classpath, and module path"
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
# Classpath만으로도 실행되는데 module system은 왜 생겼을까

전통적인 Java 애플리케이션은 classpath에 jar와 class directory를 나열하고 필요한 class를 찾았습니다. 이 방식은 단순하고 지금도 매우 널리 쓰이지만, 큰 애플리케이션에서는 **어떤 component가 어떤 다른 component에 의존하는지, 어느 package가 외부에 공개된 API인지**를 classpath만으로 강하게 표현하기 어렵습니다.

JPMS(Java Platform Module System)는 이런 dependency와 encapsulation 경계를 module이라는 단위로 명시할 수 있게 합니다.

### Classpath는 "어디에서 class를 찾을 것인가"가 중심이다

예를 들어:

```text
java -cp app.jar:lib-a.jar:lib-b.jar com.example.Main
```

처럼 classpath에 class/jar source를 나열할 수 있습니다.

ClassLoader는 필요한 binary name을 classpath 등에서 찾습니다.

```text
classpath
├─ app.jar
├─ lib-a.jar
└─ lib-b.jar
       │
       ▼
ClassLoader가 class 탐색
```

하지만 `app.jar`가 실제로 `lib-a`에 의존하는지, `lib-a`의 어떤 package가 외부 API인지가 classpath 자체에 명시적으로 드러나는 것은 아닙니다.

### Module은 이름과 dependency를 선언한다

JPMS에서는 `module-info.java`를 사용해 named module을 선언할 수 있습니다.

```java
module com.example.app {
    requires com.example.library;
}
```

Library 쪽은:

```java
module com.example.library {
    exports com.example.library.api;
}
```

처럼 선언할 수 있습니다.

큰 그림은:

```text
com.example.app
      │ requires
      ▼
com.example.library
      │ exports
      ▼
com.example.library.api
```

입니다.

### `requires`와 `exports`는 서로 다른 질문에 답한다

둘을 같은 것으로 외우면 안 됩니다.

`requires`는:

> 이 module이 어떤 다른 module을 읽어야 하는가?

를 표현합니다.

`exports`는:

> 내 module의 어떤 package를 다른 module의 일반 code가 접근할 수 있게 공개하는가?

를 표현합니다.

```text
requires = dependency/readability
exports  = package accessibility
```

Library를 `requires`했다고 그 library의 모든 internal package가 자동으로 공개되는 것은 아닙니다.

### public class여도 package가 export되지 않으면 module 밖에서 못 쓸 수 있다

```java
public class InternalEngine {
}
```

Class가 `public`이라는 사실만으로 모든 named module에서 접근 가능한 것은 아닙니다.

그 class가 들어 있는 package가 module에서 export되지 않았다면 module boundary가 추가로 접근을 제한할 수 있습니다.

```text
module library
├─ exports api.package
└─ internal.package   // export 안 함
      └─ public InternalEngine
```

`public`은 Java language access modifier이고, `exports`는 module boundary입니다. 두 층을 함께 봐야 합니다.

### `exports`와 `opens`도 목적이 다르다

Runtime reflection을 사용하는 framework에서는 `exports`만으로 충분하지 않은 경우가 있습니다. JPMS는 deep reflection과 관련해 package를 `opens`할 수 있는 별도 개념을 둡니다.

큰 방향은:

- `exports`: 다른 module의 일반 code에서 public type/member 접근
- `opens`: runtime reflection을 위한 package 개방과 관련

으로 구분합니다.

정확한 qualified exports/opens와 reflection access 규칙은 JLS/Module API 계약을 확인합니다.

그래서 reflection에서 `setAccessible(true)`를 호출했다고 module strong encapsulation이 항상 무시되는 것은 아닙니다.

### Classpath code는 unnamed module과 연결된다

기존 classpath 기반 code는 일반적으로 unnamed module에 속합니다.

```text
classpath classes/jars
       │
       ▼
Unnamed Module
```

Unnamed module은 기존 classpath 애플리케이션과의 compatibility를 위해 named module보다 느슨한 모델을 제공합니다.

그래서 프로젝트가 module system을 쓰지 않는다고 해서 Java 프로그램이 "module이라는 runtime 개념과 완전히 무관"하다고 말할 수는 없습니다. 하지만 일반 Spring Boot 프로젝트에서 직접 `module-info.java`를 작성하지 않고 classpath 기반으로 운영하는 것도 흔합니다.

### module path는 named module을 해석하는 source다

Named module jar를 module path에 두면 JVM launcher가 module descriptor와 dependency graph를 사용해 module을 구성합니다.

```text
module path
├─ app.jar (module-info.class)
├─ library.jar
└─ ...
      │
      ▼
module resolution
      │
      ▼
module graph
```

Classpath와 module path는 단순히 option 이름만 다른 같은 검색 목록이 아닙니다. Module path에서는 module identity와 dependency resolution이 추가됩니다.

### 모든 jar가 처음부터 완전한 named module일 필요는 없다

기존 ecosystem에는 `module-info.class`가 없는 jar도 많았습니다. JPMS는 migration을 위해 automatic module 같은 연결 지점을 제공합니다.

하지만 automatic module name과 dependency behavior는 장기 API 설계에서 주의해야 할 수 있습니다. Library가 공식 module descriptor를 제공하는지 확인하고, jar file name에 의존하는 임시 module name을 public contract로 함부로 고정하지 않는 편이 좋습니다.

### Split package 문제가 더 엄격해진다

Classpath 환경에서는 서로 다른 jar에 같은 package name이 존재할 수 있었지만 이는 class loading과 maintenance 문제를 만들 수 있습니다.

Named module에서는 일반적인 module graph에서 같은 package를 여러 named module이 나눠 제공하는 split package를 허용하지 않는 방향으로 강한 경계를 둡니다.

```text
module A -> com.example.common
module B -> com.example.common

named module graph에서 문제
```

Module은 package ownership을 더 명확하게 만드는 효과가 있습니다.

### Spring/Framework에서는 reflection 경계를 실제로 확인해야 한다

Framework가 constructor, private field, annotation을 reflection으로 읽는 경우 module을 도입하면 package openness 설정이 필요할 수 있습니다.

```text
Application module
   │ private members
   │
Framework reflection
   │
   └─ package open 여부 확인
```

그래서 기존 classpath Spring application을 JPMS로 옮길 때는 단순히 `module-info.java` 파일 하나를 추가하는 작업이 아닙니다. Framework의 reflection 요구, dependencies의 module metadata, test/runtime launch 설정을 함께 확인해야 합니다.

### JPMS를 모든 backend 프로젝트에 강제할 필요는 없다

JPMS는 dependency/encapsulation을 language/runtime 수준에서 명시할 수 있는 강력한 도구이지만, 일반 Spring Boot 서비스가 반드시 module path로 실행되어야 하는 것은 아닙니다.

도입 판단에는:

- 실제 module boundary가 필요한 규모인지
- dependencies가 module system을 잘 지원하는지
- reflection framework와의 설정 비용
- library 배포/API encapsulation 목표

를 봅니다.

기술이 존재한다는 이유만으로 사용하는 것이 아니라 얻을 수 있는 boundary가 비용보다 가치 있는지 판단합니다.

### 문제를 풀 때 확인할 것

1. classpath와 module path를 같은 class search option으로만 보지 않습니다.
2. `requires`와 `exports`의 역할을 구분합니다.
3. `public` class와 exported package를 별도 조건으로 봅니다.
4. Reflection 접근에는 `opens`/module boundary를 확인합니다.
5. Classpath code가 unnamed module과 연결된다는 점을 이해합니다.
6. 모든 Java/Spring 프로젝트에 JPMS가 필수라고 가정하지 않습니다.

### 면접에서 설명한다면

Classpath는 class와 jar를 찾는 전통적인 실행 경로이고, JPMS는 module 이름과 dependency, 외부에 공개할 package를 명시하는 module graph를 추가합니다. `requires`는 다른 module에 대한 dependency/readability를, `exports`는 외부에서 접근 가능한 package를 표현합니다. Public class라도 package가 export되지 않으면 named module 밖에서 접근할 수 없고, reflection에는 `opens` 같은 추가 경계가 영향을 줄 수 있습니다. 일반 classpath application은 unnamed module로 동작할 수 있으며 JPMS 도입은 실제 encapsulation 요구와 framework compatibility를 보고 판단합니다.
