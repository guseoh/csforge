---
kind: concept
contentKey: java.core.io-nio.input-output-reader-writer
topicContentKey: java.core.io-nio
slug: input-output-reader-writer
title: "Input/output, Reader, and Writer"
summary: "binary/text 데이터에 맞는 Java I/O abstraction을 선택한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html"
    title: "Java SE 25 API: InputStream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: byte input abstraction 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Reader.html"
    title: "Java SE 25 API: Reader"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: character input abstraction 확인
---
# Input/output, Reader, and Writer

## 쉬운 진입

이미지·압축 파일은 bytes를 그대로 보존해야 하고, 사람이 읽는 문서는 characters로 처리하는
편이 자연스럽다. Java I/O의 `InputStream`/`OutputStream`과 `Reader`/`Writer`는 이 두
문제의 abstraction을 나눈다.

## 정확한 메커니즘

```java
try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    int character = reader.read();
}
```

Reader가 반환하는 `int`는 한 character를 나타내거나 EOF를 뜻할 수 있어 byte API와 같은
값 범위로 생각하면 안 된다. Reader/Writer를 byte stream 위에 놓을 때 charset decoder/encoder가
경계를 맡고, binary 데이터에 Reader를 적용하면 의미가 바뀌어 손상될 수 있다.

## 실전·면접 연결

파일 포맷이 text인지 binary인지와 charset을 먼저 결정한 뒤 API를 선택한다. 한 계층에서
이미 decode한 문자열을 다시 임의 charset으로 해석하지 않는다. stream close와 writer flush
계약도 resource scope에서 함께 관리한다.

## 흔한 오해

- `Reader.read()`의 반환값은 항상 byte 하나가 아니다.
- Writer를 쓴다고 자동으로 flush·close되는 것은 아니다.
- InputStream과 Reader는 이름만 다른 동일 API가 아니다.
