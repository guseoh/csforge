---
kind: concept
contentKey: java.core.io-nio.nio-channel-buffer
topicContentKey: java.core.io-nio
slug: nio-channel-buffer
title: "NIO Channel and Buffer"
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
# NIO Channel and Buffer

NIO 코드를 처음 보면 `flip()`, `clear()`가 왜 필요한지 가장 헷갈립니다. 이유는 하나의 `Buffer`가 **데이터를 채울 때와 이미 채운 데이터를 읽을 때 서로 다른 범위를 사용하기 때문**입니다.

Channel은 데이터가 오가는 통로이고 Buffer는 그 데이터를 애플리케이션이 읽고 쓰는 임시 저장 영역입니다.

### Buffer에는 세 가지 핵심 위치 값이 있다

`capacity`, `limit`, `position`을 먼저 잡으면 대부분의 동작을 설명할 수 있습니다.

- `capacity`: Buffer가 담을 수 있는 전체 공간의 크기
- `limit`: 현재 읽거나 쓸 수 있는 범위의 끝
- `position`: 다음에 읽거나 쓸 위치

8칸짜리 ByteBuffer를 새로 만들면 개념적으로 다음 상태에서 시작합니다.

```text
capacity = 8
limit    = 8
position = 0

[ _ _ _ _ _ _ _ _ ]
  ^               ^
 position       limit
```

### Channel에서 읽어 Buffer에 채우면 position이 이동한다

```java
ByteBuffer buffer = ByteBuffer.allocate(8);
int count = channel.read(buffer);
```

예를 들어 5 byte를 읽었다면 Buffer의 앞 5칸에 값이 들어가고 `position`은 5로 이동합니다.

```text
[ A B C D E _ _ _ ]
            ^     ^
         position limit=8
```

이 상태에서 바로 `buffer.get()`을 호출하면 position 5부터 읽으려 하기 때문에 우리가 방금 채운 A부터 읽는 흐름이 아닙니다.

### `flip()`은 방금 쓴 범위를 읽을 준비로 바꾼다

```java
buffer.flip();
```

`flip()`의 핵심 효과는 기존 position을 새로운 limit으로 삼고 position을 0으로 돌리는 것입니다.

```text
flip 전
position=5, limit=8

flip 후
position=0, limit=5

[ A B C D E _ _ _ ]
  ^         ^
position   limit
```

이제 `get()`을 호출하면 A부터 E까지 읽을 수 있습니다.

### 다 읽은 뒤 `clear()`는 다시 쓰기 가능한 범위를 만든다

```java
while (buffer.hasRemaining()) {
    consume(buffer.get());
}

buffer.clear();
```

`clear()`는 이름 때문에 데이터 byte를 0으로 지우는 동작처럼 보이지만 핵심은 **position과 limit을 다시 쓰기 준비 상태로 바꾸는 것**입니다.

```text
position = 0
limit    = capacity
```

기존 byte가 메모리에 남아 있을 수 있어도 다음 write/read-from-channel가 그 영역을 덮어쓸 수 있는 상태가 됩니다.

### 일부를 아직 소비하지 못했다면 compact가 필요할 수 있다

네트워크 protocol처럼 한 번에 완전한 메시지가 들어오지 않을 수 있습니다. Buffer의 일부를 읽었지만 마지막 몇 byte는 다음 입력과 함께 처리해야 할 수도 있습니다.

`compact()`는 아직 읽지 않은 데이터를 앞쪽으로 옮기고 그 뒤에 새 데이터를 받을 수 있는 상태로 만듭니다.

```text
읽고 남은 데이터: [ D E ]

compact
[ D E _ _ _ _ _ _ ]
      ^
   position
```

`clear()`를 해 버리면 남은 데이터 보존 의미가 사라질 수 있으므로 둘의 목적을 구분해야 합니다.

### 한 번의 read/write가 전체를 처리한다는 보장은 없다

Channel I/O도 partial read/write가 가능합니다. `channel.write(buffer)`를 한 번 호출했다고 `buffer.remaining()`이 무조건 0이 된다고 가정하면 안 됩니다.

```java
while (buffer.hasRemaining()) {
    channel.write(buffer);
}
```

실제 코드는 blocking/non-blocking mode와 protocol 요구에 따라 다르지만 문제 풀이에서는 **반환값과 Buffer 상태를 따라가는 습관**이 중요합니다.

### 문제를 풀 때 Buffer 상태를 직접 적는다

복잡하게 머릿속으로만 계산하기보다 각 단계마다 세 값을 적으면 실수가 줄어듭니다.

| 동작 | position | limit | 의미 |
|---|---:|---:|---|
| allocate(8) | 0 | 8 | 쓰기 준비 |
| 5 byte 입력 | 5 | 8 | 앞 5칸 채움 |
| flip() | 0 | 5 | 채운 5칸 읽기 준비 |
| 5칸 소비 | 5 | 5 | 읽을 값 없음 |
| clear() | 0 | 8 | 다시 쓰기 준비 |

### 자주 헷갈리는 부분

- `clear()`는 실제 byte를 0으로 지우는 메서드가 아닙니다.
- `flip()`은 데이터를 복사하는 작업이 아니라 Buffer의 범위를 바꿉니다.
- `position`은 OS file offset과 같은 개념이 아닙니다.
- 한 번의 Channel read/write가 항상 요청한 전체 데이터를 처리하지는 않습니다.

### 면접에서 설명한다면

NIO에서 Channel은 I/O 통로이고 Buffer는 데이터가 담기는 영역입니다. Buffer는 `position`, `limit`, `capacity`로 현재 읽기·쓰기 범위를 관리합니다. Channel에서 데이터를 채운 뒤 `flip()`으로 읽기 범위를 만들고, 모두 소비한 뒤 `clear()`로 다시 쓰기 준비를 합니다. 일부 데이터가 남아 다음 입력과 이어야 한다면 `compact()`를 사용할 수 있습니다.
