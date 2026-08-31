---
kind: concept
contentKey: network-http.core.http-cache.if-modified-since
topicContentKey: network-http.core.http-cache
slug: if-modified-since
title: "If-Modified-Since"
summary: "Last-Modified 조건부 요청과 시간 비교의 한계를 설명한다."
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

If-Modified-Since는 client가 기억한 Last-Modified 시각 이후 representation이 바뀌었는지 server에 묻는다. 변경이 없으면 304, 변경됐으면 보통 200과 새 content를 반환한다.

초 단위 resolution, clock skew, 여러 origin의 서로 다른 clock 때문에 ETag가 더 정확한 경우가 많다. server는 header가 없는 일반 GET과 conditional GET의 authorization·cache policy를 동일하게 적용한다.

### Backend 연결

파일과 DB content를 함께 제공할 때 수정 시각의 source를 하나로 정한다. conditional response가 permission check를 우회하지 않도록 validation 순서를 고정한다.
