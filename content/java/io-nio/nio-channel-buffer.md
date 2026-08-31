---
kind: concept
contentKey: java.core.io-nio.nio-channel-buffer
topicContentKey: java.core.io-nio
slug: nio-channel-buffer
title: "NIO Channel and Buffer"
summary: "Channel과 Buffer의 position·limit·capacity 및 flip/clear 흐름을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/Buffer.html"
    title: "Java SE 25 API: Buffer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: position·limit·capacity·flip·clear 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Channel.html"
    title: "Java SE 25 API: Channel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: channel I/O abstraction과 close 확인
---
# NIO Channel and Buffer

## 쉬운 진입

Channel은 data가 오가는 통로이고 Buffer는 애플리케이션이 읽고 쓸 임시 영역이다. 같은
Buffer를 channel read에 채우고, 이어서 그 내용을 소비하려면 “쓰기 모드”와 “읽기 모드”의
cursor를 명시적으로 바꿔야 한다.

## 정확한 메커니즘

```java
ByteBuffer buffer = ByteBuffer.allocate(8);
channel.read(buffer); // position 증가, limit은 capacity
buffer.flip();        // limit=기존 position, position=0: 읽기 준비
while (buffer.hasRemaining()) consume(buffer.get());
buffer.clear();       // position=0, limit=capacity: 다시 쓰기 준비
```

`capacity`는 storage 크기, `limit`은 현재 읽기/쓰기의 끝, `position`은 다음 위치다.
`flip()`은 채운 범위를 읽게 하고 `clear()`는 데이터를 지우기보다 다음 쓰기를 위한 cursor를
되돌린다. `compact()`는 아직 읽지 않은 데이터를 앞으로 옮겨 다음 read와 이어 붙인다.

## 실전·면접 연결

partial read/write와 `hasRemaining()`을 처리해야 하며 한 번의 channel call이 모든 bytes를
소비한다고 가정하지 않는다. buffer byte order, direct buffer와 allocation 특성은 API·runtime
선택이며 모든 성능 수치를 언어 보장처럼 말하지 않는다.

## 흔한 오해

- `clear()`는 buffer bytes를 물리적으로 0으로 지우는 연산이 아니다.
- `flip()`은 buffer 내용을 복사하지 않는다.
- position과 limit은 OS file offset이나 network protocol cursor와 동일한 값이 아니다.
