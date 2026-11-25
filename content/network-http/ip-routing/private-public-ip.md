---
kind: concept
contentKey: network-http.core.ip-routing.private-public-ip
topicContentKey: network-http.core.ip-routing
slug: private-public-ip
title: "사설 IP와 공인 IP"
summary: "RFC 1918 사설 IPv4 주소와 공인 주소의 라우팅 범위를 구분하고, 주소 종류와 접근 허용 정책이 별개임을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1918"
    title: "Address Allocation for Private Internets"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RFC 1918 사설 IPv4 주소 범위와 공개 인터넷에서의 라우팅 경계를 확인한다."
    displayOrder: 1
---
# 사설 IP와 공인 IP

서로 독립된 내부 네트워크에서 IPv4 주소를 재사용할 수 있도록 RFC 1918은 다음 범위를 예약합니다.

```text
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
```

서로 연결되지 않은 두 회사에서 같은 10.0.0.10을 사용할 수 있습니다. RFC 1918 주소 자체는 공개 인터넷의 전역 라우팅 대상으로 사용하지 않습니다. 공인 주소 공간은 전역 라우팅에 사용할 수 있지만 실제 경로가 광고되고 트래픽이 허용된다는 보장은 없습니다. 모든 비 RFC 1918 주소가 공인 주소라는 뜻도 아닙니다. 루프백·링크 로컬·문서용 주소 등의 별도 범위가 존재합니다.

### 사설망의 통신과 공개 서비스

같은 사설망이나 VPN·피어링 등으로 라우팅된 사설망 사이에서는 NAT 없이도 통신할 수 있습니다. 인터넷으로 나가는 트래픽에는 NAT나 프록시를 사용할 수 있습니다. 공개 API의 진입점만 로드 밸런서에 두고 백엔드는 사설 주소로 유지하는 것도 일반적인 구성입니다.

사설 주소는 인증이나 방화벽 정책이 아닙니다. 내부 요청도 신뢰 경계를 검증해야 합니다. 공인 주소가 있어도 경로, 리스너 및 접근 정책이 맞지 않으면 접속할 수 없습니다.
