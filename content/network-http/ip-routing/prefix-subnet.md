---
kind: concept
contentKey: network-http.core.ip-routing.prefix-subnet
topicContentKey: network-http.core.ip-routing
slug: prefix-subnet
title: "CIDR prefix와 서브넷"
summary: "CIDR prefix가 IP 주소 범위를 표현하고 라우팅에서 경로의 구체성을 비교하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 주소, 헤더와 패킷 전달의 기본 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc4632.html#section-3"
    title: "RFC 4632 §3: CIDR Address Prefixes"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 접두사 표기, classless 주소 범위와 최장 접두사 선호 규칙을 확인한다."
    displayOrder: 2
---
# CIDR prefix와 서브넷

IP 주소를 각각 관리하는 대신 앞부분의 비트가 같은 주소들을 접두사로 묶으면 주소 범위와 경로를 간결하게 표현할 수 있습니다. CIDR의 / 뒤 숫자는 고정된 앞쪽 비트 수입니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "CIDR prefix와 서브넷",
  "description": "개념의 상태·구조와 책임 경계를 교재형 도식으로 구분하여 보여줍니다.",
  "example": "prefix-subnet"
}
```

192.0.2.0/24는 마지막 8비트가 달라질 수 있어 192.0.2.0부터 192.0.2.255까지 총 256개 주소를 포함합니다. 일반적인 IPv4 브로드캐스트 서브넷에서는 네트워크 주소와 브로드캐스트 주소 때문에 모든 주소를 호스트에 할당하지는 않습니다.

### 접두사와 경로 선택

같은 목적지에 /16과 /24가 모두 일치하면 /24가 더 구체적입니다. 라우팅은 이런 일치 관계를 바탕으로 다음 홉이나 출력 인터페이스를 선택합니다. 범위에 포함된다는 사실이 호스트의 존재, 링크 연결 또는 접근 허용을 증명하지는 않습니다.

IP 서브넷은 네트워크 계층의 주소 범위이고 브로드캐스트 도메인은 링크 계층의 전달 범위입니다. 하나의 VLAN과 하나의 IP 서브넷을 대응시키는 구성이 흔하지만 같은 개념은 아닙니다.
