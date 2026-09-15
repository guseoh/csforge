---
kind: concept
contentKey: network-http.core.layering.link-network-transport-application
topicContentKey: network-http.core.layering
slug: link-network-transport-application
title: "Link, Network, Transport·Application"
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
# Link, Network, Transport·Application

Internet communication을 단순화하면 link, network, transport, application 계층이 서로 다른 전달 범위를 맡는다. 중요한 것은 계층 이름을 암기하는 것이 아니라 **각 계층이 어떤 주소와 상태를 보고 어디까지 전달을 책임지는지** 구분하는 것이다.

| 계층 | 주된 책임 | 대표 식별 정보 |
| --- | --- | --- |
| Link | 하나의 local link에서 다음 장비까지 frame 전달 | link address(MAC 등) |
| Network | 여러 network 사이 packet forwarding | IP address |
| Transport | host의 endpoint 구분과 transport delivery | port, connection state |
| Application | bytes를 application message와 의미로 해석 | method, name, protocol field 등 |

### 각 계층의 보장은 서로 다르다

IP는 destination을 향해 packet을 best-effort로 forwarding하지만 reliable delivery를 보장하지 않는다. TCP는 ordered byte stream과 retransmission 같은 transport 기능을 제공하지만 application message boundary를 보존하지 않는다. UDP는 더 얇은 datagram contract를 제공한다.

Application protocol은 transport 위에서 자신의 message syntax와 semantics를 정의한다. HTTP는 method, header, status와 representation을 정의하고 DNS는 query와 answer record를 정의한다.

따라서 `transport가 성공했다 = application 요청이 성공했다`고 연결하면 안 된다. 각 계층의 성공 조건은 그 계층이 소유한 계약 안에서 해석해야 한다.
