---
kind: concept
contentKey: security.core.context-authz.context-holder
topicContentKey: security.core.context-authz
slug: context-holder
title: "요청 스레드의 인증 상태와 SecurityContextHolder"
summary: "Spring Security가 현재 인증 정보를 `SecurityContext`에 보관하는 방식과 요청 종료 시 보안 컨텍스트를 정리해야 하는 이유를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder"
    title: "Spring Security Reference: SecurityContextHolder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "SecurityContextHolder·SecurityContext·Authentication의 관계 확인"
---
# 요청 스레드의 인증 상태와 SecurityContextHolder

컨트롤러가 세션 저장소를 매번 직접 조회하지 않아도 현재 사용자를 알 수 있는 이유는 Spring Security가 앞선 필터에서 인증 상태를 복원해 `SecurityContext`에 넣기 때문입니다.

```text
HTTP 요청
    │
    ▼
보안 필터
    │ 세션/토큰에서 Authentication 복원
    ▼
SecurityContext
    │
    ▼
SecurityContextHolder
    │
    ├─ 인가 필터
    ├─ 컨트롤러 인자
    └─ 애플리케이션의 현재 사용자 조회
```

### 기본 스레드 로컬 모델은 요청 처리 흐름에 잘 맞는다

서블릿 요청이 한 작업 스레드에서 동기적으로 처리되는 동안 같은 스레드의 코드가 현재 보안 컨텍스트를 참조할 수 있습니다. 인증 정보가 전역 정적 변수 하나에 저장된다는 뜻은 아닙니다. `SecurityContextHolder`는 저장 전략에 따라 스레드별 문맥을 관리합니다.

### 스레드 풀에서는 정리가 중요하다

Tomcat 작업 스레드는 다음 요청에 재사용됩니다. 이전 요청의 `Authentication`이 스레드 로컬에 남으면 다른 사용자의 인증 정보가 섞일 수 있으므로 요청이 끝날 때 문맥을 정리해야 합니다.

```text
스레드-7
요청 A: 회원 42
   │ 문맥 설정
   │ 요청 처리
   └ 문맥 정리

같은 스레드-7 재사용
요청 B: 회원 77
```

사용자 정의 필터가 문맥을 직접 바꾼다면 요청 실패 경로에서도 저장·정리 규칙이 지켜지는지 확인해야 합니다.

### 도메인이 보안 컨텍스트에 직접 의존하지 않게 한다

도메인 객체가 `SecurityContextHolder`를 직접 호출하면 도메인 규칙이 보안 프레임워크에 의존하게 됩니다. API나 애플리케이션 경계에서 현재 사용자 식별자를 전달하면 책임과 테스트 경계가 명확해집니다.

### 문맥은 불변 스냅샷이라고 가정하면 안 된다

`Authentication`과 인증 주체 객체가 변경 가능하면 요청 처리 중 예상치 못한 변경이 공유될 수 있습니다. 필요한 정보만 담은 안정적인 표현을 사용합니다.

`SecurityContextHolder`는 요청의 인증 상태를 현재 실행 문맥에 연결합니다. 그 수명을 요청과 작업 스레드의 수명에 맞춰 정리하는 것이 중요합니다.
