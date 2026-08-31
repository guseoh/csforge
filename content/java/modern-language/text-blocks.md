---
kind: concept
contentKey: java.core.modern-language.text-blocks
topicContentKey: java.core.modern-language
slug: text-blocks
title: "Text blocks"
summary: "여러 줄 문자열을 읽기 좋게 작성하되 실제 결과 문자열의 들여쓰기·줄바꿈·escape 규칙을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html"
    title: "Java Language Specification 3장: Lexical Structure"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: text block token, 줄바꿈과 escape 처리 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: String literal과 text block 표현 확인
---
# Text blocks

JSON, SQL, HTML처럼 여러 줄로 구성된 문자열을 일반 string literal로 작성하면 따옴표와 `\n`이 내용보다 더 눈에 띄는 경우가 많습니다.

```java
String json = "{\n" +
        "  \"name\": \"Java\"\n" +
        "}";
```

Text block은 이런 **여러 줄 문자열을 소스 코드에서도 여러 줄 형태로 읽을 수 있게** 합니다.

```java
String json = """
        {
          "name": "Java"
        }
        """;
```

결과는 특별한 템플릿 객체가 아니라 평범한 `String`입니다. 차이는 문자열을 소스에 적는 방식입니다.

### 소스에 보이는 들여쓰기가 전부 결과에 들어가는 것은 아니다

Java 코드는 보통 블록 안에서 들여쓰기합니다. text block이 그 들여쓰기를 전부 실제 문자열에 넣어 버리면 코드 위치를 한 단계 옮기는 것만으로 결과가 달라지기 쉽습니다.

그래서 compiler는 text block의 공통 들여쓰기 가운데 문법상 부수적인 부분을 정리합니다. 다음 코드를 볼 때는 "앞에 공백이 8칸 보이니 결과도 무조건 8칸"이라고 판단하면 안 됩니다.

```java
String sql = """
        SELECT id, name
        FROM member
        WHERE status = 'ACTIVE'
        """;
```

실제 결과에서 중요한 공백이 있다면 source indentation과 **문자열 내용으로 보존하려는 공백**을 구분해야 합니다.

### 줄바꿈도 문자열의 일부다

text block은 여러 줄을 표현하므로 줄 끝 처리도 결과 문자열에 영향을 줍니다. 닫는 `"""`의 위치와 마지막 줄을 어떻게 작성했는지에 따라 끝의 줄바꿈 여부를 의식해야 합니다.

필요하면 escape를 이용해 의도를 더 분명하게 표현할 수 있습니다.

```java
String text = """
        first line\
        second line
        """;
```

줄 끝의 `\`는 소스의 줄바꿈이 결과 문자열에 포함되지 않도록 할 때 사용할 수 있습니다. `\s`는 의도적인 공백을 나타내는 데 활용할 수 있습니다.

모든 세부 규칙을 암기하는 것보다 **실제 문자열의 공백과 줄바꿈이 계약에 중요하다면 작은 테스트로 결과를 고정하는 습관**이 실용적입니다.

### text block은 문자열 보간 기능이 아니다

다음처럼 `${name}`을 적는다고 Java가 자동으로 값을 넣어 주지는 않습니다.

```java
String template = """
        hello, ${name}
        """;
```

이것은 그대로 문자 `$`, `{`, `name`, `}`을 포함한 String일 뿐입니다. 값 삽입이 필요하면 `formatted`, template engine 등 별도의 방법을 선택해야 합니다.

### SQL을 읽기 쉽게 써도 SQL Injection 문제는 별개다

백엔드에서는 text block을 SQL이나 JSON 예시에 사용하기 좋습니다.

```java
String sql = """
        SELECT id, email
        FROM member
        WHERE email = ?
        """;
```

하지만 text block은 **SQL parameter binding이나 입력 검증 기능이 아닙니다.** 문자열 작성이 편해졌을 뿐 보안 계약은 달라지지 않습니다. 사용자 입력을 문자열 연결로 SQL에 넣으면 text block을 사용하더라도 injection 위험은 그대로입니다.

마찬가지로 JSON 문자열이 보기 좋게 작성됐다고 해서 JSON 문법이 자동 검증되는 것도 아닙니다.

### charset 문제도 별개다

text block의 결과는 Java `String`입니다. 파일이나 네트워크로 내보내려면 결국 byte로 encoding해야 합니다. 이때 UTF-8 같은 charset을 무엇으로 사용할지는 I/O 경계에서 따로 결정해야 합니다.

```text
text block source
      │
      ▼
Java String
      │
      │ charset으로 encoding
      ▼
byte sequence
      │
      ▼
file / network
```

Text block이 platform default charset 문제를 해결해 주는 기능은 아닙니다.

### 문제를 풀 때 확인할 것

1. text block의 결과가 결국 `String`이라는 점부터 잡는다.
2. 공통 들여쓰기와 실제 보존하려는 공백을 구분한다.
3. 마지막 줄바꿈이 결과에 포함되는지 본다.
4. escape가 줄바꿈이나 공백을 어떻게 바꾸는지 확인한다.
5. formatting, JSON validation, SQL parameter binding, charset 처리는 별도 문제임을 구분한다.

### 면접에서 설명한다면

Text block은 여러 줄 문자열을 소스에서 읽기 좋게 표현하는 Java 문법이라고 설명하면 됩니다. 단순히 화면에 보이는 공백을 전부 그대로 보존하는 것은 아니며 공통 들여쓰기와 줄바꿈 처리 규칙이 있습니다. 결과는 일반 `String`이므로 SQL 보안, JSON 검증, charset encoding 같은 문제를 대신 해결하지 않습니다.
