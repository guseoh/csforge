---
kind: concept
contentKey: network-http.core.layering.why-layering
topicContentKey: network-http.core.layering
slug: why-layering
title: "계층화가 필요한 이유"
summary: "네트워크 기능을 계층별 책임과 계약으로 나누면 변경 영향과 장애 원인을 좁힐 수 있는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 네트워크 계층 구조와 계층별 책임 경계를 확인한다."
    displayOrder: 1
---
# 계층화가 필요한 이유

웹 서버로 HTTP 요청을 보내려면 현재 링크의 다음 장비를 찾고, 여러 네트워크를 지나 목적지에 도달하고, 올바른 소켓으로 데이터를 전달해야 합니다. 마지막으로 서버는 받은 데이터를 HTTP 메시지로 해석합니다. 계층화는 서로 다른 문제를 독립적인 책임과 계약으로 나누는 방식입니다.

| 계층 | 책임 | 대표 질문 |
| --- | --- | --- |
| 링크 | 현재 링크에서 프레임 전달 | 다음 장비는 누구인가? |
| 네트워크 | IP 패킷 전달 | 목적지에 맞는 다음 홉은 어디인가? |
| 전송 | 통신 종단점과 전달 특성 | 어느 소켓에 어떤 보장으로 전달하는가? |
| 애플리케이션 | 메시지의 의미 | 요청이 어떤 작업을 의미하는가? |

애플리케이션은 소켓 API를 이용하므로 이더넷 프레임을 직접 만들 필요가 없습니다. 라우터도 일반적인 IP 전달을 위해 HTTP 메서드의 의미를 이해할 필요는 없습니다.

### 장애를 계층별로 좁힙니다

DNS에서 주소를 얻었다고 TCP 연결이 성립한 것은 아닙니다. 연결이 성립했더라도 TLS 검증이나 HTTP 인가가 실패할 수 있습니다. 서버의 DB 트랜잭션은 또 별도 책임입니다. 관찰된 실패가 어느 경계에 있는지 확인하면 불필요하게 다른 계층을 수정하는 일을 줄일 수 있습니다.

계층화는 구현을 반드시 별도 프로세스나 물리 장치로 나누라는 뜻이 아닙니다. 커널, NIC 오프로딩, 프록시처럼 여러 계층을 처리하는 구성 요소가 있어도 논리적 계약을 구분하는 데 의미가 있습니다.
