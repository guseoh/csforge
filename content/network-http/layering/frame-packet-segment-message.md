---
kind: concept
contentKey: network-http.core.layering.frame-packet-segment-message
topicContentKey: network-http.core.layering
slug: frame-packet-segment-message
title: "프레임·패킷·세그먼트·메시지"
summary: "프레임·패킷·세그먼트·데이터그램·메시지가 각각 어느 계층의 데이터 단위를 가리키는지 비교한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 네트워크 계층 구조와 계층별 책임 경계를 확인한다."
    displayOrder: 1
---
# 프레임·패킷·세그먼트·메시지

네트워크에서 같은 데이터라도 관찰하는 계층에 따라 단위와 경계가 달라집니다.

| 단위 | 계층 | 예 |
| --- | --- | --- |
| 프레임 | 링크 | Ethernet frame |
| 패킷 | 네트워크 | IPv4·IPv6 packet |
| 세그먼트·데이터그램 | 전송 | TCP segment, UDP datagram |
| 메시지 | 애플리케이션 | HTTP request, DNS query |

패킷이라는 표현은 분석 도구에서 넓은 의미로 사용되기도 합니다. 단어만으로 판단하기보다 어떤 프로토콜의 헤더와 경계를 관찰하는지 확인해야 합니다.

### 메시지와 전송 단위

HTTP 요청의 1,300바이트가 TCP에서 500바이트와 800바이트로 나누어 전송될 수 있습니다. 수신 측 TCP는 연속 바이트 스트림을 제공하고 HTTP 파서는 프레이밍 규칙으로 메시지를 해석합니다. 소켓의 read 호출 결과도 메시지 경계와 일치한다고 가정할 수 없습니다.

UDP는 수신한 데이터그램의 경계를 제공하지만 전달 성공이나 순서를 보장하지 않습니다. 경계 보존과 신뢰성은 별개의 성질입니다.
