---
kind: concept
contentKey: network-http.core.udp.checksum
topicContentKey: network-http.core.udp
slug: checksum
title: "UDP Checksum과 오류 검출"
summary: "UDP checksum이 전송 중 오류를 검출하지만 delivery reliability나 security를 제공하지 않는 경계를 설명한다."
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
# UDP Checksum과 오류 검출

UDP checksum은 UDP header와 payload, 그리고 IP source·destination 등의 일부 정보를 포함한 pseudo-header를 바탕으로 계산한다. 수신자는 같은 계산을 수행해 값이 맞지 않으면 전송 중 data가 손상되었을 가능성을 발견할 수 있다.

이 기능의 목적은 **bit corruption 검출**이다. checksum이 맞는다고 datagram이 반드시 제때 도착했다거나, 중복이 아니거나, 올바른 순서라는 뜻은 아니다. 손실된 datagram을 다시 보내는 기능도 없으므로 checksum은 reliability와 별개의 메커니즘이다.

### Checksum과 보안 무결성은 다르다

UDP checksum은 공격자가 의도적으로 payload를 바꾸는 것을 막기 위한 cryptographic authentication이 아니다. 내용을 변경한 뒤 checksum까지 다시 계산할 수 있으므로 송신자의 신원이나 악의적 변조 여부를 증명하지 못한다. 그런 보장이 필요하면 상위 protocol에서 인증·암호화 메커니즘을 사용해야 한다.

IPv4 UDP에서는 checksum을 사용하지 않는 표현이 허용되지만, IPv6 UDP에서는 일반적인 통신에서 checksum 사용이 요구된다. 세부 예외가 존재할 수 있으므로 중요한 것은 `UDP checksum은 선택적인 부가 신뢰성`이라고 외우는 것이 아니라, **해당 IP version과 protocol 규칙에 따라 오류 검출 경계가 달라질 수 있다**는 점이다.

결국 checksum은 `받은 datagram이 전송 중 손상되었는가`를 검출하는 데 도움을 주지만, `받아야 할 모든 datagram을 받았는가`나 `이 message를 신뢰해도 되는가`까지 답하지 않는다.
