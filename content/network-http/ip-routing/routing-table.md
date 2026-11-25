---
kind: concept
contentKey: network-http.core.ip-routing.routing-table
topicContentKey: network-http.core.ip-routing
slug: routing-table
title: "라우팅 테이블"
summary: "목적지 prefix를 다음 홉·출력 인터페이스와 연결하고 패킷의 전달 방향을 선택하는 라우팅 테이블의 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 라우터의 경로 선택과 다음 홉 전달 규칙을 확인한다."
    displayOrder: 1
---
# 라우팅 테이블

호스트와 라우터는 패킷의 목적지 주소를 기반으로 다음 전달 방향을 선택합니다. 라우팅 테이블에는 목적지 접두사, 다음 홉, 출력 인터페이스 등의 정보가 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "라우팅 테이블",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "routing-table"
}
```

직접 연결된 경로에서는 대상 이웃에게 전달할 수 있고 원격 경로에서는 다른 라우터를 다음 홉으로 사용할 수 있습니다. 목적지 10.1.2.30이 0.0.0.0/0, 10.0.0.0/8, 10.1.2.0/24에 모두 포함된다면 일반적인 목적지 기반 전달에서는 /24가 우선합니다.

### 경로 선택 이후

출력 링크가 이더넷이라면 IPv4 ARP 또는 IPv6 NDP 등으로 다음 홉의 링크 주소를 확인합니다. 인터페이스가 내려가거나 이웃 해석이 실패하면 선택된 경로로 정상 전달할 수 없습니다.

실제 구현에서는 경로 관리용 RIB와 패킷 전달용 FIB를 구분할 수 있습니다. 정책 라우팅, 메트릭, ECMP 등에 따라 사용하는 테이블이나 경로가 결정될 수 있으므로 현재 목적지에 대한 실제 조회 결과를 확인해야 합니다.
