---
kind: concept
contentKey: network-http.core.http-versions.keep-alive
topicContentKey: network-http.core.http-versions
slug: keep-alive
title: "지속 연결과 Keep-Alive"
summary: "HTTP 연결 재사용, HTTP/1.x Keep-Alive 신호와 TCP keepalive 탐지 패킷(probe)을 서로 다른 개념으로 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 구문, 프레이밍과 연결 재사용 규칙을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9113.html#section-8.2.2"
    title: "RFC 9113 Section 8.2.2: Connection-Specific Header Fields"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2에서 Connection·Keep-Alive 같은 connection-specific field가 금지되는 규칙을 확인한다."
    displayOrder: 2
  - url: "https://www.rfc-editor.org/rfc/rfc9114.html#section-4.2"
    title: "RFC 9114 Section 4.2: HTTP Fields"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/3에서 connection-specific field가 금지되는 규칙을 확인한다."
    displayOrder: 3
---
# 지속 연결과 Keep-Alive

HTTP 지속 연결은 하나의 전송 연결을 여러 HTTP 교환에서 재사용하는 방식입니다. HTTP/1.0의 Keep-Alive 확장과 HTTP/1.1의 기본 지속 연결은 같은 규칙이 아닙니다.

HTTP/1.1에서는 Connection: close로 연결 종료 의사를 나타낼 수 있습니다. HTTP/2·3에서는 Connection 및 Keep-Alive 같은 연결별 필드를 사용하여 지속성을 협상하지 않습니다.

| 구분 | 책임 |
| --- | --- |
| HTTP 지속 연결 | 여러 HTTP 요청에서 연결 재사용 |
| TCP keepalive | 오래 유휴한 상대 TCP의 도달 가능성 탐지 |
| 커넥션 풀 idle timeout | 유휴 연결 정리 및 재사용 정책 |

TCP keepalive는 애플리케이션 요청의 성공을 확인하는 하트비트가 아닙니다. 연결 재사용도 상대 서버, 중개자, NAT가 연결을 언제까지 유지할지 보장하지 않습니다.

장시간 유휴 연결의 오류를 조사할 때 각 홉의 시간 제한, 연결 풀의 검사 및 정리 정책, 필요에 따른 keepalive 설정을 구분합니다.
