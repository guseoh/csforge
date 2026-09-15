---
kind: concept
contentKey: operating-systems.core.ipc.network-socket-ipc
topicContentKey: operating-systems.core.ipc
slug: network-socket-ipc
title: "Network Socket IPC"
summary: "process 경계를 넘는 socket과 serialization·failure 책임을 설명한다."
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
# Network Socket IPC

Network socket은 process가 kernel socket object를 통해 같은 host의 다른 process나 remote host의 endpoint와 data를 주고받는 IPC다. Application은 socket API를 사용하지만 실제 bytes는 local socket buffer와 transport/network stack을 거쳐 peer에 전달된다.

### Socket write와 peer 처리 완료는 다르다

Sender의 `write()`나 `send()`가 성공했다는 것은 local kernel이 일부 또는 전체 bytes를 받아들였다는 의미일 수 있다. 그 뒤 실제 전송, receiver kernel의 수신 buffer 적재, receiver process의 `read()`가 이어진다. 따라서 sender syscall 성공을 peer application의 처리 완료로 해석하면 안 된다.

Stream socket에서는 application message boundary가 보존되지 않으므로 receiver가 framing을 직접 정의해야 한다. Datagram socket은 message boundary를 보존하지만 loss, truncation과 최대 크기 같은 별도 semantics를 가진다.

### Network boundary는 추가 실패 상태를 만든다

Remote host와 통신하면 connection reset, timeout, packet loss, route failure처럼 local IPC에는 없던 실패가 생긴다. Sender와 receiver의 진행 상태를 항상 동시에 알 수 있는 것도 아니다. 따라서 network socket은 단순한 "멀리 있는 pipe"가 아니라 별도의 failure boundary를 가진다.

### Serialization도 application 책임이다

Process가 서로 다른 address space를 사용하므로 memory object 자체를 pointer로 전달할 수 없다. Data를 byte representation으로 serialize하고 peer가 같은 protocol로 해석해야 한다. Stream이라면 framing까지 함께 정의해야 한다.

Network socket IPC의 핵심은 **host 경계를 넘어 확장할 수 있는 대신 serialization, framing과 network failure를 명시적으로 다뤄야 한다는 것**이다.
