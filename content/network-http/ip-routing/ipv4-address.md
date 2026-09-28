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
    recommendation: "IPv4 헤더의 출발지·목적지 주소와 IP 패킷 전달의 기본을 확인한다."
    displayOrder: 1
---
# IPv4 주소

IPv4 주소는 32비트 값으로 IP 패킷의 **출발지와 목적지 네트워크 계층 주소**를 표현한다. 하지만 `192.0.2.10`이라는 주소만 보고 어느 범위까지 같은 네트워크인지 알 수는 없다. 실제 네트워크 범위는 prefix 길이 또는 서브넷 마스크와 함께 해석해야 한다.

예를 들어 `192.0.2.10/24`에서 `/24`는 앞 24비트를 네트워크 prefix로 본다는 뜻이다.

```text
주소:        192.0.2.10
prefix:      /24
네트워크:    192.0.2.0/24
```

호스트는 라우팅 테이블에서 목적지 주소와 일치하는 경로를 찾아 직접 연결된 네트워크인지, 라우터를 다음 홉으로 사용해야 하는지 결정한다.

### 한 호스트가 IPv4 주소 하나만 가지는 것은 아니다

노트북이나 서버에는 유선·무선·가상 인터페이스가 함께 있을 수 있고 하나의 인터페이스에도 여러 IP 주소가 설정될 수 있다. 따라서 IPv4 주소를 `장비 전체의 영구 ID 하나`로 생각하면 안 된다.

애플리케이션 서버도 어느 로컬 주소에 소켓을 bind했는지에 따라 특정 인터페이스로 들어온 연결만 받을 수 있다. 패킷이 호스트까지 도착하는 것과 해당 주소·포트에서 애플리케이션이 연결을 받는 것은 다른 단계다.

### IPv4 주소와 MAC 주소는 전달 범위가 다르다

IP 주소는 여러 네트워크를 지나 최종 목적지를 찾는 데 사용된다. 실제 이더넷 프레임을 보낼 때는 현재 링크에서 전달할 **다음 홉의 MAC 주소**가 별도로 필요하다.

```text
최종 목적지 IPv4 주소
        ↓
라우팅 테이블에서 다음 홉 선택
        ↓
ARP로 다음 홉 MAC 주소 확인
        ↓
현재 링크의 이더넷 프레임 전송
```

IPv4 주소의 핵심은 **네트워크 계층의 출발지·목적지를 표현하고, prefix와 라우팅 상태를 함께 사용해 다음 전달 경로를 결정한다는 점**이다.
