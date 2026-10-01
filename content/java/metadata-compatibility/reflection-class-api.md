---
kind: concept
contentKey: java.core.metadata-compatibility.reflection-class-api
topicContentKey: java.core.metadata-compatibility
slug: reflection-class-api
title: "리플렉션과 Class API"
summary: "실행 중 Class 정보에서 메서드·필드·생성자를 찾아 호출하는 리플렉션의 목적과 타입 안전성·접근 제어의 한계를 이해한다"
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
    relationNote: 실행 시점 타입과 멤버 조회 API 확인
---
# 리플렉션과 Class API

일반 Java 코드는 컴파일러가 호출할 타입과 메서드를 알고 검증합니다. 반면 프레임워크나 직렬화 도구는 실행 중 처음 만난 클래스의 생성자, 필드, 메서드, 애너테이션을 조사해야 할 수 있습니다. 리플렉션은 이럴 때 **로드된 런타임 타입의 메타데이터를 읽고 필요하면 멤버를 호출하는 API**입니다.

### `Class`가 실행 시점 타입 정보의 출발점이다

```java
Class<User> type = User.class;
Class<?> runtimeType = user.getClass();
```

`Class`를 통해 상위 클래스, 인터페이스, 생성자, 메서드, 필드, 애너테이션 정보를 조회할 수 있습니다.

```text
Class<?> 
 ├─ constructors
 ├─ methods
 ├─ fields
 ├─ annotations
 └─ superclass/interfaces
```

여기서 `Class`는 소스 파일이 아니라 JVM에 로드된 실행 시점 타입을 나타냅니다.

### 조회 API마다 대상 범위가 다르다

```java
type.getMethods();
type.getDeclaredMethods();
```

큰 차이는 다음과 같습니다.

- `getMethods()`: 상속 관계까지 고려해 공개 메서드를 조회
- `getDeclaredMethods()`: 해당 클래스가 직접 선언한 메서드를 조회

리플렉션 코드에서 "메서드가 없다"고 판단하기 전에 어떤 범위를 조회했는지 확인해야 합니다.

### 문자열 기반 조회는 컴파일 시점의 안전성을 낮춘다

```java
Method method = type.getDeclaredMethod("name");
Object result = method.invoke(user);
```

직접 호출에서는 컴파일러가 메서드의 존재와 타입을 검사하지만, 리플렉션에서는 이름과 시그니처의 불일치가 실행 시점에 드러날 수 있습니다.

```text
직접 호출
소스 코드 -> 컴파일러 검사 -> 실행

리플렉션
소스 코드 -> 메타데이터·문자열 조회 -> 실행 시점 검사
```

프레임워크가 시작 단계에서 메타데이터를 미리 조사하거나 조회 결과를 캐시하는 이유 중 하나입니다.

### `invoke()`에서는 대상 메서드 오류와 리플렉션 오류를 구분한다

리플렉션을 호출하면 인수 타입, 접근 권한, 대상 객체가 올바른지 실행 시점에 확인됩니다. 대상 메서드가 예외를 던져도 리플렉션 호출 계층을 거쳐 전달되므로, **리플렉션 API에서 발생한 오류와 실제 대상 코드의 오류를 구분**해야 합니다.

반환값도 보통 `Object`로 다루므로 호출자가 기대하는 타입을 알고 있어야 합니다.

### 비공개 멤버 접근에는 Java 접근 제어자 외에 모듈 경계도 적용된다

예전 설명처럼 `setAccessible(true)`만 호출하면 어떤 비공개 멤버에도 항상 접근할 수 있다고 생각하면 안 됩니다.

현대 Java에서는 다음 경계가 함께 작용할 수 있습니다.

```text
language access modifier
      +
reflection access check
      +
JPMS module openness
```

명명 모듈의 패키지가 적절히 열려 있지 않으면 심층 리플렉션(deep reflection)이 거부될 수 있습니다. 리플렉션 API가 Java 접근 제어와 모듈 캡슐화를 항상 무력화하는 우회로인 것은 아닙니다.

### 리플렉션 자체가 프레임워크 동작을 수행하는 것은 아니다

리플렉션으로 애너테이션을 찾았다고 트랜잭션이나 검증이 자동으로 실행되지는 않습니다.

```text
애너테이션 메타데이터
       │
리플렉션으로 조회
       │
프레임워크가 해석
       │
프록시·인터셉터·핸들러
       │
실제 동작
```

예를 들어 Spring의 `@Transactional`은 Java 애너테이션 메타데이터이며, 트랜잭션 동작은 Spring 인프라가 이를 해석해 구성합니다.

### 성능은 사용 위치와 빈도를 본다

리플렉션은 일반 호출보다 조회·호출 비용이 클 수 있습니다. 하지만 시작 시 메타데이터를 한 번 읽어 캐시하는 경우와 반복 실행 경로에서 매번 메서드를 찾아 호출하는 경우는 작업 부하가 전혀 다릅니다.

따라서 "리플렉션은 느리다"는 말만으로 코드 생성이나 다른 API를 선택하지 않습니다. 실제로 자주 실행되는 경로인지, 조회를 반복하는지, 측정 결과 문제가 있는지 먼저 살펴야 합니다.

### 정리

리플렉션은 `Class`를 통해 실행 시점 타입의 생성자, 메서드, 필드, 애너테이션을 조사하고 호출할 수 있게 합니다. 실행 중 알게 되는 타입을 처리하는 프레임워크에 유용하지만 문자열 기반 조회 때문에 일부 오류가 실행 시점으로 옮겨가며, 비공개 멤버 접근도 JPMS 모듈 경계를 항상 우회하지는 못합니다. 리플렉션은 메타데이터를 읽는 도구이고 트랜잭션·직렬화·의존성 주입 같은 동작은 그 위의 프레임워크가 구현합니다.
