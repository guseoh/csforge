---
kind: concept
contentKey: network-http.core.tls.tls-termination
topicContentKey: network-http.core.tls
slug: tls-termination
title: "TLS 종료(Termination) 경계"
summary: "리버스 프록시에서 TLS를 종료하면 클라이언트-프록시와 프록시-백엔드가 서로 다른 연결과 신뢰 경계가 되는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
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
  - url: "https://www.rfc-editor.org/rfc/rfc7239.html#section-8.1"
    title: "RFC 7239 §8.1: Forwarded Header Security"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS 종료 프록시에서 전달된 요청 메타데이터 신뢰 경계를 확인한다."
    displayOrder: 3
---
# TLS 종료(Termination) 경계

리버스 프록시나 로드 밸런서가 클라이언트의 TLS 연결을 종료하면 그 장비는 암호문을 복호화하여 HTTP 메시지를 처리할 수 있습니다. 이후 백엔드에는 별도의 연결로 요청을 전달합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "TLS 종료(Termination) 경계",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "tls-termination"
}
```

### 두 연결의 독립성

브라우저와 프록시의 TLS 연결, 프록시와 백엔드의 연결은 같은 암호 상태를 공유하지 않습니다. 후자가 평문 HTTP라면 TLS 보호는 프록시에서 끝납니다. 다시 TLS를 구성하더라도 새 연결의 인증서, 서비스 식별자 및 트래픽 키를 별도로 검증·관리해야 합니다.

TLS를 종료하지 않고 하위 계층에서 암호화 트래픽을 전달하는 passthrough와도 구분합니다.

### 전달 메타데이터의 신뢰

프록시가 복호화한 HTTP 요청을 기반으로 Forwarded 또는 X-Forwarded 계열 헤더를 재작성할 수 있습니다. 이러한 값은 원래 클라이언트의 TLS 연결이 백엔드까지 직접 보존한 정보가 아닙니다. 백엔드는 허용된 프록시에서 들어온 연결과 해당 프록시의 헤더 정리 정책을 확인해야 합니다.

외부 HTTPS 접속 성공만으로 CDN, 로드 밸런서, 앱 서버 사이의 모든 홉이 보호된다고 판단하지 않습니다. 각 구간의 연결, 인증 및 접근 정책을 조사합니다.
