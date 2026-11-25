---
kind: concept
contentKey: network-http.core.ip-routing.ipv4-address
topicContentKey: network-http.core.ip-routing
slug: ipv4-address
title: "IPv4 주소"
summary: "IPv4 주소가 패킷의 출발지·목적지를 나타내고 prefix와 함께 네트워크 범위·라우팅 판단에 사용되는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 주소, 헤더와 패킷 전달의 기본 규칙을 확인한다."
    displayOrder: 1
---
# IPv4 주소

IPv4 주소는 32비트 네트워크 계층 주소입니다. IP 헤더의 출발지와 목적지 주소에 사용하며, 주소의 네트워크 범위는 접두사 길이와 함께 해석합니다.

```text
주소: 192.0.2.10/24
접두사: 192.0.2.0/24
마스크: 255.255.255.0
```

호스트는 목적지 IP와 라우팅 정보를 비교하여 직접 전달할지 다음 홉을 사용할지 결정합니다. 이더넷에서는 다음 홉의 MAC 주소도 필요합니다.

### 주소와 인터페이스는 일대일이 아닙니다

하나의 호스트나 인터페이스에 여러 IP 주소가 설정될 수 있습니다. 서버 소켓을 특정 로컬 주소에 바인딩하는 것은 목적지 주소·포트에 관한 조건이지 물리적인 수신 인터페이스를 반드시 제한하는 것은 아닙니다. Linux의 일반적인 호스트 주소 모델에서는 다른 인터페이스로 들어온 패킷도 라우팅과 필터 정책에 따라 로컬 소켓에 전달될 수 있습니다. 인터페이스 제한은 SO_BINDTODEVICE 등의 별도 설정과 구분합니다.

IP 주소는 사용자나 장비의 영구 신원도 아닙니다. 실제 서비스 접근에는 경로, 방화벽, 리스너와 상위 프로토콜 조건이 필요합니다.
