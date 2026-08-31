---
kind: concept
contentKey: java.core.io-nio.buffered-io
topicContentKey: java.core.io-nio
slug: buffered-io
title: "Buffered I/O"
summary: "buffering과 flush 시점, underlying I/O 호출 경계를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedInputStream.html"
    title: "Java SE 25 API: BufferedInputStream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: input buffering 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedWriter.html"
    title: "Java SE 25 API: BufferedWriter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: writer buffer·flush 계약 확인
---
# Buffered I/O

## 쉬운 진입

한 글자마다 디스크나 네트워크에 전달하면 작은 호출이 너무 많아진다. buffer는 애플리케이션과
underlying stream 사이에 모아 두는 공간을 두어 여러 작은 작업을 한 번의 큰 I/O로 묶는다.

## 정확한 메커니즘

```java
try (BufferedWriter writer = Files.newBufferedWriter(path, UTF_8)) {
    writer.write("first");
    writer.newLine();
    writer.write("second");
} // close 과정에서 남은 buffer를 flush하고 자원 해제
```

`flush()`는 writer가 보유한 데이터를 다음 계층으로 밀어내지만, 그것이 디스크에 영구 저장됐다는
뜻이나 underlying resource close를 대신한다는 뜻은 아니다. buffer가 읽기 성능을 높이는
것도 API의 호출 패턴을 줄이는 의미이며, 모든 매체에서 같은 물리 성능을 보장하는 문장은 아니다.

## 실전·면접 연결

중간 결과를 다른 consumer가 즉시 봐야 하면 명시적으로 flush할 수 있고, 일반 파일 쓰기는
불필요한 flush를 반복하지 않는다. 예외가 나도 남은 데이터와 close 실패를 어떻게 처리할지
try-with-resources와 함께 설계한다.

## 흔한 오해

- flush가 close와 항상 같은 의미는 아니다.
- BufferedWriter가 charset을 자동으로 올바르게 선택하는 것은 아니다.
- buffer 크기를 키우면 모든 workload가 비례해 빨라진다는 보장은 없다.
