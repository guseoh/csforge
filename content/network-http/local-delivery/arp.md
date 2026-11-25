---
kind: concept
contentKey: network-http.core.local-delivery.arp
topicContentKey: network-http.core.local-delivery
slug: arp
title: "ARP"
summary: "IPv4 다음 홉 주소에 대응하는 MAC 주소를 찾는 ARP 요청·응답과 캐시 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "로컬 링크에서 IPv4 주소와 이더넷 주소를 대응시키는 ARP 동작을 확인한다."
    displayOrder: 1
---
# ARP

IPv4 패킷을 이더넷으로 보내려면 현재 링크에서 프레임을 받을 다음 홉의 MAC 주소가 필요합니다. ARP(Address Resolution Protocol)는 로컬 링크에서 IPv4 주소에 대응하는 링크 주소를 확인하는 프로토콜입니다.

라우팅 결과가 직접 연결된 목적지를 가리키면 해당 호스트를, 원격 네트워크를 가리키면 선택된 게이트웨이를 대상으로 주소를 해석합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "ARP",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "arp"
}
```

### 요청과 응답

이웃 캐시에 매핑이 없다면 일반적인 ARP 요청은 로컬 브로드캐스트로 전달됩니다. 해당 주소를 사용하는 장비가 요청자에게 응답하면 매핑을 캐시할 수 있습니다. 장비 교체나 주소 이동으로 캐시가 오래될 수 있으므로 필요한 경우 실제 링크와 이웃 정보를 확인합니다.

ARP는 어느 경로를 사용할지 결정하지 않습니다. 라우팅이 다음 홉을 결정하고 ARP가 현재 링크에서 사용할 MAC 주소를 확인합니다. IPv6는 일반적으로 ARP 대신 Neighbor Discovery를 사용합니다.

ARP 응답 자체는 사용자나 서비스의 인증 정보가 아닙니다. 예상하지 못한 매핑은 오래된 상태 또는 위조 등 여러 원인이 있을 수 있습니다.
