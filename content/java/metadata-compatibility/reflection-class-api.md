---
kind: concept
contentKey: java.core.metadata-compatibility.reflection-class-api
topicContentKey: java.core.metadata-compatibility
slug: reflection-class-api
title: "Reflection과 Class API"
summary: "실행 중 Class 정보를 보고 method·field·constructor를 찾고 호출하는 reflection의 목적과 타입 안전성·접근 제어 한계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/package-summary.html"
    title: "Java SE 25 API: java.lang.reflect"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: runtime metadata inspection과 access 경계 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html"
    title: "Java SE 25 API: Class"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: runtime type와 member 조회 API 확인
---
# Reflection과 Class API

일반 Java 코드는 compiler가 호출할 type과 method를 알고 검증합니다. 반면 framework나 serializer는 실행 중 처음 만난 class의 constructor, field, method, annotation을 조사해야 할 수 있습니다. Reflection은 이런 경우 **load된 runtime type의 metadata를 읽고 필요하면 member를 호출하는 API**입니다.

### `Class`가 runtime type 정보의 출발점이다

```java
Class<User> type = User.class;
Class<?> runtimeType = user.getClass();
```

`Class`를 통해 superclass, interface, constructor, method, field, annotation 같은 정보를 조회할 수 있습니다.

```text
Class<?> 
 ├─ constructors
 ├─ methods
 ├─ fields
 ├─ annotations
 └─ superclass/interfaces
```

여기서 `Class`는 source file이 아니라 JVM에 load된 runtime type을 나타냅니다.

### 조회 API마다 보는 범위가 다르다

```java
type.getMethods();
type.getDeclaredMethods();
```

큰 차이는 다음과 같습니다.

- `getMethods()`: public method를 상속 관계까지 고려해 조회
- `getDeclaredMethods()`: 해당 class가 직접 선언한 method를 조회

Reflection 코드는 "method가 없다"고 판단하기 전에 내가 어떤 범위를 조회하고 있는지 확인해야 합니다.

### 문자열 기반 lookup은 compile-time 안전성이 줄어든다

```java
Method method = type.getDeclaredMethod("name");
Object result = method.invoke(user);
```

직접 호출이라면 compiler가 method 존재와 타입을 검사하지만 reflection에서는 이름과 signature mismatch가 runtime에 드러날 수 있습니다.

```text
직접 호출
source -> compiler 검증 -> runtime

reflection
source -> metadata/string lookup -> runtime 검증
```

Framework가 startup 단계에서 metadata를 미리 조사하거나 lookup 결과를 cache하는 이유 중 하나입니다.

### `invoke()`는 target method 호출과 reflection 실패를 함께 다룬다

Reflection 호출에서는 argument type, access, target instance가 올바른지 runtime에 확인됩니다. Target method 자체가 예외를 던진 경우에도 reflection 호출 계층을 거쳐 전달되므로, **reflection API가 실패한 것과 실제 target code가 실패한 것을 구분**해야 합니다.

반환값도 일반적으로 `Object` 형태로 다루게 되므로 caller가 기대 타입을 알고 있어야 합니다.

### Private access에는 Java access modifier 외에 module 경계도 있다

예전 설명처럼 `setAccessible(true)`만 호출하면 어떤 private member든 항상 접근할 수 있다고 생각하면 안 됩니다.

현대 Java에서는 다음 경계가 함께 작용할 수 있습니다.

```text
language access modifier
      +
reflection access check
      +
JPMS module openness
```

Named module의 package가 적절히 open되지 않았다면 deep reflection이 거부될 수 있습니다. 즉 reflection API는 Java access control과 module strong encapsulation을 무조건 제거하는 우회로가 아닙니다.

### Reflection은 framework behavior 그 자체가 아니다

Annotation을 reflection으로 찾았다고 transaction이나 validation이 자동으로 실행되는 것은 아닙니다.

```text
annotation metadata
       │
reflection으로 발견
       │
framework가 해석
       │
proxy/interceptor/handler
       │
실제 behavior
```

예를 들어 Spring의 `@Transactional`은 Java annotation metadata이고, transaction behavior는 Spring infrastructure가 metadata를 해석해 구성합니다.

### 성능은 사용 위치와 빈도를 본다

Reflection에는 일반 호출보다 lookup과 invocation overhead가 있을 수 있습니다. 하지만 startup에 한 번 metadata를 읽어 cache하는 것과 hot loop에서 매번 method를 찾고 호출하는 것은 전혀 다른 workload입니다.

따라서 "reflection은 느리다"라는 문장만으로 code generation이나 다른 API를 선택하지 않습니다. 실제 hot path인지, lookup을 반복하는지, 측정상 문제가 있는지를 먼저 봅니다.

### 정리

Reflection은 `Class`를 통해 runtime type의 constructor, method, field, annotation을 조사하고 호출할 수 있게 합니다. 동적으로 알려지는 type을 처리하는 framework에 유용하지만 문자열 기반 lookup 때문에 일부 오류가 runtime으로 이동하고, private access도 JPMS module 경계를 무조건 우회하지는 못합니다. Reflection은 metadata를 읽는 도구이며 실제 transaction·serialization·DI 같은 behavior는 그 위의 framework가 구현합니다.
