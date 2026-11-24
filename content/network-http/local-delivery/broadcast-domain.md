---
kind: concept
contentKey: network-http.core.local-delivery.broadcast-domain
topicContentKey: network-http.core.local-delivery
slug: broadcast-domain
title: "브로드캐스트 도메인"
summary: "하나의 링크 계층 브로드캐스트가 전달되는 범위와 VLAN·라우터가 그 범위를 나누는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "로컬 링크에서 IPv4 주소와 이더넷 주소를 대응시키는 ARP 동작을 확인한다."
    displayOrder: 1
  - url: "https://www.cisco.com/c/en/us/support/docs/lan-switching/ethernet/12006-chapter22.html"
    title: "Cisco: Troubleshoot LAN Switching Environments"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "스위치 MAC 주소 학습·프레임 전달과 VLAN별 브로드캐스트 도메인을 확인한다."
    displayOrder: 2
    relationNote: "같은 VLAN의 브로드캐스트 범위와 물리 스위치·VLAN 경계의 구별을 중심으로 읽는다."
---
# 브로드캐스트 도메인

브로드캐스트 도메인은 링크 계층 브로드캐스트 프레임이 전달되는 범위입니다. 같은 영역의 스위치는 전달 가능한 여러 포트로 프레임을 내보내지만 일반적인 라우터는 그 이더넷 브로드캐스트를 다른 IP 네트워크로 그대로 전달하지 않습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "브로드캐스트 도메인",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "broadcast-domain"
}
```

한 물리 스위치에 VLAN 10과 VLAN 20을 구성하면 각각의 링크 계층 전달 범위를 분리할 수 있습니다. VLAN 10의 ARP 브로드캐스트가 VLAN 20에 그대로 전달되는 것은 아닙니다. 서로 다른 IP 네트워크 간 통신에는 적절한 L3 전달이 필요합니다.

### IP 서브넷과 구분합니다

서브넷은 IP 주소 접두사의 범위이고 브로드캐스트 도메인은 링크 계층의 전달 범위입니다. 실무에서 하나의 VLAN과 하나의 서브넷을 대응시키는 구성이 흔하지만 같은 개념은 아닙니다.

IPv6의 Neighbor Discovery는 ICMPv6 멀티캐스트 등을 사용합니다. IPv4 ARP의 브로드캐스트 방식을 모든 로컬 주소 해석에 일반화하지 않습니다.
