---
kind: concept
contentKey: network-http.core.port-nat.nat
topicContentKey: network-http.core.port-nat
slug: nat
title: "네트워크 주소 변환(NAT)"
summary: "네트워크 경계에서 IP 주소를 변환하고 응답 패킷을 원래 내부 종단점으로 되돌리기 위해 변환 상태를 유지하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전통적인 IPv4 NAT의 주소 변환과 반환 패킷을 원래 내부 주소로 되돌리는 상태를 확인한다."
    displayOrder: 1
---
# 네트워크 주소 변환(NAT)

NAT(Network Address Translation)는 네트워크 경계에서 패킷의 **출발지 또는 목적지 IP 주소를 다른 주소로 바꾸는 기능**이다. 사설 IPv4 네트워크와 공인 인터넷 주소 영역을 연결할 때 흔히 볼 수 있다.

예를 들어 내부 호스트 `10.0.0.5`가 인터넷 서버로 패킷을 보낼 때 NAT 장치가 사설 출발지 주소를 공인 주소 `203.0.113.9`로 바꿀 수 있다. 응답이 돌아오면 앞서 만든 변환 상태를 찾아 목적지를 다시 원래 내부 주소로 되돌린다.

```text
외부로 나갈 때
10.0.0.5 → NAT → 203.0.113.9

응답이 돌아올 때
203.0.113.9 쪽으로 온 응답
      ↓ 변환 상태 조회
10.0.0.5로 전달
```

### NAT는 주소 변환이고 라우팅·방화벽은 별도 책임이다

NAT는 패킷 주소를 어떻게 바꿀지 결정한다. 패킷을 어느 다음 홉으로 보낼지는 라우팅이 결정하고, 이 트래픽을 허용할지는 방화벽 정책이 판단할 수 있다.

실제 공유기·클라우드 장비가 NAT·라우팅·필터링을 한 번에 수행할 수 있어도 개념을 하나로 합치면 장애 원인을 잘못 찾기 쉽다.

```text
라우팅  : 어느 경로로 보낼까?
NAT      : 주소·포트를 무엇으로 바꿀까?
방화벽   : 이 트래픽을 허용할까?
```

### NAT 경계를 지나면 서로 보는 주소가 달라질 수 있다

내부 호스트는 자신의 사설 주소를 출발지로 사용하지만 외부 서버는 NAT가 변환한 공인 주소를 관찰한다. PAT까지 사용하면 출발지 포트도 바뀔 수 있다.

따라서 서버 로그에 보이는 원격 주소와 내부 클라이언트가 가진 실제 주소가 항상 같다고 가정하면 안 된다.

NAT의 핵심은 **네트워크 경계에서 주소를 변환하고, 필요한 경우 응답을 원래 내부 종단점으로 되돌릴 수 있도록 변환 관계를 유지한다는 점**이다.
