---
kind: concept
contentKey: security.core.browser.same-origin
topicContentKey: security.core.browser
slug: same-origin
title: "동일 출처 정책(SOP)이 브라우저의 응답 읽기를 제한하는 방식"
summary: "출처를 스킴·호스트·포트로 판단하고, 동일 출처 정책이 모든 교차 출처 요청을 막는 것이 아니라 주로 응답 읽기를 제한한다는 점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy"
    title: "MDN: Same-Origin Policy"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "출처의 정의와 교차 출처 읽기·쓰기·삽입의 제약 확인"
---
# 동일 출처 정책(SOP)이 브라우저의 응답 읽기를 제한하는 방식

공격자 사이트의 JavaScript가 사용자가 로그인한 은행 사이트의 응답을 읽을 수 있다면 정보가 유출됩니다. 동일 출처 정책(SOP)은 **다른 출처의 문서와 스크립트에 대한 브라우저 접근을 제한**합니다.

### 출처는 스킴·호스트·포트로 결정된다

| URL                               | `https://shop.example.com:443`와 동일 출처인가? |
| --------------------------------- | --------------------------------------------- |
| `https://shop.example.com/orders` | 예                                            |
| `http://shop.example.com`         | 아니오 — 스킴 다름                          |
| `https://api.example.com`         | 아니오 — 호스트 다름                            |
| `https://shop.example.com:8443`   | 아니오 — 포트 다름                            |

경로 `/orders`와 `/admin`이 다르다고 출처가 달라지지는 않습니다.

### 교차 출처 요청 자체가 항상 금지되는 것은 아니다

다른 출처로 폼을 제출하거나 이미지를 불러오고 페이지를 이동할 수 있습니다. SOP는 이런 요청을 모두 금지하기보다 공격자 스크립트가 **다른 출처의 응답을 자유롭게 읽는 것**을 제한합니다.

```text
attacker.example 스크립트
       │ fetch https://bank.example/account
       ▼
브라우저가 네트워크 요청을 보낼 수 있는 경우도 있음
       │
       └─ SOP/CORS 규칙에 따라 응답을 스크립트에 노출할지 결정
```

이 때문에 “SOP가 있으니 CSRF가 불가능하다”는 결론은 틀립니다. CSRF는 응답을 읽지 않아도 상태 변경 요청이 성공하면 공격 목적을 달성할 수 있습니다.

### SOP는 서버 인가가 아니다

SOP는 브라우저 정책이므로 `curl`이나 서버 간 HTTP 요청에는 적용되지 않습니다. 서버는 요청마다 인증과 인가를 직접 수행해야 합니다.

### CORS는 SOP를 선택적으로 완화한다

서버가 다른 출처의 스크립트에 응답 읽기를 허용하려면 CORS 응답 헤더를 사용합니다.

SOP가 막는 동작을 판단할 때는 요청 전송과 응답 읽기를 구분해야 합니다. 서버의 인가 검사는 어느 경우에도 별도로 필요합니다.
