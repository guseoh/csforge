---
kind: concept
contentKey: security.core.filter-chain.exception-translation
topicContentKey: security.core.filter-chain
slug: exception-translation
title: "인증·인가 예외와 401·403 응답 변환"
summary: "보안 필터에서 발생한 인증 필요·권한 부족 상태가 `AuthenticationEntryPoint`와 `AccessDeniedHandler`를 통해 HTTP 401·403 응답으로 바뀌는 경계를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-exceptiontranslationfilter"
    title: "Spring Security Reference: ExceptionTranslationFilter"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "AuthenticationException과 AccessDeniedException을 HTTP 응답으로 바꾸는 흐름 확인"
---
# 인증·인가 예외와 401·403 응답 변환

보안 오류가 모두 컨트롤러의 예외 처리기로 전달되는 것은 아닙니다. 컨트롤러보다 앞선 필터 체인에서 발생한 인증·인가 예외는 Spring Security가 처리할 수 있습니다.

```text
ExceptionTranslationFilter
       │ 뒤쪽 필터·애플리케이션 호출
       ▼
AuthenticationException 또는 AccessDeniedException 포착
       │
       ├─ 인증이 필요함 → AuthenticationEntryPoint
       │                  └─ 401 또는 로그인 리다이렉트
       │
       └─ 인증됐지만 권한이 없음 → AccessDeniedHandler
                                  └─ 403
```

`ExceptionTranslationFilter`는 뒤쪽 처리에서 발생한 두 예외를 HTTP 응답으로 바꿉니다. `AccessDeniedException`이어도 요청자가 인증되지 않았다면 인증 시작점으로 보낼 수 있습니다.

### 401과 403은 질문이 다르다

- 401 성격: **누구인지 확인할 자격 증명이 없거나 유효하지 않음**
- 403 성격: **누구인지는 알지만 이 작업을 할 권한이 없음**

실제 처리 경로는 익명 인증 상태 등에 따라 달라질 수 있지만, 인증이 필요한 상황과 권한이 부족한 상황은 구분해야 합니다.

### JSON API와 브라우저 로그인은 시작 응답이 다를 수 있다

폼 로그인은 인증이 필요할 때 `/login`으로 이동시키고, REST API는 JSON 본문과 `401` 상태를 반환하는 식으로 응답 방식을 정할 수 있습니다.

```json
{
  "code": "AUTHENTICATION_REQUIRED",
  "message": "로그인이 필요합니다."
}
```

### `@ControllerAdvice`만 바꿔도 보안 오류 응답이 그대로인 이유

보안 예외를 필터에서 처리하면 MVC 예외 처리기까지 도달하지 않습니다. API 오류 형식을 통일하려면 `AuthenticationEntryPoint`와 `AccessDeniedHandler`의 응답도 맞춰야 합니다.

### 로그에는 실패 종류와 대상은 남기되 비밀정보는 빼야 한다

인가 거부를 조사할 때는 사용자 ID, 엔드포인트, 필요한 권한이 도움이 될 수 있습니다. `Authorization` 헤더나 토큰 원문은 로그에 남기지 않아야 합니다.

보안 예외 변환은 **필터에서 발생한 실패를 클라이언트가 받는 HTTP 응답으로 바꾸는 경계**입니다.
