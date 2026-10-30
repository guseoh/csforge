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

호스트가 IP 패킷을 보내려면 먼저 라우팅 정보를 보고 **목적지가 현재 로컬 네트워크에 직접 연결돼 있는지, 라우터를 거쳐야 하는지** 판단한다.

목적지가 직접 연결된 prefix에 속하면 목적지 호스트 자체가 다음 홉이 될 수 있다. 이 경우 IPv4에서는 ARP, IPv6에서는 Neighbor Discovery를 이용해 그 이웃의 링크 계층 주소를 알아낸 뒤 프레임을 보낸다.

목적지가 로컬 네트워크 밖에 있고 더 구체적으로 일치하는 경로가 없다면 기본 경로가 가리키는 라우터를 다음 홉으로 선택한다. 흔히 이 다음 홉 라우터를 **기본 게이트웨이**라고 부른다.

### 최종 목적지 IP와 현재 링크의 다음 홉은 다르다

원격 서버로 가는 첫 번째 프레임에서도 IP 헤더의 목적지는 최종 서버다. 하지만 현재 링크의 프레임 목적지 MAC 주소는 기본 게이트웨이의 MAC 주소가 된다.

```text
최종 IP 목적지 = 원격 서버
        ↓
라우팅 판단 = 기본 경로 사용
        ↓
현재 다음 홉 = 기본 게이트웨이 IP
        ↓ ARP/NDP
프레임 목적지 = 게이트웨이 MAC
```

게이트웨이는 패킷을 받은 뒤 자신의 라우팅 테이블을 사용해 또 다음 홉을 결정한다. 이렇게 각 라우터가 현재 위치에서 다음 홉을 선택하면서 최종 목적지까지 전달이 이어진다.

### 기본 경로보다 더 구체적인 경로가 우선할 수 있다

기본 경로는 모든 목적지에 무조건 우선하는 특별한 경로가 아니다. 목적지와 더 길게 일치하는 prefix 경로가 있으면 그 경로가 먼저 선택된다. 기본 경로는 더 구체적인 일치 경로가 없을 때 사용하는 포괄 경로다.

따라서 특정 사설망·VPN 목적지가 기본 게이트웨이로 잘못 나간다면 `기본 게이트웨이가 이상하다`고만 보기보다 더 구체적인 경로가 라우팅 테이블에 존재하는지 먼저 확인해야 한다.

핵심은 **기본 게이트웨이가 로컬 네트워크 밖의 목적지로 갈 때 사용할 다음 홉을 제공하며, 최종 IP 목적지와 현재 링크에서 전달할 게이트웨이 주소는 서로 다른 정보라는 점**이다.
