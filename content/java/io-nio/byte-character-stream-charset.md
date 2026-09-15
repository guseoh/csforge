---
kind: concept
contentKey: java.core.io-nio.byte-character-stream-charset
topicContentKey: java.core.io-nio
slug: byte-character-stream-charset
title: "바이트·문자 스트림과 Charset"
summary: "파일·네트워크의 byte와 Java 문자열의 문자 사이에서 charset이 왜 필요한지 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/Charset.html"
    title: "Java SE 25 API: Charset"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 문자와 byte 사이의 encode/decode 계약과 Java 25 기본 charset 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/StandardCharsets.html"
    title: "Java SE 25 API: StandardCharsets"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: UTF-8 등 반드시 지원되는 표준 charset 상수 확인
  - url: "https://d2.naver.com/helloworld/76650"
    title: "네이버 D2: 한글 인코딩의 이해 2편 - 유니코드와 Java를 이용한 한글 처리"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: Unicode와 UTF-8의 byte 표현, Java 문자열·입출력 인코딩의 배경 이해. 기본 charset 관련 내용은 JDK 18 이전 기준이므로 Java 25 공식 문서를 우선한다.
---
# 바이트·문자 스트림과 Charset

파일과 네트워크가 실제로 주고받는 것은 byte입니다. 반면 Java의 `String`은 문자 정보를 다룹니다. 따라서 외부 byte와 문자열 사이를 오갈 때는 **어떤 규칙으로 byte와 문자를 서로 변환할지**가 필요하고, 그 규칙이 charset입니다.

```text
문자열
  │ encode with charset
  ▼
bytes
  │ decode with charset
  ▼
문자열
```

문자에서 byte로 바꾸는 것을 encoding, byte에서 문자로 바꾸는 것을 decoding이라고 합니다.

```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
String restored = new String(bytes, StandardCharsets.UTF_8);
```

### byte 자체에는 charset 정보가 들어 있지 않다

같은 문자도 charset에 따라 서로 다른 byte sequence로 표현될 수 있습니다. 반대로 같은 byte sequence를 다른 charset으로 decode하면 다른 문자나 decoding 오류가 나올 수 있습니다.

```text
UTF-8로 만든 bytes
      │
      ├─ UTF-8로 decode  -> 의도한 문자
      └─ 다른 charset    -> 다른 문자 또는 decoding 오류
```

그래서 파일이나 HTTP payload를 읽을 때는 "문자열로 바꾼다"보다 먼저 **그 byte가 어떤 charset으로 만들어졌는가**를 확인해야 합니다.

이미 잘못된 charset으로 decode해 문자 정보가 손실됐다면, 깨진 String을 다시 UTF-8로 encode한다고 원본이 항상 복구되는 것도 아닙니다.

### 문자 길이와 byte 길이는 다른 단위다

영문 ASCII 범위에서는 한 문자가 한 byte처럼 보이지만 일반적으로는 그렇지 않습니다. UTF-8에서는 문자에 따라 필요한 byte 수가 다릅니다.

```java
String text = "한";
int units = text.length();
int bytes = text.getBytes(StandardCharsets.UTF_8).length;
```

또 `String.length()`은 Unicode code point 수를 직접 반환하는 API가 아니라 UTF-16 code unit 수를 반환합니다. 이 Concept에서 중요한 것은 **Java 문자열의 문자 표현 단위와 외부 byte 크기를 같은 것으로 취급하지 않는 것**입니다.

### 기본 charset과 외부 데이터 계약은 별개다

Java 25의 기본 charset은 UTF-8이지만 다음 두 문장은 같은 뜻이 아닙니다.

```text
현재 JVM의 기본 charset은 UTF-8이다.
이 파일/프로토콜의 실제 encoding도 UTF-8이다.
```

외부 데이터가 UTF-8이라는 계약이 있다면 명시적인 charset을 사용하는 코드가 그 의도를 잘 드러낼 수 있습니다.

```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
```

반대로 실제 입력이 다른 charset이라면 JVM 기본값과 무관하게 그 데이터의 charset으로 decode해야 합니다.

### InputStream과 Reader 사이에 decoding 경계가 있다

`InputStream`은 byte를 읽고 `Reader`는 문자를 읽습니다. Byte 기반 입력을 문자 기반 입력으로 바꾸는 지점에서 charset decoding이 필요합니다.

```text
File / Network
    │ bytes
    ▼
InputStream
    │ decode with Charset
    ▼
Reader
    │ characters
    ▼
Java code
```

인코딩 문제를 찾을 때는 "문자가 깨졌다"는 결과만 보지 말고 **어디에서 byte가 String으로 바뀌었는지**를 찾는 것이 가장 중요합니다. 그 경계의 charset이 생산자와 소비자의 계약과 일치해야 합니다.
