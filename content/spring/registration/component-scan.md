---
kind: concept
contentKey: spring.core.registration.component-scan
topicContentKey: spring.core.registration
slug: component-scan
title: "컴포넌트 스캔"
summary: "Spring이 scan 시작 package 아래에서 stereotype 후보를 발견해 Bean definition으로 등록하는 흐름과 scan 범위가 startup 결과를 바꾸는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html"
    title: "Spring Framework Reference: Classpath Scanning and Managed Components"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "component scanning, stereotype, include/exclude filter 계약 확인"
---
# 컴포넌트 스캔

`@Service`를 붙였는데 주입이 안 될 때 가장 먼저 annotation 철자를 보는 것만으로는 부족합니다. `@Service`는 “이 class는 Spring component 후보가 될 수 있다”는 표시이고, 실제 등록에는 **어디를 scan할 것인지**라는 범위가 필요합니다.

Spring Boot의 전형적인 구조에서는 application class가 놓인 package를 기준으로 아래 package를 component scan 대상으로 잡습니다.

```text
com.example.shop
├─ ShopApplication      <- scan 시작점 근처
├─ order
│  └─ OrderService      <- 발견
└─ payment
   └─ PaymentClient

com.other.shared
└─ LegacyService        <- 범위 밖이면 발견되지 않을 수 있음
```

### scan은 class를 발견한 뒤 Bean definition을 등록한다

큰 흐름은 다음처럼 이해할 수 있습니다.

```text
scan base package
      │
      ▼
class metadata 탐색
      │
      ▼
@Component 계열 stereotype 후보 판별
      │
      ▼
BeanDefinition 등록
      │
      ▼
이후 instance 생성 / dependency resolution
```

따라서 “class가 classpath에 존재한다”와 “Spring Bean으로 등록되었다”는 같은 말이 아닙니다.

### stereotype은 역할을 읽게 하는 의미도 있다

`@Component`, `@Service`, `@Repository`, `@Controller`는 component 후보라는 공통점이 있지만 application에서 맡는 역할을 드러냅니다. `@Repository`처럼 framework exception translation과 연결되는 stereotype도 있어 단순 이름표 이상의 의미가 생길 수 있습니다.

다만 annotation을 붙였다고 layer 책임이 자동으로 지켜지는 것은 아닙니다. `@Controller` 안에서 직접 JPA repository를 호출해 transaction과 domain rule을 모두 처리하면 annotation 이름과 실제 책임은 달라집니다.

### scan 범위를 너무 넓혀도 문제가 생긴다

“못 찾는 것”만 scan 문제는 아닙니다. root package를 지나치게 넓게 잡으면 test fixture, 실험용 component, 원하지 않는 configuration까지 후보가 될 수 있습니다.

```java
@ComponentScan("com") // 보통 너무 넓다.
```

이런 설정은 예상하지 못한 Bean 충돌이나 startup side effect를 만들 수 있습니다. application package 구조와 scan boundary를 일치시키면 “왜 이 Bean이 들어왔는지”를 추론하기 쉬워집니다.

### 테스트 slice에서도 scan 범위가 달라진다

`@SpringBootTest`와 `@WebMvcTest`는 같은 application classpath를 보더라도 로드하는 context 범위가 다릅니다. production에서 Bean이 있다고 해서 web slice test에도 자동으로 모두 들어오는 것은 아닙니다. 그래서 테스트에서 missing Bean 오류가 날 때도 “annotation이 붙었나?”와 함께 **현재 테스트가 어떤 component/configuration을 로드하는가**를 봐야 합니다.

### 실무에서 scan 문제를 좁히는 순서

1. 대상 class가 실제로 stereotype/component candidate인가?
2. application/test의 scan base package 안에 있는가?
3. profile/conditional configuration 때문에 제외된 것은 아닌가?
4. 같은 이름이나 타입의 다른 Bean과 충돌하는가?
5. definition은 등록됐지만 생성 단계에서 실패한 것은 아닌가?

component scan은 annotation 자동 등록 기능이지만, 이해해야 할 핵심은 **발견 범위가 객체 그래프의 후보 집합을 결정한다**는 점입니다.
