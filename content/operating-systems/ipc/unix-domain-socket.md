---
kind: concept
contentKey: operating-systems.core.ipc.unix-domain-socket
topicContentKey: operating-systems.core.ipc
slug: unix-domain-socket
title: "Unix-Domain Socket"
summary: "같은 host의 process를 socket semantics로 연결하면서 local namespace·credential·stream/datagram 경계를 설명한다."
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

Unix-domain socket(AF_UNIX/AF_LOCAL)은 **같은 host 안의 process**가 socket interface로 통신하게 하는 IPC다. application은 `socket`, `bind`, `listen`, `accept`, `connect`, `read/write` 같은 familiar한 socket lifecycle을 사용할 수 있지만 IP routing을 통해 remote host로 전달하는 network socket과는 endpoint 범위가 다르다.

### Stream과 datagram을 구분한다

Unix-domain stream socket은 TCP와 비슷하게 connected byte stream interface를 제공하므로 application message boundary를 직접 framing해야 한다. datagram/seqpacket 계열은 API가 제공하는 message boundary semantics가 다를 수 있으므로 socket type을 명시해야 한다.

`Unix socket이므로 message 하나가 write 하나와 동일하게 보존된다`고 일반화하면 안 된다. `SOCK_STREAM`이면 partial read/write를 그대로 고려해야 한다.

### Endpoint namespace가 local lifecycle을 만든다

pathname 기반 Unix socket은 filesystem namespace의 path를 endpoint로 사용할 수 있다. server crash 뒤 socket pathname이 남아 새 bind가 실패하거나, permission 때문에 client가 connect하지 못할 수 있다. Linux에는 abstract namespace 같은 별도 방식도 있지만 이는 portable POSIX pathname semantics와 동일하지 않다.

따라서 server startup/shutdown에서 `endpoint 생성 → listen → client connect → close → stale pathname cleanup` lifecycle을 명시한다.

### Local peer 정보를 활용할 수 있다

일부 OS API에서는 Unix-domain peer의 process credential 같은 local identity 정보를 확인할 수 있다. 이는 network socket의 remote address와 다른 특성이다. 다만 credential을 이용한 구체적인 authorization 정책은 Security 영역에서 다루고, 여기서는 kernel이 local IPC endpoint/peer 정보를 제공할 수 있다는 mechanics만 이해한다.

### Network socket과 비교하면

Unix-domain socket은 host 경계를 넘을 필요가 없는 communication에서 network routing/transport header 처리 일부를 피할 수 있고 local namespace를 활용한다. 반대로 다른 host로 확장할 수 없으므로 deployment boundary가 바뀌면 transport choice도 바뀐다.

Backend에서 같은 machine의 helper daemon, local proxy, database client가 Unix socket을 지원한다면 TCP loopback과 latency/permission/operations trade-off를 비교할 수 있다. 단순히 local이라는 이유로 항상 더 빠르다고 가정하지 않고 실제 workload를 측정한다.
