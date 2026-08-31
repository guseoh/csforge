---
kind: concept
contentKey: security.core.context-authz.async-context
topicContentKey: security.core.context-authz
slug: async-context
title: "Async thread와 SecurityContext 전달"
summary: "SecurityContext의 기본 thread-local 성격 때문에 executor의 다른 thread로 작업을 넘길 때 authentication이 자동으로 따라간다고 가정할 수 없고 명시적 context propagation이 필요한 경우를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/integrations/concurrency.html"
    title: "Spring Security Reference: Concurrency Support"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: DelegatingSecurityContextRunnable/Executor로 context 전달하는 방식 확인
---
# Async thread와 SecurityContext 전달

요청 thread에서 current user를 잘 읽던 코드가 `@Async`나 custom executor로 넘긴 뒤 갑자기 anonymous/null이 되는 경우가 있습니다. 기본 SecurityContextHolder가 thread-local이라 **다른 worker thread에는 원래 thread의 context가 자동으로 존재하지 않기 때문**입니다.

```text
HTTP Thread-12
SecurityContext(member 42)
      │
      │ executor.submit(task)
      ▼
Worker Thread-3
SecurityContext(?)  ← 별도 thread
```

### context를 전달하려면 capture와 restore가 필요하다

Spring Security는 `DelegatingSecurityContextRunnable`, `DelegatingSecurityContextExecutor` 같은 wrapper를 제공합니다.

```text
submit 시점
current SecurityContext capture
        │
        ▼
worker 시작
context set
        │
        ▼
task 실행
        │
        ▼
finally context clear
```

마지막 cleanup이 중요한 이유는 executor thread도 재사용되기 때문입니다.

### 모든 async 작업에 사용자 context가 필요한 것은 아니다

주문 완료 후 analytics event를 비동기로 처리할 때 현재 사용자 권한을 그대로 전달해야 하는지 먼저 묻습니다. Durable message에 `actorMemberId`를 명시적으로 기록하고 consumer는 system authority로 처리하는 편이 더 명확할 수 있습니다.

### context capture 시점도 의미가 있다

Task를 queue에 넣은 뒤 실제 실행까지 10분이 걸렸고 그 사이 사용자가 logout/role 변경되었다면 submit 시점 Authentication을 그대로 사용하는 것이 정책상 맞는지 검토해야 합니다. 보안-sensitive operation은 worker에서 최신 authorization을 다시 확인해야 할 수 있습니다.

### InheritableThreadLocal만 켜면 thread pool 문제가 해결되는 것은 아니다

Thread pool은 child thread를 작업마다 새로 만드는 것이 아니라 이미 존재하는 thread를 재사용하므로 단순 inheritance semantics와 맞지 않을 수 있습니다. Framework-provided explicit propagation을 사용하는 편이 안전합니다.

Async security의 핵심은 “context가 사라지는 버그”가 아니라 **execution boundary를 넘을 때 어떤 identity snapshot을 전달하고 언제 다시 검증할지 결정하는 것**입니다.
