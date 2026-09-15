---
kind: concept
contentKey: network-http.core.http-cache.etag
topicContentKey: network-http.core.http-cache
slug: etag
title: "ETag"
summary: "selected representation을 비교하기 위한 opaque entity tag와 strong·weak validator의 차이를 설명한다."
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

`ETag`는 selected representation을 비교하기 위해 server가 제공하는 opaque validator다. Tag가 어떻게 생성되는지는 HTTP가 정하지 않는다. Hash, version number나 build identifier를 사용할 수 있지만 client는 내부 의미를 해석하지 않고 validator 값으로 비교한다.

Representation이 바뀌면 validator도 그 변경을 구분할 수 있어야 한다. Strong ETag는 representation data가 동일하다는 강한 비교에 사용할 수 있고, `W/`가 붙은 weak ETag는 의미상 동등하지만 byte-for-byte 동일하다고 말하기 어려운 representation을 표현할 수 있다.

```text
ETag: "v7"
ETag: W/"v7"
```

Client는 ETag를 `If-None-Match`에 넣어 cached representation이 여전히 current한지 확인할 수 있고, `If-Match`를 사용해 state-changing request의 precondition으로 사용할 수도 있다. 두 경우 모두 같은 ETag라는 도구를 사용하지만 cache revalidation과 optimistic update condition은 목적이 다르다.

ETag는 authorization token이나 resource의 영구 ID가 아니다. **현재 선택된 representation을 비교하기 위한 HTTP validator**라는 역할에 집중해서 이해해야 한다.
