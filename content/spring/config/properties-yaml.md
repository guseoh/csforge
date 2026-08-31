---
kind: concept
contentKey: spring.core.config.properties-yaml
topicContentKey: spring.core.config
slug: properties-yaml
title: "properties와 YAML"
summary: "환경에 따라 달라지는 값을 코드에서 분리해 externalized configuration으로 공급하고, 표현 형식과 실제 property key/value 모델을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-boot/reference/features/external-config.html"
    title: "Spring Boot Reference: Externalized Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring Boot externalized configuration과 property source 모델 확인"
---
# properties와 YAML

같은 application binary를 local, test, production에서 실행하려면 DB URL, timeout, 외부 API endpoint처럼 환경에 따라 달라지는 값이 생깁니다. 이런 값을 Java source에 박아 두면 환경 하나가 바뀔 때마다 code를 수정하고 다시 build해야 합니다.

```java
String baseUrl = "https://prod-payment.example"; // 환경 정보가 code에 고정
```

Spring Boot의 externalized configuration은 이런 값을 application 밖에서 공급하고 code는 **property의 의미와 type**만 알도록 분리합니다.

```properties
payment.base-url=https://sandbox-payment.example
payment.connect-timeout=2s
```

같은 내용은 YAML로도 표현할 수 있습니다.

```yaml
payment:
  base-url: https://sandbox-payment.example
  connect-timeout: 2s
```

### properties와 YAML은 표현 방식이고 핵심은 property model이다

두 형식의 가장 큰 차이를 “YAML은 계층형이라 더 좋다”처럼 단순화할 필요는 없습니다. Spring Environment 관점에서는 결국 key/value property source로 해석됩니다.

```text
payment.base-url
payment.connect-timeout
```

YAML은 중첩 구조를 사람이 읽기 편하게 표현할 수 있지만 indentation 오류나 profile 문서 구분을 주의해야 하고, `.properties`는 단순하고 명시적입니다. 팀이 일관되게 관리할 수 있는 형식을 고르는 것이 중요합니다.

### configuration은 바깥에 있다고 모두 안전한 것은 아니다

`application.yml`을 Git에 commit하면서 password/API key를 넣으면 source code에 상수를 박지 않았을 뿐 secret 유출 위험은 그대로입니다.

```yaml
payment:
  api-key: real-production-key # repository에 들어가면 위험
```

secret은 environment/secret manager처럼 접근 통제된 source에서 공급하고, application 설정 object에는 값이 주입되더라도 log/toString/Actuator로 노출되지 않도록 해야 합니다.

### configuration 값도 application contract다

`timeout=2000`이라고 쓰면 2000초인지 millisecond인지 해석이 애매할 수 있습니다. Boot의 duration/data size binding처럼 단위를 표현할 수 있는 형식을 사용하면 의미가 분명해집니다.

```yaml
client:
  connect-timeout: 2s
  max-file-size: 10MB
```

값을 문자열로 흩어 읽기보다 다음 Concept의 `@ConfigurationProperties`처럼 type-safe하게 묶는 이유도 여기서 나옵니다.

### 환경 파일을 늘리는 것과 profile을 남발하는 것은 다르다

`application-local.yml`, `application-prod.yml`을 분리할 수 있지만 profile마다 전체 설정을 복제하면 어느 값이 최종적으로 적용되는지 어려워집니다. 공통 기본값은 한곳에 두고 정말 다른 값만 override하는 편이 drift를 줄입니다.

externalized configuration의 핵심은 file extension이 아니라 **동일한 application code가 환경별 값을 외부에서 받아 실행될 수 있게 만드는 것**입니다.
