---
kind: concept
contentKey: network-http.core.port-nat.transport-port
topicContentKey: network-http.core.port-nat
slug: transport-port
title: "전송 계층 포트"
summary: "하나의 호스트 안에서 여러 TCP·UDP 통신 종단점을 포트 번호로 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6335"
    title: "Service Name and Transport Protocol Port Number Registry"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전송 프로토콜의 서비스 이름과 포트 번호 공간을 확인한다."
    displayOrder: 1
---
# 전송 계층 포트

IP가 네트워크 계층의 주소를 제공한다면 전송 계층 포트는 TCP 또는 UDP의 통신 종단점을 구분하는 데 사용됩니다. 포트는 16비트 번호이며 프로토콜별로 해석합니다.

```text
198.51.100.20 TCP 443 → HTTPS 서비스 예시
198.51.100.20 UDP 53  → DNS 서비스 예시
```

TCP 53과 UDP 53은 서로 다른 전송 프로토콜의 포트입니다. 포트 등록과 관례는 프로토콜을 추정하는 데 도움이 되지만 443이라는 번호만으로 HTTPS 사용 여부를 확정할 수는 없습니다.

### 서버와 클라이언트

서버는 로컬 주소·포트에 바인딩하고 연결 또는 데이터그램을 기다립니다. 클라이언트가 연결할 때는 운영체제가 임시 로컬 포트를 선택할 수 있습니다. 같은 서버 포트를 사용하는 연결도 상대 IP·포트가 다르면 별도로 구분됩니다.

포트는 프로세스 ID가 아닙니다. 소켓 소유 관계와 프로세스 상태는 OS가 관리하며 프로세스 종료 후 같은 포트를 다른 프로세스가 사용할 수 있습니다.
