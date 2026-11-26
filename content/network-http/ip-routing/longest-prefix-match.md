---
kind: concept
contentKey: network-http.core.ip-routing.longest-prefix-match
topicContentKey: network-http.core.ip-routing
slug: longest-prefix-match
title: "최장 접두사 일치(Longest-Prefix Match)"
summary: "목적지와 여러 경로가 일치할 때 가장 긴 접두사(prefix), 즉 더 구체적인 경로를 우선하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 라우터의 경로 선택과 다음 홉 전달 규칙을 확인한다."
    displayOrder: 1
---
# 최장 접두사 일치(Longest-Prefix Match)

하나의 IP 목적지가 여러 경로의 주소 범위에 동시에 포함될 수 있습니다. 일반적인 목적지 기반 경로 조회는 일치하는 접두사 중 길이가 가장 긴 것을 선택합니다.

| 경로 | 목적지 10.1.2.30 포함 여부 |
| --- | --- |
| 0.0.0.0/0 | 포함 |
| 10.0.0.0/8 | 포함 |
| 10.1.2.0/24 | 포함, 가장 구체적 |

/24가 선택되는 이유는 물리적으로 가까운 라우터이거나 지연 시간이 작아서가 아닙니다. 목적지와 일치하는 주소 범위가 가장 구체적이기 때문입니다. 이 방식으로 일반 인터넷 트래픽은 기본 경로를 쓰면서 특정 사설망은 VPN으로 전달할 수 있습니다.

### 같은 길이의 경로와 정책

라우팅 프로토콜 선호도나 메트릭은 동일 접두사의 경로 선정에 영향을 줄 수 있습니다. ECMP는 적절한 복수 경로를 사용할 수 있게 합니다. 정책 라우팅은 목적지 외의 조건으로 조회할 테이블 등을 결정할 수도 있습니다. 최장 접두사 일치 자체를 모든 경로 선택 정책과 동일시하지 않습니다.
