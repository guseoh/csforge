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

`If-Modified-Since`는 client가 기억한 `Last-Modified` 날짜 이후 selected representation이 바뀌었는지 묻는 조건부 요청 header다. GET 또는 HEAD에서 server가 representation의 변경 시각이 이 날짜보다 늦지 않다고 판단하면 body 없이 304를 반환할 수 있고, 변경되었다면 보통 200과 새 representation을 반환한다. 날짜가 없거나 유효하지 않으면 일반 요청처럼 처리한다.

HTTP-date의 초 단위 정밀도와 origin clock의 조정 때문에 짧은 시간 안의 변경을 놓칠 수 있다. client 시계가 아니라 server가 선택한 representation의 변경 시각과 protocol 비교 규칙을 기준으로 판단해야 하며, `If-None-Match`가 함께 있으면 ETag 조건이 우선되어 이 날짜를 별도로 적용하지 않는다. 따라서 If-Modified-Since는 ETag를 대신하는 만능 version number가 아니라, 정확한 opaque validator가 없을 때 bandwidth를 줄이는 보조 조건으로 이해한다.

conditional header가 있다는 이유로 server가 resource 선택, authorization, tenant 경계를 생략해서는 안 된다. 권한과 representation을 확인한 뒤 조건을 평가해야 하며, cache가 304를 받은 경우에는 이미 보관한 body가 있어야 재사용할 수 있다. body가 없는 client나 cache entry가 사라진 client는 조건부 요청에 의존하지 말고 일반 GET으로 다시 받아야 한다.

### Backend 연결

파일과 DB content를 함께 제공할 때 수정 시각의 source를 하나로 정하고, export 과정에서 mtime을 임의로 갱신해 false change를 만들지 않는다. conditional response가 permission check를 우회하지 않도록 resource·권한 선택 후 validator를 평가하는 순서를 고정하며, 초 단위 collision이 중요한 content에는 ETag를 우선 제공한다.
