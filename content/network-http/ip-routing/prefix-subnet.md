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
---
# CIDR prefix와 서브넷

CIDR prefix는 IP 주소에서 **앞의 몇 비트를 하나의 주소 범위로 묶어 해석할지** 나타낸다. Prefix가 길수록 포함하는 주소 범위가 작아지고 더 구체적인 네트워크를 표현한다.

예를 들어 `/24`는 앞 24비트가 같은 주소를 하나의 prefix로 묶는다.

```text
192.0.2.10/24
        ↓
192.0.2.0/24 범위에 속함

192.0.2.30 → 같은 /24 범위
192.0.3.30 → 다른 /24 범위
```

### Prefix는 주소 범위를 표현하고 라우팅은 실제 다음 홉을 결정한다

호스트나 라우터는 목적지 주소가 어떤 prefix와 일치하는지 이용해 라우팅 테이블에서 후보 경로를 찾는다. 직접 연결된 prefix가 있으면 같은 링크로 직접 전달할 수 있고, 다른 네트워크라면 라우터를 다음 홉으로 선택할 수 있다.

다만 `같은 숫자 범위에 들어간다`는 사실만으로 상대 호스트가 실제 존재하거나 통신 가능하다는 뜻은 아니다. 인터페이스 구성, 라우팅 상태, 방화벽, 이웃 탐색 등 다른 조건도 맞아야 한다.

### `/24`가 `/16`보다 더 구체적이다

같은 목적지에 `/16`과 `/24` 경로가 모두 일치하면 `/24`가 더 긴 prefix이므로 더 좁은 범위를 가리킨다. 이 구체성은 최장 접두사 일치(Longest-Prefix Match)에서 중요한 기준이 된다.

### 서브넷과 브로드캐스트 도메인은 같은 계층의 개념이 아니다

IP 서브넷은 네트워크 계층의 주소 prefix 범위를 나타낸다. 브로드캐스트 도메인은 링크 계층에서 브로드캐스트 프레임이 전달되는 범위다. 실무에서 VLAN 하나와 IP 서브넷 하나를 대응시키는 경우가 많아도 두 개념의 책임은 다르다.

핵심은 **CIDR prefix가 주소 공간을 네트워크 단위로 묶고, 라우팅에서 목적지 경로의 범위와 구체성을 표현한다는 점**이다.
