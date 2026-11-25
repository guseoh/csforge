---
kind: concept
contentKey: network-http.core.http-versions.http11-persistent
topicContentKey: network-http.core.http-versions
slug: http11-persistent
title: "HTTP/1.1 지속 연결"
summary: "HTTP/1.1에서 하나의 TCP 연결을 여러 요청·응답 교환에 재사용하는 기본 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 구문, 프레이밍과 연결 재사용 규칙을 확인한다."
    displayOrder: 1
---
# HTTP/1.1 지속 연결

HTTP/1.1은 기본적으로 하나의 TCP 연결에서 여러 요청·응답을 교환할 수 있습니다. 매번 연결을 수립하고 종료하는 비용을 줄일 수 있지만, 연결 수명이 무제한이라는 뜻은 아닙니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "HTTP/1.1 지속 연결",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "http11-persistent"
}
```

연결을 재사용하려면 각 메시지의 끝을 정확히 판단해야 합니다. 메시지 길이가 연결 종료에 의존한다면 같은 연결로 후속 메시지를 전달할 수 없습니다. Content-Length, chunked 전송 코딩, 메서드 및 상태 코드별 프레이밍 규칙을 적용해야 합니다.

### Host와 연결 종료

```http
GET /posts HTTP/1.1
Host: example.com
```

RFC 9112 §3.2에 따르면 HTTP/1.1 요청에는 Host가 필요하며, 누락되거나 두 줄 이상이거나 값이 유효하지 않으면 서버는 400을 반환해야 합니다. Host는 실제 연결 주소와 별개의 논리적 대상 정보입니다.

Connection: close로 종료 의사를 알릴 수 있으며 서버와 클라이언트는 자원 및 유휴 시간 정책에 따라 연결을 닫을 수 있습니다. 커넥션 풀에서는 이전 응답의 콘텐츠 소비 여부와 연결의 유효성을 관리해야 합니다.

HTTP/1.1의 지속 연결은 HTTP/2처럼 여러 독립 스트림을 교차 전송하는 방식과는 다릅니다.
