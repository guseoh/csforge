---
kind: concept
contentKey: java.core.modern-language.text-blocks
topicContentKey: java.core.modern-language
slug: text-blocks
title: "Text Block으로 여러 줄 문자열 쓰기"
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
# Text Block으로 여러 줄 문자열 쓰기

JSON, SQL, HTML처럼 여러 줄인 문자열을 일반 string literal로 작성하면 실제 내용보다 따옴표와 `\n`, 문자열 연결 문법이 더 눈에 띌 수 있습니다.

```java
String json = "{\n" +
        "  \"name\": \"Java\"\n" +
        "}";
```

Text block은 이런 문자열을 **소스 코드에서도 여러 줄 형태로 읽을 수 있게 하는 문자열 리터럴 문법**입니다.

```java
String json = """
        {
          "name": "Java"
        }
        """;
```

결과는 특별한 템플릿 객체가 아니라 일반 `String`입니다.

### 소스의 들여쓰기가 전부 결과 문자열이 되지는 않는다

Java 코드는 보통 블록 안에서 들여쓰기됩니다. text block은 소스 구조 때문에 생긴 공통 들여쓰기를 그대로 모두 결과에 넣지 않고, 문법 규칙에 따라 incidental indentation을 제거합니다.

```java
String sql = """
        SELECT id, name
        FROM member
        WHERE status = 'ACTIVE'
        """;
```

따라서 "소스에 앞 공백이 8칸 보이니 결과 문자열에도 반드시 8칸이 들어간다"고 판단하면 안 됩니다. 실제 문자열에서 의미가 있는 공백과 소스 코드 정렬을 위한 들여쓰기를 구분해야 합니다.

### 줄바꿈과 escape도 결과 문자열의 일부다

text block은 여러 줄 문자열이므로 마지막 줄바꿈을 포함해 어디에 line terminator가 들어가는지 결과에 영향을 줍니다. 닫는 `"""`의 위치와 escape를 함께 봐야 합니다.

```java
String text = """
        first line\
        second line
        """;
```

줄 끝의 `\`를 사용하면 그 소스 줄바꿈이 결과 문자열에 포함되지 않도록 할 수 있습니다. `\s`는 의도적인 공백을 표현할 때 사용할 수 있습니다.

공백과 줄바꿈이 프로토콜이나 테스트 결과에 중요하다면 눈으로만 추측하기보다 실제 결과 문자열을 작은 테스트로 확인하는 편이 안전합니다.

### text block은 문자열 보간 기능이 아니다

```java
String template = """
        hello, ${name}
        """;
```

`${name}`은 자동으로 변수 값으로 치환되지 않습니다. 그대로 문자열에 포함됩니다. 값을 삽입해야 한다면 `formatted` 같은 별도 API나 필요한 템플릿 도구를 사용해야 합니다.

### 문자열 작성 문법과 그 문자열의 의미는 별도 문제다

Text block으로 SQL을 읽기 좋게 적었다고 parameter binding이나 SQL 검증이 생기는 것은 아니고, JSON을 text block으로 적었다고 JSON 문법이 자동 검증되는 것도 아닙니다. Text block이 해결하는 문제는 **Java source에서 여러 줄 String을 어떻게 표현할 것인가**입니다.

같은 이유로 파일이나 네트워크에 문자열을 쓸 때 어떤 charset으로 byte로 변환할지도 I/O 계층의 별도 계약입니다.

Text block을 읽을 때는 먼저 결과가 평범한 `String`이라는 점을 잡고, 그다음 incidental indentation, 줄바꿈, escape가 실제 문자열을 어떻게 만드는지 확인하면 됩니다. 다른 포맷의 검증·보안·인코딩 책임까지 이 문법에 기대하지 않는 것이 핵심입니다.
