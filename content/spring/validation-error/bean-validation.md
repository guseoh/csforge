---
kind: concept
contentKey: spring.core.validation-error.bean-validation
topicContentKey: spring.core.validation-error
slug: bean-validation
title: "Bean Validation 경계"
summary: "외부 입력의 형식·범위 제약을 Bean Validation으로 표현하되 domain invariant와 authorization, DB constraint를 annotation 하나로 대체하지 않는 경계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html"
    title: "Spring Framework Reference: Java Bean Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Jakarta Bean Validation을 Spring에서 사용하는 integration 계약 확인"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html"
    title: "Spring Framework Reference: Validation in Spring MVC"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@RequestBody/@ModelAttribute와 method validation의 MVC 동작 확인"
---
# Bean Validation 경계

API request에는 application code를 실행하기 전에 거를 수 있는 명확한 형식 제약이 있습니다. 제목은 비어 있으면 안 되고, page size는 1~100이어야 하며, email field는 적어도 email 형식을 가져야 한다는 식입니다.

```java
record CreateMemberRequest(
        @NotBlank String nickname,
        @Email String email,
        @Size(min = 8, max = 100) String password
) { }
```

Spring MVC는 `@Valid`/`@Validated`와 Bean Validation provider를 연결해 이런 constraint를 controller 호출 경계에서 검사할 수 있습니다.

### 요청 형식 검증과 business invariant는 같은 층이 아니다

`@NotBlank title`은 어떤 게시글 상태에서도 비교적 안정적인 request shape 규칙일 수 있습니다. 하지만 다음 규칙은 상황이 다릅니다.

> “배송을 시작한 주문은 취소할 수 없다.”

이 규칙은 REST request뿐 아니라 batch, scheduler, admin tool에서도 지켜져야 하며 현재 `Order` 상태를 알아야 합니다. DTO annotation에 억지로 넣기보다 domain behavior가 소유하는 편이 자연스럽습니다.

```java
order.cancel(now); // Order가 자신의 현재 상태를 보고 허용/거부
```

```text
JSON/type/shape constraint -> API/Bean Validation
현재 domain state invariant -> Domain
현재 principal 권한        -> Security/Application
동시성까지 보장할 unique    -> Database constraint
```

### validation을 여러 층에서 하는 것은 모두 중복 낭비가 아니다

회원 email 중복을 생각해 보겠습니다.

```java
if (memberRepository.existsByEmail(email)) {
    throw new DuplicateEmailException();
}
```

친절한 사전 검사는 가능하지만 두 request가 동시에 `exists=false`를 본 뒤 모두 insert할 수 있습니다. 정말 unique해야 한다면 DB unique constraint가 최종 invariant를 보호해야 합니다. application check와 DB constraint는 **사용자 경험과 동시성 보장이라는 서로 다른 목적**을 가질 수 있습니다.

### annotation을 붙였다고 입력이 “안전해진 것”은 아니다

`@Size(max=100)`은 길이를 제한하지만 SQL injection/XSS/authorization 문제를 자동으로 해결하지 않습니다. security vulnerability마다 공격자가 바꾸는 의미와 실행 경계가 다릅니다.

```java
@NotBlank String sort; // 그래도 동적 SQL identifier에 그대로 붙이면 위험할 수 있다.
```

Bean Validation은 input contract의 일부이지 전체 보안 계층이 아닙니다.

### validation group은 복잡도를 숨길 수도 있다

create/update마다 constraint가 달라 group을 사용할 수 있지만 DTO 하나에 많은 group 조건이 쌓이면 서로 다른 API contract를 한 type에 억지로 합친 신호일 수 있습니다. `CreateMemberRequest`, `UpdateProfileRequest`처럼 use case별 request type을 분리하는 편이 더 읽기 쉬운 경우도 많습니다.

Bean Validation을 잘 쓰는 기준은 annotation 개수가 아니라 **현재 constraint가 어느 경계에서 항상 참이어야 하는가**를 먼저 정하는 것입니다.
