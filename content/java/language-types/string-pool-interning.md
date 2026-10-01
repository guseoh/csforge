---
kind: concept
contentKey: java.core.language-types.string-pool-interning
topicContentKey: java.core.language-types
slug: string-pool-interning
title: "문자열 풀(String Pool)과 intern()"
summary: "문자열 리터럴이 intern되는 규칙과 intern()의 의미를 이해하고 모든 String 생성이 같은 방식이라고 일반화하지 않는다"
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
    relationNote: intern() 메서드의 계약 확인
---
# 문자열 풀(String Pool)과 intern()

문자열 리터럴을 비교하다 보면 `==`가 `true`인 경우가 있습니다. 이것은 `String.equals`의 규칙이 특별해서가 아니라 Java 언어가 **문자열 리터럴과 특정 상수 문자열 표현식을 intern하도록 규정**하기 때문입니다.

### 동일한 문자열 리터럴은 같은 intern된 String 객체를 가리킨다

```java
String a = "java";
String b = "java";

System.out.println(a == b); // true
```

Java 언어 명세는 동일한 문자열 리터럴이 같은 `String` 인스턴스를 가리키도록 보장합니다. 따라서 위 코드의 `true`는 특정 JVM이 우연히 문자열을 재사용해서 나오는 결과가 아닙니다.

```text
"java" 리터럴 ───────────┐
                          ├──> 문자열 풀의 대표 String 객체
created.intern() ─────────┘
new String("java") ─────────> 별도의 String 객체
```

위 예제에서는 `"java"` 리터럴의 대표 객체가 존재하므로, 내용이 같은 `created.intern()`은 그 대표 객체의 참조를 돌려줍니다. 반면 `new String("java")`는 같은 내용을 가진 새 `String` 객체를 만드는 생성 표현식입니다.

```java
String a = "java";
String b = new String("java");

System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
```

문자열 내용은 같아도 생성 경로가 다르면 객체 동일성은 다를 수 있습니다.

### `intern()`은 무엇을 하는가

`String.intern()`은 이 문자열과 `equals` 기준으로 같은 내용을 가진 대표 문자열을 문자열 풀에서 얻습니다.

```java
String created = new String("java");
String pooled = created.intern();

System.out.println(pooled == "java"); // true
```

여기서 중요한 점은 `intern()`을 “문자열을 절약하는 최적화 버튼”처럼 사용하는 것이 아닙니다. 문자열 풀의 구체적인 저장 위치나 내부 관리 방식은 JDK 구현과 버전에 따라 달라질 수 있습니다. Java 언어/API 수준에서 중요한 것은 **리터럴과 `intern()`에 대해 어떤 동일성 계약이 있는지**입니다.

### 컴파일 시점 상수 문자열 표현식도 intern된다

```java
String a = "ja" + "va";
String b = "java";

System.out.println(a == b); // true
```

`"ja" + "va"`는 컴파일 시점에 값이 확정되는 문자열 상수 표현식입니다. 이런 상수 문자열 표현식은 intern되므로 위 코드에서 `a`와 `b`는 같은 `String` 인스턴스를 가리킵니다.

반대로 실행 중 변수 값을 이용해 조합한 문자열은 같은 규칙을 적용하면 안 됩니다.

```java
String part = "ja";
String a = part + "va";
String b = "java";

System.out.println(a == b);      // 내용 비교를 ==에 기대하면 안 됨
System.out.println(a.equals(b)); // true
```

`part`는 변수이므로 `part + "va"`는 위의 문자열 상수 표현식과 같은 경우가 아닙니다. 결과의 문자열 내용은 `"java"`와 같지만 같은 객체라는 보장은 없습니다.

### 실무에서는 내용 비교와 객체 동일성을 분리한다

일반적인 비즈니스 코드에서 문자열 내용 비교를 위해 문자열 풀이나 `intern()`을 직접 고려할 필요는 거의 없습니다. 문자열 값이 같은지 알고 싶은 경우에는 `equals`로 의도를 표현하면 됩니다.

대량의 중복 문자열 때문에 실제 메모리 문제가 생겼다면 그때 프로파일링과 힙 분석으로 원인을 확인한 뒤 해결책을 선택해야 합니다. `intern()`을 습관적으로 호출하면 코드 의도를 흐리고 별도의 관리 비용을 만들 수 있습니다.

### 문제를 풀 때는 생성 경로를 본다

`String`의 `==` 결과를 묻는 코드에서는 문자열 내용만 보지 말고 각각이 **리터럴인지, `new String`인지, 컴파일 시점 문자열 상수 표현식인지, 실행 중 만들어진 문자열인지, `intern()`을 호출했는지**를 확인해야 합니다.

다만 실제 애플리케이션의 문자열 값 비교에서는 이런 객체 동일성 추론을 사용하지 않고 `equals` 같은 값 비교 API로 의도를 드러내는 것이 핵심입니다.
