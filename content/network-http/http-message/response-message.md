---
kind: concept
contentKey: network-http.core.http-message.response-message
topicContentKey: network-http.core.http-message
slug: response-message
title: "HTTP 응답 메시지"
summary: "HTTP 응답에서 상태 코드·필드·선택적인 콘텐츠가 요청 처리 결과와 표현 데이터를 어떻게 전달하는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP 응답 메시지

HTTP 응답은 서버나 중개자가 요청에 대해 반환하는 메시지입니다. 상태 코드, 필드, 필요한 경우의 콘텐츠는 서로 다른 역할을 가집니다.

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 2

[]
```

상태 코드는 HTTP 결과를 나타내며 필드는 표현 형식, 캐시 정책, 위치 등을 설명합니다. 콘텐츠에는 선택한 표현이나 오류 상세가 포함될 수 있습니다. 204와 304에는 콘텐츠가 없으며 HEAD 응답도 콘텐츠를 전송하지 않습니다.

### 응답 완전성과 업무 성공

정상적인 GET 응답에서 Content-Length: 120이 적용되는데 실제로 0바이트만 받은 뒤 연결이 닫혔다면 불완전한 HTTP 응답입니다. 200 상태 코드가 메시지의 전체 수신을 보증하지는 않습니다.

202는 작업 처리 요청을 수락했지만 처리가 아직 완료되지 않은 상태입니다. 예를 들어 보고서 생성은 작업 상태 조회 URI를 통해 이후 성공 여부를 확인할 수 있습니다.

### 응답을 만든 홉

CDN이 저장 응답을 반환하거나 프록시가 상위 서버 오류를 바탕으로 응답할 수 있습니다. 상태 코드, 요청 ID, 캐시 상태 및 각 홉의 로그를 연결해야 원본 앱에서 실제로 요청을 처리했는지 판단할 수 있습니다.
