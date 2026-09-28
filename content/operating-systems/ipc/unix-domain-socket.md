---
kind: concept
contentKey: operating-systems.core.ipc.unix-domain-socket
topicContentKey: operating-systems.core.ipc
slug: unix-domain-socket
title: "유닉스 도메인 소켓(Unix-Domain Socket)"
summary: "호스트 내부 엔드포인트 통신과 네트워크 소켓 차이를 설명한다."
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
# 유닉스 도메인 소켓(Unix-Domain Socket)

Unix-domain socket(AF_UNIX/AF_LOCAL)은 **같은 호스트의 프로세스 사이를 socket interface로 연결하는 IPC**다. 애플리케이션은 `socket`, `bind`, `listen`, `accept`, `connect`, `read/write` 같은 socket 생명주기을 사용할 수 있지만 IP routing을 통해 remote 호스트와 통신하는 네트워크 socket과는 엔드포인트 범위가 다르다.

![같은 호스트의 client/서버 프로세스를 연결하는 Unix-domain socket](/learning/operating-systems/unix-domain-socket.svg)

### Socket type에 따라 data 경계가 달라진다

`SOCK_STREAM`을 사용하면 connected 바이트 스트림을 제공하므로 애플리케이션 메시지 경계를 직접 프레이밍해야 한다. Datagram이나 seqpacket 계열은 다른 경계 의미를 제공할 수 있다. 따라서 `Unix-domain socket은 message 단위를 자동 보존한다`고 일반화하면 안 된다.

### 엔드포인트 네임스페이스도 생명주기의 일부다

경로명 기반 Unix-domain socket은 파일 시스템 네임스페이스의 경로를 엔드포인트로 사용할 수 있다. 서버가 종료된 뒤 경로명이 남아 있으면 다음 bind에 영향을 줄 수 있고, 경로 권한도 접근 가능성에 영향을 준다. Linux의 abstract 네임스페이스처럼 별도 방식도 있지만 portable 경로명 의미와는 다르다.

즉 local socket에서도 엔드포인트 생성·사용·close·cleanup이 명확한 생명주기을 가져야 한다.

### 네트워크 socket과의 경계

Unix-domain socket은 호스트 내부 communication이므로 IP routing과 remote 호스트 실패를 다루지 않는다. 대신 local 네임스페이스와 peer credential 같은 호스트 내부 기능을 활용할 수 있다. 다른 호스트로 통신 범위를 넓혀야 한다면 네트워크 소켓 같은 다른 transport가 필요하다.

Unix-domain socket의 핵심은 **같은 호스트의 프로세스를 socket 의미로 연결하며, 스트림/datagram 경계와 local 엔드포인트 생명주기을 함께 관리한다는 것**이다.
