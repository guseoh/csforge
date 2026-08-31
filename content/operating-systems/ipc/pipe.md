---
kind: concept
contentKey: operating-systems.core.ipc.pipe
topicContentKey: operating-systems.core.ipc
slug: pipe
title: "Pipe"
summary: "kernel buffer를 이용한 단방향 process 간 byte stream을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPC 방식의 ownership과 backpressure를 비교한다."
    displayOrder: 1
---
# Pipe

pipe는 한 process가 쓴 byte stream을 다른 process가 읽는 kernel-buffered IPC다. 기본적으로 단방향이고 message boundary를 보존하지 않으므로 reader는 framing을 별도로 정의해야 한다.

buffer가 가득 차면 writer가 block하거나 non-blocking error를 받고, reader가 모든 write end를 닫아야 EOF를 관찰할 수 있다. descriptor 상속과 close 순서가 protocol의 일부다.

### Backend 연결

외부 parser subprocess의 stdout pipe를 읽을 때 stderr pipe까지 drain하지 않으면 child가 block할 수 있다. stream framing과 종료·timeout·backpressure를 함께 구현한다.
