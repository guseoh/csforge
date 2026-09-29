---
kind: concept
contentKey: java.core.metadata-compatibility.jpms-classpath-modulepath
topicContentKey: java.core.metadata-compatibility
slug: jpms-classpath-modulepath
title: "JPMS·클래스패스(Classpath)·모듈 경로(Module Path)"
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
# JPMS·클래스패스(Classpath)·모듈 경로(Module Path)

Classpath는 Java 클래스와 JAR를 찾는 전통적인 실행 경로입니다. 단순하고 널리 쓰이지만 "이 구성 요소가 어느 모듈에 의존하는가", "외부에 공개할 패키지는 무엇인가"를 경로 자체가 명확히 표현하지는 않습니다.

JPMS(Java Platform Module System)는 **의존성과 패키지 접근 경계를 모듈 단위로 명시**할 수 있게 합니다.

### Classpath에서는 클래스 탐색 경로를 지정한다

```text
classpath
├─ app.jar
├─ lib-a.jar
└─ lib-b.jar
      │
      ▼
ClassLoader가 클래스 탐색
```

Classpath에 JAR가 있다는 것은 클래스를 찾을 위치가 있다는 뜻입니다. 하지만 `app.jar`가 어느 라이브러리에 의존하고 어떤 패키지만 공개 API인지까지 나타내지는 않습니다.

### 명명 모듈(named module)은 의존성과 공개 패키지를 선언한다

```java
module com.example.app {
    requires com.example.library;
}
```

라이브러리는 다음처럼 외부에 공개할 패키지를 선언할 수 있습니다.

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

`requires`는 다른 모듈에 대한 의존성과 가독성(readability)을, `exports`는 자신의 어떤 패키지를 다른 모듈의 일반 코드에 공개할지를 나타냅니다.

### `public`과 `exports`는 서로 다른 접근 경계다

```java
public class InternalEngine {
}
```

클래스가 `public`이어도 해당 패키지가 명명 모듈에서 export되지 않았다면 모듈 밖의 일반 코드는 접근할 수 없습니다.

```text
모듈 library
├─ exports api.package
└─ internal.package
      └─ public InternalEngine
```

Java 접근 제어자와 모듈의 패키지 경계를 모두 만족해야 합니다.

### `opens`는 심층 리플렉션(deep reflection)과 연결된다

`exports`는 다른 모듈이 공개·보호 API를 일반 코드에서 사용하는 경계를 정하고, `opens`는 실행 시점의 심층 리플렉션을 허용하는 경계를 정합니다.

```text
exports -> 일반적인 컴파일·실행 시점 접근
opens   -> 실행 시점 심층 리플렉션 허용
```

따라서 리플렉션 코드에서 `setAccessible(true)`를 호출해도 JPMS의 강한 캡슐화를 항상 무시할 수는 없습니다. 프레임워크가 비공개 생성자나 필드를 리플렉션으로 사용한다면 해당 패키지가 필요한 모듈에 열려 있는지 확인해야 합니다.

### Classpath의 코드는 비명명 모듈(unnamed module)에 속한다

명명 모듈에 속하지 않는 타입은 이를 정의한 `ClassLoader`의 비명명 모듈에 속합니다. Java 25 `Module` API에 따르면 비명명 모듈은 이름이 없으며, 일반적으로 classpath에서 로드된 타입이 여기에 속합니다.

```text
classpath의 클래스·JAR
       │
       ▼
비명명 모듈
```

비명명 모듈은 기존 classpath 애플리케이션과의 호환성을 위해 명명 모듈보다 느슨한 접근 모델을 가집니다. 따라서 `module-info.java`를 사용하지 않는 Spring Boot 애플리케이션도 Java 실행 환경의 모듈 개념과 완전히 무관하지는 않습니다.

### Module path에서는 모듈 그래프를 해석한다

명명 모듈을 module path에 두면 실행 도구와 컴파일러가 모듈 디스크립터를 읽고 의존성 그래프를 구성합니다.

```text
모듈 경로
├─ app.jar
├─ library.jar
└─ ...
     │
     ▼
모듈 해석
     │
     ▼
모듈 그래프
```

따라서 classpath와 module path는 옵션 이름만 다른 클래스 검색 경로가 아닙니다. 모듈 경로에는 모듈 식별성(module identity), 가독성(readability), `exports`·`opens` 같은 추가 계약이 있습니다.

### JPMS 도입 여부는 프레임워크 요구와 함께 판단한다

Spring, ORM, 직렬화 도구처럼 리플렉션을 많이 사용하는 프레임워크에서는 명명 모듈을 도입할 때 필요한 패키지 개방과 의존성의 모듈 메타데이터를 함께 확인해야 합니다.

모든 백엔드 프로젝트가 JPMS를 사용해야 하는 것도 아닙니다. 다음 항목을 살펴 실제 가치가 있는지 판단합니다.

- 강한 모듈 캡슐화가 필요한가
- 의존성이 모듈 메타데이터를 안정적으로 제공하는가
- 리플렉션 기반 프레임워크의 설정 비용은 어느 정도인가
- 라이브러리 API 경계를 모듈 수준에서 공개할 필요가 있는가

### 정리

Classpath는 클래스와 JAR를 찾는 전통적인 실행 경로이고, JPMS는 명명 모듈의 의존성과 패키지 접근 경계를 모듈 그래프에 명시합니다. `requires`는 의존성·가독성을, `exports`는 외부 공개 패키지를, `opens`는 심층 리플렉션 경계를 나타냅니다. Classpath의 타입은 비명명 모듈과 연결됩니다. JPMS 도입 여부는 실제 캡슐화 이점과 프레임워크·의존성 호환성 비용을 보고 결정해야 합니다.
