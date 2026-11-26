---
kind: concept
contentKey: network-http.core.local-delivery.default-gateway
topicContentKey: network-http.core.local-delivery
slug: default-gateway
title: "기본 게이트웨이"
summary: "목적지가 로컬 네트워크 밖에 있을 때 기본 경로가 다음 홉 라우터를 선택하는 방식과 최종 IP 목적지와의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "인터넷 호스트의 네트워크 계층 구조와 계층별 책임 경계를 확인한다."
    displayOrder: 1
---
# 기본 게이트웨이

호스트가 IP 패킷을 보낼 때 먼저 라우팅 정보를 조회합니다. 직접 연결된 경로라면 해당 목적지를 이웃으로 해석하고, 라우터를 경유하는 경로라면 그 다음 홉의 링크 주소를 확인합니다.

더 구체적인 일치 경로가 없을 때 기본 경로를 사용합니다. 이 경로가 가리키는 다음 홉 라우터를 흔히 기본 게이트웨이라고 부릅니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "기본 게이트웨이",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "default-gateway"
}
```

원격 서버로 향하는 첫 이더넷 프레임은 게이트웨이 MAC을 목적지로 사용하지만 IP 패킷의 목적지 주소는 원격 서버입니다. 게이트웨이는 자신의 라우팅 테이블로 다음 홉을 선택합니다.

### 기본 경로보다 구체적인 경로가 우선합니다

IPv4의 0.0.0.0/0, IPv6의 ::/0은 포괄적인 기본 접두사입니다. 목적지에 일치하는 더 긴 접두사가 있으면 그 경로가 우선합니다. VPN 목적지 트래픽이 잘못된 게이트웨이로 나갈 때는 해당 목적지의 더 구체적인 경로와 실제 선택 결과를 조사해야 합니다.

기본 경로가 존재해도 게이트웨이의 이웃 해석, 링크 연결 및 이후 경로가 정상이어야 통신할 수 있습니다.
