---
kind: concept
contentKey: security.core.browser.cors-preflight
topicContentKey: security.core.browser
slug: cors-preflight
title: "교차 출처 리소스 공유(CORS)와 사전 요청"
summary: "CORS 응답 헤더가 다른 출처의 스크립트에 응답 읽기를 허용하는 방식과, 일부 요청에서 사전 요청을 거쳐 허용된 메서드·헤더를 확인하는 흐름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"
    title: "MDN: Cross-Origin Resource Sharing (CORS)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "단순 요청·사전 요청·자격 증명·응답 헤더의 흐름 확인"
  - url: "https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html"
    title: "Spring Security Reference: CORS"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "서블릿 환경에서 CORS를 보안 필터보다 먼저 처리해야 하는 이유 확인"
---
# 교차 출처 리소스 공유(CORS)와 사전 요청

프런트엔드가 `https://app.example.com`, API가 `https://api.example.com`이면 호스트가 달라 출처도 다릅니다. 브라우저는 동일 출처 정책에 따라 프런트엔드 스크립트의 API 응답 읽기를 제한합니다. 서버는 CORS 응답 헤더로 **특정 출처에는 읽기를 허용한다**고 선언할 수 있습니다.

### 단순한 교차 출처 GET의 흐름

```text
브라우저 ── GET /orders ──► API
Origin: https://app.example.com

API ── 응답 ──► 브라우저
Access-Control-Allow-Origin: https://app.example.com

브라우저가 응답을 스크립트에 노출
```

CORS 헤더가 없거나 허용 출처가 맞지 않으면 브라우저가 스크립트의 응답 읽기를 차단할 수 있습니다. **서버가 요청을 전혀 받지 않았다는 뜻은 아닙니다.**

### 일부 요청은 사전 요청으로 허용 여부를 확인한다

```text
브라우저 ── 사전 요청 ──► API
OPTIONS /orders
Origin: https://app.example.com
Access-Control-Request-Method: POST

API ── 사전 요청 응답 ──► 브라우저
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: POST

허용되면 브라우저 ── 실제 POST ──► API
```

사용자 정의 헤더나 특정 본문 형식·HTTP 메서드 조합은 사전 요청 대상이 될 수 있습니다.

### 자격 증명을 보낼 때는 허용 출처를 명시한다

세션 쿠키 같은 자격 증명을 교차 출처 요청에 포함하려면 브라우저의 자격 증명 전송 설정과 서버의 `Access-Control-Allow-Credentials: true` 등이 필요합니다. 이때 `Access-Control-Allow-Origin: *`를 사용할 수 없으며 허용할 출처를 구체적으로 지정해야 합니다.

### CORS는 CSRF 방어가 아니다

단순한 폼 요청은 사전 요청 없이 다른 사이트에서 전송될 수 있습니다. 공격자가 응답을 읽지 못해도 서버 상태가 바뀌면 CSRF가 성공할 수 있으므로 CORS 설정만으로 CSRF 방어를 대신할 수 없습니다.

### CORS 오류는 서버 로그와 브라우저 콘솔을 함께 본다

API가 200을 반환했어도 브라우저가 CORS 정책 때문에 응답 읽기를 막을 수 있습니다. 본 요청의 전송 여부, OPTIONS 응답, 출처·자격 증명 관련 응답 헤더를 순서대로 확인합니다.

CORS는 **어느 출처의 브라우저 스크립트에 응답 읽기를 허용할지 서버가 알리는 방식**입니다.
