---
kind: concept
contentKey: network-http.core.layering.encapsulation
topicContentKey: network-http.core.layering
slug: encapsulation
title: "캡슐화(Encapsulation)"
summary: "상위 계층의 데이터가 하위 계층의 페이로드가 되고 각 계층의 헤더가 추가되는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 프로토콜 계층의 책임 경계를 확인한다."
    displayOrder: 1
---
# 캡슐화(Encapsulation)

캡슐화는 **상위 계층이 만든 데이터가 하위 계층의 페이로드가 되고, 각 계층이 자기 전달에 필요한 정보를 덧붙이는 과정**이다. 예를 들어 애플리케이션이 만든 HTTP 메시지는 TCP가 운반할 데이터가 되고, TCP 세그먼트는 IP 패킷의 페이로드가 되며, IP 패킷은 다시 현재 링크의 프레임에 실린다.

```text
애플리케이션 메시지
      ↓
전송 계층 헤더 + 데이터
      ↓
IP 헤더 + 전송 계층 데이터
      ↓
링크 계층 헤더/트레일러 + IP 패킷
```

각 계층이 붙이는 정보의 목적도 다르다. 링크 계층은 **현재 링크에서 다음 장비까지 전달하는 데 필요한 정보**를, IP는 **최종 목적지 주소와 라우팅에 필요한 정보**를, TCP 같은 전송 계층은 **포트·순서·연결 상태처럼 양 끝 통신에 필요한 정보**를 담는다.

### 애플리케이션 메시지와 실제 전송 단위는 일대일이 아니다

큰 HTTP 메시지 하나가 여러 TCP 세그먼트와 IP 패킷, 링크 프레임으로 나뉠 수 있다. 반대로 TCP는 메시지 경계를 보존하는 프로토콜이 아니므로 애플리케이션이 한 번 읽었을 때 여러 논리 메시지의 바이트가 함께 보일 수도 있다.

따라서 `HTTP 요청 하나 = TCP 세그먼트 하나 = 이더넷 프레임 하나`처럼 서로 다른 계층의 단위를 일대일로 대응시키면 안 된다.

### 링크 계층 정보는 홉마다 다시 만들어질 수 있다

라우터는 들어온 프레임에서 IP 패킷을 꺼낸 뒤 다음 링크에 맞는 새 프레임을 만든다. 그래서 출발지·목적지 MAC 주소 같은 링크 계층 정보는 홉마다 바뀔 수 있다. 반면 일반적인 IP 전달에서는 최종 목적지 IP 주소를 기준으로 다음 경로를 계속 선택한다.

캡슐화의 핵심은 **각 계층이 상위 데이터를 페이로드로 받아 자신의 책임에 필요한 전달 정보를 추가하며, 계층마다 데이터 단위와 책임 범위가 다르다는 것**이다.
