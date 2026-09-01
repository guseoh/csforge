---
kind: concept
contentKey: network-http.core.http-cache.if-none-match
topicContentKey: network-http.core.http-cache
slug: if-none-match
title: "If-None-Match"
summary: "ETag 조건부 요청이 304 또는 새 representation으로 이어지는 흐름을 설명한다."
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
# If-None-Match

client는 저장한 representation의 ETag를 `If-None-Match`에 넣어 현재 선택된 representation과 일치하는지 묻는다. 값은 하나의 tag가 아니라 여러 tag 목록일 수 있고 `*`는 어떤 current representation이 존재하는지를 조건으로 삼는다. server는 요청 대상과 현재 representation을 선택한 뒤 validator를 비교해야 하며, 단순히 header 문자열을 애플리케이션 cache key와 비교하는 것으로 대체할 수 없다.

GET 또는 HEAD에서 조건이 일치하면 server는 보통 304를 반환해 client가 보관한 body를 재사용하게 한다. 그 조건이 일치하지 않으면 일반 response를 생성한다. GET/HEAD가 아닌 method에서 일치하면 304가 아니라 412 Precondition Failed 흐름이 될 수 있으므로, `If-None-Match`를 모든 method에 “cache hit면 304”로 구현해서는 안 된다. 이 header의 cache 비교에는 weak comparison이 쓰일 수 있지만, tag의 따옴표·`W/` 표기·목록 parsing을 보존해야 한다.

`If-None-Match`와 `If-Modified-Since`가 함께 오면 ETag 조건이 우선되고 뒤의 날짜 조건을 독립적으로 적용하지 않는 규칙을 따른다. 또한 validator가 일치하더라도 resource 존재 여부와 authorization, tenant scope를 먼저 올바르게 확인해야 한다. 304 또는 412를 반환하는 것은 body를 생략하는 최적화나 동시성 전제조건의 결과이지 권한 검사를 우회하는 방법이 아니다.

### Backend 연결

목록 query parameter, locale, authorization·tenant context가 response 선택에 영향을 주면 ETag와 cache variation이 그 경계를 함께 반영해야 한다. 304 response에 필요한 cache metadata가 누락되지 않는지, ETag가 일치하지만 권한이 바뀐 사용자의 resource를 재사용하지 않는지 endpoint와 proxy를 함께 테스트한다.
