---
kind: concept
contentKey: network-http.core.port-nat.socket-endpoint
topicContentKey: network-http.core.port-nat
slug: socket-endpoint
title: "소켓 종단점"
summary: "IP 주소·포트·전송 프로토콜 조합으로 통신의 한쪽 종단점을 표현하고 수신 대기 소켓과 연결 소켓을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6335"
    title: "Service Name and Transport Protocol Port Number Registry"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전송 프로토콜의 서비스 이름과 포트 번호 공간을 확인한다."
    displayOrder: 1
---
# 소켓 종단점

통신 종단점(endpoint)은 네트워크 통신의 한쪽 끝을 뜻한다. 인터넷 소켓을 단순화하면 **IP 주소 + 포트 번호 + 전송 프로토콜**로 로컬 종단점을 표현할 수 있다.

```text
TCP 종단점 = IPv4/IPv6 주소 + TCP 포트
UDP 종단점 = IPv4/IPv6 주소 + UDP 포트
```

도메인 이름은 종단점 자체가 아니다. `api.example.com`을 DNS로 하나 이상의 IP 주소에 해석한 뒤, 실제로 선택한 IP 주소와 포트·전송 프로토콜이 네트워크 통신 종단점을 만든다.

### 수신 대기 소켓(listening socket)과 성립된 TCP 연결은 상태 범위가 다르다

TCP 서버는 로컬 주소·포트에 수신 대기 소켓(listening socket)을 두고 연결 요청을 기다린다. 연결이 성립하면 새 연결 상태는 로컬 종단점뿐 아니라 상대 종단점도 함께 가진다.

```text
listen
0.0.0.0:443

연결 1
192.0.2.10:53124 ↔ 198.51.100.20:443

연결 2
192.0.2.11:60431 ↔ 198.51.100.20:443
```

그래서 하나의 수신 대기 포트에서 많은 TCP 연결을 동시에 받을 수 있다.

UDP도 주소·포트에 바인딩할 수 있지만 TCP처럼 연결 수립 핸드셰이크와 신뢰성 상태를 자동으로 제공하지는 않는다. 같은 소켓 API를 사용한다고 두 전송 프로토콜의 보장이 같아지는 것은 아니다.

### 와일드카드 바인딩은 여러 로컬 주소에서 받을 수 있게 한다

서버가 특정 IP 하나가 아니라 IPv4의 `0.0.0.0` 같은 와일드카드 주소(wildcard address)에 바인딩하면 일반적으로 여러 로컬 IPv4 주소로 들어오는 트래픽을 받을 수 있다. 반대로 특정 주소에만 바인딩하면 다른 인터페이스 주소로 패킷이 도착해도 그 소켓이 받지 못할 수 있다.

핵심은 **소켓 종단점이 전송 프로토콜·로컬 주소·포트의 조합으로 통신의 한쪽 끝을 나타내며, DNS 이름·프로세스 ID·업무 사용자 신원과는 다른 개념이라는 점**이다.
