---
kind: concept
contentKey: java.core.metadata-compatibility.binary-compatibility-api-evolution
topicContentKey: java.core.metadata-compatibility
slug: binary-compatibility-api-evolution
title: "바이너리 호환성과 API 진화"
summary: "라이브러리 변경에서 소스를 다시 컴파일할 수 있는지, 기존 바이너리가 새 라이브러리와 계속 연결되는지, 실제 동작이 유지되는지를 별개의 문제로 구분한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html"
    title: "Java SE 25 JLS Chapter 13: Binary Compatibility"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 바이너리 호환성 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/NoSuchMethodError.html"
    title: "Java SE 25 API: NoSuchMethodError"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 바이너리 연결 실패가 실행 시점에 나타나는 증상 확인
---
# 바이너리 호환성과 API 진화

라이브러리를 v1에서 v2로 바꿨을 때 "호환된다"는 말에는 여러 의미가 있습니다. 기존 소스 코드를 다시 컴파일할 수 있는지, 이미 컴파일된 `.class`가 새 라이브러리와 연결되는지, 실행 결과의 의미까지 유지되는지는 서로 다른 문제입니다.

### 소스 호환성(source compatibility)과 바이너리 호환성(binary compatibility)을 구분한다

소스 호환성은 기존 소스 코드를 새 라이브러리와 다시 컴파일할 수 있는지를 봅니다.

```text
클라이언트 소스(client.java) + 라이브러리 v2
        │
        ▼
      javac 컴파일 성공?
```

바이너리 호환성은 v1을 기준으로 이미 컴파일된 클라이언트 바이너리가 v2와 **재컴파일하지 않고도** 연결되는지를 봅니다.

```text
클라이언트 클래스 파일(client.class)
(v1로 컴파일됨)
        │
        ▼
v2 라이브러리로 실행
        │
        ▼
JVM 연결 성공?
```

이 차이는 배포 후 `NoSuchMethodError`, `NoSuchFieldError` 같은 오류를 이해하는 데 중요합니다.

### 메서드 계약은 이름뿐 아니라 디스크립터(descriptor)로 결정된다

```java
String find(long id)
```

를 다음처럼 바꾼다고 해 보겠습니다.

```java
String find(Long id)
```

소스 코드에서는 박싱 때문에 비슷해 보일 수 있지만 클래스 파일의 메서드 디스크립터는 달라집니다. 기존 클라이언트 바이너리가 원시 타입 `long` 매개변수를 받는 메서드를 요구한다면 새 `Long` 메서드는 같은 바이너리 멤버가 아닙니다.

따라서 공개 API의 매개변수 타입이나 반환 타입을 바꾸면 소스 수준을 넘어 바이너리 호환성에도 큰 영향을 줄 수 있습니다.

### `NoSuchMethodError`는 리플렉션 조회 실패와 다르다

`NoSuchMethodException`은 리플렉션 API가 요청한 메서드를 찾지 못했을 때 발생할 수 있는 검사 예외입니다.

반면 `NoSuchMethodError`는 이미 컴파일된 코드가 실행 시 연결 과정에서 기대한 메서드를 찾지 못할 때 나타나는 `LinkageError` 계열 오류입니다.

```text
리플렉션 조회 실패
  -> NoSuchMethodException 가능

컴파일된 바이너리의 연결 실패
  -> NoSuchMethodError 가능
```

운영 중 `NoSuchMethodError`가 발생하면 컴파일 때 사용한 의존성과 실행 시 실제로 로드된 의존성의 버전이 같은지부터 확인합니다.

### API를 추가해도 소스 호환성에 영향을 줄 수 있다

기존 메서드를 삭제하지 않고 오버로드를 추가하면 기존 바이너리는 예전에 결정한 메서드 참조를 계속 사용할 수 있습니다. 하지만 소스를 다시 컴파일하면 오버로드 해석(overload resolution)은 새 API를 대상으로 다시 수행됩니다.

```java
void process(String value)
void process(Integer value) // 새 overload

process(null);              // 재컴파일 시 ambiguous 가능
```

즉 **바이너리 호환성을 지키는 변경이 소스 호환성도 지킨다는 뜻은 아닙니다.**

### 인터페이스 진화도 변경 형태에 따라 판단한다

인터페이스에 추상 메서드를 추가하면 기존 구현체에 영향을 줄 수 있습니다. `default` 메서드는 기존 구현체가 새 메서드를 직접 구현하지 않아도 동작하게 해 API 진화를 유연하게 만들지만, 모든 변경을 자동으로 안전하게 하지는 않습니다.

기존 상속 계층에 같은 시그니처가 있거나 메서드 선택 규칙이 달라지면 충돌이 생길 수 있으므로, 변경 형태별로 JLS 호환성 규칙을 확인해야 합니다.

### 공개 컴파일 시점 상수는 클라이언트 코드에 값이 포함될 수 있다

```java
public static final int LIMIT = 10;
```

같은 컴파일 시점 상수는 클라이언트를 컴파일할 때 값이 바이트코드에 삽입될 수 있습니다. 나중에 라이브러리 값을 다음처럼 바꾸더라도:

```java
public static final int LIMIT = 20;
```

재컴파일하지 않은 클라이언트는 이전 값 `10`을 계속 사용할 수 있습니다.

이 문제는 멤버의 존재 여부뿐 아니라 **클라이언트 바이너리에 이미 어떤 값이 포함되어 있는지**도 호환성 판단에 포함됨을 보여 줍니다.

### 바이너리 호환성과 동작 호환성은 다르다

```java
User find(long id)
```

메서드 디스크립터를 유지해도 v1에서 없는 사용자를 `null`로 반환하다가 v2에서 예외를 던지도록 바꾸면 바이너리 연결은 성공하지만 호출자가 기대한 동작은 달라집니다.

```text
binary contract 유지
    ≠
semantic behavior 유지
```

실제 API 진화에서는 반환값의 의미, 예외, null 허용성, 순서, 스레드 안전성과 같은 동작 계약도 별도로 살펴야 합니다.

### Java 바이너리 호환성과 HTTP API 호환성은 판단 기준이 다르다

Java 라이브러리 호환성은 클래스 파일, 디스크립터, JVM 연결을 중심으로 판단합니다. REST API 호환성은 엔드포인트, JSON 스키마, 상태 코드와 필드 의미를 살펴봅니다.

둘 다 API 진화 문제지만 계약 단위가 다르므로, 한쪽이 안전하다고 다른 쪽까지 안전하다고 볼 수는 없습니다.

### 정리

소스 호환성(source compatibility)은 기존 소스 코드를 새 라이브러리와 다시 컴파일할 수 있는지를 뜻하고, 바이너리 호환성(binary compatibility)은 기존 클래스 파일이 재컴파일 없이 새 라이브러리와 연결되는지를 뜻합니다. 메서드 디스크립터(method descriptor)를 바꾸거나 삭제하면 `NoSuchMethodError` 같은 실행 시점 연결 오류가 생길 수 있습니다. 오버로드를 추가하거나 공개 상수를 바꾸면 소스와 바이너리에서 결과가 달라질 수도 있습니다. 바이너리 연결이 유지돼도 실제 동작 계약은 깨질 수 있으므로 API 진화에서는 세 호환성 문제를 나누어 판단해야 합니다.
