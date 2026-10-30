---
kind: concept
contentKey: operating-systems.core.ipc.pipe
topicContentKey: operating-systems.core.ipc
slug: pipe
title: "파이프(Pipe)"
summary: "커널 버퍼를 통한 단방향 바이트 스트림과 EOF가 결정되는 조건을 설명한다."
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
# 파이프(Pipe)

파이프는 커널이 관리하는 버퍼를 사이에 두고 한 프로세스가 쓴 바이트를 다른 프로세스가 읽게 하는 IPC다. 익명 파이프(anonymous pipe)는 보통 읽기 끝(read end)과 쓰기 끝(write end)이라는 두 파일 디스크립터를 만들고, `fork()` 이후 부모와 자식이 필요한 끝만 나누어 사용하는 형태로 이해할 수 있다.

![파이프의 생산자-소비자 버퍼와 EOF 생명주기](/learning/operating-systems/pipe-buffer-eof.svg)

### 파이프는 바이트 스트림이다

쓰는 쪽이 `ABC`와 `DEF`를 각각 썼다고 읽는 쪽이 반드시 두 번의 `read()`에서 같은 경계로 받는 것은 아니다. `ABCDEF`를 한 번에 읽거나 일부만 읽을 수도 있다. 따라서 레코드나 메시지 경계가 필요하다면 애플리케이션이 별도의 프레이밍(framing)을 정의해야 한다.

### 버퍼 용량은 유한하다

읽는 쪽보다 쓰는 쪽이 빠르면 커널의 파이프 버퍼가 가득 찰 수 있다. 블로킹 쓰기는 공간이 생길 때까지 기다릴 수 있고, 논블로킹 모드에서는 지금 쓸 수 없다는 결과를 받을 수 있다. 즉 파이프는 단순한 바이트 전달 통로이면서 **생산자와 소비자의 속도를 연결하는 유한 버퍼**다.

### EOF는 파일 디스크립터의 생명주기와 연결된다

읽는 쪽이 EOF를 보려면 해당 파이프의 모든 쓰기 끝 참조가 닫혀야 한다. 실제 데이터를 쓰던 프로세스가 종료했더라도 다른 프로세스가 복제되거나 상속된 쓰기 끝 파일 디스크립터를 계속 보유하면 EOF가 전달되지 않을 수 있다.

```text
파이프 생성
  ↓
읽기/쓰기 끝 분배
  ↓
불필요한 파일 디스크립터 닫기
  ↓
쓰기 주체 종료 + 모든 쓰기 끝 닫힘
  ↓
읽는 쪽이 EOF 관찰
```

파이프의 핵심은 **커널 버퍼를 통한 로컬 바이트 스트림, 유한한 용량, 파일 디스크립터 생명주기에 따른 EOF**다. 양방향 통신이나 메시지 경계 보존이 필요하다면 다른 IPC 방식이 더 자연스러울 수 있다.
