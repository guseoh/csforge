---
kind: concept
contentKey: network-http.core.http-status.redirect-status
topicContentKey: network-http.core.http-status
slug: redirect-status
title: "Redirect Status와 Follow-up Request"
summary: "301·302·303·307·308이 Location과 후속 request method 처리에 미치는 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Redirect Status와 Follow-up Request

3xx response 중 여러 status는 `Location` field로 다른 URI를 알려 주고 user agent가 그 URI로 후속 request를 만들 수 있게 한다. 하지만 redirect code에 따라 새 URI가 일시적인지 영구적인지, 기존 method를 유지해야 하는지가 다르다.

`301 Moved Permanently`와 `308 Permanent Redirect`는 target resource가 새로운 permanent URI로 이동했다는 의미다. `302 Found`와 `307 Temporary Redirect`는 현재는 다른 URI를 사용하지만 원래 target을 앞으로도 계속 사용할 수 있는 temporary redirect다.

### 301·302와 307·308의 중요한 차이는 method 처리다

역사적 호환성 때문에 user agent는 `301` 또는 `302`에 대해 **POST request를 GET으로 바꾸어** redirect를 수행할 수 있다. 반면 `307`과 `308`은 자동 redirect를 수행할 때 original method와 content를 변경하면 안 된다.

`303 See Other`는 원래 operation의 결과를 다른 resource에서 조회하도록 유도하는 redirect다. HTTP user agent는 Location URI에 GET 또는 HEAD 같은 retrieval request를 수행해 간접적인 결과를 가져올 수 있다. POST 처리 뒤 결과 페이지로 이동시키는 패턴에서 자주 의미가 잘 맞는다.

```text
301 / 302 → POST가 GET으로 바뀔 수 있음
303       → 다른 URI를 retrieval request로 조회
307 / 308 → original method와 content 유지
```

redirect는 `기존 request가 새 URI에서 그대로 한 번 더 실행된다`는 단순한 기능이 아니다. **status별 method semantics를 확인해야 후속 request가 같은 effect를 반복하는지, 단순 조회로 전환되는지** 정확히 판단할 수 있다.
