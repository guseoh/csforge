---
kind: concept
contentKey: java.core.io-nio.input-output-reader-writer
topicContentKey: java.core.io-nio
slug: input-output-reader-writer
title: "입출력과 Reader·Writer"
summary: "데이터가 바이너리인지 텍스트인지에 따라 바이트 스트림과 문자 스트림을 선택하고 자원 수명을 관리한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html"
    title: "Java SE 25 API: InputStream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: byte 입력 stream의 read·close 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Reader.html"
    title: "Java SE 25 API: Reader"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 문자 입력 추상화와 read 계약 확인
---
# 입출력과 Reader·Writer

이미지 파일과 JSON 파일은 둘 다 디스크에 저장되지만 Java 코드에서 다루는 방식은 같지 않습니다. 이미지는 원래 바이트 구조를 그대로 보존해야 하는 바이너리 데이터이고, JSON은 문자셋 규칙을 통해 문자로 해석하는 텍스트 데이터입니다.

Java I/O는 이 차이를 기준으로 크게 **바이트 스트림**과 **문자 스트림**을 나눕니다.

### 바이너리 데이터는 InputStream과 OutputStream이 기본이다

`InputStream`은 바이트 입력을, `OutputStream`은 바이트 출력을 나타내는 추상화입니다.

```java
try (InputStream input = Files.newInputStream(path)) {
    byte[] header = input.readNBytes(8);
}
```

이미지, 압축 파일, 암호화된 페이로드처럼 바이트 자체의 값이 중요한 데이터는 중간에 문자로 바꾸지 않고 바이트로 처리해야 합니다.

```text
바이너리 파일
    │
    ▼
InputStream
    │ bytes
    ▼
애플리케이션
```

바이너리 데이터를 임의의 문자셋으로 문자열로 바꿨다가 다시 바이트로 만드는 과정은 원래 데이터를 보존하지 못할 수 있습니다.

### 텍스트 데이터는 Reader와 Writer가 문자 관점을 제공한다

`Reader`는 문자 입력, `Writer`는 문자 출력을 제공합니다.

```java
try (Reader reader = Files.newBufferedReader(
        path,
        StandardCharsets.UTF_8
)) {
    int value = reader.read();
}
```

여기서 `read()`가 `int`를 반환한다고 해서 "정수 데이터를 읽는다"는 뜻은 아닙니다. 문자 값을 표현할 공간과 EOF를 나타낼 별도 값이 필요하기 때문에 int 반환 타입을 사용합니다.

바이트 스트림과 문자 스트림 사이에는 문자셋 변환이 들어갑니다.

```text
InputStream(bytes)
       │
       │ 문자셋 디코딩
       ▼
Reader(characters)
```

### 텍스트인지 바이너리인지 먼저 결정해야 한다

파일 확장자나 메서드 이름만 보고 API를 고르는 것이 아니라 데이터의 의미를 봐야 합니다.

| 데이터           | 자연스러운 관점     |
| ---------------- | ------------------- |
| JPEG/PNG         | 바이트                |
| ZIP              | 바이트                |
| 암호화 페이로드   | 바이트                |
| UTF-8 CSV        | 문자 + 문자셋 |
| JSON 텍스트        | 문자 + 문자셋 |
| 일반 텍스트 로그 | 문자 + 문자셋 |

HTTP body도 네트워크에서는 바이트로 이동하지만 애플리케이션 layer에서 JSON으로 해석하는 순간 문자셋과 텍스트 parsing 경계를 거칩니다. 층위를 나눠서 보는 것이 중요합니다.

### 읽기 한 번이 항상 요청한 양을 전부 채우는 것은 아니다

I/O 코드를 읽을 때 흔한 실수는 `read(buffer)` 한 번으로 항상 버퍼 전체가 채워진다고 생각하는 것입니다. Stream API의 읽기 계약은 실제로 읽힌 수를 반환하며 EOF에서는 별도 값을 반환할 수 있습니다.

```java
byte[] buffer = new byte[1024];
int read;
while ((read = input.read(buffer)) != -1) {
    output.write(buffer, 0, read);
}
```

마지막 반복에서는 1024보다 적은 바이트가 읽힐 수도 있습니다. 반환값을 무시하면 이전 버퍼 내용까지 잘못 처리할 수 있습니다.

### close는 I/O의 일부다

파일이나 socket 같은 외부 자원은 사용 후 반환해야 합니다. Java에서는 try-with-resources로 소유권을 코드 구조에 표현할 수 있습니다.

```java
try (InputStream input = Files.newInputStream(path)) {
    // 사용
}
```

하지만 "모든 스트림을 무조건 받은 쪽에서 닫는다"는 규칙으로 외우면 안 됩니다. 누가 자원을 만들었고 누가 생명주기를 소유하는지 API 계약을 확인해야 합니다. 다른 객체가 관리하는 스트림을 빌려 쓰는 코드가 임의로 닫으면 오히려 문제가 될 수 있습니다.

### Reader/Writer를 쓴다고 문자셋이 자동으로 정답이 되는 것은 아니다

Character API를 사용해도 바이트와 연결되는 경계에는 문자셋이 필요합니다. `Files.newBufferedReader(path, UTF_8)`처럼 명시적인 API를 사용하면 계약이 잘 보입니다.

또 `Writer`는 문자를 바이트로 보내는 하위 계층을 가질 수 있고 버퍼링이 있다면 `flush`와 `close` 시점도 함께 고려해야 합니다.

### 문제를 풀 때 확인할 것

1. 데이터가 바이너리인지 텍스트인지 확인합니다.
2. 바이트 API와 문자 API 중 어떤 층위인지 봅니다.
3. 텍스트라면 문자셋 변환 지점이 어디인지 확인합니다.
4. 읽기 반환값을 무시하고 있지 않은지 봅니다.
5. 자원을 누가 열고 누가 닫아야 하는지 소유권을 확인합니다.

### 학습 후 스스로 설명해 보기

`InputStream`/`OutputStream`은 바이트 기반 I/O이고 `Reader`/`Writer`는 문자 기반 I/O라고 설명할 수 있습니다. Text 데이터를 다룰 때는 바이트와 문자 사이의 문자셋 변환이 필요하며, 읽기 한 번이 전체 데이터를 반환한다고 가정하지 말고 반환값과 EOF를 처리해야 합니다. 외부 자원의 close 책임도 소유권 계약에 맞게 관리해야 합니다.
