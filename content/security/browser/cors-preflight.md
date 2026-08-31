---
kind: concept
contentKey: security.core.browser.cors-preflight
topicContentKey: security.core.browser
slug: cors-preflight
title: "CORS와 preflight가 허용 범위를 협상하는 방식"
summary: "CORS가 server response header로 특정 origin의 browser script read를 허용하고 non-simple request 전에 preflight OPTIONS로 method/header permission을 확인하는 흐름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"
    title: "MDN: Cross-Origin Resource Sharing (CORS)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: simple request, preflight, credentials와 response header 흐름 확인
  - url: "https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html"
    title: "Spring Security Reference: CORS"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: CORS가 Security filter 전에 처리되어야 하는 servlet integration 확인
---
# CORS와 preflight가 허용 범위를 협상하는 방식

Frontend가 `https://app.example.com`, API가 `https://api.example.com`이면 host가 달라 same-origin이 아닙니다. Browser는 SOP 때문에 frontend script가 API response를 자유롭게 읽지 못하게 하고, 서버가 CORS header로 **이 origin에게는 읽기를 허용한다**고 명시할 수 있습니다.

### simple cross-origin GET의 흐름

```text
Browser
Origin: https://app.example.com
    │
    ├──────── GET ────────► API
    │                      │
    │   Access-Control-Allow-Origin:
    │   https://app.example.com
    │◄─────────────────────┤
    │
    └─ response를 script에 노출
```

CORS header가 없거나 origin이 맞지 않으면 browser가 script의 response 접근을 차단할 수 있습니다. **서버가 request를 전혀 받지 않았다는 뜻은 아닙니다.**

### non-simple request는 preflight로 먼저 묻는다

```text
Browser                         API
  │ OPTIONS /orders              │
  │ Origin: app.example.com      │
  │ Access-Control-Request-Method: POST
  ├─────────────────────────────►│
  │                              │
  │ Allow-Origin / Allow-Methods │
  │◄─────────────────────────────┤
  │
  └── 허용될 때 실제 POST ──────►
```

Custom header, 특정 content type/method 조합은 preflight 대상이 될 수 있습니다.

### credentials와 wildcard를 조심한다

Session cookie처럼 credential을 cross-origin request에 포함하려면 client의 credentials 설정과 서버의 `Access-Control-Allow-Credentials: true` 등이 필요합니다. Credentialed response에 `Access-Control-Allow-Origin: *`를 사용할 수 없고 구체적인 origin을 허용해야 합니다.

### CORS는 CSRF 방어가 아니다

Simple form request는 preflight 없이 cross-site로 전송될 수 있고, response를 읽지 않아도 서버 state가 바뀌면 CSRF가 성공할 수 있습니다. CORS를 엄격하게 설정했다고 CSRF token이 자동으로 불필요해지는 것은 아닙니다.

### CORS error는 서버 log와 browser console을 함께 본다

API 자체는 200을 반환했는데 browser가 CORS 때문에 response를 script에 숨기는 경우가 있습니다. network request 유무, OPTIONS response, allow-origin/credentials header를 순서대로 확인하면 원인을 좁힐 수 있습니다.

CORS는 firewall이 아니라 **브라우저에게 어떤 cross-origin script access를 허용할지 서버가 선언하는 protocol**입니다.
