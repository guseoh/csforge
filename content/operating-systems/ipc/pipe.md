---
kind: concept
contentKey: operating-systems.core.ipc.pipe
topicContentKey: operating-systems.core.ipc
slug: pipe
title: "파이프(파이프)"
summary: "커널 버퍼를 통한 단방향 바이트 스트림과 EOF 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "파이프(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Pipe capacity가 제한되어 있고 full pipe에 대한 blocking write가 reader가 공간을 만들 때까지 멈출 수 있음을 확인한다."
    displayOrder: 1
---
# 파이프(파이프)

파이프는 커널이 관리하는 버퍼를 사이에 두고 한 프로세스가 쓴 바이트를 다른 프로세스가 읽게 하는 IPC다. Anonymous 파이프는 보통 read end와 write end라는 두 디스크립터를 만들고, `fork()` 이후 필요한 디스크립터를 부모와 자식가 나누어 사용하는 형태로 이해할 수 있다.

![파이프의 producer-consumer 버퍼와 EOF 수명](/learning/operating-systems/파이프-버퍼-eof.svg)

### 파이프는 바이트 스트림이다

Writer가 `ABC`와 `DEF`를 각각 썼다고 reader가 반드시 두 번의 read에서 같은 경계로 받는 것은 아니다. Reader는 `ABCDEF`를 한 번에 읽거나 일부만 읽을 수 있다. 따라서 record나 메시지 경계가 필요하면 애플리케이션이 별도 프레이밍을 정의해야 한다.

### 버퍼는 용량를 가진다

Reader보다 writer가 빠르면 커널 파이프 버퍼가 찰 수 있다. 블로킹 write는 공간이 생길 때까지 기다릴 수 있고, 논블로킹 mode에서는 지금 쓸 수 없다는 결과를 받을 수 있다. 즉 파이프는 단순한 바이트 conduit이면서 producer와 consumer 속도를 연결하는 bounded 버퍼다.

### EOF는 디스크립터 수명과 연결된다

Reader가 EOF를 보려면 해당 파이프의 모든 write-end 참조가 닫혀야 한다. 실제 writer가 종료했더라도 다른 프로세스가 write 디스크립터를 계속 보유하면 reader는 EOF를 받지 못할 수 있다.

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

파이프의 핵심은 **커널 버퍼를 통한 local 바이트 스트림, bounded 용량, 디스크립터 수명에 따른 EOF**다. 양방향 통신이나 메시지 경계가 필요하면 다른 IPC primitive가 더 자연스러울 수 있다.
