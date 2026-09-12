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

UTF-8로 만들어진 byte를 다른 charset 규칙으로 해석하면 decoder는 **같은 숫자 배열을 다른 문자 규칙으로 읽습니다.** 그 결과 글자가 깨져 보이거나 malformed/unmappable input으로 처리될 수 있습니다. 흔히 깨진 문자 표시를 mojibake라고 부릅니다.

```text
UTF-8로 만든 bytes
        │
        ├─ UTF-8로 decode        -> 원래 문자
        │
        └─ 다른 charset로 decode -> 다른 문자 또는 decoding 문제
```

이미 잘못된 charset으로 decode해서 깨진 `String`을 얻었다면 단순히 다시 `getBytes(UTF_8)`를 호출한다고 원래 byte가 자동으로 복원되지는 않습니다. 최초 decoding 과정에서 어떤 byte가 어떤 문자로 바뀌었는지, replacement가 일어났는지를 알아야 합니다.

### 한 문자와 한 byte는 같은 단위가 아니다

영문 ASCII 범위에서는 한 문자가 한 byte처럼 보여서 혼동하기 쉽지만 일반적으로는 그렇지 않습니다. UTF-8에서는 문자에 따라 필요한 byte 수가 달라집니다.

따라서 문자열 길이와 전송 byte 크기를 같은 값으로 취급하면 안 됩니다.

```java
String text = "한";
int chars = text.length();
int bytes = text.getBytes(StandardCharsets.UTF_8).length;
```

여기서도 `String.length()` 자체는 Unicode code point 개수와 언제나 같은 의미가 아니라 UTF-16 code unit 수를 반환합니다. 이 Concept의 핵심은 우선 **문자 표현의 단위와 외부 byte 수는 서로 다른 층위**라는 점입니다.

### Java 25의 기본 charset은 UTF-8이지만 외부 계약까지 자동으로 정해지지는 않는다

다음 코드는 charset을 직접 적지 않습니다.

```java
byte[] bytes = text.getBytes();
```

오래된 Java 자료에서는 기본 charset이 OS나 locale마다 달라질 수 있으므로 이런 호출 자체를 피하라고 설명하는 경우가 많습니다. 그러나 Java SE 25의 `Charset` 계약에서는 JVM의 기본 charset이 **UTF-8이며, implementation-specific 방식으로 변경되지 않는 한 UTF-8을 사용한다**고 명시합니다.

그렇다고 charset을 생략한 코드가 항상 좋은 것은 아닙니다. JVM 기본값이 UTF-8이라는 사실과, 지금 읽는 CSV·HTTP payload·외부 파일이 실제로 UTF-8이라는 사실은 서로 다른 문제입니다.

```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
```

외부 데이터 형식이 UTF-8이라고 정해져 있다면 이렇게 경계에서 charset을 명시하면 코드가 의존하는 **외부 계약**이 더 잘 드러납니다. 반대로 MS949나 EUC-KR 같은 데이터를 받는다면 기본값에 기대지 말고 실제 계약에 맞는 charset을 사용해야 합니다.

즉 Java 25에서의 판단 기준은 "기본 charset이 환경마다 바뀌니 무조건 명시한다"가 아니라, **JVM 기본값과 외부 데이터의 인코딩 계약을 구분하고 필요한 경계에서 의도를 드러낸다**에 가깝습니다.

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
- HTTP body는 UTF-8인데 외부 파일은 MS949 등 다른 charset임
- DB에서 꺼낸 문자열은 정상인데 로그나 terminal rendering 단계에서 깨짐
- byte 길이 제한과 문자 길이 제한을 혼동함

이 문제들은 모두 "문자열이 깨졌다"로 보이지만 실제 오류가 발생한 층위는 다를 수 있습니다. Java String, 파일 encoding, HTTP metadata, terminal rendering을 분리해서 확인해야 합니다.

### 문제를 풀 때 확인할 것

1. 현재 데이터가 byte인지 character/String인지 확인합니다.
2. 어느 지점에서 encode 또는 decode가 일어나는지 찾습니다.
3. 사용하는 charset이 데이터 생산자·소비자 계약과 같은지 봅니다.
4. 문자 길이와 byte 길이를 같은 값으로 가정하지 않습니다.
5. Java 25의 기본 charset이 UTF-8이라는 사실과 외부 데이터 charset 계약을 혼동하지 않습니다.

### 학습 후 스스로 설명해 보기

파일과 네트워크는 byte를 다루고 Java String은 Unicode 문자 정보를 다루기 때문에 둘 사이에는 charset 기반 encoding/decoding 과정이 필요합니다. 서로 다른 charset으로 encode/decode하면 같은 byte를 다른 문자로 해석할 수 있습니다. Java 25의 JVM 기본 charset은 UTF-8이지만 외부 파일이나 프로토콜의 실제 인코딩까지 자동으로 UTF-8이 되는 것은 아니므로, 데이터 경계의 charset 계약을 확인하고 필요할 때 코드에 명시해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. Java 25에서 `String.getBytes()`에 charset을 생략하면 OS마다 결과가 달라진다고 말해도 되나요?

그렇게 일반화하면 현재 기준에서는 부정확합니다. Java SE 25의 기본 charset은 UTF-8입니다. 다만 해당 외부 파일이나 프로토콜의 charset이 UTF-8인지와는 별개이므로, 시스템 경계에서는 실제 데이터 계약을 확인하고 명시적인 charset API를 사용하는 편이 의도를 드러내기 좋습니다.

#### Q. byte 배열을 잘못된 charset으로 한 번 decode한 뒤 올바른 charset으로 다시 encode하면 원본을 복구할 수 있나요?

항상 그렇지는 않습니다. 잘못된 decoding 과정에서 다른 문자로 매핑되거나 replacement가 발생하면 원본 byte 정보가 사라질 수 있습니다. 인코딩 문제는 깨진 문자열만 다시 변환하기보다 최초 byte-to-character 경계를 찾아 어떤 charset과 오류 정책이 사용됐는지 확인해야 합니다.
