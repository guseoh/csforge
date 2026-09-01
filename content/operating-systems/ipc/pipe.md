---
kind: concept
contentKey: operating-systems.core.ipc.pipe
topicContentKey: operating-systems.core.ipc
slug: pipe
title: "Pipe"
summary: "kernel-buffered byte stream과 descriptor lifetime이 process 간 producer-consumer protocol을 만드는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "pipe의 byte-stream semantics, capacity, EOF와 blocking/non-blocking 동작을 확인한다."
    displayOrder: 1
---
# Pipe

pipe는 kernel이 관리하는 buffer를 사이에 두고 한 execution context가 쓴 bytes를 다른 context가 읽게 하는 IPC다. Unix anonymous pipe는 보통 `pipe()`가 read end와 write end 두 descriptor를 만들고, parent가 `fork()`한 뒤 필요한 end를 parent/child가 나눠 가지는 식으로 자주 사용한다.

### Pipe는 message queue가 아니라 byte stream이다

writer가 `"ABC"`를 한 번 쓰고 이어 `"DEF"`를 썼다고 reader가 반드시 두 번의 read에서 같은 경계로 `ABC`, `DEF`를 받는 것은 아니다. reader는 `ABCDEF`를 한 번에 읽거나 일부만 읽을 수 있다. application protocol이 record/message boundary를 필요로 한다면 length prefix, delimiter 같은 framing을 별도로 정의해야 한다.

### Buffer capacity가 backpressure를 만든다

reader가 느리면 kernel pipe buffer가 채워질 수 있다. blocking write는 공간이 생길 때까지 writer를 기다리게 할 수 있고 non-blocking mode에서는 현재 쓸 수 없음을 나타내는 오류를 받을 수 있다. 따라서 pipe는 단순한 data conduit이면서 producer와 consumer 속도를 연결하는 bounded buffer이기도 하다.

### EOF는 descriptor lifetime과 연결된다

reader가 EOF를 관찰하려면 해당 pipe의 **모든 write-end reference가 닫혀야 한다.** parent가 child용 write fd를 실수로 계속 들고 있거나 다른 subprocess가 descriptor를 상속받으면 실제 writer가 종료했어도 reader가 EOF를 기다리며 멈출 수 있다.

이 때문에 `fork → 불필요한 read/write end close → producer/consumer 실행 → 마지막 writer close → reader EOF`가 protocol lifecycle의 일부다.

### 양방향 통신과 pipe

anonymous pipe 하나는 한 방향 byte stream으로 생각하는 편이 안전하다. 양방향 communication이 필요하면 pipe 두 개를 쓰거나 socketpair/Unix-domain socket 같은 다른 primitive를 선택할 수 있다. 어떤 IPC가 적합한지는 message boundary, bidirectional need, process relation과 failure handling에 따라 달라진다.

Backend가 external parser subprocess를 실행한다면 stdout만 읽고 stderr를 방치해 child가 stderr pipe capacity에서 block되는 상황도 고려한다. 두 stream drain, timeout, process termination, EOF/reap 순서를 하나의 subprocess lifecycle로 설계한다.
