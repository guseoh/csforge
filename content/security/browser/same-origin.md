---
kind: concept
contentKey: security.core.browser.same-origin
topicContentKey: security.core.browser
slug: same-origin
title: "Same-Origin Policy가 브라우저 script 읽기를 제한하는 방식"
summary: "origin을 scheme·host·port 조합으로 이해하고 SOP가 cross-origin resource interaction 전체를 금지하는 것이 아니라 특히 script의 cross-origin read를 제한하는 browser isolation 정책임을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy"
    title: "MDN: Same-Origin Policy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: origin 정의와 cross-origin read/write/embed 제약 확인
---
# Same-Origin Policy가 브라우저 script 읽기를 제한하는 방식

웹에서 공격자 사이트의 JavaScript가 사용자가 로그인한 은행 사이트의 응답을 마음대로 읽을 수 있다면 심각한 정보 노출이 됩니다. Same-Origin Policy(SOP)는 **서로 다른 origin의 document/script 사이 접근을 제한하는 브라우저 보안 경계**입니다.

### origin은 scheme·host·port로 결정된다

| URL                               | `https://shop.example.com:443`와 same origin? |
| --------------------------------- | --------------------------------------------- |
| `https://shop.example.com/orders` | 예                                            |
| `http://shop.example.com`         | 아니오 — scheme 다름                          |
| `https://api.example.com`         | 아니오 — host 다름                            |
| `https://shop.example.com:8443`   | 아니오 — port 다름                            |

Path `/orders`와 `/admin`이 다르다고 origin이 달라지는 것은 아닙니다.

### cross-origin 요청 자체가 항상 금지되는 것은 아니다

HTML form POST, image/embed, navigation처럼 cross-origin write/embed가 가능한 경우가 있습니다. SOP의 핵심 방어 중 하나는 공격자 script가 **다른 origin의 response data를 자유롭게 읽는 것**을 막는 것입니다.

```text
attacker.example script
       │ fetch https://bank.example/account
       ▼
Browser가 network request를 보낼 수 있는 경우도 있음
       │
       └─ SOP/CORS 규칙에 따라 response를 script에 노출할지 결정
```

이 때문에 “SOP가 있으니 CSRF가 불가능하다”는 결론은 틀립니다. CSRF는 response를 읽지 않아도 state-changing request가 성공하면 공격 목적을 달성할 수 있습니다.

### SOP는 서버 authorization이 아니다

브라우저 정책이므로 `curl`, backend-to-backend HTTP client는 SOP에 의해 막히지 않습니다. 서버는 모든 요청에 authentication/authorization을 자체 적용해야 합니다.

### CORS는 SOP를 선택적으로 완화한다

서버가 특정 다른 origin의 script에게 response를 읽을 권한을 주고 싶을 때 CORS response header를 사용합니다. 이것이 다음 Concept의 주제입니다.

SOP를 이해할 때는 “다른 domain 요청 금지” 한 줄이 아니라 **브라우저가 어떤 origin의 script에게 어떤 resource response를 노출할지를 제한하는 client-side isolation**으로 보는 것이 정확합니다.
