---
kind: concept
contentKey: spring.core.production.startup-failure
topicContentKey: spring.core.production
slug: startup-failure
title: "Startup validation과 fail-fast"
summary: "애플리케이션이 요청을 받기 전에 설정·Bean 조립·외부 의존성 오류를 가능한 한 일찍 드러내는 이유와, startup 실패와 runtime 복구 대상을 구분한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-boot/reference/features/external-config.html"
    title: "Spring Boot Reference: Externalized Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 설정 바인딩과 애플리케이션 시작 시점의 구성 확인
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html"
    title: "Spring Framework Reference: Customizing the Nature of a Bean"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Bean 초기화 lifecycle과 초기화 callback 확인
---
# Startup validation과 fail-fast

운영 환경에서 가장 다루기 쉬운 장애는 **서비스가 준비되기 전에 명확하게 실패하는 장애**입니다. 데이터베이스 주소가 잘못되었는데 애플리케이션은 정상 기동한 것처럼 보이고, 첫 주문 요청이 들어온 뒤에야 오류가 드러난다면 문제를 발견하는 시점이 너무 늦습니다. Spring Boot의 startup 단계는 단순히 JVM에 `main()`을 실행하는 시간이 아니라 설정을 읽고, Bean 정의를 만들고, 의존성을 연결하고, 초기화 callback을 실행하며 애플리케이션이 요청을 받을 준비가 되었는지 확인하는 과정입니다.

### 시작할 때 무엇을 확인하는가

단순화하면 흐름은 다음과 같습니다.

```text
main()
  │
  ▼
Environment 구성
  │  application.yml / profile / env var / command line
  ▼
ApplicationContext 생성
  │
  ▼
Bean definition 등록
  │
  ▼
Bean 생성 + 의존성 주입
  │
  ▼
@PostConstruct / InitializingBean / initMethod
  │
  ▼
ApplicationReadyEvent
  │
  ▼
요청 수신 가능
```

예를 들어 필수 설정을 문자열로만 받아 두면 오타가 있어도 실제 사용 시점까지 문제가 숨어 있을 수 있습니다.

```java
@ConfigurationProperties(prefix = "payment")
@Validated
public record PaymentProperties(
        @NotBlank String baseUrl,
        @Min(100) int connectTimeoutMillis
) {
}
```

이처럼 타입과 validation 규칙으로 binding하면 `payment.base-url`이 없거나 timeout 값이 잘못된 경우 시작 단계에서 실패시킬 수 있습니다. 핵심은 “Spring Boot가 알아서 안전하게 해 준다”가 아니라 **우리가 startup에 검증 가능한 계약을 얼마나 명시했는가**입니다.

### fail-fast가 항상 외부 시스템 연결 성공을 뜻하지는 않는다

외부 결제 API가 잠시 내려가 있다고 해서 애플리케이션 자체를 시작하지 못하게 만드는 것이 항상 좋은 선택은 아닙니다. 설정 자체가 잘못된 경우와 일시적인 외부 장애는 성격이 다릅니다.

| 상황                                          | 권장 판단                                        |
| --------------------------------------------- | ------------------------------------------------ |
| 필수 URL 누락, 잘못된 enum 값, 중복 Bean      | startup에서 실패                                 |
| DB migration 불일치로 데이터 무결성 보장 불가 | startup 실패를 강하게 검토                       |
| 일시적인 외부 API 503                         | runtime timeout/retry/circuit 정책으로 처리 가능 |
| 선택 기능의 부가 서비스 unavailable           | degraded mode 가능 여부 판단                     |

모든 외부 시스템에 startup health check를 걸어 두면 한 시스템의 짧은 장애가 전체 배포 실패로 전파될 수 있습니다. 반대로 필수 schema나 credential이 잘못되었는데도 억지로 기동하면 첫 요청이 장애를 대신 발견합니다. **기동 불가 조건과 runtime 복구 조건을 나누는 것**이 운영 설계입니다.

### Bean 초기화에 무거운 작업을 넣을 때 생기는 문제

```java
@PostConstruct
void warmUp() {
    remoteCatalogClient.downloadAll();
}
```

이 코드는 단순해 보이지만 remote API가 느리면 전체 startup 시간이 늘고, timeout 정책이 부실하면 배포가 멈춥니다. 초기화 callback은 “애플리케이션 준비 전에 반드시 완료되어야 하는가?”라는 질문으로 검토해야 합니다. 캐시 warming처럼 실패해도 나중에 복구 가능한 작업이라면 startup 필수 경로 밖으로 분리하는 편이 나을 수 있습니다.

### 실무에서 확인할 것

startup 장애를 볼 때는 stack trace의 마지막 예외 한 줄만 보지 않고 **어느 단계에서 실패했는지**를 먼저 찾습니다. property binding인지, Bean 후보 충돌인지, circular dependency인지, migration인지, 초기화 callback인지에 따라 원인이 완전히 달라집니다. 좋은 startup 설계는 장애를 없애는 것이 아니라 **잘못된 구성은 빨리 멈추고, 일시 장애는 적절한 runtime 복구 경로로 넘기는 경계**를 만듭니다.
