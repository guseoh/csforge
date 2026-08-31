---
kind: concept
contentKey: spring.core.config.configuration-binding
topicContentKey: spring.core.config
slug: configuration-binding
title: "타입 안전 configuration binding"
summary: "관련 property를 @ConfigurationProperties 객체로 묶고 duration/URL/range 같은 type과 validation을 startup contract로 만들어 잘못된 환경을 조기에 실패시킨다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties"
    title: "Spring Boot Reference: Type-safe Configuration Properties"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@ConfigurationProperties binding과 type-safe external configuration 확인"
---
# 타입 안전 configuration binding

property를 필요할 때마다 문자열 key로 읽으면 설정 구조가 code 곳곳에 퍼집니다.

```java
@Value("${payment.timeout}")
private long timeout;

@Value("${payment.base-url}")
private String baseUrl;
```

`timeout` 단위가 무엇인지, URL 형식이 유효한지, 두 값이 같은 configuration 그룹인지 field만 보고 알기 어렵습니다. `@ConfigurationProperties`는 관련 값을 하나의 configuration object로 묶어 **application이 기대하는 환경 contract**를 type으로 표현할 수 있습니다.

```java
@ConfigurationProperties(prefix = "payment")
public record PaymentProperties(
        URI baseUrl,
        Duration connectTimeout,
        int maxRetries
) { }
```

```yaml
payment:
  base-url: https://sandbox.example
  connect-timeout: 2s
  max-retries: 3
```

### 문자열이 아니라 의미 있는 type으로 변환한다

`URI`, `Duration`, enum 같은 type을 사용하면 잘못된 값이 binding 시점에 드러날 수 있습니다.

```text
"2s" -> Duration
"https://..." -> URI
"STRICT" -> enum
```

이것은 단순 편의가 아니라 downstream code가 매번 parsing/단위 확인을 반복하지 않게 만듭니다.

### startup validation으로 환경 자체를 거부할 수 있다

```java
@Validated
@ConfigurationProperties(prefix = "worker")
public record WorkerProperties(
        @Min(1) @Max(100) int concurrency,
        @NotNull Duration timeout
) { }
```

production에서 `concurrency=0`이 들어왔다면 요청이 들어온 뒤 이상하게 실패하기보다 application startup에서 configuration error로 멈추는 편이 보통 더 안전합니다.

```text
잘못된 환경 값
    │
    ▼
binding / validation 실패
    │
    ▼
startup 실패 -> deploy 단계에서 발견
```

### validation이 business rule을 대신하지 않는다

`max-retries` 범위 같은 configuration invariant는 properties object에 적합하지만, 주문 가능한 상태나 할인 정책은 request/domain state에 따라 달라집니다. `@ConfigurationProperties` validation이 강력하다고 모든 domain validation을 이곳으로 옮기는 것은 책임 혼합입니다.

### secret을 type-safe하게 묶어도 노출 위험은 남는다

```java
record PaymentProperties(String apiKey, URI baseUrl) { }
```

이 record를 log에 그대로 출력하면 `toString()`을 통해 secret이 노출될 수 있습니다. secret configuration object는 debug/log/Actuator exposure까지 고려해야 합니다. type safety는 confidentiality를 보장하지 않습니다.

### configuration object를 어디까지 넘길까

application 전체에 `PaymentProperties`를 주입해 모든 class가 설정 구조를 알게 하기보다, configuration layer에서 필요한 primitive/value를 사용해 `PaymentClient`를 만들고 service에는 완성된 client를 주입하면 configuration detail의 전파를 줄일 수 있습니다.

```text
Environment -> PaymentProperties -> PaymentClient -> application service
```

configuration binding은 file을 record로 바꾸는 기능을 넘어 **실행 환경의 입력을 명시적인 type과 startup invariant로 변환하는 경계**입니다.
