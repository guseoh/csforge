---
kind: concept
contentKey: java.core.language-types.string-pool-interning
topicContentKey: java.core.language-types
slug: string-pool-interning
title: "String pool과 intern"
summary: "문자열 리터럴이 재사용되는 규칙과 intern의 의미를 이해하고 모든 String 생성이 같은 방식이라고 일반화하지 않는다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5"
    title: "JLS 3.10.5 String Literals"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 문자열 리터럴의 intern 및 동일성 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#intern()"
    title: "Java SE 25 API: String.intern"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: intern 메서드의 계약 확인
---
# String pool과 intern

문자열 리터럴을 비교하다 보면 `==`가 `true`인 경우가 있습니다. 이것은 `String.equals`의 규칙이 특별해서가 아니라, Java가 문자열 리터럴을 **재사용할 수 있는 문자열 풀(string pool)** 과 연결하기 때문입니다.

### 같은 리터럴이 같은 객체를 가리킬 수 있는 이유

```java
String a = "java";
String b = "java";

System.out.println(a == b); // true
```

Java 언어 명세는 문자열 리터럴과 특정 상수 문자열 표현식을 intern하도록 규정합니다. 그래서 같은 리터럴은 같은 canonical String 인스턴스를 가리키게 됩니다.

하지만 다음 코드는 생성 경로가 다릅니다.

```java
String a = "java";
String b = new String("java");

System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
```

`new String(...)`은 새로운 String 객체를 만드는 생성 표현식입니다. 문자열 내용은 같아도 객체 동일성은 다를 수 있습니다.

### `intern()`은 무엇을 하는가

`String.intern()`은 해당 문자열과 내용이 같은 canonical 표현을 문자열 풀에서 얻습니다.

```java
String created = new String("java");
String pooled = created.intern();

System.out.println(pooled == "java"); // true
```

여기서 중요한 점은 `intern()`을 “문자열을 절약하는 최적화 버튼”처럼 사용하는 것이 아닙니다. 문자열 풀의 구체적인 저장 위치나 관리 방식은 JDK 구현과 버전에 따라 달라질 수 있습니다. Java 언어 수준에서 중요한 것은 **리터럴과 intern에 대해 어떤 동일성 계약이 있는지**입니다.

### 컴파일 시점에 합쳐지는 문자열도 있다

```java
String a = "ja" + "va";
String b = "java";
System.out.println(a == b); // 상수 표현식이면 같은 interned String을 사용할 수 있음
```

두 리터럴만으로 이루어진 상수 표현식은 컴파일 시점에 하나의 상수 문자열로 처리될 수 있습니다. 반대로 실행 중 변수 값으로 조합한 문자열은 같은 방식으로 생각하면 안 됩니다.

```java
String part = "ja";
String a = part + "va";
String b = "java";

System.out.println(a == b);      // 내용 비교 결과를 ==에 기대하지 말 것
System.out.println(a.equals(b)); // true
```

### 실무에서 pool을 의식해야 할까

일반적인 비즈니스 코드에서 문자열 내용 비교를 위해 pool이나 `intern()`을 직접 고려할 필요는 거의 없습니다. `equals`로 의도를 표현하면 됩니다.

대량의 중복 문자열 때문에 실제 메모리 문제가 생겼다면 그때 프로파일링과 heap 분석으로 원인을 확인한 뒤 해결책을 선택해야 합니다. `intern()`을 습관적으로 호출하면 오히려 코드 의도를 흐리고 관리 비용을 만들 수 있습니다.

### 문제를 풀 때는 생성 경로를 본다

`String`의 `==` 결과를 묻는 코드에서는 문자열 내용만 보지 말고 각각이 **리터럴인지, `new String`인지, 컴파일 시점 상수 표현식인지, 실행 중 만들어진 문자열인지, `intern()`을 호출했는지**를 확인해야 합니다.

그리고 실제 애플리케이션 코드에서는 이런 객체 동일성 추론을 비즈니스 문자열 비교에 사용하지 않는 것이 핵심입니다.
