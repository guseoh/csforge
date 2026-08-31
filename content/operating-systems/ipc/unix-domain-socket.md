---
kind: concept
contentKey: operating-systems.core.ipc.unix-domain-socket
topicContentKey: operating-systems.core.ipc
slug: unix-domain-socket
title: "Unix-Domain Socket"
summary: "같은 host의 process를 socket interface로 연결하는 IPC를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/unix.7.html"
    title: "unix(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process IPC와 socket lifecycle을 확인한다."
    displayOrder: 1
---
# Unix-Domain Socket

Unix-domain socket은 network protocol과 비슷한 stream 또는 datagram interface로 같은 host process를 연결한다. IP routing 비용 없이 kernel을 거치며 filesystem pathname이나 abstract namespace로 endpoint를 식별할 수 있다.

stream은 message boundary가 없고 connection·permission·peer credential을 별도 처리한다. socket file을 stale 상태로 남기거나 server restart 중 client가 재연결하지 못하는 lifecycle 문제가 생길 수 있다.

### Backend 연결

local sidecar나 database socket client를 사용할 때 TCP와 다른 address·permission·container namespace를 확인한다. endpoint가 사라진 경우 retry와 fatal configuration error를 구분한다.

