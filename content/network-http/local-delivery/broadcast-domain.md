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
---
# 브로드캐스트 도메인

브로드캐스트 도메인은 **하나의 링크 계층 브로드캐스트 프레임이 전달되는 범위**다. 같은 브로드캐스트 도메인 안의 이더넷 스위치는 브로드캐스트 프레임을 필요한 여러 포트로 전달하지만, 일반적인 라우터는 그 링크 계층 프레임을 다른 IP 네트워크로 그대로 넘기지 않는다.

ARP 요청이 대표적인 예다. 같은 로컬 링크의 IPv4 주소에 대응하는 MAC 주소를 찾을 때 ARP Request가 브로드캐스트되므로 같은 브로드캐스트 도메인의 장비들이 이를 볼 수 있다.

### VLAN은 하나의 물리 스위치 안에서도 브로드캐스트 범위를 나눌 수 있다

```text
VLAN 10
  호스트 A ─┐
  호스트 B ─┴─ A의 브로드캐스트가 전달될 수 있음

VLAN 20
  호스트 C ─── VLAN 10의 링크 계층 브로드캐스트를 직접 받지 않음
```

따라서 여러 장비가 같은 물리 스위치에 꽂혀 있다는 사실만으로 같은 브로드캐스트 도메인이라고 볼 수는 없다. VLAN 구성에 따라 서로 다른 링크 계층 영역으로 분리될 수 있다.

### 브로드캐스트 도메인과 IP 서브넷은 관련되지만 같은 개념은 아니다

브로드캐스트 도메인은 링크 계층의 전달 범위를 설명하고, IP 서브넷은 주소 prefix를 이용해 네트워크 계층의 주소 범위를 설명한다. 실무에서는 하나의 VLAN과 하나의 IP 서브넷을 대응시키는 구성이 흔하지만, 두 용어의 계층과 책임은 다르다.

### IPv6 이웃 탐색은 이더넷 브로드캐스트를 그대로 사용하지 않는다

IPv6는 ARP 대신 ICMPv6 기반 이웃 탐색(NDP)을 사용하며, 이웃 탐색에 멀티캐스트를 활용한다. 따라서 `로컬 주소 탐색은 항상 브로드캐스트`라고 일반화하면 IPv4 ARP 동작을 IPv6에 잘못 적용하게 된다.

핵심은 **브로드캐스트 도메인이 링크 계층 브로드캐스트의 전달 범위이며, VLAN과 라우터 같은 경계가 이 범위를 분리한다는 점**이다.
