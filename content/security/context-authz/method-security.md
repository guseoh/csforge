---
kind: concept
contentKey: security.core.context-authz.method-security
topicContentKey: security.core.context-authz
slug: method-security
title: "메서드 보안과 유스케이스 인가"
summary: "HTTP 경로 규칙만으로 보호하기 어려운 서비스 메서드에 인가를 적용하고, 리소스 소유권 같은 동적 조건을 검사하는 흐름을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html"
    title: "Spring Security Reference: Method Security"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@PreAuthorize와 메서드 인가 인터셉터의 동작 확인"
---
# 메서드 보안과 유스케이스 인가

`/admin/**` 경로를 관리자에게만 허용하는 규칙은 HTTP 경계에서 명확합니다. 그러나 서비스 메서드가 컨트롤러 외의 스케줄러·메시지 소비자에서도 호출된다면 **유스케이스 자체의 인가 조건**을 별도로 확인해야 합니다.

```java
@PreAuthorize("hasAuthority('CATALOG_WRITE')")
public void publishProduct(long productId) {
    ...
}
```

Spring Security 메서드 보안은 Spring AOP 인터셉터가 메서드 호출 전후에 인가를 수행하는 방식입니다.

```text
호출자
  │
  ▼
메서드 보안 프록시/인터셉터
  │ 현재 Authentication + 표현식/정책
  ├─ 거부 → 예외
  └─ 허용
       ▼
    대상 메서드
```

### 메서드 인자가 필요한 소유권 정책도 표현할 수 있다

```java
@PreAuthorize("@orderAuth.canCancel(authentication, #orderId)")
public void cancel(long orderId) { ... }
```

복잡한 조회와 도메인 상태 판단을 SpEL 문자열에 모두 넣기보다 별도 정책 빈에서 검사하면 읽고 테스트하기 쉽습니다.

### 컨트롤러와 메서드에 같은 규칙을 중복하지 않는다

두 층에 규칙을 중복하면 정책을 바꿀 때 한쪽만 수정할 수 있습니다. HTTP 경로의 기본 제한과 유스케이스의 리소스별 인가 책임을 구분합니다.

```text
HTTP 계층
- 인증 필요
- /admin/** 기본 역할 검사

애플리케이션 유스케이스
- 소유권
- 상태에 따른 권한
- 높은 권한을 요구하는 작업
```

### 프록시 경계를 이해해야 한다

기본 프록시 방식에서는 같은 객체 안에서 자기 메서드를 호출하면 인터셉터를 거치지 않을 수 있습니다. `@PreAuthorize`가 붙어 있다는 사실뿐 아니라 실제 호출이 프록시를 통과하는지 확인해야 합니다.

메서드 보안은 HTTP 이외의 호출 경로에서도 **중요한 유스케이스의 권한 조건을 같은 경계에서 검사**할 때 의미가 있습니다.
