---
kind: concept
contentKey: network-http.core.port-nat.connection-tuple
topicContentKey: network-http.core.port-nat
slug: connection-tuple
title: "연결 식별 튜플"
summary: "양쪽 IP 주소·포트와 전송 프로토콜 조합으로 연결·흐름을 구분하고 같은 서버 포트에서 여러 연결이 공존하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP 연결이 양쪽 소켓 정보로 구분되는 기본 연결 식별 경계를 확인한다."
    displayOrder: 1
---
# 연결 식별 튜플

TCP 연결은 한쪽 포트 번호만으로 식별되지 않는다. TCP 프로토콜이 이미 정해져 있다고 보면 **로컬 IP·로컬 포트·원격 IP·원격 포트의 4-tuple**로 연결의 양 끝을 구분할 수 있다. 전송 프로토콜까지 포함해 일반적인 네트워크 흐름을 표현할 때는 5-tuple이라고 부르기도 한다.

```text
protocol = TCP
client   = 192.0.2.10:53124
server   = 198.51.100.20:443
```

### 서버 포트가 같아도 연결은 서로 다르다

웹 서버가 TCP 443 하나에서 listen해도 각 클라이언트의 주소와 임시 포트가 다르므로 연결 튜플도 달라진다.

```text
192.0.2.10:53124 → 198.51.100.20:443
192.0.2.11:60431 → 198.51.100.20:443
192.0.2.12:49100 → 198.51.100.20:443
```

운영체제는 이 연결들을 별도 TCP 상태로 관리할 수 있다. 따라서 `서버 포트 하나 = 연결 하나`가 아니다.

### 연결 튜플과 HTTP 요청 ID도 다른 개념이다

HTTP/1.1에서는 같은 TCP 연결로 여러 요청을 순차적으로 보낼 수 있고 HTTP/2에서는 한 연결 안에 여러 스트림이 동시에 존재할 수 있다. 그러므로 TCP 연결 튜플을 애플리케이션의 영구 요청 ID나 사용자 세션 ID처럼 사용하면 계층을 혼동하게 된다.

### NAT를 지나면 양쪽이 관찰하는 튜플이 달라질 수 있다

NAT/PAT가 출발지 주소·포트를 변환하면 내부 클라이언트가 보는 연결 정보와 외부 서버가 보는 주소·포트가 다르다. NAT 장치는 이 변환 관계를 상태로 보관해 돌아오는 패킷을 원래 내부 흐름으로 되돌린다.

핵심은 **연결·네트워크 흐름이 양 끝 주소와 포트, 필요하면 전송 프로토콜 조합으로 구분되며, 같은 listen 포트 아래에도 많은 독립 연결이 공존할 수 있다는 점**이다.
