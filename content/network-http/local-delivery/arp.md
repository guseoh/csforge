---
kind: concept
contentKey: network-http.core.local-delivery.arp
topicContentKey: network-http.core.local-delivery
slug: arp
title: "ARP"
summary: "IPv4 다음 홉 주소에 대응하는 MAC 주소를 찾는 ARP 요청·응답 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "같은 링크 안에서 IPv4 주소를 MAC 주소로 해석하는 ARP 동작을 확인한다."
    displayOrder: 1
---
# ARP

IPv4 패킷을 이더넷 같은 로컬 링크로 내보내려면 **이번에 프레임을 전달할 다음 홉의 IPv4 주소에 대응하는 MAC 주소**를 알아야 한다. ARP(Address Resolution Protocol)는 이 IPv4 주소와 MAC 주소 사이의 해석을 담당한다.

목적지가 같은 서브넷에 있다면 목적지 호스트의 IPv4 주소에 대응하는 MAC 주소를 찾는다. 목적지가 다른 네트워크에 있다면 먼저 라우팅 테이블이 기본 게이트웨이 같은 다음 홉을 선택하고, ARP는 **그 다음 홉의 IPv4 주소에 대응하는 MAC 주소**를 찾는다.

### ARP 요청과 응답

송신 호스트가 필요한 매핑을 모르면 로컬 브로드캐스트로 ARP Request를 보낼 수 있다. 해당 IPv4 주소를 가진 노드는 ARP Reply로 자신의 MAC 주소를 알려 주고, 송신 측은 얻은 결과를 ARP 캐시(이웃 캐시)에 일정 시간 보관해 이후 프레임 전송에 재사용할 수 있다.

```text
Who has 192.0.2.10?
        ↓ 로컬 브로드캐스트
192.0.2.10 is at aa:bb:cc:dd:ee:ff
        ↓ ARP Reply
ARP 캐시에 IPv4 ↔ MAC 매핑 저장
```

이 캐시는 영구적인 진실이 아니다. 장비가 바뀌거나 주소 소유자가 달라질 수 있으므로 운영체제는 매핑을 일정 시간 뒤 갱신하거나 다시 확인한다. 같은 IPv4 주소에 예상하지 못한 MAC 주소가 연결되는 상황은 단순 통신 장애뿐 아니라 ARP spoofing 같은 보안 문제와도 이어질 수 있다.

### ARP는 라우팅 프로토콜이 아니다

ARP는 목적지까지 어떤 경로로 갈지를 결정하지 않는다. **라우팅이 먼저 다음 홉 IPv4 주소를 선택하고, ARP가 그 다음 홉을 현재 로컬 링크에서 어떤 MAC 주소로 보낼지 해결한다.**

따라서 흐름을 `목적지 IPv4 → 라우팅으로 다음 홉 선택 → ARP로 다음 홉 MAC 확인 → 이더넷 프레임 전송` 순서로 구분하면 라우팅과 주소 해석의 책임을 섞지 않을 수 있다.
