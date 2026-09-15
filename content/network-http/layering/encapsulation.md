---
kind: concept
contentKey: network-http.core.layering.encapsulation
topicContentKey: network-http.core.layering
slug: encapsulation
title: "Encapsulation"
summary: "상위 message가 하위 header와 payload 안에 실리는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Encapsulation

Encapsulation은 상위 계층이 만든 data가 하위 계층의 payload가 되고, 각 계층이 자신의 전달에 필요한 header를 덧붙이는 과정이다. Application message는 transport가 운반할 payload가 되고, transport unit은 IP packet의 payload가 되며, packet은 다시 link frame에 실린다.

```text
application message
      ↓
transport header + payload
      ↓
IP header + transport data
      ↓
link header/trailer + packet
```

각 header에는 그 계층이 필요한 정보가 들어간다. Link 계층은 local delivery 정보를, IP는 destination과 forwarding 정보를, transport는 endpoint와 delivery state를 표현한다.

### 한 application message와 wire unit은 일대일이 아니다

큰 application message는 여러 transport unit과 packet/frame으로 나뉠 수 있고, 반대로 한 번의 application read에서 여러 logical message의 bytes가 함께 보일 수도 있다. 따라서 `HTTP 요청 하나 = TCP segment 하나 = Ethernet frame 하나`처럼 계층별 단위를 직접 일대일로 대응시키면 안 된다.

### Link header는 hop마다 달라질 수 있다

Router는 incoming frame에서 IP packet을 꺼내 다음 hop으로 보낼 새 link frame을 만든다. 그래서 source/destination link address는 hop마다 바뀔 수 있다. 반면 IP destination은 end-to-end forwarding 판단에 사용된다.

Encapsulation의 핵심은 **각 계층이 상위 data를 payload로 받아 자신의 전달 정보를 추가하며, 계층마다 data unit의 경계가 다르다는 것**이다.
