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

![NIO Buffer의 write mode와 read mode 전환](/learning/java/nio-buffer-flip.svg)

### Buffer의 상태는 position·limit·capacity로 읽는다

- `capacity`: Buffer가 가질 수 있는 전체 요소 수
- `limit`: 현재 접근할 수 있는 범위의 끝
- `position`: 다음에 읽거나 쓸 위치

8칸짜리 `ByteBuffer`를 만들면 개념적으로 다음과 같습니다.

```text
capacity = 8
limit    = 8
position = 0

[ _ _ _ _ _ _ _ _ ]
  ^               ^
position         limit
```

### Channel에서 데이터를 읽어 Buffer에 쓰면 position이 이동한다

```java
ByteBuffer buffer = ByteBuffer.allocate(8);
int count = channel.read(buffer);
```

5 byte가 들어왔다면 앞 5칸이 채워지고 다음 쓰기 위치인 `position`은 5가 됩니다.

```text
[ A B C D E _ _ _ ]
            ^     ^
         position limit=8
```

이 상태는 아직 "A부터 읽기" 위한 상태가 아닙니다. 다음 접근 위치가 5이기 때문입니다.

### `flip()`은 채운 범위를 읽을 범위로 바꾼다

```java
buffer.flip();
```

`flip()`은 기존 position을 새 limit으로 두고 position을 0으로 옮깁니다.

```text
flip 전: position=5, limit=8
flip 후: position=0, limit=5

[ A B C D E _ _ _ ]
  ^         ^
position   limit
```

데이터를 뒤집거나 복사하는 메서드가 아니라 **방금 쓴 범위를 읽을 수 있도록 상태 값을 바꾸는 연산**입니다.

### 모두 소비했다면 `clear()`, 일부가 남았다면 `compact()`

다 읽고 Buffer 전체를 다시 입력용으로 쓰려면 `clear()`를 사용할 수 있습니다.

```java
buffer.clear();
```

핵심 효과는 `position = 0`, `limit = capacity`로 되돌려 전체 범위를 다시 쓸 수 있게 하는 것입니다. 기존 byte를 0으로 지우는 동작은 아닙니다.

반면 아직 읽지 않은 데이터가 있고 다음 입력과 이어서 처리해야 한다면 `compact()`가 필요할 수 있습니다.

```text
읽고 남은 값: [ D E ]

compact 후
[ D E _ _ _ _ _ _ ]
      ^
   position
```

남은 값을 앞쪽으로 옮기고 그 뒤에 새 데이터를 쓸 공간을 만듭니다.

### 한 번의 Channel read/write가 전체를 처리한다고 가정하지 않는다

Channel I/O는 partial read/write가 가능합니다. `channel.write(buffer)` 한 번으로 모든 remaining byte가 반드시 기록되는 것은 아닙니다.

```java
while (buffer.hasRemaining()) {
    channel.write(buffer);
}
```

실제 반복 방식은 blocking/non-blocking mode와 protocol에 따라 달라질 수 있지만, 코드 추론에서는 **I/O 반환값과 Buffer의 현재 position/limit을 함께 추적**해야 합니다.

NIO Buffer 문제를 풀 때는 메서드 이름보다 각 단계의 `position`, `limit`, `capacity`를 직접 적어 보세요. `flip`은 쓰기 범위를 읽기 범위로 전환하고, `clear`는 전체를 다시 쓰기 준비 상태로 만들며, `compact`는 읽지 않은 데이터를 보존한다는 차이가 상태 값으로 자연스럽게 보입니다.
