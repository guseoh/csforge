---
kind: concept
contentKey: spring.core.scope-lifecycle.scopes
topicContentKey: spring.core.scope-lifecycle
slug: scopes
title: "Bean 범위(scope): singleton·prototype·request"
summary: "Bean scope가 같은 Bean 정의에서 객체를 언제 만들고 어느 범위에서 공유할지 정하는 수명 규칙임을 이해한다"
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
# Bean 범위(scope): singleton·prototype·request

Bean scope는 “이 annotation을 붙이면 어떻게 생성된다”는 문법보다 **같은 Bean 정의를 조회할 때 객체를 언제 만들고 어느 범위에서 같은 객체를 공유할 것인가**를 정하는 수명 정책입니다.

가장 흔한 singleton은 컨테이너가 하나의 공유 객체를 관리합니다. prototype은 Bean을 요청할 때마다 새 객체를 만들고, 웹 환경의 request scope는 HTTP 요청 하나 동안 같은 객체를 사용합니다.

| scope     | 객체 공유 범위                        | 대표적인 사용 의미                         |
| --------- | ------------------------------------- | ------------------------------------------ |
| singleton | Spring 컨테이너의 해당 Bean 정의      | 상태 없는 Service·Repository·Client       |
| prototype | Bean을 요청할 때마다 새 객체          | 독립된 변경 가능 작업 객체가 필요한 경우  |
| request   | HTTP 요청 하나                        | 요청별 상태를 Bean으로 표현해야 하는 경우 |

### scope는 “객체가 몇 개인가”보다 “누가 같은 객체를 보는가”가 중요하다

요청이 두 개 들어오는 상황을 비교해 보겠습니다.

```text
Request A ──► singleton Service #1
Request B ──► singleton Service #1

Request A ──► request Bean #A
Request B ──► request Bean #B
```

singleton Service 필드에 요청별 값을 저장하면 A와 B가 같은 메모리 상태를 만집니다. request scope Bean은 각 요청마다 분리되지만 그렇다고 모든 요청 데이터를 Bean으로 만들 필요는 없습니다. 메서드 매개변수나 지역 변수가 더 단순한 경우가 많습니다.

### prototype은 “컨테이너가 평생 관리해 준다”는 뜻이 아니다

prototype Bean은 컨테이너가 생성과 의존성 주입까지는 수행하지만 singleton처럼 모든 소멸 과정을 끝까지 추적해 주지는 않습니다. 자원 해제가 필요한 prototype 객체라면 누가 정리 책임을 질지 별도로 설계해야 합니다.

```java
@Scope("prototype")
@Component
class ExportSession implements AutoCloseable { ... }
```

`AutoCloseable`이라고 해서 Spring이 모든 prototype 객체의 `close()`를 기억했다가 컨텍스트 종료 때 자동 호출한다고 가정하면 안 됩니다.

### Spring singleton과 thread safety는 다른 문제다

scope가 singleton이라고 해서 객체가 자동으로 불변이거나 thread-safe해지는 것은 아닙니다. scope는 객체의 공유 범위와 수명을 정할 뿐입니다.

```java
@Service
class CounterService {
    private long count; // 여러 스레드가 같은 필드를 공유
}
```

이 필드를 동시성에 안전하게 만들지, 애초에 공유되는 변경 가능 상태를 없앨지는 애플리케이션 설계 문제입니다.

### scope 선택은 실제 상태의 수명에서 시작한다

- 애플리케이션 전체에서 공유해도 되는 상태 없는 협력 객체인가?
- 요청 하나에만 존재해야 하는 변경 가능 상태인가?
- 호출마다 완전히 독립된 객체가 필요한가?
- 짧은 scope 객체를 긴 scope 객체가 붙잡는 문제는 없는가?

scope를 이해하면 다음에 나오는 scoped proxy가 왜 필요한지 자연스럽게 보입니다. 핵심은 annotation 목록이 아니라 **서로 다른 수명의 객체를 어떻게 연결할 것인가**입니다.
