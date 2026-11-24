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
  - url: "https://www.rfc-editor.org/rfc/rfc8200.html#section-8.1"
    title: "RFC 8200 §8.1: IPv6 Upper-Layer Checksums"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 UDP checksum 일반 필수 조건과 제한된 터널 예외를 확인한다."
    displayOrder: 2
---
# UDP 체크섬

UDP 체크섬은 UDP 헤더와 데이터, IP 주소 등이 포함된 의사 헤더를 바탕으로 계산하는 오류 검출 값입니다. 수신 측은 체크섬을 검증해 우발적인 전송 오류를 발견할 수 있습니다. 모든 가능한 오류를 검출하는 것은 아닙니다.

| 관찰 대상 | 체크섬의 역할 |
| --- | --- |
| 도착한 데이터의 우발적 손상 | 검출에 도움 |
| 데이터그램 유실 | 검출하지 못함 |
| 순서 변경·중복 | 판단하지 않음 |
| 송신자 신원·악의적 변조 | 인증하지 않음 |

### IPv4와 IPv6

IPv4 UDP에서는 체크섬 필드 0으로 체크섬 미사용을 나타낼 수 있습니다. 실제 계산값이 0이면 모든 비트가 1인 값으로 전송합니다. IPv6 UDP는 일반적으로 체크섬을 요구하며 특정 터널링 등에 제한적인 예외가 있습니다.

### 보안과 오류 검출은 다릅니다

일반 체크섬은 비밀 키에 의존하는 인증값이 아닙니다. 따라서 통신 상대와 데이터의 악의적 변경을 검증하려면 DTLS, QUIC 등 상위 보안 프로토콜이나 별도 메시지 인증이 필요합니다. 체크섬이 유효해도 전체 메시지 수신과 업무 처리 성공을 보장하지 않습니다.
