---
kind: concept
contentKey: network-http.core.http-cache.if-modified-since
topicContentKey: network-http.core.http-cache
slug: if-modified-since
title: "If-Modified-Since"
summary: "Last-Modified 시각 이후 representation이 변경되었는지를 확인하는 시간 기반 조건부 GET/HEAD를 설명한다."
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
# If-Modified-Since

`If-Modified-Since`는 client가 이전 response에서 받은 `Last-Modified` 값을 request에 보내고, selected representation이 그 시각 이후 변경되었는지 묻는 conditional field다.

GET 또는 HEAD에서 representation이 지정한 시각 이후 변경되지 않았다면 server는 content를 다시 보내지 않고 `304 Not Modified`를 반환할 수 있다. 변경되었다면 현재 representation을 일반 response로 전달한다.

```text
If-Modified-Since: T
        ↓
representation changed after T ?
   no  → 304
   yes → 200 + current representation
```

이 방식은 HTTP-date의 초 단위 정밀도와 clock에 의존하므로 빠르게 반복되는 변경을 정확하게 구분하기에는 한계가 있다. 그래서 더 정확한 opaque validator가 필요하면 ETag와 `If-None-Match`를 사용할 수 있다.

`If-None-Match`와 `If-Modified-Since`가 함께 들어오면 ETag 조건을 우선해 평가한다. **If-Modified-Since는 Last-Modified를 이용해 representation 전송을 줄이는 시간 기반 revalidation mechanism**이며, application의 업무 version을 완전히 대체하는 값은 아니다.
