---
kind: concept
contentKey: operating-systems.core.ipc.network-socket-ipc
topicContentKey: operating-systems.core.ipc
slug: network-socket-ipc
title: "네트워크 소켓 IPC(네트워크 소켓 IPC)"
summary: "프로세스 경계를 넘는 socket과 직렬화·실패 책임을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/socket.7.html"
    title: "socket(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process IPC와 socket lifecycle을 확인한다."
    displayOrder: 1
---
# 네트워크 소켓 IPC(네트워크 소켓 IPC)

네트워크 socket은 프로세스가 커널 socket 객체를 통해 같은 호스트의 다른 프로세스나 remote 호스트의 엔드포인트와 data를 주고받는 IPC다. 애플리케이션은 socket API를 사용하지만 실제 바이트는 local socket 버퍼와 transport/네트워크 스택을 거쳐 peer에 전달된다.

### Socket write와 peer 처리 완료는 다르다

Sender의 `write()`나 `send()`가 성공했다는 것은 local 커널이 일부 또는 전체 바이트를 받아들였다는 의미일 수 있다. 그 뒤 실제 전송, receiver 커널의 수신 버퍼 적재, receiver 프로세스의 `read()`가 이어진다. 따라서 sender syscall 성공을 peer 애플리케이션의 처리 완료로 해석하면 안 된다.

스트림 socket에서는 애플리케이션 메시지 경계가 보존되지 않으므로 receiver가 프레이밍을 직접 정의해야 한다. Datagram socket은 메시지 경계를 보존하지만 loss, truncation과 최대 크기 같은 별도 의미를 가진다.

### 네트워크 경계는 추가 실패 상태를 만든다

Remote 호스트와 통신하면 연결 reset, 타임아웃, packet loss, route 실패처럼 local IPC에는 없던 실패가 생긴다. Sender와 receiver의 진행 상태를 항상 동시에 알 수 있는 것도 아니다. 따라서 네트워크 socket은 단순한 "멀리 있는 파이프"가 아니라 별도의 실패 경계를 가진다.

### 직렬화도 애플리케이션 책임이다

프로세스가 서로 다른 address space를 사용하므로 메모리 객체 자체를 pointer로 전달할 수 없다. Data를 바이트 representation으로 serialize하고 peer가 같은 프로토콜로 해석해야 한다. 스트림이라면 프레이밍까지 함께 정의해야 한다.

네트워크 소켓 IPC의 핵심은 **호스트 경계를 넘어 확장할 수 있는 대신 직렬화, 프레이밍과 네트워크 실패를 명시적으로 다뤄야 한다는 것**이다.

### 흐름으로 보기

```text
sender application
        │ send()가 bytes를 local kernel에 전달
        ▼
sender socket buffer → transport/network → peer socket buffer
                                              │
                                              ▼
                                  receiver가 read() 후 framing·처리
```

`send()` 성공은 peer 애플리케이션이 바이트를 읽거나 처리했다는 확인이 아니다.
