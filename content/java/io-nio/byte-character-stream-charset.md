---
kind: concept
contentKey: java.core.io-nio.byte-character-stream-charset
topicContentKey: java.core.io-nio
slug: byte-character-stream-charset
title: "Byte, character stream, and charset"
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
    relationNote: 문자와 byte 사이의 encode/decode 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/StandardCharsets.html"
    title: "Java SE 25 API: StandardCharsets"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: UTF-8 등 반드시 지원되는 표준 charset 상수 확인
---
# Byte, character stream, and charset

파일과 네트워크가 실제로 주고받는 것은 byte입니다. 반면 Java의 `String`은 사람이 읽는 문자 정보를 다룹니다. 그래서 외부에서 받은 byte를 문자열로 바꾸거나 문자열을 파일·네트워크로 내보낼 때는 **어떤 규칙으로 byte와 문자를 서로 바꿀지**가 필요합니다. 그 규칙이 charset입니다.

### 같은 글자도 charset에 따라 byte 표현이 달라진다

```text
문자열 "Java 한글"
        │
        │ UTF-8로 encode
        ▼
byte sequence
        │
        │ UTF-8로 decode
        ▼
문자열 "Java 한글"
```

문자에서 byte로 바꾸는 방향을 **encoding**, byte에서 문자로 바꾸는 방향을 **decoding**이라고 합니다.

```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
String restored = new String(bytes, StandardCharsets.UTF_8);
```

encode할 때와 decode할 때 같은 문자 규칙을 사용해야 원래 의도한 문자열을 얻을 수 있습니다. byte 자체에는 "나는 UTF-8이다"라는 정보가 자동으로 붙어 있는 것이 아닙니다.

### charset이 맞지 않으면 왜 글자가 깨질까

UTF-8로 만들어진 byte를 다른 charset 규칙으로 해석하면 decoder는 **같은 숫자 배열을 다른 문자 규칙으로 읽습니다.** 그 결과 글자가 깨져 보일 수 있습니다. 흔히 이런 현상을 mojibake라고 부릅니다.

```text
UTF-8로 만든 bytes
        │
        ├─ UTF-8로 decode   -> 원래 문자
        │
        └─ 다른 charset으로 decode -> 다른 문자 또는 오류
```

이미 잘못된 charset으로 decode해서 깨진 `String`을 얻었다면 단순히 다시 `getBytes(UTF_8)`를 호출한다고 원래 byte가 자동으로 복원되지는 않습니다. **어느 단계에서 잘못 해석했는지**를 알아야 합니다.

### 한 문자와 한 byte는 같은 단위가 아니다

영문 ASCII 범위에서는 한 문자가 한 byte처럼 보여서 혼동하기 쉽지만 일반적으로는 그렇지 않습니다. UTF-8에서는 문자에 따라 필요한 byte 수가 달라집니다.

따라서 문자열 길이와 전송 byte 크기를 같은 값으로 취급하면 안 됩니다.

```java
String text = "한";
int chars = text.length();
int bytes = text.getBytes(StandardCharsets.UTF_8).length;
```

여기서도 `String.length()` 자체는 Unicode code point 개수와 언제나 같은 의미가 아니라 UTF-16 code unit 기준이라는 더 깊은 규칙이 있습니다. 이 Concept의 핵심은 우선 **문자 개수와 byte 개수는 다른 층위**라는 점입니다.

### 기본 charset에 숨게 의존하지 않는다

다음 코드는 charset을 직접 적지 않습니다.

```java
byte[] bytes = text.getBytes();
```

API의 기본 charset 동작에 의존하면 실행 환경이나 외부 시스템 계약을 코드만 보고 파악하기 어려워집니다. 파일 형식이나 HTTP payload가 UTF-8이라고 정해져 있다면 다음처럼 명시하는 편이 의도가 분명합니다.

```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
```

중요한 것은 "무조건 UTF-8"이라는 암기 규칙이 아니라 **외부 데이터의 실제 charset 계약을 확인하고 그 값을 명시적으로 적용하는 것**입니다.

### InputStream과 Reader의 경계도 charset과 연결된다

`InputStream`은 byte를 읽는 추상화이고 `Reader`는 문자를 읽는 추상화입니다. byte stream을 character stream으로 바꾸는 지점에 charset decoding이 들어갑니다.

```text
File / Network
    │ bytes
    ▼
InputStream
    │ charset decoder
    ▼
Reader
    │ characters
    ▼
Java code
```

따라서 text file을 읽을 때 "어떤 Reader를 썼는가"뿐 아니라 **어느 charset으로 byte를 문자로 바꾸었는가**까지 봐야 합니다.

### 백엔드에서 어디서 문제가 생길까

- CSV 파일 업로드의 인코딩이 예상과 다름
- HTTP body는 UTF-8인데 외부 파일이 EUC-KR 등 다른 charset임
- DB에서 꺼낸 문자열은 정상인데 로그/terminal 표현에서 깨짐
- byte 길이 제한과 문자 길이 제한을 혼동함

이 문제들은 모두 "문자열이 깨졌다"로 보이지만 실제 오류가 발생한 층위는 다를 수 있습니다. Java String, 파일 encoding, HTTP header, terminal rendering을 분리해서 확인해야 합니다.

### 문제를 풀 때 확인할 것

1. 현재 데이터가 byte인지 character/String인지 확인합니다.
2. 어느 지점에서 encode 또는 decode가 일어나는지 찾습니다.
3. 사용하는 charset이 양쪽 계약과 같은지 봅니다.
4. 문자 길이와 byte 길이를 같은 값으로 가정하지 않습니다.
5. 기본 charset에 숨게 의존하는 호출이 있는지 확인합니다.

### 면접에서 설명한다면

파일과 네트워크는 byte를 다루고 Java String은 문자를 다루기 때문에 둘 사이에는 charset 기반 encoding/decoding 과정이 필요하다고 설명하면 됩니다. 서로 다른 charset으로 encode/decode하면 같은 byte를 다른 문자로 해석해 글자가 깨질 수 있으므로 외부 데이터 계약에 맞는 charset을 경계에서 명시하는 것이 중요합니다.
