---
kind: concept
contentKey: network-http.core.http-status.redirect-status
topicContentKey: network-http.core.http-status
slug: redirect-status
title: "리다이렉션 상태 코드"
summary: "301·302·303·307·308 상태 코드가 Location과 이어지는 요청의 메서드 처리에 미치는 차이를 설명한다."
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
# 리다이렉션 상태 코드

3xx 응답 중 여러 상태 코드는 `Location` 필드로 다른 URI를 알려 사용자 에이전트가 그 URI로 후속 요청을 보낼 수 있게 한다. 다만 상태 코드에 따라 새 URI가 일시적인지 영구적인지, 기존 메서드를 유지해야 하는지가 다르다.

`301 Moved Permanently`와 `308 Permanent Redirect`는 대상 리소스가 새 영구 URI로 이동했음을 나타낸다. `302 Found`와 `307 Temporary Redirect`는 현재는 다른 URI를 사용하지만 원래 대상을 앞으로 다시 사용할 수 있는 임시 리다이렉션이다.

### 301·302와 307·308은 메서드 처리에서 다르다

과거 동작과의 호환성 때문에 사용자 에이전트는 `301`이나 `302`를 받으면 **POST 요청을 GET으로 바꾸어** 리다이렉션할 수 있다. 반면 `307`과 `308`은 자동으로 리다이렉션할 때 원래 메서드와 콘텐츠를 변경하면 안 된다.

`303 See Other`는 원래 작업의 결과를 다른 리소스에서 조회하도록 유도한다. HTTP 사용자 에이전트는 `Location` URI에 GET이나 HEAD 같은 조회 요청을 보내 간접 결과를 가져올 수 있다. POST 처리 뒤 결과 페이지로 이동시키는 경우에 자주 적합하다.

```text
301 / 302 → POST가 GET으로 바뀔 수 있음
303       → 다른 URI를 GET·HEAD 같은 조회 요청으로 확인
307 / 308 → 원래 메서드와 콘텐츠 유지
```

리다이렉션은 `기존 요청을 새 URI에서 그대로 한 번 더 실행하는 기능`이 아니다. **상태 코드별 메서드 의미를 확인해야 후속 요청이 같은 효과를 반복하는지, 단순 조회로 바뀌는지** 판단할 수 있다.
