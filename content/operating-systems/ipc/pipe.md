---
kind: concept
contentKey: operating-systems.core.ipc.pipe
topicContentKey: operating-systems.core.ipc
slug: pipe
title: "Pipe"
summary: "kernel buffer를 통한 단방향 byte stream과 EOF 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Pipe capacity가 제한되어 있고 full pipe에 대한 blocking write가 reader가 공간을 만들 때까지 멈출 수 있음을 확인한다."
    displayOrder: 1
---
# Pipe

Pipe는 kernel이 관리하는 buffer를 사이에 두고 한 process가 쓴 bytes를 다른 process가 읽게 하는 IPC다. Anonymous pipe는 보통 read end와 write end라는 두 descriptor를 만들고, `fork()` 이후 필요한 descriptor를 parent와 child가 나누어 사용하는 형태로 이해할 수 있다.

![pipe의 producer-consumer buffer와 EOF lifetime](/learning/operating-systems/pipe-buffer-eof.svg)

### Pipe는 byte stream이다

Writer가 `ABC`와 `DEF`를 각각 썼다고 reader가 반드시 두 번의 read에서 같은 경계로 받는 것은 아니다. Reader는 `ABCDEF`를 한 번에 읽거나 일부만 읽을 수 있다. 따라서 record나 message boundary가 필요하면 application이 별도 framing을 정의해야 한다.

### Buffer는 capacity를 가진다

Reader보다 writer가 빠르면 kernel pipe buffer가 찰 수 있다. Blocking write는 공간이 생길 때까지 기다릴 수 있고, non-blocking mode에서는 지금 쓸 수 없다는 결과를 받을 수 있다. 즉 pipe는 단순한 byte conduit이면서 producer와 consumer 속도를 연결하는 bounded buffer다.

### EOF는 descriptor lifetime과 연결된다

Reader가 EOF를 보려면 해당 pipe의 모든 write-end reference가 닫혀야 한다. 실제 writer가 종료했더라도 다른 process가 write descriptor를 계속 보유하면 reader는 EOF를 받지 못할 수 있다.

```text
pipe 생성
  ↓
read/write end 분배
  ↓
불필요한 descriptor close
  ↓
writer 종료 + 모든 write end close
  ↓
reader EOF
```

Pipe의 핵심은 **kernel buffer를 통한 local byte stream, bounded capacity, descriptor lifetime에 따른 EOF**다. 양방향 통신이나 message boundary가 필요하면 다른 IPC primitive가 더 자연스러울 수 있다.
