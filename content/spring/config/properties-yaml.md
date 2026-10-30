---
kind: concept
contentKey: spring.core.config.properties-yaml
topicContentKey: spring.core.config
slug: properties-yaml
title: "properties와 YAML"
summary: "환경에 따라 달라지는 값을 코드에서 분리해 외부 설정으로 공급하고, 파일 표현 형식과 실제 property key/value 모델을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-boot/reference/features/external-config.html"
    title: "Spring Boot Reference: Externalized Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring Boot 외부 설정과 property source 모델 확인"
---
# properties와 YAML

같은 애플리케이션을 로컬, 테스트, 운영 환경에서 실행하려면 DB URL, 타임아웃, 외부 API 주소처럼 환경에 따라 달라지는 값이 생깁니다. 이런 값을 Java 소스에 박아 두면 환경 하나가 바뀔 때마다 코드를 수정하고 다시 빌드해야 합니다.

```java
String baseUrl = "https://prod-payment.example"; // 환경 정보가 코드에 고정
```

Spring Boot의 외부 설정 기능은 이런 값을 애플리케이션 밖에서 공급하고 코드는 **property의 의미와 타입**만 알도록 분리합니다.

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

### properties와 YAML은 표현 방식이고 핵심은 property 모델이다

두 형식의 차이를 “YAML은 계층형이라 더 좋다”처럼 단순화할 필요는 없습니다. Spring Environment 관점에서는 결국 key/value 형태의 설정 소스로 해석됩니다.

```text
payment.base-url
payment.connect-timeout
```

YAML은 중첩 구조를 사람이 읽기 편하게 표현할 수 있지만 들여쓰기 오류나 프로필 문서 구분을 주의해야 하고, `.properties`는 단순하고 명시적입니다. 팀이 일관되게 관리할 수 있는 형식을 고르는 것이 중요합니다.

### 설정을 코드 밖으로 뺐다고 모두 안전한 것은 아니다

`application.yml`을 Git에 커밋하면서 비밀번호나 API key를 넣으면 Java 소스에 상수를 박지 않았을 뿐 비밀값 유출 위험은 그대로입니다.

```yaml
payment:
  api-key: real-production-key # 저장소에 들어가면 위험
```

비밀값은 환경 변수나 secret manager처럼 접근 통제된 소스에서 공급하고, 애플리케이션 설정 객체에 값이 주입되더라도 로그·`toString()`·Actuator로 노출되지 않도록 해야 합니다.

### 설정 값도 애플리케이션 계약이다

`timeout=2000`이라고 쓰면 2000초인지 밀리초인지 애매할 수 있습니다. Spring Boot의 `Duration`, data size 바인딩처럼 단위를 표현할 수 있는 타입을 사용하면 의미가 분명해집니다.

```yaml
client:
  connect-timeout: 2s
  max-file-size: 10MB
```

값을 문자열로 흩어 읽기보다 다음 Concept의 `@ConfigurationProperties`처럼 타입 안전하게 묶는 이유도 여기서 나옵니다.

### 환경 파일을 늘리는 것과 프로필을 남발하는 것은 다르다

`application-local.yml`, `application-prod.yml`을 분리할 수 있지만 프로필마다 전체 설정을 복제하면 어느 값이 최종 적용되는지 추적하기 어려워집니다. 공통 기본값은 한곳에 두고 정말 다른 값만 덮어쓰는 편이 환경별 설정 차이를 줄입니다.

외부 설정의 핵심은 파일 확장자가 아니라 **동일한 애플리케이션 코드가 환경별 값을 외부에서 받아 실행될 수 있게 만드는 것**입니다.
