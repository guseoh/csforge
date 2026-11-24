---
kind: concept
contentKey: network-http.core.ip-routing.router-forwarding
topicContentKey: network-http.core.ip-routing
slug: router-forwarding
title: "라우터의 패킷 전달"
summary: "라우터가 들어온 프레임에서 IP 패킷을 꺼내 목적지 경로를 찾고 수명 정보를 갱신한 뒤 다음 링크로 전달하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 라우터의 경로 선택과 다음 홉 전달 규칙을 확인한다."
    displayOrder: 1
---
# 라우터의 패킷 전달

라우터는 링크 계층 프레임에서 IP 패킷을 꺼내 목적지 IP에 대한 전달 경로를 조회하고 다음 링크에 맞는 프레임을 만들어 전송합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "라우터의 패킷 전달",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "router-forwarding"
}
```

일반적인 전달에서는 출발지와 최종 목적지 IP를 유지하지만, 현재 링크의 출발지와 목적지 MAC은 새로운 홉에 맞게 바뀝니다. IPv4 TTL 또는 IPv6 Hop Limit도 감소합니다. IPv4에서는 TTL 변경으로 헤더 체크섬을 갱신해야 합니다.

### 다른 기능과의 경계

NAT는 IP 또는 포트를 변환할 수 있으며 터널은 별도의 외부 헤더를 추가할 수 있습니다. 이는 일반적인 IP 전달과 별도의 기능입니다. HTTP 메서드나 경로를 읽고 백엔드를 선택하는 애플리케이션 프록시도 IP 라우터와 책임이 다릅니다.

현재 라우터가 다음 홉에 정상적으로 보냈더라도 이후 구간의 필터링, MTU, 손실 및 반환 경로 문제로 종단 간 통신은 실패할 수 있습니다.
