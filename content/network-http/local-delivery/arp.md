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
    recommendation: "같은 로컬 링크에서 IPv4 주소를 이더넷 주소로 해석하는 ARP 요청·응답을 확인한다."
    displayOrder: 1
---
# ARP

IPv4 패킷을 이더넷 같은 로컬 링크로 내보내려면 **이번 프레임을 전달할 다음 홉의 IPv4 주소에 대응하는 MAC 주소**를 알아야 한다. ARP(Address Resolution Protocol)는 로컬 링크에서 IPv4 주소와 MAC 주소 사이의 매핑을 알아내는 프로토콜이다.

목적지가 같은 서브넷에 있으면 최종 목적지 호스트가 곧 현재 링크의 다음 홉이 될 수 있다. 반대로 다른 네트워크의 서버로 간다면 라우팅 테이블이 먼저 기본 게이트웨이 같은 다음 홉을 선택하고, ARP는 **그 게이트웨이의 IPv4 주소에 대응하는 MAC 주소**를 찾는다.

```text
원격 서버로 전송

최종 목적지 IP
      ↓ 라우팅
다음 홉 = 기본 게이트웨이 IP
      ↓ ARP
기본 게이트웨이 MAC
      ↓
이더넷 프레임 전송
```

### ARP Request와 ARP Reply

필요한 매핑이 캐시에 없으면 송신 호스트는 로컬 브로드캐스트로 ARP Request를 보낼 수 있다. 해당 IPv4 주소를 사용하는 노드는 ARP Reply로 자신의 MAC 주소를 알려 준다.

```text
Who has 192.0.2.10?
        ↓ 로컬 브로드캐스트
192.0.2.10 is at aa:bb:cc:dd:ee:ff
        ↓ ARP Reply
이웃 캐시에 IPv4 ↔ MAC 매핑 저장
```

운영체제는 얻은 매핑을 일정 시간 캐시에 두어 프레임을 보낼 때마다 ARP를 다시 하지 않도록 한다. 하지만 장비 교체, 가상 IP 이동, 네트워크 재구성으로 매핑이 바뀔 수 있으므로 영구적인 값으로 취급해서는 안 된다.

### ARP 응답을 곧바로 신뢰 가능한 신원 증명으로 보면 안 된다

같은 IPv4 주소에 예상과 다른 MAC 주소가 연결되면 단순한 오래된 캐시일 수도 있지만 ARP spoofing 같은 보안 문제일 수도 있다. ARP 자체를 사용자·서버의 애플리케이션 신원을 증명하는 수단으로 사용해서는 안 된다.

### ARP는 경로를 선택하지 않는다

ARP는 어느 네트워크 경로로 갈지 결정하지 않는다. **라우팅이 다음 홉 IPv4 주소를 선택하고, ARP가 그 다음 홉을 현재 링크에서 어느 MAC 주소로 보낼지 해결한다.**

핵심 흐름은 `목적지 IP → 라우팅으로 다음 홉 선택 → ARP로 다음 홉 MAC 확인 → 링크 프레임 전송`이다.
