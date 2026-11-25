---
kind: concept
contentKey: network-http.core.udp.udp-datagram
topicContentKey: network-http.core.udp
slug: udp-datagram
title: "UDP 데이터그램과 메시지 경계"
summary: "UDP가 데이터그램 단위의 경계를 보존해 전달하지만 도착·순서·중복 제거까지 보장하지 않는다는 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8085"
    title: "UDP Usage Guidelines"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP를 사용하는 application의 혼잡 제어·메시지 크기·신뢰성 설계 지침을 확인한다."
    displayOrder: 2
    relationNote: "경로 MTU를 넘는 UDP 데이터그램과 IP 단편화를 피하기 위한 지침을 보충한다."
---
# UDP 데이터그램과 메시지 경계

UDP는 출발지·목적지 포트와 길이, 체크섬, 데이터를 포함하는 데이터그램을 전달합니다. 정상적으로 전달된 데이터그램은 TCP처럼 연속 바이트 스트림으로 합쳐지지 않습니다.

```text
전송: [A] [B]
수신 예: [A] [B], [B] [A], [B]만 도착
```

데이터그램 경계와 신뢰성은 별개입니다. 수신 API의 버퍼가 너무 작으면 구현과 API 계약에 따라 데이터그램 일부가 잘릴 수 있으므로 경계 보존이 모든 바이트의 무조건적인 애플리케이션 수신을 뜻하지 않습니다.

### 크기와 경로 MTU

큰 UDP 데이터그램은 IP 단편화가 필요할 수 있습니다. IPv4에서는 조건에 따라 단편화가 가능하며 IPv6 라우터는 단편화하지 않습니다. 조각 하나만 유실되어도 전체 데이터그램 재조립이 실패할 수 있습니다. 따라서 경로 MTU에 맞는 크기를 고려하고, 논리 메시지를 여러 데이터그램으로 나누는 경우 상위 프로토콜의 식별·재조립 규칙을 정의합니다.

UDP의 비연결성은 TCP와 같은 연결 수립과 복구 상태가 없다는 뜻입니다. OS는 소켓과 버퍼, 바인딩 상태를 관리하고 애플리케이션도 별도의 통신 상태를 유지할 수 있습니다.
