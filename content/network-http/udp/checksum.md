---
kind: concept
contentKey: network-http.core.udp.checksum
topicContentKey: network-http.core.udp
slug: checksum
title: "UDP 체크섬"
summary: "UDP 체크섬이 전송 중 비트 오류를 검출하지만 전달 신뢰성·순서 보장·보안 인증까지 제공하지는 않는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP 체크섬

UDP 체크섬(checksum)은 UDP 헤더와 데이터, 그리고 IP 출발지·목적지 등의 정보를 포함한 의사 헤더(pseudo-header)를 바탕으로 계산한다. 수신 측은 같은 방식으로 값을 확인해 **전송 과정에서 비트가 손상된 데이터그램을 발견하는 데 도움**을 받을 수 있다.

여기서 체크섬이 제공하는 것은 오류 **검출**이지 전달 신뢰성 전체가 아니다.

| 질문 | UDP 체크섬이 해결하는가? | 필요한 별도 기능 |
| --- | --- | --- |
| 전송 중 비트가 손상됐는가? | 검출에 도움을 줌 | 손상된 데이터 처리 정책 |
| 데이터그램이 유실됐는가? | 아니오 | ACK·타임아웃·재전송 등 |
| 순서가 바뀌었는가? | 아니오 | 시퀀스 번호·재정렬 규칙 |
| 같은 메시지가 중복됐는가? | 아니오 | 메시지 식별자·중복 제거 |
| 신뢰할 수 있는 상대가 보냈는가? | 아니오 | 인증·암호학적 무결성 보호 |

### 체크섬이 맞는다고 모든 데이터그램을 받았다는 뜻은 아니다

체크섬은 **도착한 데이터그램의 내용이 우연한 전송 오류로 손상됐는지** 확인하는 장치다. 애초에 사라진 데이터그램은 검사할 대상 자체가 없으므로 누락 여부를 알려 주지 못한다. 먼저 보낸 데이터그램이 나중에 도착해도 체크섬은 순서 문제를 판단하지 않는다.

### 체크섬과 보안 무결성은 다르다

공격자가 데이터 내용을 의도적으로 바꾸고 체크섬도 다시 계산하면 UDP 체크섬만으로는 악의적 변조를 구분할 수 없다. 송신자의 신원을 증명하지도 않는다.

따라서 공격자가 내용을 바꾸지 못하게 하거나 상대를 인증해야 한다면 TLS, DTLS, QUIC 같은 인증된 암호화나 상위 프로토콜의 메시지 인증 기능이 필요하다.

### IPv4와 IPv6의 체크섬 규칙도 완전히 같지 않다

IPv4 UDP에는 체크섬을 사용하지 않는 표현이 허용돼 왔지만, IPv6 UDP에서는 일반적인 통신에서 체크섬 사용이 요구된다. 일부 특수한 예외만 보고 `UDP 체크섬은 항상 선택 사항`이라고 일반화하면 안 된다.

핵심은 **UDP 체크섬이 도착한 데이터그램의 우연한 전송 오류를 검출하는 기능이며, 손실 복구·순서·중복 제거·상대 인증을 대신하지 않는다는 점**이다.
