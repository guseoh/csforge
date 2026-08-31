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

network socket IPC는 local process 경계를 넘어 host·network를 통해 byte stream이나 datagram을 전달한다. transport의 delivery·ordering 보장과 application framing·serialization을 각각 계약으로 둬야 한다.

socket은 connection, buffer, timeout, half-close와 peer failure 상태를 가진다. write 성공은 peer application이 message를 처리했다는 뜻이 아니며, retry가 duplicate를 만들 수 있다.

### Backend 연결

backend service 호출은 HTTP status와 application result, transport close를 구분한다. request id와 idempotency key로 timeout 뒤 재시도를 안전하게 만든다.

