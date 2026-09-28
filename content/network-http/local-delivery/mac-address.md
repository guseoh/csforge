---
kind: concept
contentKey: network-http.core.local-delivery.mac-address
topicContentKey: network-http.core.local-delivery
slug: mac-address
title: "MAC 주소"
summary: "같은 로컬 링크에서 프레임을 전달할 때 사용하는 MAC 주소의 역할과 IP 주소와의 책임 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "로컬 링크에서 IPv4 주소와 이더넷 주소를 대응시키는 ARP 동작을 확인한다."
    displayOrder: 1
---
# MAC 주소

MAC 주소는 이더넷 같은 링크 계층에서 네트워크 인터페이스를 식별하고 **현재 로컬 링크 안에서 프레임을 어느 장비로 보낼지** 표현하는 데 사용된다. 네트워크 카드(NIC)는 목적지 MAC 주소를 보고 자신이 받아야 할 프레임인지 판단하고, 스위치는 MAC 주소 테이블을 이용해 프레임을 어느 포트로 전달할지 결정한다.

MAC 주소의 범위는 IP 주소와 다르다. IP 목적지 주소는 여러 네트워크를 지나 도달할 최종 목적지를 나타낼 수 있지만, 현재 이더넷 프레임의 목적지 MAC 주소는 **지금 이 링크에서 전달해야 할 다음 홉**을 가리킨다.

### 원격 서버로 갈 때도 현재 링크에서는 다음 홉 MAC을 사용한다

예를 들어 노트북이 다른 네트워크의 서버로 패킷을 보낸다고 하자. IP 헤더의 목적지는 원격 서버 주소지만 첫 번째 이더넷 프레임의 목적지 MAC은 기본 게이트웨이의 MAC이다.

```text
최종 IP 목적지: 원격 서버

첫 번째 링크
클라이언트 MAC → 기본 게이트웨이 MAC

다음 링크
라우터의 출력 MAC → 다음 홉 MAC
```

라우터가 패킷을 다음 링크로 전달할 때는 이전 프레임을 그대로 넘기는 것이 아니라 다음 링크에 맞는 새 프레임을 만든다. 그래서 MAC 주소는 홉마다 바뀔 수 있지만 최종 IP 목적지는 일반적인 전달 과정에서 그대로 유지될 수 있다.

### MAC 주소를 사용자·장비의 영구 신원으로 보면 안 된다

가상 인터페이스, NIC 교체, 관리자가 지정한 주소, 무선 환경의 주소 무작위화 등으로 관찰되는 MAC 주소는 달라질 수 있다. 또한 MAC 주소는 로컬 링크에서 전달하기 위한 정보이지 애플리케이션 사용자의 인증 자격이 아니다.

따라서 `특정 MAC 주소 = 항상 같은 사용자·장비`라고 가정해 인증이나 중요한 권한 판단에 사용하면 안 된다.

핵심은 **MAC 주소가 현재 로컬 링크의 프레임 전달을 위한 링크 계층 식별 정보이고, 여러 네트워크를 지나는 IP 주소와는 책임 범위가 다르다는 점**이다.
