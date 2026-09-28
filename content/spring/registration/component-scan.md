---
kind: concept
contentKey: spring.core.registration.component-scan
topicContentKey: spring.core.registration
slug: component-scan
title: "컴포넌트 스캔"
summary: "Spring이 스캔 시작 패키지 아래에서 stereotype 후보를 발견해 Bean 정의로 등록하는 흐름과 스캔 범위가 시작 결과를 바꾸는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html"
    title: "Spring Framework Reference: Classpath Scanning and Managed Components"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "컴포넌트 스캔, stereotype, include/exclude filter 계약 확인"
---
# 컴포넌트 스캔

`@Service`를 붙였는데 주입이 안 될 때 annotation 철자만 보는 것으로는 부족합니다. `@Service`는 “이 클래스는 Spring 컴포넌트 후보가 될 수 있다”는 표시이고, 실제 등록에는 **어디를 스캔할 것인지**라는 범위가 필요합니다.

Spring Boot의 전형적인 구조에서는 애플리케이션 시작 클래스가 놓인 패키지를 기준으로 하위 패키지를 컴포넌트 스캔 대상으로 잡습니다.

```text
com.example.shop
├─ ShopApplication      <- 스캔 시작점 근처
├─ order
│  └─ OrderService      <- 발견
└─ payment
   └─ PaymentClient

com.other.shared
└─ LegacyService        <- 범위 밖이면 발견되지 않을 수 있음
```

### 스캔은 클래스를 발견한 뒤 Bean 정의를 등록한다

```text
스캔 기준 패키지
      │
      ▼
클래스 등록 정보 탐색
      │
      ▼
@Component 계열 stereotype 후보 판별
      │
      ▼
BeanDefinition 등록
      │
      ▼
이후 객체 생성 / 의존성 해결
```

따라서 “클래스가 classpath에 존재한다”와 “Spring Bean으로 등록되었다”는 같은 말이 아닙니다.

### stereotype은 역할을 읽게 하는 의미도 있다

`@Component`, `@Service`, `@Repository`, `@Controller`는 컴포넌트 후보라는 공통점이 있지만 애플리케이션에서 맡는 역할을 드러냅니다. `@Repository`처럼 프레임워크의 예외 변환과 연결되는 stereotype도 있어 단순 이름표 이상의 의미가 생길 수 있습니다.

다만 annotation을 붙였다고 계층 책임이 자동으로 지켜지는 것은 아닙니다. `@Controller` 안에서 직접 JPA Repository를 호출해 트랜잭션과 도메인 규칙을 모두 처리하면 annotation 이름과 실제 책임은 달라집니다.

### 스캔 범위를 너무 넓혀도 문제가 생긴다

“못 찾는 것”만 스캔 문제는 아닙니다. 기준 패키지를 지나치게 넓게 잡으면 테스트용 컴포넌트, 실험용 컴포넌트, 원하지 않는 설정까지 후보가 될 수 있습니다.

```java
@ComponentScan("com") // 보통 너무 넓다.
```

이런 설정은 예상하지 못한 Bean 충돌이나 시작 시 부수 효과를 만들 수 있습니다. 애플리케이션 패키지 구조와 스캔 경계를 일치시키면 “왜 이 Bean이 들어왔는지”를 추론하기 쉬워집니다.

### 테스트 slice에서도 스캔 범위가 달라진다

`@SpringBootTest`와 `@WebMvcTest`는 같은 classpath를 보더라도 불러오는 컨텍스트 범위가 다릅니다. 운영 환경에서 Bean이 있다고 해서 web slice 테스트에도 자동으로 모두 들어오는 것은 아닙니다. 테스트에서 Bean 누락 오류가 날 때도 “annotation이 붙었나?”와 함께 **현재 테스트가 어떤 컴포넌트와 설정을 불러오는가**를 봐야 합니다.

### 실무에서 스캔 문제를 좁히는 순서

1. 대상 클래스가 실제로 stereotype·component 후보인가?
2. 애플리케이션이나 테스트의 스캔 기준 패키지 안에 있는가?
3. 프로필이나 조건부 설정 때문에 제외된 것은 아닌가?
4. 같은 이름이나 타입의 다른 Bean과 충돌하는가?
5. Bean 정의는 등록됐지만 생성 단계에서 실패한 것은 아닌가?

컴포넌트 스캔은 annotation 기반 자동 등록 기능이지만, 이해해야 할 핵심은 **발견 범위가 객체 그래프의 후보 집합을 결정한다**는 점입니다.
