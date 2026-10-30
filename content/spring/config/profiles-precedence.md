---
kind: concept
contentKey: spring.core.config.profiles-precedence
topicContentKey: spring.core.config
slug: profiles-precedence
title: "프로필과 설정 우선순위"
summary: "여러 설정 소스와 프로필이 같은 key를 제공할 때 우선순위에 따라 최종 값이 결정되는 과정을 실제 실행 환경에서 추론한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config"
    title: "Spring Boot Reference: PropertySource Order"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring Boot property source 우선순위와 덮어쓰기 규칙 확인"
  - url: "https://docs.spring.io/spring-boot/reference/features/profiles.html"
    title: "Spring Boot Reference: Profiles"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "활성 프로필과 프로필별 설정 확인"
---
# 프로필과 설정 우선순위

설정 문제는 파일 안의 값을 읽는 것보다 **같은 key가 여러 곳에서 정의될 때 최종적으로 어떤 값이 선택되는가**를 추적하는 일이 더 어렵습니다.

예를 들어 저장소에는 다음 설정이 있습니다.

```yaml
# application.yml
server:
  port: 8080
```

운영 프로필에는 다음 값이 있습니다.

```yaml
# application-prod.yml
server:
  port: 9090
```

그리고 컨테이너 환경 변수에는 다음 값이 있습니다.

```text
SERVER_PORT=10080
```

실제 포트를 알아내려면 “prod 파일이 있으니 9090”이라고만 볼 수 없습니다. 활성 프로필과 더 높은 우선순위의 설정 소스를 함께 확인해야 합니다.

### 프로필은 설정 묶음을 선택하고 우선순위는 같은 key의 최종 값을 정한다

두 개념을 분리해서 보면 쉽습니다.

```text
어떤 설정 소스가 후보인가? -> 프로필 / 설정 파일 위치
             │
             ▼
같은 key가 여러 번 나오면?  -> 설정 소스 우선순위
             │
             ▼
최종 Environment 값
```

프로필을 활성화하면 프로필 전용 설정 소스가 후보에 들어오지만 명령행 인자나 환경 변수처럼 더 높은 우선순위의 입력이 같은 key를 다시 덮어쓸 수 있습니다.

### 운영 장애에서는 “파일 내용”보다 실제 실행 값을 본다

`application-prod.yml`에 올바른 DB URL이 있는데 애플리케이션이 엉뚱한 DB에 연결되었다면 다음을 확인합니다.

1. prod 프로필이 실제로 활성화되었는가?
2. 환경 변수나 명령행 인자에 같은 property가 있는가?
3. 외부 설정 파일 위치가 추가되었는가?
4. relaxed binding으로 다른 환경 변수 이름이 같은 property에 매핑되는가?
5. 시작 로그나 Actuator 환경 정보를 민감값을 가린 상태로 확인할 수 있는가?

비밀값은 관측할 때 반드시 노출 위험을 고려해야 합니다.

### 프로필을 업무 기능 플래그처럼 쓰지 않는다

`prod`·`local`처럼 배포 환경 차이를 표현하는 프로필은 자연스럽습니다. 하지만 회원 등급별 할인처럼 요청마다 달라지는 업무 규칙을 프로필로 선택하면 정책을 바꾸기 위해 애플리케이션을 다시 시작해야 하는 이상한 구조가 됩니다.

```text
프로필       : 애플리케이션 구성 선택
업무 상태    : 실행 중 도메인·애플리케이션 판단
```

### 기본값과 덮어쓰기를 설계한다

안전한 기본값을 코드나 설정에 두고 환경에서 필요한 값만 덮어쓰는 방식은 운영 편의가 큽니다. 반대로 운영 환경에서 반드시 명시되어야 하는 비밀값이나 외부 주소에 위험한 기본값을 두면 누락이 조용히 잘못된 시스템으로 연결될 수 있습니다.

```java
// 필수 운영 key라면 빈 기본값보다 시작 검증에서 실패시키는 편이 낫다.
```

설정 우선순위를 잘 이해한다는 것은 순번을 외우는 것보다 **현재 실행 중인 프로세스가 어떤 설정 소스를 읽었고 최종 값이 왜 그 값이 되었는지 추적할 수 있는 것**입니다.
