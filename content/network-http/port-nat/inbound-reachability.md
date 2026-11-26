---
kind: concept
contentKey: network-http.core.port-nat.inbound-reachability
topicContentKey: network-http.core.port-nat
slug: inbound-reachability
title: "외부에서 내부로 연결하기"
summary: "상태 기반 NAT 뒤의 내부 종단점에 외부에서 새 연결을 시작하려면 기존 매핑이나 명시적인 목적지 변환 규칙이 필요한 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전통적인 IPv4 NAT/NAPT의 주소·포트 변환과 상태 관리 규칙을 확인한다."
    displayOrder: 1
---
# 외부에서 내부로 연결하기

일반적인 outbound NAT는 내부에서 외부로 시작한 흐름을 변환하고 돌아오는 응답을 기존 매핑으로 전달합니다. 외부에서 새로운 연결을 시작하는 경우 해당 외부 종단점을 어느 내부 주소·포트로 연결할지 정의되지 않았을 수 있습니다.

### 명시적 목적지 매핑

```text
203.0.113.9:8443 → 10.0.0.20:443
```

정적 DNAT 또는 포트 포워딩은 외부 목적지에 대응하는 내부 주소·포트를 지정할 수 있습니다. 기존 동적 매핑을 사용할 수 있는지는 NAT의 매핑 및 필터링 정책에 따라 달라집니다.

실제 접속에는 외부 경로, NAT 규칙, 방화벽·보안 그룹, 내부 리스너 및 반환 경로가 모두 필요합니다. 공인 주소가 또 다른 상위 NAT 뒤에 있다면 그 경계도 조사해야 합니다.

### 장애 원인 구분

매핑이 없어 내부 목적지를 찾지 못하는 것과 방화벽 정책이 트래픽을 거부하는 것은 다릅니다. 외부에 공개할 서비스에는 필요한 진입점과 접근 정책을 명시적으로 구성해야 합니다.
