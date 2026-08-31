---
kind: concept
contentKey: java.core.io-nio.buffered-io
topicContentKey: java.core.io-nio
slug: buffered-io
title: "Buffered I/O"
summary: "작은 I/O 요청을 buffer에 모으는 이유와 flush·close가 각각 무엇을 의미하는지 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedInputStream.html"
    title: "Java SE 25 API: BufferedInputStream"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: byte input buffering 동작과 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedWriter.html"
    title: "Java SE 25 API: BufferedWriter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: character output buffer·flush·close 계약 확인
---
# Buffered I/O

파일에 문자 한 개를 쓸 때마다 실제 하위 I/O 작업을 수행한다고 생각해 보겠습니다. 작은 작업이 매우 많이 반복되면 애플리케이션과 하위 I/O 계층 사이의 호출 횟수가 커집니다. **Buffering은 작은 읽기·쓰기를 메모리의 임시 공간에 모아 더 큰 단위로 처리하기 위한 방법**입니다.

### buffer는 애플리케이션과 실제 I/O 사이에 놓인다

```text
application
   │ write("A")
   │ write("B")
   │ write("C")
   ▼
buffer
   │ 여러 값을 모음
   ▼
underlying I/O
```

출력 buffer는 작은 write 요청을 잠시 모았다가 buffer가 차거나 flush/close 같은 시점에 다음 계층으로 전달할 수 있습니다. 입력 buffer는 하위 계층에서 비교적 큰 단위로 읽어 둔 뒤 애플리케이션의 작은 read 요청에 그 데이터를 제공합니다.

### BufferedWriter를 사용하면 작은 write 호출을 모을 수 있다

```java
try (BufferedWriter writer = Files.newBufferedWriter(
        path,
        StandardCharsets.UTF_8
)) {
    writer.write("first");
    writer.newLine();
    writer.write("second");
}
```

`writer.write()`를 호출했다고 그 순간 물리 디스크에 데이터가 영구적으로 기록됐다고 단정하면 안 됩니다. Java의 buffer, OS buffer/cache, storage 장치 등 여러 계층이 있을 수 있기 때문입니다.

이 Concept에서 보장해야 할 핵심은 **BufferedWriter가 자신의 buffer를 가지고 있다는 API 동작**이며, 실제 하드웨어 persistence까지 같은 의미로 확장하지 않는 것입니다.

### flush는 buffer의 데이터를 다음 계층으로 보낸다

```java
writer.write("progress");
writer.flush();
```

`flush()`는 현재 writer에 남아 있는 출력 데이터를 다음 계층으로 밀어내는 의미입니다. 네트워크 응답이나 대화형 출력처럼 상대방이 중간 결과를 지금 봐야 할 때 필요할 수 있습니다.

하지만 flush를 자주 호출하면 buffering으로 모으려던 장점이 줄어들 수 있습니다. 모든 줄마다 습관적으로 flush하는 것보다 **중간 결과를 반드시 관찰해야 하는 시점인지**를 판단해야 합니다.

### flush와 close는 같은 동작이 아니다

`close()`는 자원의 사용을 끝내는 lifecycle 동작입니다. Buffered output은 close 과정에서 남은 데이터를 처리한 뒤 underlying resource를 닫는 계약을 가질 수 있습니다.

반면 `flush()`만 호출했다고 stream을 더 이상 사용할 수 없는 것은 아닙니다.

```text
flush
- 현재 buffered output 전달
- stream은 계속 사용할 수 있음

close
- 남은 output 처리
- resource lifecycle 종료
```

try-with-resources를 사용하면 정상 경로뿐 아니라 예외 경로에서도 close를 시도하도록 구조를 만들 수 있습니다.

### buffer 크기를 무조건 키우면 빠른 것은 아니다

Buffering이 I/O 호출 수를 줄일 수 있다고 해서 buffer를 크게 만들수록 성능이 선형으로 좋아지는 것은 아닙니다. 데이터 크기, 접근 패턴, 하위 I/O, 메모리 사용량 등 여러 요소가 영향을 줍니다.

실무에서 성능 문제가 있다면 "buffer가 있으니 빠르다" 또는 "buffer를 두 배로 늘리자"가 아니라 실제 처리량과 I/O 호출 패턴을 측정해야 합니다.

### 코딩테스트와 백엔드에서의 연결

코딩테스트에서 `BufferedReader`, `BufferedWriter`를 자주 사용하는 이유도 작은 콘솔 I/O 호출을 줄이고 text를 효율적으로 처리하려는 목적과 연결됩니다.

백엔드에서는 파일 업로드·다운로드, CSV export처럼 큰 데이터를 다룰 때 전체 파일을 `String` 하나로 먼저 만들지 않고 stream/buffer 경계를 유지하는 것이 메모리 사용에도 중요할 수 있습니다.

### 문제를 풀 때 확인할 것

1. buffer가 input 쪽인지 output 쪽인지 확인합니다.
2. 실제 하위 I/O와 애플리케이션 호출 사이에 어떤 데이터가 모이는지 봅니다.
3. `flush()` 시점과 `close()` 시점을 구분합니다.
4. 중간 결과를 즉시 보여 줘야 하는 요구가 있는지 확인합니다.
5. buffer를 사용한다고 물리 storage persistence까지 보장된다고 가정하지 않습니다.

### 면접에서 설명한다면

Buffered I/O는 작은 읽기·쓰기 요청을 메모리 buffer에 모아 하위 I/O 호출을 줄이는 데 도움을 줍니다. `flush()`는 현재 buffer의 데이터를 다음 계층으로 전달하지만 자원을 닫는 동작은 아니며, `close()`는 resource lifecycle을 종료합니다. Buffering 효과와 실제 디스크 영구 저장이나 OS 동작은 서로 다른 층위로 구분해야 합니다.
