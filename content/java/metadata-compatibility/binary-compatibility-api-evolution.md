---
kind: concept
contentKey: java.core.metadata-compatibility.binary-compatibility-api-evolution
topicContentKey: java.core.metadata-compatibility
slug: binary-compatibility-api-evolution
title: "Binary Compatibility와 API 진화"
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
# Binary Compatibility와 API 진화

Library를 v1에서 v2로 바꿨을 때 "호환된다"는 말은 하나의 질문이 아닙니다. 기존 source가 다시 compile되는지, 예전에 compile된 `.class`가 새 library와 그대로 링크되는지, 실행 결과의 의미까지 유지되는지는 서로 다른 문제입니다.

### Source compatibility와 binary compatibility를 구분한다

Source compatibility는 기존 source를 새 library와 다시 compile할 수 있는지를 봅니다.

```text
client.java + library v2
        │
        ▼
      javac 성공?
```

Binary compatibility는 이미 v1을 기준으로 compile된 client binary가 v2와 **재컴파일 없이** 연결될 수 있는지를 봅니다.

```text
client.class
(compiled with v1)
        │
        ▼
runtime with library v2
        │
        ▼
JVM linkage 성공?
```

이 차이는 배포 시점의 `NoSuchMethodError`, `NoSuchFieldError` 같은 문제를 이해하는 데 중요합니다.

### Method는 이름만 아니라 descriptor가 계약이다

```java
String find(long id)
```

를 다음처럼 바꾼다고 해 보겠습니다.

```java
String find(Long id)
```

Source에서는 boxing 때문에 비슷해 보일 수 있지만 class file의 method descriptor는 달라집니다. 기존 client binary가 primitive `long` parameter의 method를 요구한다면 새 `Long` method는 같은 binary member가 아닙니다.

따라서 public API의 parameter type이나 return type 변경은 source 수준보다 더 큰 binary compatibility 영향을 만들 수 있습니다.

### `NoSuchMethodError`는 reflection lookup 실패와 다르다

`NoSuchMethodException`은 reflection API가 요청한 method를 찾지 못했을 때 만날 수 있는 checked exception입니다.

반면 `NoSuchMethodError`는 이미 compile된 code가 runtime linkage 과정에서 기대한 method를 찾지 못할 때 나타나는 `LinkageError` 계열 문제입니다.

```text
Reflection lookup 실패
  -> NoSuchMethodException 가능

Compiled binary linkage 실패
  -> NoSuchMethodError 가능
```

운영에서 `NoSuchMethodError`를 만나면 compile 시 사용한 dependency와 runtime에 실제 load된 dependency version이 같은지부터 확인합니다.

### API를 추가하는 변경도 source에는 영향을 줄 수 있다

기존 method를 삭제하지 않고 overload만 추가하면 기존 binary는 예전에 결정된 method reference를 계속 사용할 수 있습니다. 하지만 source를 다시 compile하면 overload resolution은 새 API 집합을 대상으로 다시 수행됩니다.

```java
void process(String value)
void process(Integer value) // 새 overload

process(null);              // 재컴파일 시 ambiguous 가능
```

즉 **binary-compatible한 변경이 source-compatible하다는 뜻은 아닙니다.**

### Interface evolution도 변경 형태를 본다

Interface에 abstract method를 추가하면 기존 구현체에 영향을 줄 수 있습니다. Default method는 기존 구현체가 새 method를 직접 구현하지 않아도 동작할 수 있게 해 API evolution을 더 유연하게 만들지만 모든 변경을 자동으로 안전하게 하는 기능은 아닙니다.

기존 hierarchy에 같은 signature가 있거나 method resolution이 달라지면 충돌이 생길 수 있으므로 실제 JLS compatibility 규칙을 변경 형태별로 봅니다.

### Public compile-time constant는 client에 값이 남을 수 있다

```java
public static final int LIMIT = 10;
```

같은 compile-time constant는 client compile 시 값이 bytecode에 inline될 수 있습니다. Library를 나중에 다음처럼 바꿔도:

```java
public static final int LIMIT = 20;
```

재컴파일하지 않은 client는 여전히 이전 값 10을 사용할 수 있습니다.

이 문제는 member가 존재하느냐뿐 아니라 **client binary 안에 무엇이 이미 고정되어 있는가**까지 compatibility에 포함된다는 것을 보여 줍니다.

### Binary compatibility와 behavior compatibility는 다르다

```java
User find(long id)
```

method descriptor를 그대로 유지해도 v1에서는 없는 사용자를 `null`로 반환하고 v2에서는 예외를 던지게 바꾸면 binary linkage는 성공하지만 caller가 기대한 behavior는 달라집니다.

```text
binary contract 유지
    ≠
semantic behavior 유지
```

실제 API evolution에서는 return 의미, exception, nullability, ordering, thread-safety 같은 semantic contract까지 별도로 봐야 합니다.

### Java binary compatibility와 HTTP API compatibility도 층이 다르다

Java library compatibility는 class file, descriptor, JVM linkage를 중심으로 봅니다. REST API compatibility는 endpoint, JSON schema, status code와 field semantics를 봅니다.

둘 다 API evolution 문제이지만 계약 단위가 다르므로 하나가 안전하다고 다른 쪽까지 안전한 것은 아닙니다.

### 정리

Source compatibility는 기존 source가 새 library와 다시 compile되는지, binary compatibility는 이미 compile된 class file이 새 library와 다시 compile 없이 링크되는지를 뜻합니다. Method descriptor 변경이나 삭제는 `NoSuchMethodError` 같은 runtime linkage 문제를 만들 수 있고, overload 추가나 public constant 변경처럼 source와 binary에서 결과가 다르게 나타나는 경우도 있습니다. Binary linkage가 유지돼도 실제 behavior contract는 별도로 깨질 수 있으므로 API 진화에서는 세 층을 분리해서 판단해야 합니다.
