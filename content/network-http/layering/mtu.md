---
kind: concept
contentKey: network-http.core.layering.mtu
topicContentKey: network-http.core.layering
slug: mtu
title: "MTU와 패킷 크기"
summary: "링크 MTU가 패킷 크기·fragmentation·전송 실패에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1191"
    title: "Path MTU Discovery"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 Path MTU Discovery와 fragmentation 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8201"
    title: "Path MTU Discovery for IP version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 경로 MTU 탐색과 ICMPv6 Packet Too Big 처리를 확인한다."
    displayOrder: 2
    relationNote: "IPv6에서는 라우터 fragmentation 대신 송신 측이 경로 MTU를 반영하는 규칙을 보충한다."
---
# MTU와 패킷 크기

MTU(Maximum Transmission Unit)는 하나의 링크가 **fragmentation 없이 운반할 수 있는 네트워크 계층 패킷 크기의 상한**이다. 종단 간 경로에는 여러 링크가 있으므로 실제 통신에서는 경로 중 더 작은 MTU 때문에 문제가 생길 수 있다.

MTU는 애플리케이션 메시지의 최대 크기가 아니다. 예를 들어 HTTP 응답 하나가 수 MB여도 TCP는 그 바이트 스트림을 여러 세그먼트와 IP 패킷으로 나누어 전달할 수 있다.

| 상황 | 경로에서 일어날 수 있는 일 | 송신 측의 대응 |
| --- | --- | --- |
| IPv4에서 fragmentation 허용 | 조건에 따라 라우터가 패킷을 fragment로 나눌 수 있음 | 가능하면 경로 MTU에 맞춰 처음부터 더 작은 패킷 사용 |
| IPv4에서 DF 설정 | 너무 큰 패킷을 버리고 오류 정보를 돌려줄 수 있음 | 오류를 바탕으로 패킷 크기를 줄임 |
| IPv6 forwarding 중 패킷이 너무 큼 | 라우터가 fragment하지 않고 Packet Too Big을 보낼 수 있음 | 송신 측이 경로 MTU를 반영해 이후 패킷을 더 작게 구성 |

### 경로 MTU를 넘으면 왜 문제가 되는가

IPv4에서는 조건에 따라 중간 라우터가 패킷을 나눌 수 있지만, DF가 설정되어 있거나 IPv6 forwarding처럼 라우터 fragmentation을 사용하지 않는 경우에는 그대로 전달할 수 없다. 이때 송신 측이 더 작은 패킷을 만들 수 있도록 ICMP 계열의 오류 정보가 사용될 수 있다.

Path MTU Discovery(PMTUD)는 이런 신호를 이용해 종단 경로에서 사용할 수 있는 패킷 크기를 알아내는 방식이다. 그러나 ICMP가 필터링되는 환경에서는 전통적인 PMTUD가 제대로 동작하지 않을 수 있어 PLPMTUD처럼 상위 계층에서 탐색하는 방법도 사용된다.

### Fragmentation은 공짜가 아니다

원래 하나였던 패킷이 여러 fragment로 나뉘면 수신 측에서 다시 조립해야 한다. 일부 fragment만 유실되어도 원래 데이터그램 전체를 전달하지 못할 수 있으므로 특히 UDP에서는 큰 데이터그램을 무작정 보내는 것이 취약할 수 있다.

또한 VPN이나 터널은 바깥에 헤더를 추가하므로 애플리케이션이 체감하는 유효 MTU를 줄일 수 있다. ‘물리 인터페이스 MTU가 1500이니 항상 1500바이트 IP 패킷을 보낼 수 있다’고 단정하면 안 되는 이유다.

MTU의 핵심은 **애플리케이션 메시지 크기와 별개의 링크·네트워크 계층 제한이며, 경로 MTU를 넘는 패킷은 fragmentation이나 전달 실패, 추가 탐색 비용을 만들 수 있다는 것**이다.
