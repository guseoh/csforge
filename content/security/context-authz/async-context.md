---
kind: concept
contentKey: security.core.context-authz.async-context
topicContentKey: security.core.context-authz
slug: async-context
title: "비동기 스레드로 SecurityContext 전달"
summary: "비동기 작업이 다른 스레드에서 실행될 때 요청의 인증 정보가 자동 전달되지 않는 이유와, 명시적 전달 및 실행 시점의 권한 재검사가 필요한 경우를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/integrations/concurrency.html"
    title: "Spring Security Reference: Concurrency Support"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "DelegatingSecurityContextRunnable/Executor로 보안 컨텍스트를 전달하는 방식 확인"
---
# 비동기 스레드로 SecurityContext 전달

요청 스레드에서 현재 사용자를 읽던 코드가 `@Async`나 사용자 정의 실행기로 넘어간 뒤 익명 사용자나 `null`을 볼 수 있습니다. `SecurityContextHolder`의 기본 저장 방식은 스레드 로컬이므로 **다른 스레드에 인증 정보가 자동으로 전달되지 않기 때문**입니다.

```text
HTTP 요청 스레드-12
SecurityContext(member 42)
      │
      │ executor.submit(task)
      ▼
작업 스레드-3
SecurityContext(?)  ← 별도 스레드
```

### 인증 정보를 전달하고 사용 후 정리한다

Spring Security는 `DelegatingSecurityContextRunnable`, `DelegatingSecurityContextExecutor`처럼 보안 컨텍스트를 전달하는 래퍼를 제공합니다.

```text
submit 시점
현재 SecurityContext 캡처
        │
        ▼
작업 스레드 시작
문맥 설정
        │
        ▼
작업 실행
        │
        ▼
finally에서 문맥 정리
```

작업 스레드는 다시 쓰일 수 있으므로 작업이 끝나면 전달한 보안 컨텍스트를 정리해야 합니다.

### 모든 비동기 작업에 사용자 인증 정보가 필요한 것은 아니다

주문 완료 후 분석 이벤트를 비동기로 처리할 때 현재 사용자의 권한을 그대로 전달해야 하는지 따져 봅니다. 오래 보관되는 메시지에는 `actorMemberId`를 명시적으로 기록하고, 소비자는 시스템 권한으로 처리하는 편이 더 명확할 수 있습니다.

### 인증 정보를 가져온 시점도 중요하다

작업을 큐에 넣은 뒤 실행까지 10분이 걸렸고 그 사이 사용자가 로그아웃하거나 역할이 바뀌었다면, 제출 시점의 `Authentication`을 그대로 써도 되는지 판단해야 합니다. 환불 같은 민감한 작업은 실행 시점에 최신 권한을 다시 검사해야 할 수 있습니다.

### 스레드 풀에서는 상속형 스레드 로컬만으로 부족하다

스레드 풀은 기존 스레드를 재사용하므로 새 스레드에 값을 물려주는 방식만으로는 작업별 인증 정보를 안전하게 전달하기 어렵습니다. 명시적 전달과 정리 경계를 사용해야 합니다.

비동기 보안에서는 **어떤 사용자 정보를 작업에 전달하고 실행 시점에 무엇을 다시 검증할지** 결정해야 합니다.
