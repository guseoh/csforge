---
kind: concept
contentKey: java.core.jvm-runtime.classloader-delegation-type-identity
topicContentKey: java.core.jvm-runtime
slug: classloader-delegation-type-identity
title: "ClassLoader 위임과 타입 동일성"
summary: "class를 어떤 ClassLoader가 정의했는지가 runtime type identity의 일부라는 점과 delegation이 중복 loading을 줄이는 방식을 이해한다"
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

Java runtime에서 class는 이름만으로 식별되지 않습니다. 같은 `com.example.Plugin`이라는 binary name이라도 **서로 다른 defining ClassLoader가 각각 정의했다면 다른 runtime type**이 될 수 있습니다. 이 규칙은 plugin, application server, hot reload 환경에서 발생하는 이상한 `ClassCastException`을 이해하는 핵심입니다.

![ClassLoader 경계와 runtime type identity](/learning/java/classloader-type-identity.svg)

### ClassLoader는 class를 찾아 정의한다

ClassLoader는 binary name에 대응하는 class definition을 찾아 JVM에 제공합니다.

```text
"com.example.Plugin"
        │
        ▼
   ClassLoader
        │ class bytes
        ▼
   runtime Class
```

Class bytes는 jar나 directory뿐 아니라 custom loader가 관리하는 다른 source에서 올 수도 있습니다. 중요한 것은 어느 파일에서 왔는지만이 아니라 **어느 loader가 그 class를 정의했는가**입니다.

### 기본 `loadClass` 흐름은 parent delegation을 사용한다

`ClassLoader.loadClass`의 일반적인 기본 구현은 이미 load된 class인지 확인한 뒤 parent loader에 먼저 요청하고, parent가 찾지 못하면 자신의 `findClass` 경로를 사용합니다.

```text
Application Loader
       │
       ├─ parent에게 요청
       ▼
Platform / Bootstrap
       │
       └─ 찾지 못함
             │
             ▼
      child가 직접 탐색
```

이 구조는 platform class나 공통 library가 여러 loader에서 제각각 중복 정의되는 일을 줄입니다.

그러나 **모든 custom loader가 반드시 parent-first여야 하는 것은 아닙니다.** Plugin/container가 child-first나 다른 loader graph를 사용할 수도 있으므로 실제 환경에서는 해당 loader 구현의 계약을 확인합니다.

### runtime type identity에는 defining loader가 포함된다

두 loader가 같은 이름의 class를 각각 정의해 보겠습니다.

```text
Loader A ──▶ com.example.Plugin
Loader B ──▶ com.example.Plugin
```

두 `Class`의 이름 문자열은 같을 수 있지만 runtime type은 다를 수 있습니다.

```java
Class<?> a = loaderA.loadClass("com.example.Plugin");
Class<?> b = loaderB.loadClass("com.example.Plugin");

System.out.println(a.getName().equals(b.getName())); // true 가능
System.out.println(a == b);                         // false 가능
```

즉 JVM 관점에서 중요한 조합은 다음과 같습니다.

```text
binary name + defining ClassLoader
```

그래서 loader A가 정의한 `Plugin` 객체를 loader B가 정의한 같은 이름의 `Plugin`으로 cast할 수 없을 수 있습니다.

### 공통 API는 공유되는 loader 경계에 둔다

Plugin 시스템에서 host와 plugin이 같은 interface를 통해 협력하려면 공통 API를 둘이 공유하는 loader에서 정의하는 구조가 자연스럽습니다.

```text
Shared Parent Loader
   └─ PluginApi
          ▲
          │ implements
 ┌────────┴────────┐
Plugin Loader A  Plugin Loader B
    ImplA             ImplB
```

반대로 각 plugin loader가 `PluginApi`까지 별도로 정의하면 source 이름은 같아도 runtime type identity가 갈라집니다. 이 경우 host가 구현체를 같은 `PluginApi`로 보지 못할 수 있습니다.

### Classpath와 ClassLoader는 같은 개념이 아니다

Classpath나 module path는 class를 찾기 위한 source/configuration입니다. ClassLoader는 runtime에서 실제 class definition을 찾고 정의하는 주체입니다.

```text
classpath / module path -> 탐색 source
ClassLoader             -> runtime loading/definition 주체
```

따라서 같은 jar가 classpath에 있다는 사실만으로 두 객체가 같은 defining loader의 같은 `Class`라고 결론내릴 수 없습니다.

### 진단할 때는 이름뿐 아니라 loader를 본다

이름이 같은데 cast가 실패하거나 hot reload 후 이상한 linkage 문제가 생기면 다음을 확인합니다.

```java
System.out.println(value.getClass());
System.out.println(value.getClass().getClassLoader());
```

함께 볼 것은 실제 `Class` 객체 identity, defining loader, class bytes의 source, loader delegation graph입니다. 특히 Spring Boot devtools, plugin framework, application server처럼 여러 loader가 공존하는 환경에서 중요합니다.

### Class unloading도 loader 수명과 연결된다

Class는 method가 끝났다는 이유로 하나씩 즉시 unload되는 단순 모델이 아닙니다. JVMS 수준에서는 defining loader의 reachability가 class unloading 가능성과 연결되고, 실제 unloading 시점은 JVM 구현과 GC 정책의 영역입니다.

따라서 redeploy나 plugin reload 뒤에도 이전 ClassLoader를 thread, static registry, ThreadLocal이 계속 참조하면 그 loader와 관련 class metadata가 오래 남을 수 있습니다.

### 정리

ClassLoader는 class definition을 찾고 JVM에 정의하며, 기본 `loadClass` 구현은 parent delegation을 사용합니다. 하지만 custom loader는 다른 정책을 가질 수 있습니다. Runtime type identity에는 binary name뿐 아니라 defining ClassLoader가 중요하므로, 같은 이름의 class라도 서로 다른 loader가 정의하면 다른 타입이 될 수 있습니다. Plugin이나 reload 환경에서는 공통 API를 어느 loader가 정의하는지가 설계와 진단의 핵심입니다.
