---
kind: concept
contentKey: network-http.core.tls.tls-purpose
topicContentKey: network-http.core.tls
slug: tls-purpose
title: "TLS가 제공하는 보안"
summary: "TLS가 두 통신 종단점 사이에서 기밀성·무결성·상대 인증을 제공하고, 그 보호가 애플리케이션 권한과 업무 성공까지 확장되지는 않는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "RFC 8446은 RFC 9846(2026년)에 의해 대체되었다. TLS 1.3 기존 모델의 역사적 설명 근거로 읽는다."
  - url: "https://www.rfc-editor.org/rfc/rfc9846"
    title: "RFC 9846: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현행 TLS 1.3 표준의 핸드셰이크·키·보안 요구사항을 확인한다."
    displayOrder: 2
    relationNote: "RFC 9846 §1.2의 8446 대비 변경 요약과 현재 개념에 해당하는 본문 절을 읽는다."
---
# TLS가 제공하는 보안

네트워크를 평문으로 통신하면 중간 경로에서 데이터를 읽거나 변조할 위험이 있습니다. TLS는 두 종단점 사이의 보호 채널을 만들고 일반적인 인증서 기반 HTTPS에서 기밀성, 무결성 및 서버 인증을 제공합니다.

| 목표 | 보호 범위 |
| --- | --- |
| 기밀성 | 보호된 애플리케이션 데이터의 내용 |
| 무결성 | 전송 중 보호 데이터의 변조 검증 |
| 서버 인증 | 의도한 서비스와 통신하는지 확인 |

TLS로 모든 메타데이터가 숨겨지는 것은 아닙니다. IP 주소와 전송량 등은 관찰될 수 있습니다. 클라이언트 인증이 필요한 경우에는 별도의 인증 방식 또는 상호 TLS 등의 구성을 고려할 수 있습니다.

### TLS 종단점의 경계

브라우저와 리버스 프록시가 TLS 연결을 맺고 프록시가 백엔드에 새로운 요청을 보내면 첫 TLS 연결의 보호는 프록시에서 끝납니다. 다음 구간을 보호하려면 별도 보안 연결이 필요합니다.

서버 인증과 애플리케이션 사용자 인증·인가도 다릅니다. HTTPS가 정상이어도 사용자가 특정 주문을 조회할 권한이 있는지 판단하고 저장 데이터와 로그를 보호하는 것은 별도의 책임입니다.
