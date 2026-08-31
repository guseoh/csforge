---
kind: concept
contentKey: java.core.io-nio.byte-character-stream-charset
topicContentKey: java.core.io-nio
slug: byte-character-stream-charset
title: "Byte, character stream, and charset"
summary: "byte·character와 charset 경계에서 encoding/decoding을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/Charset.html"
    title: "Java SE 25 API: Charset"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: charset encode/decode 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/charset/StandardCharsets.html"
    title: "Java SE 25 API: StandardCharsets"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 표준 charset 상수 확인
---
# Byte, character stream, and charset

## 쉬운 진입

파일과 네트워크는 byte sequence를 주고받지만 Java 문자열은 Unicode character를 다룬다.
그 사이에서 UTF-8 같은 charset을 정하지 않으면 같은 bytes가 다른 글자로 decode되어
mojibake가 된다.

## 정확한 메커니즘

```text
문자열 "한" ── UTF-8 encode ── bytes
bytes      ── UTF-8 decode ── 문자열 "한"
```

`Charset`은 문자와 byte sequence의 mapping 및 encoder/decoder 정책을 나타낸다.
`InputStream`/`OutputStream`은 raw bytes에, `Reader`/`Writer`는 characters에 가까운
abstraction이다. 경계에서 `StandardCharsets.UTF_8`처럼 명시하면 OS default charset에
의존하는 위험을 줄인다.

## 실전·면접 연결

문서 형식의 charset과 transport의 charset을 각각 확인하고, decode 실패를 replacement로
삼킬지 예외로 처리할지 정한다. 이미 깨진 문자열을 다시 encode한다고 원래 bytes가 자동
복구되지는 않는다. Java API의 문자열은 OS terminal 표시 방식과도 별개의 층이다.

## 흔한 오해

- character 하나가 항상 byte 하나인 것은 아니다.
- UTF-8이 모든 legacy byte sequence를 같은 문자로 해석한다는 뜻은 아니다.
- `String.getBytes()`의 default charset 사용은 portable contract가 아니다.
