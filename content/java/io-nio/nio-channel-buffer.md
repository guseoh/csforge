---
kind: concept
contentKey: java.core.io-nio.nio-channel-buffer
topicContentKey: java.core.io-nio
slug: nio-channel-buffer
title: "NIO Channel과 Buffer"
summary: "Channel로 데이터를 주고받을 때 Buffer의 position·limit·capacity가 어떻게 바뀌는지 상태 변화로 이해한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/Buffer.html"
    title: "Java SE 25 API: Buffer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: position·limit·capacity와 flip·clear·compact 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/Channel.html"
    title: "Java SE 25 API: Channel"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Channel의 I/O·open/close abstraction 확인
---
# NIO Channel과 Buffer

NIO 코드에서 `flip()`, `clear()`, `compact()`가 헷갈리는 이유는 같은 Buffer가 **데이터를 채우는 상태와 이미 채운 데이터를 읽는 상태를 position과 limit으로 구분**하기 때문입니다.

Channel은 데이터가 오가는 통로이고 Buffer는 그 데이터를 애플리케이션이 읽고 쓰는 영역입니다.

```csforge-viz
{
  "version": 1,
  "type": "java-api-contract",
  "example": "buffer",
  "title": "8칸 Buffer의 상태 추적",
  "description": "같은 8칸에서 쓰기, flip, 부분 소비, compact, clear를 추적합니다. clear는 데이터를 지우지 않습니다."
}
```

### Buffer의 상태는 position·limit·용량으로 읽는다

- `capacity`: Buffer가 가질 수 있는 전체 요소 수
- `limit`: 현재 접근할 수 있는 범위의 끝
- `position`: 다음에 읽거나 쓸 위치

8칸짜리 `ByteBuffer`를 만들면 개념적으로 다음과 같습니다.

초기 상태는 position=0, limit=8, capacity=8입니다.

### Channel에서 데이터를 읽어 Buffer에 쓰면 position이 이동한다

```java
ByteBuffer buffer = ByteBuffer.allocate(8);
int count = channel.read(buffer);
```

5 바이트가 들어왔다면 앞 5칸이 채워지고 다음 쓰기 위치인 `position`은 5가 됩니다.

A·B·C·D·E를 쓴 뒤에는 position=5, limit=8입니다.

이 상태는 아직 "A부터 읽기" 위한 상태가 아닙니다. 다음 접근 위치가 5이기 때문입니다.

### `flip()`은 채운 범위를 읽을 범위로 바꾼다

```java
buffer.flip();
```

`flip()`은 기존 position을 새 limit으로 두고 position을 0으로 옮깁니다.

flip 후에는 position=0, limit=5로 바뀌며 바이트 내용은 유지됩니다.

데이터를 뒤집거나 복사하는 메서드가 아니라 **방금 쓴 범위를 읽을 수 있도록 상태 값을 바꾸는 연산**입니다.

### 모두 소비했다면 `clear()`, 일부가 남았다면 `compact()`

다 읽고 Buffer 전체를 다시 입력용으로 쓰려면 `clear()`를 사용할 수 있습니다.

```java
buffer.clear();
```

핵심 효과는 `position = 0`, `limit = capacity`로 되돌려 전체 범위를 다시 쓸 수 있게 하는 것입니다. 기존 바이트를 0으로 지우는 동작은 아닙니다.

반면 아직 읽지 않은 데이터가 있고 다음 입력과 이어서 처리해야 한다면 `compact()`가 필요할 수 있습니다.

A·B·C를 소비했다면 D·E가 남습니다. compact는 D·E를 index 0·1로 옮기고 position=2, limit=8로 설정합니다. 이후 영역을 0으로 지우는 계약은 없습니다.

남은 값을 앞쪽으로 옮기고 그 뒤에 새 데이터를 쓸 공간을 만듭니다.

### 한 번의 Channel 읽기/쓰기가 전체를 처리한다고 가정하지 않는다

Channel I/O는 partial 읽기/쓰기가 가능합니다. `channel.write(buffer)` 한 번으로 모든 remaining 바이트가 반드시 기록되는 것은 아닙니다.

```java
while (buffer.hasRemaining()) {
    channel.write(buffer);
}
```

이 반복은 쓰기가 진행되거나 기다릴 수 있는 블로킹 채널의 단순 예시입니다. 논블로킹 채널에서 `write()`가 0을 반환하면 같은 반복을 즉시 계속하는 대신 남은 데이터를 보존하고, 쓰기 준비 통지 등을 이용해 나중에 재시도해야 합니다. 그렇지 않으면 아무 진전 없이 CPU를 사용하는 busy loop가 될 수 있습니다.

실제 반복 방식은 블로킹/논블로킹 모드와 프로토콜에 따라 달라질 수 있지만, 코드 추론에서는 **I/O 반환값과 Buffer의 현재 position/limit을 함께 추적**해야 합니다.

NIO Buffer 문제를 풀 때는 메서드 이름보다 각 단계의 `position`, `limit`, `capacity`를 직접 적어 보세요. `flip`은 쓰기 범위를 읽기 범위로 전환하고, `clear`는 전체를 다시 쓰기 준비 상태로 만들며, `compact`는 읽지 않은 데이터를 보존한다는 차이가 상태 값으로 자연스럽게 보입니다.
