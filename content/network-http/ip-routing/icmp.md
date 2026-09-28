---
kind: concept
contentKey: network-http.core.ip-routing.icmp
topicContentKey: network-http.core.ip-routing
slug: icmp
title: "ICMP 오류·진단 메시지"
summary: "IP 패킷 전달 과정의 오류·진단 정보를 전달하는 ICMP와 ping 결과의 해석 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc792"
    title: "Internet Control Message Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv4 패킷 전달 오류와 Echo·Time Exceeded·Destination Unreachable 등 ICMP 메시지의 역할을 확인한다."
    displayOrder: 1
---
# ICMP 오류·진단 메시지

ICMP(Internet Control Message Protocol)는 IP 패킷 전달 과정에서 생긴 **오류와 제어·진단 정보를 전달하는 네트워크 계층 프로토콜**이다. 목적지에 도달할 수 없음, 패킷 수명 만료, 헤더 문제 같은 상태를 출발지에 알리는 데 사용된다.

대표적으로 다음과 같은 메시지가 있다.

- `Destination Unreachable`: 목적지 또는 필요한 전달 조건에 도달할 수 없는 상황을 알린다.
- `Time Exceeded`: TTL이 만료됐거나 특정 재조립 시간이 초과된 상황을 알릴 수 있다.
- `Echo Request / Echo Reply`: `ping` 같은 도달 가능성 진단에 사용된다.

### ICMP는 TCP·UDP 같은 일반 애플리케이션 전송 프로토콜이 아니다

ICMP는 TCP의 순서 있는 바이트 스트림이나 UDP의 애플리케이션 데이터그램 전달 API를 제공하지 않는다. IP 전달 과정의 상태를 알려 주는 제어 프로토콜이다.

예를 들어 라우터가 TTL 만료로 패킷을 버렸다면 ICMP Time Exceeded를 보낼 수 있다. 이 신호는 `어느 지점에서 패킷 수명이 끝났는가`를 추정하는 데 도움이 되지만 HTTP 요청 결과를 알려 주는 것은 아니다.

### `ping 성공 = 웹 서비스 정상`이 아니다

| 관찰 결과 | 확인에 도움이 되는 것 | 이것만으로 알 수 없는 것 |
| --- | --- | --- |
| ICMP Echo Reply 수신 | Echo 요청·응답이 왕복할 수 있음 | 특정 TCP 포트·TLS·HTTP 상태 |
| TCP 연결 수립 | 해당 IP·포트의 전송 연결이 성립함 | TLS 인증·HTTP 처리 성공 |
| HTTP 응답 수신 | HTTP 계층에서 응답을 받음 | 응답 상태 이상의 업무 결과 |

반대로 ping이 실패했다고 서비스가 반드시 죽은 것도 아니다. 네트워크 정책이 ICMP Echo만 차단하고 TCP 443은 허용할 수 있기 때문이다.

따라서 장애를 볼 때 `DNS 조회 → IP 경로/ICMP → TCP/UDP → TLS → HTTP`를 계층별로 나누어 관찰해야 한다.

ICMP의 핵심은 **IP 전달 자체의 오류·진단 정보를 제공하며, 특정 애플리케이션 서비스의 성공 여부를 대신 판정하는 프로토콜은 아니라는 점**이다.
