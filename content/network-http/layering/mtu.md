---
kind: concept
contentKey: network-http.core.layering.mtu
topicContentKey: network-http.core.layering
slug: mtu
title: "MTU와 패킷 크기"
summary: "링크 MTU와 경로 MTU가 패킷 단편화·전달 실패·송신 측 패킷 크기 조정에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1191"
    title: "Path MTU Discovery"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 경로 MTU 탐색과 DF가 설정된 큰 패킷의 처리 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8201"
    title: "Path MTU Discovery for IP version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 경로 MTU 탐색과 ICMPv6 Packet Too Big을 이용한 송신 측 패킷 크기 조정 규칙을 확인한다."
    displayOrder: 2
    relationNote: "IPv6에서는 중간 라우터가 패킷을 단편화하지 않고 송신 측이 경로 MTU에 맞춰 크기를 조정한다는 규칙을 보충한다."
---
# MTU와 패킷 크기

MTU(Maximum Transmission Unit)는 링크에서 운반할 수 있는 네트워크 계층 패킷 크기의 제한입니다. 일반적인 Ethernet IP MTU가 1500바이트라고 해서 HTTP 응답도 1500바이트 이하로 제한되는 것은 아닙니다.

TCP는 긴 바이트 스트림을 여러 세그먼트로 나눕니다. IPv4 헤더 20바이트와 TCP 헤더 20바이트만 있다고 가정하면 MTU 1500에서 TCP 데이터의 크기는 최대 1460바이트가 됩니다. 옵션, 터널, IPv6 등은 이 계산에 영향을 줍니다. MSS는 TCP 데이터 크기에 관한 값이며 MTU와 같지 않습니다.

| 조건 | 처리 |
| --- | --- |
| IPv4, 단편화 가능 | 필요한 경우 라우터가 단편화 |
| IPv4, DF 설정 | 너무 큰 패킷은 폐기하고 관련 ICMP 오류 전달 |
| IPv6 | 라우터는 단편화하지 않고 ICMPv6 Packet Too Big 전달 |

### 경로 MTU

Path MTU는 경로의 여러 링크에서 허용하는 크기의 제약을 반영합니다. VPN 또는 터널이 외부 헤더를 추가하면 내부 패킷에 사용할 수 있는 공간이 줄어들 수 있습니다.

PMTUD는 ICMP 오류를 이용해 패킷 크기를 조정합니다. 필요한 ICMP가 차단되면 작은 요청은 성공하지만 큰 데이터 전송이 멈추는 현상이 발생할 수 있습니다. PLPMTUD는 패킷 전달 성공을 관찰하며 크기를 탐색하는 접근법입니다.

단편화된 IP 데이터그램의 조각이 하나라도 유실되면 원래 데이터그램을 재조립하지 못할 수 있습니다. 큰 UDP 데이터그램이나 터널을 운영할 때는 이 비용을 고려해야 합니다.
