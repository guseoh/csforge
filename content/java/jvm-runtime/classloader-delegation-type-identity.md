---
kind: concept
contentKey: java.core.jvm-runtime.classloader-delegation-type-identity
topicContentKey: java.core.jvm-runtime
slug: classloader-delegation-type-identity
title: "ClassLoader 위임과 타입 동일성"
summary: "어떤 ClassLoader가 클래스를 정의했는지가 런타임 타입 동일성의 일부임을 이해하고, 위임 방식이 중복 로딩을 줄이는 원리를 설명한다"
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ClassLoader.html"
    title: "Java SE 25 API: ClassLoader"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: loading·parent delegation·defining loader 확인
  - url: "https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-5.html#jvms-5.3"
    title: "Java SE 25 JVMS: Creation and Loading"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: binary name과 defining loader의 runtime type identity 확인
---
# ClassLoader 위임과 타입 동일성

Java 실행 시점에 클래스는 이름만으로 식별되지 않습니다. 같은 `com.example.Plugin`이라는 바이너리 이름(binary name)이라도 **서로 다른 `ClassLoader`가 각각 정의하면 별개의 실행 시점 타입(runtime type)** 이 될 수 있습니다. 이 규칙은 플러그인, 애플리케이션 서버, 핫 리로드 환경에서 발생하는 `ClassCastException`의 원리를 이해하는 핵심입니다.

![ClassLoader 경계와 런타임 타입 동일성](/learning/java/classloader-type-identity.svg)

### `ClassLoader`는 클래스를 찾아 정의한다

`ClassLoader`는 바이너리 이름에 대응하는 클래스 정의(class definition)를 찾아 JVM에 제공합니다.

```text
"com.example.Plugin"
        │
        ▼
   ClassLoader
        │ 클래스 바이트
        ▼
   실행 중인 Class 객체
```

클래스 바이트는 JAR나 디렉터리뿐 아니라 사용자 정의 로더가 관리하는 다른 출처에서 올 수도 있습니다. 중요한 것은 어느 파일에서 왔는지만이 아니라 **어느 로더가 해당 클래스를 정의했는가**입니다.

### 기본 `loadClass` 흐름은 부모 위임(parent delegation)을 사용한다

`ClassLoader.loadClass`의 일반적인 기본 구현은 클래스가 이미 로드되었는지 확인한 뒤 부모 로더에 먼저 요청하고, 부모가 찾지 못하면 자신의 `findClass` 경로를 사용합니다.

```text
애플리케이션 클래스 로더
       │
       ├─ parent에게 요청
       ▼
플랫폼 / 부트스트랩
       │
       └─ 찾지 못함
             │
             ▼
      자식 로더가 직접 탐색
```

이 구조는 플랫폼 클래스나 공통 라이브러리가 여러 로더에서 제각각 중복 정의되는 일을 줄입니다.

그러나 **모든 사용자 정의 로더가 반드시 부모 우선(parent-first)이어야 하는 것은 아닙니다.** 플러그인이나 컨테이너가 자식 우선(child-first) 정책이나 다른 로더 구조를 사용할 수도 있으므로 실제 환경에서 해당 로더 구현의 계약을 확인해야 합니다.

### 실행 시점 타입 동일성에는 클래스를 정의한 로더가 포함된다

두 로더가 같은 이름의 클래스를 각각 정의해 보겠습니다.

```text
Loader A ──▶ com.example.Plugin
Loader B ──▶ com.example.Plugin
```

두 `Class`의 이름 문자열은 같아도 실행 시점 타입은 다를 수 있습니다.

```java
Class<?> a = loaderA.loadClass("com.example.Plugin");
Class<?> b = loaderB.loadClass("com.example.Plugin");

System.out.println(a.getName().equals(b.getName())); // true 가능
System.out.println(a == b);                         // false 가능
```

즉 JVM 관점에서 중요한 조합은 다음과 같습니다.

```text
바이너리 이름(binary name) + 클래스를 정의한 `ClassLoader`
```

그래서 로더 A가 정의한 `Plugin` 객체를 로더 B가 정의한 같은 이름의 `Plugin`으로 캐스팅할 수 없을 수 있습니다.

### 공통 API는 공유 로더 경계에 둔다

플러그인 시스템에서 호스트와 플러그인이 같은 인터페이스로 협력하려면 공통 API를 양쪽이 공유하는 로더에서 정의하는 구조가 자연스럽습니다.

```text
공유 부모 로더
   └─ PluginApi 타입
          ▲
          │ implements
 ┌────────┴────────┐
플러그인 로더 A  플러그인 로더 B
    ImplA             ImplB
```

반대로 각 플러그인 로더가 `PluginApi`까지 별도로 정의하면 소스에서 보이는 이름은 같아도 실행 시점 타입 동일성이 달라집니다. 이 경우 호스트는 구현체를 자신이 사용하는 `PluginApi`와 같은 타입으로 보지 못할 수 있습니다.

### Classpath와 `ClassLoader`는 같은 개념이 아니다

Classpath나 module path는 클래스를 찾을 위치를 지정하는 경로·설정입니다. `ClassLoader`는 실행 시점에 실제 클래스 정의를 찾아 JVM에 제공하는 주체입니다.

```text
classpath / module path -> 탐색 경로
ClassLoader             -> 실행 시점 로딩·정의 주체
```

따라서 같은 jar가 클래스패스에 있다는 사실만으로 두 객체가 같은 defining 로더의 같은 `Class`라고 결론내릴 수 없습니다.

### 진단할 때는 이름뿐 아니라 로더도 확인한다

이름이 같은데 캐스팅이 실패하거나 hot reload 후 이상한 linkage 문제가 생기면 다음을 확인합니다.

```java
System.out.println(value.getClass());
System.out.println(value.getClass().getClassLoader());
```

실제 `Class` 객체의 동일성(identity), 클래스를 정의한 로더, 클래스 바이트의 출처, 로더 위임 구조를 함께 살펴야 합니다. 특히 Spring Boot devtools, 플러그인 프레임워크, 애플리케이션 서버처럼 여러 로더가 공존하는 환경에서 중요합니다.

### 클래스 언로딩도 로더 수명과 연결된다

클래스는 메서드가 끝났다고 하나씩 즉시 언로드되는 단순한 구조가 아닙니다. JVMS 수준에서는 클래스를 정의한 로더가 도달 가능한지에 따라 클래스 언로딩 가능성이 달라지고, 실제 언로딩 시점은 JVM 구현과 GC 정책에 달려 있습니다.

따라서 재배포나 플러그인 재로드 뒤에도 이전 `ClassLoader`를 스레드, 정적 레지스트리, `ThreadLocal`이 계속 참조하면 해당 로더와 관련된 클래스 메타데이터가 오래 남을 수 있습니다.

### 정리

`ClassLoader`는 클래스 정의를 찾아 JVM에 제공하며, 기본 `loadClass` 구현은 부모 위임을 사용합니다. 사용자 정의 로더는 다른 정책을 선택할 수 있습니다. 실행 시점 타입 동일성에는 바이너리 이름뿐 아니라 클래스를 정의한 `ClassLoader`도 중요하므로, 같은 이름의 클래스라도 서로 다른 로더가 정의하면 다른 타입이 될 수 있습니다. 플러그인이나 재로드 환경에서는 공통 API를 어느 로더가 정의하는지가 설계와 진단의 핵심입니다.
