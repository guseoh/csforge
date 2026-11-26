---
kind: concept
contentKey: network-http.core.http-state-intermediary.reverse-proxy
topicContentKey: network-http.core.http-state-intermediary
slug: reverse-proxy
title: "역방향 프록시"
summary: "역방향 프록시가 공개 요청을 받아 백엔드로 새 요청을 전달하며, 두 연결 구간의 전송·TLS·시간 제한이 독립적임을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 역방향 프록시

역방향 프록시는 원본 서버 앞에서 클라이언트 요청을 받아 적절한 백엔드로 전달하는 서버 측 중개자입니다. 공개 진입점을 제공하고 뒤쪽 서버를 직접 노출하지 않는 구조에 활용할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "역방향 프록시",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "reverse-proxy"
}
```

프록시는 호스트·경로를 기준으로 백엔드를 선택하거나 TLS 종료, 로드 밸런싱, 캐시 등의 기능을 제공할 수 있습니다. 이러한 기능이 모든 역방향 프록시에 필수인 것은 아닙니다.

### 연결과 장애의 경계

클라이언트와 프록시, 프록시와 백엔드의 연결은 상대 주소, 프로토콜, TLS 상태 및 타임아웃 정책이 다를 수 있습니다. 백엔드 연결이 자동으로 암호화되는 것도 아닙니다.

프록시가 상위 서버 요청을 재시도할 때 최초 요청이 이미 적용되었을 수 있습니다. 요청 메서드와 업무 효과를 고려해 재시도 조건을 설계합니다. 원래 클라이언트의 스킴과 주소를 전달하는 헤더를 사용할 때는 신뢰된 프록시의 재작성 정책과 직접 접근 차단을 확인해야 합니다.
