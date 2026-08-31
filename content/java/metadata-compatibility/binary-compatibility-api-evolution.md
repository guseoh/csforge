---
kind: concept
contentKey: java.core.metadata-compatibility.binary-compatibility-api-evolution
topicContentKey: java.core.metadata-compatibility
slug: binary-compatibility-api-evolution
title: "Binary compatibility and API evolution"
summary: "library를 바꿀 때 source 재컴파일 가능 여부와 이미 컴파일된 client가 새 binary와 계속 연결되는지, 실제 behavior가 유지되는지를 별도 문제로 구분한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html"
    title: "Java SE 25 JLS Chapter 13: Binary Compatibility"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: binary compatibility rules 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NoSuchMethodError.html"
    title: "Java SE 25 API: NoSuchMethodError"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: binary linkage failure의 runtime 증상 확인
---
# 코드는 다시 컴파일되는데 왜 배포한 뒤 깨질 수 있을까

Library를 v1에서 v2로 바꿨을 때 "호환된다"는 말은 생각보다 여러 뜻을 가집니다.

기존 source를 v2와 다시 compile할 수 있는지, 이미 v1을 기준으로 compile된 `.class`가 v2 library와 그대로 실행되는지, 실행은 되더라도 기존 behavior가 유지되는지는 서로 다른 질문입니다.

이 차이를 알아야 `NoSuchMethodError` 같은 배포 시점 오류와 API evolution 문제를 설명할 수 있습니다.

### Source compatibility는 기존 source를 다시 compile할 수 있는가의 문제다

다음 client가 있다고 해 보겠습니다.

```java
service.send("hello");
```

Library v1이:

```java
void send(String message)
```

를 제공했다면 compile됩니다.

v2에서 method를:

```java
void send(Message message)
```

로 바꿨다면 기존 source는 수정 없이 다시 compile되지 않을 수 있습니다.

이것은 source compatibility 문제입니다.

```text
client.java + library v2
       │
       ▼
    javac 성공?
```

### Binary compatibility는 이미 compile된 class가 다시 compile 없이 연결되는가의 문제다

실제 배포에서는 애플리케이션의 모든 dependency가 항상 동시에 다시 compile되는 것은 아닙니다.

```text
client.java
   │ compile with library v1
   ▼
client.class
   │
   │ runtime with library v2
   ▼
JVM linkage
```

`client.class`에는 v1의 method와 field에 대한 symbolic reference가 들어 있습니다. Runtime에 v2 library를 load했을 때 JVM이 그 reference를 계속 해결할 수 있어야 기존 binary가 동작합니다.

만약 v2에서 client가 호출하던 method가 사라졌다면 runtime에 다음과 같은 linkage error를 만날 수 있습니다.

```text
NoSuchMethodError
```

Source code만 보면 새 library에는 "비슷한 method가 있다"고 느껴져도 기존 class file이 요구하는 정확한 binary member가 없으면 문제가 됩니다.

### `NoSuchMethodError`와 `NoSuchMethodException`은 발생 층이 다르다

이 둘은 이름이 비슷하지만 같은 상황이 아닙니다.

`NoSuchMethodException`은 reflection API로 method를 찾으려 했는데 없을 때처럼 일반적인 checked exception으로 만날 수 있습니다.

`NoSuchMethodError`는 보통 이미 compile된 code가 runtime linkage에서 기대한 method를 찾지 못할 때 나타나는 `LinkageError` 계열 문제입니다.

```text
Reflection lookup 실패
-> NoSuchMethodException 가능

Binary linkage 실패
-> NoSuchMethodError 가능
```

운영에서 `NoSuchMethodError`가 보이면 source typo보다 **compile할 때 사용한 dependency version과 runtime에 실제 load된 version이 다른지**부터 확인하는 이유입니다.

### Method signature 변경은 binary contract를 바꾼다

Class file에서 method는 단순히 이름 하나만으로 식별되지 않습니다. Parameter와 return type이 포함된 descriptor가 중요합니다.

예를 들어:

```java
String find(long id)
```

를:

```java
String find(Long id)
```

로 바꾸면 Java source에서는 auto-boxing 때문에 비슷해 보일 수 있지만 binary method descriptor는 다릅니다.

기존 client.class가 `(J)Ljava/lang/String;` 같은 descriptor를 기대한다면 새로운 `(Ljava/lang/Long;)Ljava/lang/String;` method는 같은 binary member가 아닙니다.

그래서 public API parameter type 변경은 생각보다 큰 compatibility change입니다.

### Method를 "추가"하는 것도 source compatibility에는 영향을 줄 수 있다

기존 method를 삭제하지 않고 overload만 추가하면 binary compatibility에는 상대적으로 안전한 경우가 많습니다. 기존 class file은 예전에 선택한 정확한 method를 계속 호출하기 때문입니다.

하지만 client source를 다시 compile하면 overload resolution이 새롭게 실행됩니다.

```java
void process(String value)
void process(Integer value) // 새 overload

process(null);
```

기존에는 하나의 overload만 있어 compile됐는데 새 overload가 추가되면서 `null` 호출이 ambiguous해질 수 있습니다.

즉:

```text
Binary old client -> 계속 동작할 수 있음
Source recompile   -> 새 overload 때문에 실패할 수 있음
```

처럼 source와 binary compatibility 결과가 다를 수 있습니다.

### Interface 변경도 종류에 따라 영향이 다르다

Interface에 abstract method를 새로 추가하면 기존 구현 class의 source 재컴파일과 runtime behavior에 영향을 줄 수 있습니다.

Java 8 이후 default method는 interface evolution을 더 유연하게 만드는 도구가 되었습니다.

```java
interface Repository {
    void save();

    default void flush() {
    }
}
```

기존 구현 class가 `flush()`를 구현하지 않아도 default implementation을 사용할 수 있습니다.

하지만 default method 추가도 기존 hierarchy의 다른 method와 충돌하거나 resolution을 바꿀 가능성이 있으므로 "default면 모든 변경이 안전"이라고 일반화하지 않습니다. JLS binary compatibility 규칙을 실제 변경 형태별로 봅니다.

### Field도 binary contract다

Public field를 삭제하거나 static/instance 성격을 바꾸는 것도 기존 binary에 영향을 줄 수 있습니다.

```java
public static final int TIMEOUT = 1000;
```

특히 compile-time constant는 client bytecode에 값이 inlining될 수 있어서 더 미묘합니다.

Library v1:

```java
public static final int LIMIT = 10;
```

Client를 compile한 뒤 library v2에서:

```java
public static final int LIMIT = 20;
```

으로 바꿔도 기존 client binary에는 10이 이미 들어가 있을 수 있습니다.

```text
client compiled with v1 -> literal 10 embedded 가능
runtime library v2      -> field value 20
old client              -> 여전히 10 관찰 가능
```

그래서 public constant 변경도 배포 compatibility 관점에서 주의해야 합니다.

### Binary compatibility가 유지돼도 behavior compatibility는 깨질 수 있다

Method 이름과 descriptor를 그대로 유지한다고 해 보겠습니다.

```java
User find(long id)
```

v1에서는 없으면 `null`을 반환했는데 v2에서는 예외를 던지도록 바꿨다면 binary linkage는 성공합니다. 하지만 기존 client가 기대한 behavior는 달라질 수 있습니다.

```text
Binary compatible
method exists, descriptor same

Behavior incompatible
null -> exception
```

이것은 JLS Chapter 13의 binary compatibility만으로 판단할 수 없는 **semantic/API contract** 문제입니다.

실제 library evolution에서는 다음도 함께 봅니다.

- return 의미
- exception 종류
- nullability
- ordering
- thread-safety
- timing/performance assumption
- serialization format
- database/network contract

### Java library와 REST API compatibility는 층이 다르다

Backend 개발에서는 Java binary compatibility와 HTTP API backward compatibility를 섞기 쉽습니다.

```text
Java library API
.class linkage / method descriptor / JVM

HTTP API
JSON schema / field semantics / status / endpoint contract
```

둘 다 API evolution 문제지만 compatibility 단위가 다릅니다. Java method를 binary-compatible하게 유지했다고 외부 REST client까지 compatible한 것은 아닙니다.

Backend Engineering 영역에서는 HTTP/API evolution을 별도로 더 깊게 다룹니다.

### 실제 배포 오류에서 무엇을 확인할까

`NoSuchMethodError`, `NoSuchFieldError`, `AbstractMethodError` 같은 linkage error를 만나면 다음 순서가 유용합니다.

1. 어떤 class/member를 runtime이 기대하는가
2. Client가 어느 library version으로 compile됐는가
3. Runtime classpath/module path에는 실제 어떤 version이 load됐는가
4. Dependency conflict로 이전/새 jar가 함께 들어왔는가
5. ClassLoader가 예상과 다른 jar를 load했는가

`javap`나 dependency tree, runtime classpath, `Class.getProtectionDomain()` 등의 진단이 연결될 수 있습니다.

### 문제를 풀 때 확인할 것

1. Source 재컴파일 문제인지 기존 `.class` runtime 문제인지 구분합니다.
2. Method 이름만 아니라 descriptor가 유지되는지 봅니다.
3. Overload 추가가 source resolution을 바꿀 수 있는지 확인합니다.
4. Public compile-time constant가 client에 inline될 수 있음을 봅니다.
5. Binary linkage 성공과 behavior compatibility를 구분합니다.
6. LinkageError가 보이면 compile-time/runtime dependency version을 비교합니다.
7. Java binary compatibility와 HTTP API compatibility를 섞지 않습니다.

### 면접에서 설명한다면

Source compatibility는 기존 source가 새 library와 다시 compile되는지의 문제이고, binary compatibility는 이미 이전 library를 기준으로 compile된 class file이 새 library와 다시 compile 없이 링크될 수 있는지의 문제입니다. Public method의 descriptor를 바꾸거나 삭제하면 기존 binary에서 `NoSuchMethodError` 같은 linkage 문제가 생길 수 있습니다. 반대로 binary linkage가 유지돼도 exception이나 반환 의미가 달라지면 behavior compatibility는 깨질 수 있어서 API evolution에서는 세 층을 따로 봐야 합니다.