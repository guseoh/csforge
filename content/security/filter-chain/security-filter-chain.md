---
kind: concept
contentKey: security.core.filter-chain.security-filter-chain
topicContentKey: security.core.filter-chain
slug: security-filter-chain
title: "보안 필터 체인의 선택과 실행 순서"
summary: "`FilterChainProxy`가 요청에 처음 일치하는 `SecurityFilterChain` 하나를 선택하고 그 안의 필터를 순서대로 실행하는 구조를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-securityfilterchain"
    title: "Spring Security Reference: SecurityFilterChain"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "FilterChainProxy가 여러 SecurityFilterChain 중 일치하는 체인을 선택하는 동작 확인"
---
# 보안 필터 체인의 선택과 실행 순서

Spring Security에서 `SecurityFilterChain` 빈을 여러 개 정의해도 모든 필터가 매 요청에 실행되지는 않습니다. `FilterChainProxy`는 순서대로 체인을 확인하고 **요청에 처음 일치하는 체인 하나의 필터만 실행**합니다.

```text
요청 /api/admin/report
       │
       ▼
FilterChainProxy
       │
       ├─ 체인 A: /api/**          ✓ 먼저 일치
       │      └─ permitAll 규칙 적용
       │
       └─ 체인 B: /api/admin/**   선택되지 않음
```

두 경로가 겹치므로 체인 A를 먼저 두면 관리자 요청도 A에서 처리됩니다. 관리자 요청에 별도 인증·인가가 필요하다면 `/api/admin/**` 체인을 먼저 배치하고, 일반 `/api/**` 체인을 그 뒤에 둬야 합니다. 등록 순서만 믿지 말고 실제 요청이 어느 체인에 일치하는지도 확인해야 합니다.

### 필터 실행 순서가 보안 동작을 결정한다

인가 필터가 현재 `Authentication`을 사용하려면 앞선 단계에서 인증 결과가 보안 컨텍스트에 준비돼 있어야 합니다. 예외 처리 필터도 자신이 감싸는 필터에서 발생한 예외를 처리하므로 위치가 중요합니다.

Spring Security가 기본 필터 순서를 구성합니다. 사용자 정의 필터를 추가할 때는 어느 필터 앞이나 뒤에서 실행할지 명시해야 합니다.

```java
http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
```

### `permitAll`은 필터 체인 제외가 아니다

`permitAll()`은 인가 단계에서 접근을 허용한다는 뜻입니다. 해당 요청도 선택된 체인의 다른 필터를 통과하므로 CSRF·CORS·보안 컨텍스트 처리가 적용될 수 있습니다.

### 문제를 추적할 때는 선택된 체인부터 본다

같은 엔드포인트에 예상과 다른 인증 방식이 적용되면 다음을 확인합니다.

1. 어느 `SecurityFilterChain`이 요청에 처음 일치했는지
2. 선택된 체인에 어떤 필터가 들어 있는지
3. 사용자 정의 필터가 어디에 배치됐는지
4. 최종 인가 규칙이 무엇인지

체인 선택과 필터 순서를 따라가면 응답을 만든 지점을 좁힐 수 있습니다. `SecurityFilterChain`은 HTTP 요청이 통과하는 **순서 있는 보안 처리 흐름**입니다.
