---
kind: concept
contentKey: operating-systems.core.ipc.network-socket-ipc
topicContentKey: operating-systems.core.ipc
slug: network-socket-ipc
title: "Network Socket IPC"
summary: "network socket을 사용한 process 간 message 경계와 비용을 설명한다."
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

network socket IPC는 process가 kernel socket object를 통해 같은 host의 다른 process 또는 remote host의 endpoint와 bytes/datagram을 주고받는 방식이다. application은 `socket → bind/listen/accept 또는 connect → send/recv → close`라는 interface를 사용하지만, 실제 전달은 각 host의 socket buffer와 transport/network stack을 거친다. 따라서 socket API가 제공하는 경계와 peer application이 관찰하는 경계를 분리해서 생각해야 한다.

### 송신 성공부터 수신 처리까지는 여러 상태다

송신 process가 `write()` 또는 `send()`를 호출하면 우선 local kernel이 bytes를 socket send buffer에 받아들일 수 있다. 그 뒤 transport가 packet을 전송하고, receiver kernel이 이를 검증·재조립해 receive buffer에 넣으면 수신 process가 `read()`/`recv()`로 가져간다. stream transport라면 application이 읽은 조각의 경계를 message로 복원해야 하고, datagram transport라면 datagram 단위와 loss/truncation semantics를 확인해야 한다. 어떤 transport를 쓰는지에 따라 delivery/order 보장이 달라지지만, transport가 reliable하더라도 peer application이 business operation을 commit했다는 뜻은 아니다.

이 흐름에는 backpressure도 있다. receiver가 느리거나 network가 막히면 send buffer가 차고 sender의 blocking call이 기다리거나 non-blocking call이 partial result·retry 상태를 반환할 수 있다. connection close, reset, timeout은 서로 다른 failure 관찰일 수 있으므로 socket을 단순한 무한 byte pipe로 모델링하면 안 된다.

### Framing·serialization·재시도는 application 책임이다

두 process가 `userId`, `command`, `payload`를 교환하려면 bytes를 어떤 encoding으로 표현할지와 한 message의 시작·끝을 어떻게 알릴지 합의해야 한다. length prefix, delimiter, fixed-size record 또는 self-describing format을 선택할 수 있지만, stream socket 자체가 이 protocol을 자동으로 만들어 주지는 않는다.

또한 timeout 뒤 응답이 보이지 않는다고 해서 server가 요청을 처리하지 않았다고 단정할 수 없다. 요청이 server에 도착해 처리된 뒤 응답만 유실됐을 수도 있기 때문이다. retry를 설계한다면 request id, duplicate detection, idempotent operation 또는 결과 조회를 함께 정의해야 한다.

### Local IPC에서 remote service로 경계가 바뀐다

loopback을 포함한 network socket은 Unix-domain socket보다 host 경계를 확장하기 쉽지만 network failure, address reachability, TLS/authentication 같은 추가 책임이 생긴다. 반대로 Unix-domain socket은 같은 host라는 범위와 local permission/credential을 활용할 수 있다. socket API가 비슷하다는 이유로 두 방식의 failure boundary와 security boundary가 같다고 보지 않는다.

Backend service 호출에서도 `request bytes가 local send buffer에 accepted됨`, `peer가 response를 보냄`, `HTTP status를 받음`, `business transaction이 commit됨`을 별도 state로 둔다. request id와 application idempotency key가 있어야 transport timeout 뒤 재시도가 중복 effect를 만들지 않도록 제어할 수 있다.

