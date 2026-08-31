---
kind: concept
contentKey: spring.core.config.profiles-precedence
topicContentKey: spring.core.config
slug: profiles-precedence
title: "profiles와 설정 우선순위"
summary: "여러 property source와 profile이 같은 key를 제공할 때 최종 값이 한 번 더 override될 수 있다는 점을 실제 실행 환경에서 추론한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config"
    title: "Spring Boot Reference: PropertySource Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring Boot property source precedence와 overriding 규칙 확인"
  - url: "https://docs.spring.io/spring-boot/reference/features/profiles.html"
    title: "Spring Boot Reference: Profiles"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "active profile과 profile-specific configuration 확인"
---
# profiles와 설정 우선순위

설정 문제는 파일 안의 값을 읽는 것보다 **같은 key가 여러 곳에서 정의될 때 최종적으로 어떤 값이 이기는가**를 추적하는 일이 더 어렵습니다.

예를 들어 repository에는 다음 설정이 있습니다.

```yaml
# application.yml
server:
  port: 8080
```

production profile에는:

```yaml
# application-prod.yml
server:
  port: 9090
```

그리고 container environment에는:

```text
SERVER_PORT=10080
```

실제 port를 알아내려면 “prod 파일이 있으니 9090”이라고만 볼 수 없습니다. 활성 profile과 더 높은 우선순위 property source를 함께 확인해야 합니다.

### profile은 설정 묶음 선택이고 precedence는 같은 key의 최종 승자를 정한다

두 개념을 분리해서 보면 쉽습니다.

```text
어떤 설정 source들이 후보인가? -> profile / config location
             │
             ▼
같은 key가 여러 번 나오면?      -> property source precedence
             │
             ▼
최종 Environment 값
```

profile을 활성화하면 profile-specific source가 후보에 들어오지만 command-line/environment variable 등 다른 source가 다시 override할 수 있습니다.

### 운영 장애에서는 “파일 내용”보다 runtime effective value를 본다

`application-prod.yml`에 올바른 DB URL이 있는데 application이 엉뚱한 DB에 연결되었다면 다음을 확인합니다.

1. prod profile이 실제로 active인가?
2. environment variable/command line에 같은 property가 있는가?
3. external config file location이 추가되었는가?
4. 이름 변환(relaxed binding)으로 다른 환경 변수가 같은 property에 매핑되는가?
5. startup log/Actuator env를 안전하게 확인할 수 있는가?

secret 값은 관측할 때 masking이 필요합니다.

### profile을 business feature flag처럼 쓰지 않는다

`prod`/`local`처럼 deployment 환경 차이를 표현하는 profile은 자연스럽습니다. 하지만 회원 등급별 할인처럼 request마다 달라지는 business rule을 profile로 선택하면 application을 다시 시작해야 정책이 바뀌는 이상한 구조가 됩니다.

```text
profile: application 구성 선택
business state: runtime domain/application 판단
```

### 기본값과 override를 설계한다

안전한 default를 code/config에 두고 environment에서 필요한 값만 override하는 방식은 운영 편의가 큽니다. 반대로 production에 반드시 명시되어야 하는 secret이나 endpoint에 위험한 fallback을 두면 누락이 조용히 잘못된 시스템으로 연결될 수 있습니다.

```java
// 필수 production key라면 빈 기본값보다 startup validation으로 실패시키는 편이 낫다.
```

configuration precedence를 잘 이해한다는 것은 외우는 순번을 말하는 것보다 **현재 실행 프로세스가 어떤 source를 읽었고 최종 effective value가 왜 그 값인지 추적할 수 있는 것**입니다.
