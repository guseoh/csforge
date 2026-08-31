---
kind: concept
contentKey: security.core.filter-chain.security-filter-chain
topicContentKey: security.core.filter-chain
slug: security-filter-chain
title: "SecurityFilterChain 선택과 filter 실행 순서"
summary: "FilterChainProxy가 request matcher에 맞는 SecurityFilterChain 하나를 선택하고 그 안의 authentication·authorization·CSRF 등 filter를 순서대로 실행하는 구조를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-securityfilterchain"
    title: "Spring Security Reference: SecurityFilterChain"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: FilterChainProxy와 multiple SecurityFilterChain matching 동작 확인
---
# SecurityFilterChain 선택과 filter 실행 순서

Spring Security 설정에서 `SecurityFilterChain` bean을 만든다고 해서 모든 chain의 filter를 매 요청에 전부 실행하는 것은 아닙니다. `FilterChainProxy`는 request를 보고 **matching되는 SecurityFilterChain을 선택한 뒤 그 chain의 security filters를 실행**합니다.

```text
Request /api/orders
       │
       ▼
FilterChainProxy
       │
       ├─ Chain A matcher: /api/**   ✓
       │      ├─ authentication filter
       │      ├─ csrf/cors related filters
       │      └─ authorization filter
       │
       └─ Chain B matcher: /admin/**
```

Multiple chain을 구성할 때 더 구체적인 matcher와 ordering을 잘못 두면 기대하지 않은 chain이 먼저 matching될 수 있습니다.

### filter order는 security semantics를 만든다

Authorization filter가 current Authentication을 사용하려면 그 전에 authentication/security context가 준비되어 있어야 합니다. Exception handling filter도 어느 exception을 감싸는지에 따라 동작합니다.

Spring Security는 표준 filter order를 구성하므로 custom filter를 추가할 때는 “어느 filter 전/후인가?”를 명시적으로 결정해야 합니다.

```java
http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
```

### `permitAll`과 filter chain 제외는 다르다

`permitAll()`은 authorization 단계에서 접근을 허용하는 것이고, 해당 request가 security filters를 전혀 통과하지 않는다는 뜻이 아닙니다. CSRF/CORS/context 같은 filter 동작은 여전히 적용될 수 있습니다.

### debug할 때는 selected chain부터 본다

같은 endpoint인데 예상과 다른 인증 방식이 적용되면:

1. 어떤 `SecurityFilterChain` matcher가 선택됐는지
2. 어떤 filters가 포함됐는지
3. custom filter 위치가 어디인지
4. 최종 authorization rule이 무엇인지

순서로 보면 원인을 좁히기 쉽습니다.

SecurityFilterChain은 annotation 모음이 아니라 **HTTP 요청을 security state machine으로 통과시키는 ordered pipeline**입니다.
