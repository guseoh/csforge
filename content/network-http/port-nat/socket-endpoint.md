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

인터넷 통신의 한쪽 끝은 전송 프로토콜과 IP 주소, 포트의 조합으로 표현할 수 있습니다. 소켓은 애플리케이션이 운영체제의 통신 기능을 사용하기 위한 객체 또는 핸들이며 주소 자체와 동일하지 않습니다.

### 수신 대기와 성립된 연결

```text
리스닝: 0.0.0.0:443 / TCP
연결 1: 198.51.100.20:443 ↔ 192.0.2.10:53124
연결 2: 198.51.100.20:443 ↔ 192.0.2.11:60431
```

리스닝 소켓은 새 연결을 기다립니다. 연결이 성립하면 accept 등을 통해 별도의 연결 소켓을 사용할 수 있습니다. 각 연결은 로컬과 원격 종단점의 상태를 가집니다. UDP 소켓도 주소·포트에 바인딩할 수 있지만 TCP의 핸드셰이크와 신뢰성 상태를 제공하지 않습니다.

### 바인딩과 접근 가능성

IPv4 0.0.0.0에 바인딩하면 일반적으로 여러 로컬 IPv4 주소로 향하는 요청을 받을 수 있습니다. 특정 주소로 제한하면 다른 목적지 주소의 연결이 그 소켓과 매칭되지 않을 수 있습니다. 물리 인터페이스 제한과는 구분해야 합니다.

와일드카드 바인딩만으로 인터넷에서 접근 가능한 것은 아닙니다. 경로, 방화벽 및 기타 네트워크 정책이 별도로 적용됩니다.
