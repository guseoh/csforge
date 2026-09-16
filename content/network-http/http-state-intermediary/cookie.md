---
kind: concept
contentKey: network-http.core.http-state-intermediary.cookie
topicContentKey: network-http.core.http-state-intermediary
slug: cookie
title: "Cookie"
summary: "user agent가 저장한 cookie를 조건에 맞는 HTTP 요청에 다시 보내는 state 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6265"
    title: "HTTP State Management Mechanism"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP cookie state와 전송 scope를 확인한다."
    displayOrder: 1
---
# Cookie

HTTP 자체의 request와 response는 이전 요청의 application state를 자동으로 기억하지 않는다. Cookie는 user agent가 server의 지시에 따라 작은 name/value 상태를 저장하고, 이후 요청이 정해진 조건에 맞을 때 그 값을 `Cookie` header로 다시 보내게 하는 state management mechanism이다.

보통 server는 session identifier 같은 값을 cookie로 전달하고, 이후 요청에서 돌아온 identifier를 이용해 server-side state를 찾을 수 있다. 하지만 cookie가 반드시 session ID일 필요는 없다. 어떤 의미를 부여하고 값을 어떻게 검증할지는 application contract가 정한다.

```text
response: Set-Cookie
        ↓
user agent가 저장
        ↓
조건에 맞는 다음 request
        ↓
request: Cookie
```

cookie의 전송 여부는 host/domain, path, secure channel, site context와 저장 lifetime 같은 scope 규칙에 영향을 받는다. 또한 `Cookie` request field에는 저장 시 사용한 모든 attribute가 다시 실리는 것이 아니라 전송 대상이 된 cookie의 name/value가 포함된다.

Cookie가 요청에 포함됐다는 사실만으로 그 값이 신뢰할 수 있는 사용자 identity이거나 아직 유효한 session이라는 보장은 없다. **Cookie는 HTTP 요청 사이에 state token을 운반하는 mechanism이고, 그 token의 의미·유효성·권한은 별도의 application 검증 대상**이다.
