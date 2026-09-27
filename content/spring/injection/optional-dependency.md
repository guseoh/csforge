---
kind: concept
contentKey: spring.core.injection.optional-dependency
topicContentKey: spring.core.injection
slug: optional-dependency
title: "선택적 의존성"
summary: "협력 객체가 없어도 기능이 유효한지 먼저 판단하고, 선택적 주입이 필요한 경우와 null/Optional/ObjectProvider/Null Object 같은 대안을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html"
    title: "Spring Framework Reference: Using @Autowired"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "required=false, Optional, ObjectProvider 등 annotation 기반 선택적 주입 방식 확인"
---
# 선택적 의존성

“Bean이 있으면 쓰고 없으면 건너뛴다”는 요구는 실제로 존재합니다. 예를 들어 로컬 환경에서는 외부 분석 시스템을 등록하지 않고 운영 환경에서만 사용할 수 있습니다. 하지만 의존성을 선택적으로 만드는 순간 객체가 가질 수 있는 상태가 늘어납니다.

```java
class AuditService {
    private final Optional<ExternalAuditSink> sink;

    void record(Event event) {
        sink.ifPresent(it -> it.send(event));
    }
}
```

이 코드가 맞으려면 **sink가 없어도 `AuditService`가 정상적으로 자신의 책임을 수행한다**는 제품 의미가 먼저 성립해야 합니다.

### “Bean을 못 찾으니 선택적으로 바꾸자”는 위험하다

시작 시 `NoSuchBeanDefinitionException`이 발생했다고 다음처럼 바꾸는 것은 근본 해결이 아닐 수 있습니다.

```java
@Autowired(required = false)
ExternalAuditSink sink;
```

원래 반드시 있어야 하는 `PaymentGateway`가 등록되지 않은 것이라면 애플리케이션을 억지로 시작시키는 것보다 조기에 실패하는 편이 안전합니다. 선택적 주입은 설정 오류를 숨기기 위한 우회 수단이 아닙니다.

### 선택지가 여러 가지인 이유는 부재를 다루는 방식이 다르기 때문이다

| 방식                       | 특징                                 | 적합한 경우                                      |
| -------------------------- | ------------------------------------ | ------------------------------------------------ |
| nullable 참조              | 가장 단순하지만 null 검사 필요       | 프레임워크 연동 경계의 제한적 사용               |
| `Optional<T>`              | 값의 부재를 타입으로 표현            | 실제로 부재가 정상 상태일 때                     |
| `ObjectProvider<T>`        | 지연 조회·선택 조회·여러 후보 조회   | Spring 컨테이너 조회 기능이 필요한 인프라 코드   |
| Null Object                | 항상 같은 인터페이스로 호출          | “아무것도 하지 않음”이 명확한 행동일 때          |
| 조건부 설정                | 객체 그래프 자체를 환경별로 바꿈     | 기능 단위 활성화·비활성화                        |

애플리케이션·도메인 코드가 `ObjectProvider`를 자주 사용한다면 업무 코드가 Spring 컨테이너 조회 방식까지 알아야 하는지 다시 볼 필요가 있습니다.

### 선택적 협력 객체 때문에 if문이 퍼질 때

```java
if (notifier != null) { ... }
if (notifier != null) { ... }
if (notifier != null) { ... }
```

부재 검사가 여러 메서드에 반복되면 “알림을 보내지 않는 구현”을 주입하거나, 기능 자체를 설정 단계에서 다른 구현으로 조립하는 편이 책임을 단순하게 만들 수 있습니다.

```java
class NoopNotifier implements Notifier {
    public void send(Message message) { }
}
```

다만 Null Object도 실패를 숨겨서는 안 됩니다. 결제 승인처럼 협력 객체 부재 자체가 업무 실패인 경우 noop 구현은 위험합니다.

### 선택성은 도메인 의미부터 정한다

선택적 의존성을 설계할 때는 다음을 확인합니다.

1. 협력 객체가 없어도 객체나 기능이 정상인가?
2. 부재가 실행 환경 설정 때문인가, 요청별 업무 상태 때문인가?
3. 호출자가 부재를 알아야 하는가, 구현이 흡수해야 하는가?
4. 부재가 설정 실수라면 시작 단계에서 실패시키는 편이 낫지 않은가?

Spring은 여러 주입 도구를 제공하지만 **무엇이 선택적이어야 하는지를 결정하는 것은 프레임워크가 아니라 애플리케이션 의미**입니다.
