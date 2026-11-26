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

ICMP는 IP 전달에서 발생한 오류와 제어 정보를 알리는 프로토콜입니다. TCP나 UDP처럼 일반적인 애플리케이션 전송 서비스로 이해하면 안 됩니다.

| 메시지 | 의미 |
| --- | --- |
| Destination Unreachable | 목적지 또는 전달 조건에 도달할 수 없음 |
| Time Exceeded | 수명 제한 만료 또는 재조립 시간 초과 등 |
| Echo Request / Reply | 왕복 가능성 진단 |
| ICMPv6 Packet Too Big | 다음 링크에서 허용하는 크기를 초과 |

ICMPv6는 IPv6 이웃 탐색 등에도 사용됩니다. 경로 MTU 조정에 필요한 오류까지 무조건 차단하면 큰 패킷의 전달 문제를 악화시킬 수 있습니다.

### ping과 서비스 상태는 다릅니다

Echo Reply를 받았다면 해당 Echo 요청과 응답이 왕복한 것입니다. TCP 443 연결, TLS 검증, HTTP 처리의 성공까지 의미하지 않습니다. 반대로 Echo를 차단한 네트워크에서도 HTTPS가 정상일 수 있습니다.

장애 분석은 DNS 결과, 실제 목적지와 경로, 전송 연결, TLS 및 HTTP 응답을 별도로 관찰해야 합니다. ICMP 응답이 없다는 사실만으로 특정 라우터나 서버가 정지했다고 확정하지 않습니다.
