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
    recommendation: "전통적인 IPv4 NAT/NAPT의 주소·포트 변환과 상태 관리 규칙을 확인한다."
    displayOrder: 1
---
# 네트워크 주소 변환(NAT)

NAT는 네트워크 경계에서 패킷의 출발지 또는 목적지 IP 주소를 바꾸는 기능입니다. 주소와 전송 계층 포트를 함께 변환하는 방식은 NAPT 또는 PAT라고 합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "네트워크 주소 변환(NAT)",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "nat"
}
```

내부 호스트에서 외부 서버로 접속할 때 출발지 주소가 변환될 수 있습니다. PAT라면 포트도 바뀝니다. 응답이 변환된 외부 주소와 포트로 돌아오면 상태 기반 NAT는 매핑을 찾아 원래 내부 종단점으로 목적지를 복원합니다. 주소 변환에 따라 필요한 IP 및 전송 계층 체크섬도 조정됩니다.

### 책임 구분

라우팅은 다음 경로를 선택하고 NAT는 주소·포트를 변환하며 방화벽은 허용 여부를 판단합니다. 같은 장비가 이 기능들을 함께 수행하더라도 각각의 설정과 실패 원인은 다릅니다.

외부 서버가 보는 상대 주소는 변환된 주소일 수 있습니다. 이 값을 내부 호스트의 실제 주소나 사용자 신원으로 단정하지 않습니다. 외부에서 새 연결을 시작하려면 적절한 목적지 매핑과 경로·필터 조건이 필요할 수 있습니다.
