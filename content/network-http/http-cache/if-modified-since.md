---
kind: concept
contentKey: network-http.core.http-cache.if-modified-since
topicContentKey: network-http.core.http-cache
slug: if-modified-since
title: "If-Modified-Since 조건부 요청"
summary: "Last-Modified 시각 이후 선택된 표현이 변경되었는지를 확인하는 시간 기반 조건부 GET/HEAD를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# If-Modified-Since 조건부 요청

If-Modified-Since는 이전에 받은 Last-Modified 날짜를 기준으로 선택된 표현이 변경되었는지 확인하는 필드입니다. 일반적으로 GET과 HEAD에 사용합니다.

```http
If-Modified-Since: Tue, 15 Sep 2026 09:30:00 GMT
```

정상 요청의 전제조건 평가에서 표현의 수정 시각이 이 날짜보다 늦지 않다면 304를 반환할 수 있습니다. 조건이 참이면 일반 요청 처리로 넘어가며 반드시 200이 된다는 뜻은 아닙니다. 유효하지 않은 날짜나 GET·HEAD 이외의 메서드 등 명세가 정한 경우에는 이 필드를 무시합니다.

### ETag와의 우선순위

If-None-Match가 함께 있으면 If-Modified-Since는 무시합니다. ETag를 사용하면 초 단위 날짜로 구분하기 어려운 변경을 식별할 수 있습니다. Last-Modified의 정확성은 표현 변경 시각과 서버 시계에 의존합니다.

이 필드는 HTTP 표현 재검증에 관한 것이며 DB 동시 수정 보호나 업무 버전을 자동으로 보장하지 않습니다.
