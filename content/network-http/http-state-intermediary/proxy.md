---
kind: concept
contentKey: network-http.core.http-state-intermediary.proxy
topicContentKey: network-http.core.http-state-intermediary
slug: proxy
title: "정방향 프록시"
summary: "클라이언트가 선택한 정방향 프록시가 외부 목적지로 요청을 대신 전달하고, 각 연결 구간과 신뢰 경계를 나누는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 정방향 프록시

정방향 프록시는 클라이언트가 외부 원본 서버에 접근할 때 선택하는 중개자입니다. 프록시는 원본을 향한 별도 연결로 요청을 전달하거나 적용 가능한 정책에 따라 직접 응답할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "정방향 프록시",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "proxy"
}
```

외부 접근 정책, 감사 로그 및 캐시 등은 제품이나 운영 구성에 따라 제공할 수 있는 기능입니다. 정방향 프록시의 본질은 클라이언트 쪽에서 외부 통신을 중개하는 배치입니다.

### HTTPS 터널

클라이언트는 CONNECT로 대상 서버와 통신할 터널을 요청할 수 있습니다. 프록시가 암호화된 바이트를 전달하기만 한다면 TLS를 종료하지 않고 HTTP 내용을 자동으로 읽을 수는 없습니다. 프록시가 TLS를 별도로 종료하여 내용을 처리하는 구성은 인증 및 신뢰 경계가 달라집니다.

원본 서버는 연결 상대를 프록시로 관찰할 수 있습니다. 프록시의 존재만으로 익명성이나 사용자 인증을 보장하지 않습니다.
