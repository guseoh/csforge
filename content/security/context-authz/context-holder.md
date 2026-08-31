---
kind: concept
contentKey: security.core.context-authz.context-holder
topicContentKey: security.core.context-authz
slug: context-holder
title: "SecurityContextHolder와 요청 thread의 인증 상태"
summary: "Spring Security가 현재 Authentication을 SecurityContext에 두고 기본적으로 thread-local strategy로 접근하게 하는 이유와 request 종료 시 context cleanup이 중요한 이유를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder"
    title: "Spring Security Reference: SecurityContextHolder"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: SecurityContextHolder, SecurityContext, Authentication 관계 확인
---
# SecurityContextHolder와 요청 thread의 인증 상태

Controller에서 매번 session store를 직접 조회하지 않아도 현재 사용자를 얻을 수 있는 이유는 Spring Security가 filter chain 앞쪽에서 authentication을 복원해 `SecurityContext`에 넣기 때문입니다.

```text
HTTP Request
    │
    ▼
Security filter
    │ session/token에서 Authentication 복원
    ▼
SecurityContext
    │
    ▼
SecurityContextHolder
    │
    ├─ authorization filter
    ├─ controller argument
    └─ application current-principal adapter
```

### 기본 thread-local 모델은 요청 처리 흐름에 잘 맞는다

Servlet 요청 하나가 한 worker thread에서 동기적으로 진행되는 동안 같은 thread의 코드가 현재 context를 쉽게 참조할 수 있습니다. 하지만 이것은 “Authentication이 global static 변수 하나에 저장된다”는 뜻이 아닙니다. Holder는 strategy를 통해 thread별 context를 관리합니다.

### thread pool에서는 cleanup이 중요하다

Tomcat worker thread는 요청이 끝나도 사라지지 않고 다음 요청에 재사용됩니다. 이전 Authentication이 thread-local에 남으면 다음 요청이 잘못된 principal을 볼 수 있으므로 Spring Security filter lifecycle은 request 경계에서 context를 적절히 설정하고 정리합니다.

```text
Thread-7
Request A: member 42
   │ context set
   │ request 처리
   └ context clear

같은 Thread-7 재사용
Request B: member 77
```

Custom filter가 직접 context를 조작한다면 실패 path에서도 cleanup/persistence contract를 깨지 않는지 주의해야 합니다.

### domain/service가 holder에 직접 강하게 결합될 필요는 없다

Domain object가 `SecurityContextHolder`를 호출해 현재 사용자를 읽기 시작하면 security framework가 domain invariant 안으로 들어옵니다. API/application 경계에서 `CurrentMember` 같은 작은 abstraction으로 identity를 전달하면 test와 책임이 더 명확해질 수 있습니다.

### context는 immutable snapshot이라고 가정하면 안 된다

Authentication과 principal 객체가 mutable하면 요청 중 예상치 못한 변경이 공유될 수 있습니다. 가능하면 current identity representation을 작고 안정적으로 유지합니다.

SecurityContextHolder의 핵심은 static API 이름이 아니라 **request security state를 현재 execution context에 연결하고 그 lifetime을 request/thread lifecycle과 맞추는 것**입니다.
