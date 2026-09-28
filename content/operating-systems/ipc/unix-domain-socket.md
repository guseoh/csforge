---
kind: concept
contentKey: operating-systems.core.ipc.unix-domain-socket
topicContentKey: operating-systems.core.ipc
slug: unix-domain-socket
title: "유닉스 도메인 소켓(Unix-Domain Socket)"
summary: "같은 호스트의 프로세스를 연결하는 소켓 IPC와 네트워크 소켓의 차이를 설명한다."
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

유닉스 도메인 소켓(`AF_UNIX`/`AF_LOCAL`)은 **같은 호스트의 프로세스 사이를 소켓 인터페이스로 연결하는 IPC**다. 애플리케이션은 `socket`, `bind`, `listen`, `accept`, `connect`, `read`/`write` 같은 소켓 생명주기를 사용할 수 있지만, IP 라우팅을 통해 원격 호스트와 통신하는 네트워크 소켓과는 통신 범위가 다르다.

![같은 호스트의 클라이언트/서버 프로세스를 연결하는 Unix-domain socket](/learning/operating-systems/unix-domain-socket.svg)

### 소켓 종류에 따라 데이터 경계가 달라진다

`SOCK_STREAM`을 사용하면 연결된 바이트 스트림을 제공하므로 애플리케이션이 메시지 경계를 직접 프레이밍해야 한다. 데이터그램이나 `SOCK_SEQPACKET` 계열은 다른 경계 계약을 제공할 수 있다. 따라서 **유닉스 도메인 소켓은 항상 메시지 단위를 자동 보존한다**고 일반화하면 안 된다.

### 엔드포인트 이름 공간도 생명주기의 일부다

경로명 기반 유닉스 도메인 소켓은 파일 시스템 이름 공간의 경로를 엔드포인트로 사용할 수 있다. 서버가 종료된 뒤 경로가 남아 있으면 다음 `bind()`에 영향을 줄 수 있고, 경로 권한도 접근 가능성에 영향을 준다. Linux의 추상 이름 공간(abstract namespace)처럼 별도 방식도 있지만 이식 가능한 경로명 방식과는 구분해야 한다.

즉 로컬 소켓에서도 엔드포인트 생성·사용·종료·정리가 명확한 생명주기를 가져야 한다.

### 네트워크 소켓과의 경계

유닉스 도메인 소켓은 한 호스트 안의 통신이므로 IP 라우팅이나 원격 호스트 장애를 직접 다루지 않는다. 대신 로컬 이름 공간과 상대 프로세스 자격 정보(peer credential) 같은 호스트 내부 기능을 활용할 수 있다. 다른 호스트까지 통신 범위를 넓혀야 한다면 네트워크 소켓 같은 다른 전송 수단이 필요하다.

유닉스 도메인 소켓의 핵심은 **같은 호스트의 프로세스를 소켓 계약으로 연결하면서, 스트림/데이터그램의 데이터 경계와 로컬 엔드포인트 생명주기를 함께 관리한다는 것**이다.
