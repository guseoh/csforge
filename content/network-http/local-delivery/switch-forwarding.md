---
kind: concept
contentKey: network-http.core.local-delivery.switch-forwarding
topicContentKey: network-http.core.local-delivery
slug: switch-forwarding
title: "스위치의 프레임 전달"
summary: "이더넷 스위치가 출발지 MAC을 학습하고 목적지 MAC에 따라 출력 포트를 선택하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
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
    relationNote: "Source MAC → 포트 학습, 목적지 MAC 테이블 조회, 미학습 유니캐스트 flooding과 aging을 중심으로 읽는다."
---
# 스위치의 프레임 전달

이더넷 스위치는 수신 프레임의 출발지 MAC 주소와 입력 포트를 관찰하여 전달 테이블(FDB)을 학습합니다. 목적지 MAC이 알려져 있으면 해당 포트로 프레임을 전달할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "스위치의 프레임 전달",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "switch-forwarding"
}
```

예를 들어 포트 1에서 A의 프레임을 받으면 A가 포트 1 방향에 있다는 정보를 등록합니다. 이후 B에서 A로 보내는 프레임을 받으면 목적지 A의 항목을 찾아 전달합니다. 출발지 주소로 학습하고 목적지 주소로 조회한다는 차이가 핵심입니다.

### 테이블에 목적지가 없는 경우

Unknown unicast는 일반적으로 같은 VLAN의 전달 가능한 다른 포트로 플러딩합니다. 브로드캐스트도 해당 영역에 전달합니다. 입력 포트로 다시 내보내거나 차단 상태의 포트로 전달하지 않는 등 실제 전달 정책이 적용됩니다.

동적 FDB 항목은 에이징되며 장비 이동에 따라 다시 학습될 수 있습니다. 스위치는 VLAN별 전달 영역을 구분하므로 물리적으로 같은 장비에 연결되어도 같은 브로드캐스트 도메인이라고 단정할 수 없습니다.

라우터의 IP 목적지와 경로 조회는 MAC 학습 및 프레임 전달과 다른 책임입니다.
