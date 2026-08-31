---
kind: concept
contentKey: spring.core.scope-lifecycle.scopes
topicContentKey: spring.core.scope-lifecycle
slug: scopes
title: "singleton·prototype·request scope"
summary: "Bean scope가 같은 definition에서 몇 개의 instance를 언제 만들고 누구와 공유하는지 정하는 수명 규칙임을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html"
    title: "Spring Framework Reference: Bean Scopes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "singleton, prototype, request 등 Bean scope 계약 확인"
---
# singleton·prototype·request scope

Bean scope는 “이 annotation을 붙이면 어떻게 생성된다”는 문법보다 **같은 Bean definition을 조회할 때 어떤 instance를 얼마나 오래 공유할 것인가**를 정하는 수명 정책입니다.

가장 흔한 singleton은 container가 하나의 공유 instance를 관리합니다. prototype은 요청할 때마다 새 instance를 만들고, web-aware context의 request scope는 HTTP request 하나 동안 같은 instance를 사용합니다.

| scope     | instance 공유 범위                      | 대표적인 사용 의미                                |
| --------- | --------------------------------------- | ------------------------------------------------- |
| singleton | Spring container의 해당 Bean definition | stateless service, repository, client             |
| prototype | Bean 요청/생성 시 새 instance           | 독립 mutable 작업 객체가 정말 필요한 경우         |
| request   | HTTP request 하나                       | request-local state를 Bean으로 표현해야 하는 경우 |

### scope는 “객체가 몇 개인가”보다 “누가 같은 객체를 보는가”가 중요하다

request가 두 개 들어오는 상황을 비교해 보겠습니다.

```text
Request A ──► singleton Service #1
Request B ──► singleton Service #1

Request A ──► request Bean #A
Request B ──► request Bean #B
```

singleton service field에 request별 값을 저장하면 A와 B가 같은 memory state를 만집니다. request scope Bean은 각 request마다 분리되지만, 그렇다고 모든 request data를 Bean으로 만들 필요는 없습니다. method parameter나 local variable이 더 단순한 경우가 많습니다.

### prototype은 “container가 평생 관리해 준다”는 뜻이 아니다

prototype Bean은 container가 생성과 dependency injection까지는 수행하지만, singleton처럼 완전한 destruction lifecycle을 끝까지 추적해 주지 않는다는 점을 주의해야 합니다. 자원 해제가 필요한 prototype object라면 누가 cleanup 책임을 질지 별도로 설계해야 합니다.

```java
@Scope("prototype")
@Component
class ExportSession implements AutoCloseable { ... }
```

`AutoCloseable`이라고 해서 Spring이 모든 prototype instance의 `close()`를 자동으로 기억했다가 context 종료 때 호출한다고 가정하면 안 됩니다.

### Spring singleton과 thread safety는 다른 문제다

scope가 singleton이라고 해서 immutable/thread-safe가 되는 것은 아닙니다. scope는 instance identity와 lifetime을 정할 뿐입니다.

```java
@Service
class CounterService {
    private long count; // 여러 thread가 같은 field를 공유
}
```

이 field를 안전하게 만들지, 애초에 shared mutable state를 없앨지는 application design 문제입니다.

### scope 선택은 실제 state lifetime에서 시작한다

- application 전체에서 공유해도 되는 stateless collaborator인가?
- request 하나에만 존재해야 하는 mutable state인가?
- 호출마다 완전히 독립된 객체가 필요한가?
- 짧은 scope 객체를 긴 scope 객체가 붙잡는 문제는 없는가?

scope를 이해하면 다음에 나오는 scoped proxy가 왜 필요한지 자연스럽게 보입니다. 핵심은 annotation 목록이 아니라 **서로 다른 수명의 객체를 어떻게 연결할 것인가**입니다.
