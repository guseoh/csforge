---
kind: concept
contentKey: security.core.filter-chain.servlet-filter
topicContentKey: security.core.filter-chain
slug: servlet-filter
title: "서블릿 필터가 DispatcherServlet 앞에서 요청을 가로채는 위치"
summary: "서블릿 필터가 컨트롤러보다 앞에서 요청·응답을 처리하는 위치와 Spring Security가 이 경계에서 동작하는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/architecture.html"
    title: "Spring Security Reference: Servlet Architecture"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Servlet Filter·DelegatingFilterProxy·FilterChainProxy의 관계 확인"
---
# 서블릿 필터가 DispatcherServlet 앞에서 요청을 가로채는 위치

Spring MVC 컨트롤러가 요청을 처음 처리한다고 생각하기 쉽지만 서블릿 필터가 그보다 앞에서 실행될 수 있습니다.

```text
HTTP 요청
    │
    ▼
서블릿 컨테이너
    │
    ▼
필터 1
    │
    ▼
필터 2
    │
    ▼
DispatcherServlet
    │
    ▼
컨트롤러
```

필터는 `chain.doFilter(request, response)` 호출 전후에 로직을 실행할 수 있어 인증, 로그 수집, CORS, 압축처럼 여러 요청에 공통으로 적용할 처리에 적합합니다.

### 필터가 체인을 계속 호출하지 않으면 컨트롤러까지 가지 않는다

```java
if (invalidRequest(request)) {
    response.sendError(400);
    return;
}
chain.doFilter(request, response);
```

인증 필터가 실패 응답을 반환하면 MVC 컨트롤러는 호출되지 않습니다. 컨트롤러의 중단점에 도달하지 않고 401이 발생한다면 먼저 보안 필터 체인을 확인합니다.

### 요청 본문 스트림을 필터에서 먼저 소비하면?

서블릿의 요청 본문은 공유되는 입력 스트림입니다. 인증·감사 로깅 필터가 `request.getInputStream()`을 읽어 버리면 뒤의 MVC 메시지 변환기(`@RequestBody` 파싱)가 기대한 본문을 받지 못할 수 있습니다.

```text
POST /orders {"itemId":17}
  → Filter에서 InputStream 끝까지 읽기
  → chain.doFilter(...)
  → MVC에서 @RequestBody 읽기 시 empty stream / 역직렬화 오류
```

본문을 반드시 검사해야 한다면 먼저 헤더나 식별자만으로 처리할 수 있는지 확인하고, 필요한 경우에는 **전체 용량 상한이 있는 요청 래퍼**로 바이트를 복사하고 downstream에 재생 가능한 스트림을 제공하는 명시적 설계를 사용해야 합니다. Spring의 `ContentCachingRequestWrapper`는 읽힌 내용을 캐시하는 데 도움을 주지만 **다운스트림 요청 본문을 자동으로 되감아 재생해 주는 래퍼는 아닙니다.** 로그에서는 비밀번호·토큰·개인정보를 제거하고, 큰 본문을 무제한 버퍼링하지 않습니다.

### Spring 빈과 서블릿 필터를 연결한다

Spring Security는 `DelegatingFilterProxy`와 `FilterChainProxy`로 서블릿 컨테이너의 필터와 Spring이 관리하는 보안 필터를 연결합니다.

```text
서블릿 컨테이너
   │
DelegatingFilterProxy
   │
Spring 빈: FilterChainProxy
   │
보안 필터들...
```

이 구조 덕분에 보안 필터도 Spring의 의존성 주입과 수명주기 관리를 사용할 수 있습니다.

### 필터와 인터셉터를 같은 것으로 보면 안 된다

Spring MVC의 `HandlerInterceptor`는 `DispatcherServlet` 안쪽에서 실행되고 서블릿 필터는 그보다 앞에서 실행됩니다. 요청 본문을 감싸거나 보안 컨텍스트를 준비하는 작업처럼 컨트롤러를 찾기 전에 필요한 처리는 필터에 둘 수 있습니다.

이 순서를 알면 컨트롤러가 실행되기 전에 401이 반환되는 이유와, CORS를 보안 필터보다 먼저 처리해야 하는 경우를 설명할 수 있습니다.
