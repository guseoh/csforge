---
kind: concept
contentKey: network-http.core.http-cache.etag
topicContentKey: network-http.core.http-cache
slug: etag
title: "ETag"
summary: "representation version validator로 ETag를 사용하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# ETag

`ETag`는 selected representation을 식별하는 opaque validator다. server가 내부적으로 row version, hash, build identifier를 사용해 만들 수는 있지만, protocol은 그 생성 방식을 요구하지 않는다. 중요한 것은 같은 선택 조건에서 전달할 representation의 변경을 validator가 일관되게 구분하는 것이다.

strong validator는 representation data가 byte 단위로 동일하다고 판단할 수 있을 때 사용하고, weak validator(`W/` 접두사)는 의미상 충분히 같은 representation을 비교하는 데 사용한다. weak tag를 strong comparison이 필요한 범위에 사용하면 range나 update precondition의 판단이 잘못될 수 있다. `ETag`는 password 검증이나 권한 부여 token이 아니며, `Content-Encoding`처럼 선택 representation을 바꾸는 요소와 `Vary`에 포함된 요청 조건을 계산 범위와 맞춰야 한다.

client는 `If-None-Match`에 ETag를 보내 cache revalidation을 수행하고, `If-Match`에는 수정 전제조건으로 보낼 수 있다. 전자는 GET/HEAD에서 일치하면 304로 body 전송을 줄이는 흐름이고, 후자는 다른 client의 변경을 덮어쓰지 않기 위한 조건부 변경 흐름이다. 두 header 모두 validator의 범위와 요청 대상 resource를 server가 먼저 올바르게 선택한다는 전제가 필요하다.

### Backend 연결

Concept JSON의 ETag를 canonical content version 하나로 만들더라도 응답에 들어가는 locale, query 결과, compression variant가 바뀌면 같은 tag를 재사용할 수 있는지 확인해야 한다. 조건부 update에 stale `If-Match`가 오면 조용히 덮어쓰지 않고 precondition failure 또는 conflict 흐름으로 돌려, cache revalidation과 optimistic concurrency를 같은 기능으로 취급하지 않는다.
