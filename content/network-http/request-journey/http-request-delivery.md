---
kind: concept
contentKey: network-http.core.request-journey.http-request-delivery
topicContentKey: network-http.core.request-journey
slug: http-request-delivery
title: "HTTP 요청의 전달 경로"
summary: "완성된 HTTP 요청이 여러 중개자를 거쳐 원본 서버로 전달되거나, 캐시·게이트웨이 같은 중간 지점에서 직접 처리될 수 있는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP 요청의 전달 경로

클라이언트가 HTTP 요청을 보낼 때 원본 서버에 직접 연결할 수도 있고 CDN, 프록시, 로드 밸런서 등을 경유할 수도 있습니다. 사용자 관점에서는 하나의 요청이어도 실제로는 별개의 HTTP 교환과 전송 연결이 이어질 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "HTTP 요청의 전달 경로",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "http-request-delivery"
}
```

중개자가 HTTP 메시지를 처리하는 경우 다음 서버와 별도 연결을 사용하며 요청 대상, TLS 상태, 헤더, 타임아웃 및 재시도 정책이 달라질 수 있습니다. 연결에만 적용되는 필드는 다음 홉에 그대로 전달하면 안 되며 버전별 규칙을 적용합니다.

### 어느 구성 요소가 응답했는가

CDN에 재사용 가능한 저장 응답이 있으면 원본 서버까지 요청이 전달되지 않을 수 있습니다. 중개자가 접근을 거부하거나 상위 서버 통신 실패를 해석해 502 또는 504를 생성할 수도 있습니다. HTTP 응답을 받았다고 원본 애플리케이션이 반드시 실행된 것은 아닙니다.

원래 주소나 스킴을 전달하는 Forwarded 또는 X-Forwarded 계열 값은 프록시의 재작성 정책과 실제 신뢰 경계를 확인해야 합니다. 장애 조사에서는 요청 ID, 중개자 로그, 백엔드 연결 상태 및 애플리케이션 로그를 연결해 응답을 생성한 홉을 찾습니다.
