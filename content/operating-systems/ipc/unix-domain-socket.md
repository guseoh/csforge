---
kind: concept
contentKey: operating-systems.core.ipc.unix-domain-socket
topicContentKey: operating-systems.core.ipc
slug: unix-domain-socket
title: "Unix-Domain Socket"
summary: "host 내부 endpoint 통신과 network socket 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/unix.7.html"
    title: "unix(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "AF_UNIX endpoint namespace, stream/datagram semantics와 local peer information을 확인한다."
    displayOrder: 1
---
# Unix-Domain Socket

Unix-domain socket(AF_UNIX/AF_LOCAL)은 **같은 host의 process 사이를 socket interface로 연결하는 IPC**다. Application은 `socket`, `bind`, `listen`, `accept`, `connect`, `read/write` 같은 socket lifecycle을 사용할 수 있지만 IP routing을 통해 remote host와 통신하는 network socket과는 endpoint 범위가 다르다.

![같은 host의 client/server process를 연결하는 Unix-domain socket](/learning/operating-systems/unix-domain-socket.svg)

### Socket type에 따라 data boundary가 달라진다

`SOCK_STREAM`을 사용하면 connected byte stream을 제공하므로 application message boundary를 직접 framing해야 한다. Datagram이나 seqpacket 계열은 다른 boundary semantics를 제공할 수 있다. 따라서 `Unix-domain socket은 message 단위를 자동 보존한다`고 일반화하면 안 된다.

### Endpoint namespace도 lifecycle의 일부다

Pathname 기반 Unix-domain socket은 filesystem namespace의 path를 endpoint로 사용할 수 있다. Server가 종료된 뒤 pathname이 남아 있으면 다음 bind에 영향을 줄 수 있고, path permission도 접근 가능성에 영향을 준다. Linux의 abstract namespace처럼 별도 방식도 있지만 portable pathname semantics와는 다르다.

즉 local socket에서도 endpoint 생성·사용·close·cleanup이 명확한 lifecycle을 가져야 한다.

### Network socket과의 경계

Unix-domain socket은 host 내부 communication이므로 IP routing과 remote host failure를 다루지 않는다. 대신 local namespace와 peer credential 같은 host-local 기능을 활용할 수 있다. 다른 host로 통신 범위를 넓혀야 한다면 network socket 같은 다른 transport가 필요하다.

Unix-domain socket의 핵심은 **같은 host의 process를 socket semantics로 연결하며, stream/datagram boundary와 local endpoint lifecycle을 함께 관리한다는 것**이다.
