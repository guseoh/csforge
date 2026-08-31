---
kind: concept
contentKey: java.core.metadata-compatibility.reflection-class-api
topicContentKey: java.core.metadata-compatibility
slug: reflection-class-api
title: "Reflection and Class API"
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
# 실행 중에 class 구조를 알아내야 하는 이유

일반 Java 코드는 컴파일할 때 어떤 class와 method를 호출할지 알고 있습니다.

```java
User user = new User();
String name = user.name();
```

하지만 framework나 serializer는 애플리케이션이 어떤 class를 사용할지 미리 모두 알 수 없습니다. 예를 들어 JSON library는 실행 중 `User`라는 class를 받아 field나 constructor 구조를 조사해야 할 수 있고, dependency injection framework는 annotation과 constructor를 읽어 객체를 만들 수 있습니다.

Reflection은 이런 상황에서 **실행 중 runtime type 정보와 member를 조사하고 필요하면 호출하는 API**입니다.

### `Class`는 runtime type을 나타내는 출발점이다

```java
Class<User> type = User.class;
```

또는 객체가 이미 있다면:

```java
Class<?> type = user.getClass();
```

`Class` 객체를 통해 class 이름, 상위 타입, interface, method, field, constructor, annotation 같은 metadata를 조회할 수 있습니다.

```text
User.class
   │
   ├─ methods
   ├─ fields
   ├─ constructors
   ├─ annotations
   └─ superclass/interfaces
```

여기서 `Class`는 source file 자체가 아니라 JVM에 load된 runtime type을 나타냅니다.

### public member와 선언된 member 조회는 다르다

Reflection API 이름은 비슷해서 자주 헷갈립니다.

```java
type.getMethods();
type.getDeclaredMethods();
```

큰 방향은 다음처럼 잡습니다.

- `getMethods()`: 접근 가능한 public method를 상속 관계까지 고려해 조회
- `getDeclaredMethods()`: 해당 class가 직접 선언한 method를 조회

private method가 필요하다고 무조건 `getMethods()`에서 찾을 수 있는 것은 아니고, 반대로 `getDeclaredMethods()`가 모든 상위 class method를 자동으로 모아 주는 것도 아닙니다.

어떤 범위를 원하는지 먼저 결정하고 API를 선택합니다.

### 문자열로 member를 찾으면 compile-time 검사가 줄어든다

```java
Method method = type.getDeclaredMethod("name");
Object result = method.invoke(user);
```

일반 호출:

```java
String result = user.name();
```

은 compiler가 method 존재 여부와 반환 타입을 검사합니다.

Reflection은 `"name"`이라는 문자열과 `Method` 객체를 통해 호출하기 때문에 method 이름이 바뀌거나 parameter signature가 맞지 않는 문제가 runtime에서 나타날 수 있습니다.

```text
일반 호출
source -> compiler type check -> runtime

reflection
source -> 문자열/metadata -> runtime lookup/invoke
```

그래서 framework는 보통 startup 시 metadata를 미리 검사하거나 결과를 cache해 문제를 일찍 발견하려고 합니다.

### `invoke()` 결과와 예외도 호출자가 처리해야 한다

```java
Object value = method.invoke(user);
```

Reflection API는 여러 runtime type을 다뤄야 하므로 결과가 `Object` 형태로 나타나는 경우가 많습니다. 실제 기대 타입을 호출자가 알고 검증해야 합니다.

또 원래 method가 예외를 던지면 reflection 호출 과정의 예외 형태로 감싸져 전달될 수 있습니다. 그래서 실제 target exception과 reflection API 자체 실패를 구분해야 합니다.

### private member에 접근한다고 항상 성공하는 것은 아니다

예전 Java 설명에서는 다음 한 줄로 끝내는 경우가 많았습니다.

```java
method.setAccessible(true);
```

그리고 "그러면 private도 전부 접근 가능하다"고 설명합니다. 현대 Java에서는 이렇게 단순화하면 안 됩니다.

Access control에는:

- Java language access modifier
- runtime reflection access check
- JPMS module의 strong encapsulation

같은 경계가 함께 작용할 수 있습니다.

`setAccessible(true)` 또는 관련 접근 API가 모든 module boundary를 무조건 무시하게 해 주는 것은 아닙니다. 실행 환경과 module openness에 따라 접근이 거부될 수 있습니다.

### Reflection은 framework가 자동으로 behavior를 만드는 마법이 아니다

Annotation이 붙은 method를 reflection으로 찾았다고 실제 transaction이나 validation이 자동으로 실행되는 것은 아닙니다.

```text
Annotation metadata
      │
Reflection으로 발견
      │
Framework code가 해석
      │
Proxy/interceptor/handler가 behavior 적용
```

Reflection은 metadata를 읽고 member를 호출하는 도구입니다. "annotation을 보면 무슨 일을 할지"는 framework가 구현합니다.

이 구분은 Spring을 이해할 때 중요합니다. `@Transactional` annotation 자체가 DB transaction을 여는 것이 아니라 Spring infrastructure가 metadata를 읽고 proxy/interceptor 동작을 구성합니다.

### 성능 문제는 "Reflection은 무조건 느리다"보다 사용 위치를 본다

Reflection 호출에는 일반 정적 호출보다 lookup, access, boxing/argument 처리 같은 추가 비용이 생길 수 있습니다. 하지만 framework가 startup에 metadata를 한 번 조사하고 결과를 cache한다면 request마다 모든 것을 다시 scan하는 것과 상황이 다릅니다.

그래서 다음처럼 판단합니다.

- startup 시 한 번의 reflection: 많은 framework에서 충분히 합리적
- 매우 뜨거운 반복 loop에서 매번 lookup/invoke: 비용을 측정할 가치가 있음
- 일반 application code: 안정적인 interface/직접 호출이 가능하면 그쪽이 더 단순

필요하면 `MethodHandle`, code generation 같은 대안도 있지만 측정 근거 없이 미리 복잡하게 만들지 않습니다.

### Reflection은 어디에서 자주 만날까

Java/Spring backend에서는 다음과 연결됩니다.

- Spring component/bean metadata 처리
- JSON serialization/deserialization
- ORM entity metadata
- validation annotation
- test framework
- proxy/framework infrastructure

따라서 reflection API를 직접 자주 작성하지 않더라도 framework가 무엇을 하는지 이해하는 기반이 됩니다.

### 문제를 풀 때 확인할 것

1. `Class`가 runtime type을 나타낸다는 점을 확인합니다.
2. inherited public member와 declared member 조회를 구분합니다.
3. 문자열 기반 lookup에서 compile-time 검사가 줄어드는 부분을 봅니다.
4. `invoke()`의 실제 target exception과 reflection failure를 구분합니다.
5. `setAccessible`이 모든 JPMS boundary를 무조건 뚫는다고 생각하지 않습니다.
6. Reflection 자체와 framework behavior를 구분합니다.
7. 성능을 이야기할 때 lookup 빈도와 실제 측정을 확인합니다.

### 면접에서 설명한다면

Reflection은 실행 중 `Class`를 통해 method, field, constructor, annotation 같은 runtime metadata를 조사하고 필요하면 호출할 수 있게 하는 Java API입니다. Framework가 미리 알 수 없는 사용자 class를 처리할 때 유용하지만 문자열 기반 lookup과 `Object` 결과 때문에 compile-time type safety가 약해질 수 있고, private access도 JPMS 같은 runtime 접근 경계를 무조건 우회하지는 못합니다. Spring이나 serializer는 reflection을 사용해 metadata를 찾은 뒤 별도의 framework logic으로 실제 behavior를 적용합니다.