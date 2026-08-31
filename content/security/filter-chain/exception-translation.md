---
kind: concept
contentKey: security.core.filter-chain.exception-translation
topicContentKey: security.core.filter-chain
slug: exception-translation
title: "AuthenticationException·AccessDeniedException과 401/403 변환"
summary: "Security filter 내부의 인증 필요와 권한 부족 실패를 ExceptionTranslationFilter가 AuthenticationEntryPoint 또는 AccessDeniedHandler로 연결해 HTTP 응답으로 바꾸는 경계를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-exceptiontranslationfilter"
    title: "Spring Security Reference: ExceptionTranslationFilter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: AuthenticationException과 AccessDeniedException의 HTTP response translation 확인
---
# AuthenticationException·AccessDeniedException과 401/403 변환

Security에서 실패가 났다고 모두 controller advice로 들어오는 것은 아닙니다. Controller보다 앞의 filter chain에서 발생한 authentication/authorization exception은 Spring Security의 exception translation 경계가 처리합니다.

```text
AuthorizationFilter
       │
       ├─ AuthenticationException / unauthenticated path
       │          ▼
       │   AuthenticationEntryPoint
       │          └─ 401 또는 login redirect
       │
       └─ AccessDeniedException / authenticated but forbidden
                  ▼
           AccessDeniedHandler
                  └─ 403
```

### 401과 403은 질문이 다르다

- 401 성격: **누구인지 확인할 credential이 없거나 유효하지 않음**
- 403 성격: **누구인지는 알지만 이 action을 할 권한이 없음**

실제 Spring Security 흐름에서는 anonymous authentication 등 세부 조건에 따라 entry point가 선택될 수 있지만 conceptual distinction은 유지됩니다.

### JSON API와 browser login은 entry point가 다를 수 있다

전통적인 form login은 인증이 필요하면 `/login`으로 redirect하는 것이 자연스럽습니다. REST API는 JSON body와 `401` status를 반환하는 편이 client contract에 맞을 수 있습니다.

```json
{
  "code": "AUTHENTICATION_REQUIRED",
  "message": "로그인이 필요합니다."
}
```

### `@ControllerAdvice`만 커스텀해도 security error가 안 바뀌는 이유

Security exception이 DispatcherServlet에 도달하기 전에 filter에서 처리되면 MVC exception handler 경계 밖입니다. 그래서 API error 형식을 통일하려면 `AuthenticationEntryPoint`, `AccessDeniedHandler`도 같은 error contract를 사용하도록 구성해야 할 수 있습니다.

### 로그에는 실패 종류와 대상은 남기되 secret은 빼야 한다

Authorization denial을 조사하려면 principal ID, endpoint, 필요한 authority 정도가 유용할 수 있지만 Authorization header/token 원문을 통째로 로그에 남기면 안 됩니다.

Exception translation은 예외 이름을 HTTP status로 바꾸는 단순 mapping이 아니라 **security failure가 MVC 경계에 들어오기 전 client-visible contract로 바뀌는 지점**입니다.
