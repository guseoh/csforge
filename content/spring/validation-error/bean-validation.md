---
kind: concept
contentKey: spring.core.validation-error.bean-validation
topicContentKey: spring.core.validation-error
slug: bean-validation
title: "Bean Validation 경계"
summary: "외부 입력의 형식·범위 제약을 Bean Validation으로 표현하되 도메인 불변식, 권한 검사, DB 제약까지 annotation 하나로 대체하지 않는 경계를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html"
    title: "Spring Framework Reference: Java Bean Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Jakarta Bean Validation을 Spring에서 사용하는 연동 계약 확인"
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html"
    title: "Spring Framework Reference: Validation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@RequestBody/@ModelAttribute와 메서드 검증의 MVC 동작 확인"
---
# Bean Validation 경계

API 요청에는 애플리케이션 기능을 실행하기 전에 거를 수 있는 명확한 형식 제약이 있습니다. 제목은 비어 있으면 안 되고, 페이지 크기는 1~100이어야 하며, 이메일 필드는 이메일 형식을 가져야 한다는 식입니다.

```java
record CreateMemberRequest(
        @NotBlank String nickname,
        @Email String email,
        @Size(min = 8, max = 100) String password
) { }
```

Spring MVC는 `@Valid`·`@Validated`와 Bean Validation provider를 연결해 이런 제약을 Controller 호출 경계에서 검사할 수 있습니다.

### 요청 형식 검증과 도메인 불변식은 같은 층이 아니다

`@NotBlank title`은 어떤 게시글 상태에서도 비교적 안정적인 요청 형태 규칙일 수 있습니다. 하지만 다음 규칙은 상황이 다릅니다.

> “배송을 시작한 주문은 취소할 수 없다.”

이 규칙은 REST 요청뿐 아니라 배치, 스케줄러, 관리자 도구에서도 지켜져야 하며 현재 `Order` 상태를 알아야 합니다. DTO annotation에 억지로 넣기보다 도메인 동작이 소유하는 편이 자연스럽습니다.

```java
order.cancel(now); // Order가 자신의 현재 상태를 보고 허용/거부
```

```text
JSON·타입·형식 제약       -> API / Bean Validation
현재 도메인 상태 불변식   -> Domain
현재 사용자 권한          -> Security / Application
동시성까지 보장할 유일성  -> Database UNIQUE 제약
```

### 검증을 여러 층에서 하는 것은 모두 중복 낭비가 아니다

회원 이메일 중복을 생각해 보겠습니다.

```java
if (memberRepository.existsByEmail(email)) {
    throw new DuplicateEmailException();
}
```

친절한 사전 검사는 가능하지만 두 요청이 동시에 `exists=false`를 본 뒤 모두 INSERT를 시도할 수 있습니다. 정말 유일해야 한다면 DB UNIQUE 제약이 최종 불변식을 보호해야 합니다. 애플리케이션 사전 검사와 DB 제약은 **사용자 경험과 동시성 보장이라는 서로 다른 목적**을 가질 수 있습니다.

### annotation을 붙였다고 입력이 “안전해진 것”은 아니다

`@Size(max=100)`은 길이를 제한하지만 SQL Injection, XSS, 권한 문제를 자동으로 해결하지 않습니다. 각 보안 취약점은 공격자가 영향을 주는 데이터와 실행 경계가 다릅니다.

```java
@NotBlank String sort; // 그래도 동적 SQL 식별자에 그대로 붙이면 위험할 수 있다.
```

Bean Validation은 입력 계약의 일부이지 전체 보안 계층이 아닙니다.

### 검증 group은 복잡도를 숨길 수도 있다

생성·수정마다 제약이 달라 group을 사용할 수 있지만 DTO 하나에 많은 group 조건이 쌓이면 서로 다른 API 계약을 한 타입에 억지로 합친 신호일 수 있습니다. `CreateMemberRequest`, `UpdateProfileRequest`처럼 기능별 요청 타입을 분리하는 편이 더 읽기 쉬운 경우도 많습니다.

Bean Validation을 잘 쓰는 기준은 annotation 개수가 아니라 **현재 제약이 어느 경계에서 항상 참이어야 하는가**를 먼저 정하는 것입니다.
