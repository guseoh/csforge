---
kind: concept
contentKey: network-http.core.request-journey.proxy-gateway-path
topicContentKey: network-http.core.request-journey
slug: proxy-gateway-path
title: "Proxy와 Gateway 경유"
summary: "정방향 프록시·리버스 프록시·게이트웨이가 클라이언트와 원본 서버 사이에 별도의 HTTP 홉과 연결을 만드는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 프록시와 게이트웨이 경유

HTTP 중개자는 요청을 받아 직접 응답하거나 다음 서버에 전달할 수 있습니다. 중개자 앞뒤의 네트워크 연결은 서로 다른 주소, TLS 상태, 연결 풀 및 시간 제한을 가질 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "Proxy와 Gateway 경유",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "proxy-gateway-path"
}
```

정방향 프록시는 클라이언트 쪽에서 외부 서비스를 중개하고 역방향 프록시는 서버 쪽 진입점에서 내부 백엔드로 전달합니다. HTTP의 gateway는 역방향 프록시를 나타내는 용어이기도 하며 API 게이트웨이 제품은 경로 선택, 인증, 프로토콜 변환 같은 별도 기능을 제공할 수 있습니다.

### 메시지와 실패 경계

프록시는 설정과 명세에 따라 요청 헤더를 정리하고 백엔드를 선택하며 TLS를 종료하거나 새 TLS 연결을 만들 수 있습니다. 버퍼링, 캐시, 재시도도 별도 정책입니다. 모든 프록시가 이런 기능을 수행하는 것은 아닙니다. CONNECT 터널처럼 HTTP 메시지 자체를 읽지 않고 전달하는 경우도 구분합니다.

앞쪽 연결이 정상이어도 프록시와 백엔드 사이의 연결이 실패할 수 있습니다. 오류 응답을 받았다면 어느 구성 요소가 생성했는지, upstream 요청이 실제로 전달됐는지 확인합니다. 변경 요청을 재시도할 때는 이전 요청의 실제 효과가 불명확할 수 있다는 점도 고려합니다.
