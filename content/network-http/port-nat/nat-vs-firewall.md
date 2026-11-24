---
kind: concept
contentKey: network-http.core.port-nat.nat-vs-firewall
topicContentKey: network-http.core.port-nat
slug: nat-vs-firewall
title: "NAT와 방화벽의 차이"
summary: "NAT의 주소·포트 변환과 방화벽의 명시적 트래픽 허용·차단 정책을 분리해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전통적인 IPv4 NAT/NAPT의 주소·포트 변환과 상태 관리 규칙을 확인한다."
    displayOrder: 1
---
# NAT와 방화벽의 차이

가정용 공유기나 클라우드 네트워크 장비는 NAT, 방화벽, 라우팅을 함께 제공하는 경우가 많습니다. 그러나 판단 기준은 서로 다릅니다.

| 기능 | 판단 |
| --- | --- |
| NAT | 주소·포트를 어떤 값으로 변환할 것인가? |
| 방화벽 | 해당 트래픽을 허용할 것인가? |
| 라우팅 | 어느 다음 홉 또는 인터페이스로 전달할 것인가? |

NAT 매핑이 존재해도 방화벽이 거부하면 전달되지 않을 수 있습니다. 방화벽이 허용해도 경로와 필요한 매핑, 리스너가 없으면 연결은 실패합니다.

### NAT가 보안처럼 보이는 이유

내부에서 먼저 만든 매핑이 없는 outbound NAT에서는 외부 새 패킷이 내부 목적지에 도달하지 못할 수 있습니다. 그러나 포트 포워딩을 추가하면 도달 가능성이 달라집니다. 이러한 변환 구조를 보안 정책의 대체물로 사용해서는 안 됩니다.

운영에서는 변환 규칙과 트래픽 허용 범위를 구분하고, 신뢰 경계를 통과한 뒤에도 서비스 인증과 인가를 적용해야 합니다.
