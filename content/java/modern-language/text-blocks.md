---
kind: concept
contentKey: java.core.modern-language.text-blocks
topicContentKey: java.core.modern-language
slug: text-blocks
title: "Text blocks"
summary: "multi-line text의 indentation·escape·line terminator를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html"
    title: "Java Language Specification 3장: Lexical Structure"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: text block token과 line terminator 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: string literal·text block 표현 확인
---
# Text blocks

## 쉬운 진입

JSON, SQL, 안내문처럼 줄바꿈이 중요한 문자열을 `"...\\n..."`로 이어 쓰면 내용과 코드
구조가 서로 싸운다. text block은 여러 줄을 source에서 자연스럽게 작성하게 해 준다.

## 정확한 메커니즘

```java
String json = """
        {
          "name": "Java"
        }
        """;
```

compiler는 incidental indentation을 정리하고, escape sequence와 line terminator 규칙을
적용한다. 여는 delimiter 뒤의 줄바꿈과 닫는 delimiter의 위치도 결과 문자열에 영향을
주므로 “source에 보이는 공백이 모두 그대로”라고 단정하지 않는다. `\s`, `\` 같은 escape로
의도적인 마지막 공백·줄바꿈을 표현할 수 있다.

## 실전·면접 연결

text block은 문법 표현을 편하게 할 뿐 JSON/SQL escaping과 validation을 대신하지 않는다.
외부 protocol에 보낼 text라면 charset encoding과 포맷 규칙을 별도로 관리한다. diff가
읽기 쉬운 위치에 delimiter를 두고 실제 결과를 작은 테스트로 고정한다.

## 흔한 오해

- text block은 runtime file이나 template engine이 아니다.
- 들여쓰기 정리는 모든 공백을 무조건 삭제하는 동작이 아니다.
- text block이 자동으로 platform default charset을 고정해 주지는 않는다.
