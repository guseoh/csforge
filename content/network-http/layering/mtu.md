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

MTU(Maximum Transmission Unit)는 **하나의 링크가 한 번에 운반할 수 있는 네트워크 계층 패킷 크기의 상한**과 관련된 값이다. 종단 간 경로에는 여러 링크가 있으므로 실제 전송에서는 그중 더 작은 MTU가 패킷 크기를 제한할 수 있다.

MTU는 애플리케이션 메시지의 최대 크기가 아니다. HTTP 응답이 수 MB여도 TCP는 바이트 스트림을 여러 세그먼트와 IP 패킷으로 나누어 전달할 수 있다.

| 상황 | 네트워크에서 일어날 수 있는 일 | 송신 측에서 필요한 대응 |
| --- | --- | --- |
| IPv4에서 단편화가 가능한 경우 | 조건에 따라 중간 라우터가 패킷을 여러 조각으로 나눌 수 있음 | 가능하면 경로에 맞는 패킷 크기 사용 |
| IPv4에서 DF가 설정된 큰 패킷 | 전달할 수 없으면 패킷을 버리고 관련 ICMP 오류를 보낼 수 있음 | 경로 MTU에 맞춰 이후 패킷 크기 감소 |
| IPv6에서 다음 링크 MTU보다 큰 패킷 | 중간 라우터는 단편화하지 않고 ICMPv6 Packet Too Big을 보냄 | 송신 측이 더 작은 패킷을 구성 |

### 경로 MTU(Path MTU)는 종단 간 경로에서 사용할 수 있는 크기를 제한한다

출발지 인터페이스 MTU가 1500이라고 해서 모든 경로에서 항상 같은 크기를 사용할 수 있는 것은 아니다. VPN·터널이 바깥쪽 헤더를 추가하거나 중간 링크의 MTU가 더 작으면 실질적으로 사용할 수 있는 크기가 줄어든다.

PMTUD(Path MTU Discovery)는 ICMP 계열 오류를 이용해 경로에서 사용할 수 있는 패킷 크기를 조정하는 방식이다. 그런데 필요한 ICMP 메시지가 중간에서 차단되면 송신 측이 패킷 크기를 줄여야 한다는 사실을 알기 어려워질 수 있다. 이런 환경에서는 PLPMTUD처럼 상위 전송 계층에서 실제 전달 성공을 관찰하며 크기를 탐색하는 접근도 사용된다.

### 단편화는 손실 비용을 키울 수 있다

원래 하나였던 IP 데이터그램이 여러 조각으로 나뉘면 수신 측이 다시 조립해야 한다. 조각 하나만 사라져도 원래 데이터그램을 완성하지 못할 수 있어, 특히 UDP에서 매우 큰 데이터그램을 무작정 보내는 것은 취약하다.

TCP는 애플리케이션 바이트 스트림을 여러 세그먼트로 나누므로 `HTTP 메시지가 MTU보다 크다`는 사실 자체가 문제가 아니다. 핵심은 **IP 계층에 실제로 만들어지는 패킷이 경로에서 전달 가능한 크기에 맞는가**다.

MTU의 핵심은 **애플리케이션 메시지 크기와 별개의 링크·네트워크 계층 제한이며, 경로 MTU를 넘는 패킷은 단편화·오류·추가 탐색 비용을 만들 수 있다는 점**이다.
