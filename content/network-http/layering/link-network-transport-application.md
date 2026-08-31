---
kind: concept
contentKey: network-http.core.layering.link-network-transport-application
topicContentKey: network-http.core.layering
slug: link-network-transport-application
title: "Link, Network, Transport and Application"
summary: "link·network·transport·application 계층의 역할을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Link, Network, Transport and Application

link 계층은 같은 local network에서 frame을 전달하고, network 계층은 주소와 routing으로 서로 다른 network를 연결한다. transport는 process 간 port와 delivery semantics를 제공하고 application은 HTTP·DNS처럼 업무에 보이는 message 의미를 정한다.

상위 계층이 하위 계층의 모든 보장을 받는 것은 아니다. UDP 위 application이 reliability를 직접 만들 수 있고, TCP가 전달해도 application 처리 성공까지 보장하지 않으므로 각 boundary를 문장으로 적는다.

### Backend 연결

API 장애에서 DNS resolution, connect, TLS handshake, HTTP status, domain result를 별도 span으로 남긴다. “네트워크 오류” 하나로 기록하면 재시도 가능성을 판단할 수 없다.

