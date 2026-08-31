---
kind: concept
contentKey: spring.core.injection.optional-dependency
topicContentKey: spring.core.injection
slug: optional-dependency
title: "선택적 의존성"
summary: "협력자가 없어도 객체가 유효한지 먼저 판단하고, optional injection이 필요한 경우와 null/Optional/ObjectProvider/Null Object 같은 대안을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html"
    title: "Spring Framework Reference: Using @Autowired"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "required=false, Optional, ObjectProvider 등 annotation-based injection 방식 확인"
---
# 선택적 의존성

“Bean이 있으면 쓰고 없으면 건너뛴다”는 요구는 실제로 존재합니다. 예를 들어 local 환경에서는 외부 analytics sink를 등록하지 않고 production에서만 사용할 수 있습니다. 하지만 dependency를 optional로 만드는 순간 객체의 가능한 상태가 늘어납니다.

```java
class AuditService {
    private final Optional<ExternalAuditSink> sink;

    void record(Event event) {
        sink.ifPresent(it -> it.send(event));
    }
}
```

이 코드가 맞으려면 **sink가 없어도 `AuditService`가 정상적으로 책임을 수행한다**는 제품 의미가 먼저 성립해야 합니다.

### “Bean을 못 찾으니 optional로”는 위험하다

startup에서 `NoSuchBeanDefinitionException`이 나자 다음처럼 바꾸는 것은 근본 해결이 아닐 수 있습니다.

```java
@Autowired(required = false)
ExternalAuditSink sink;
```

원래 반드시 있어야 하는 payment gateway가 등록되지 않은 것이라면 application을 시작시키는 것보다 조기에 실패하는 편이 안전합니다. optional injection은 configuration 오류를 숨기기 위한 escape hatch가 아닙니다.

### 선택지가 여러 가지인 이유는 사용 시점이 다르기 때문이다

| 방식                      | 특징                             | 적합한 경우                                             |
| ------------------------- | -------------------------------- | ------------------------------------------------------- |
| nullable reference        | 가장 단순하지만 null 검사 필요   | framework integration 경계의 제한적 사용                |
| `Optional<T>`             | 부재를 type으로 표현             | 실제로 부재가 정상 상태일 때                            |
| `ObjectProvider<T>`       | lazy/optional/multiple lookup    | container lookup semantics가 필요한 infrastructure code |
| Null Object               | 항상 같은 interface 사용         | “아무것도 하지 않음”이 명확한 행동일 때                 |
| conditional configuration | 객체 그래프 자체를 환경별로 바꿈 | 기능 단위 enable/disable                                |

application/domain code가 `ObjectProvider`를 자주 사용한다면 business code가 container lookup semantics를 알아야 하는지 다시 볼 필요가 있습니다.

### optional collaborator가 if 문을 퍼뜨릴 때

```java
if (notifier != null) { ... }
if (notifier != null) { ... }
if (notifier != null) { ... }
```

부재 검사가 여러 method에 반복되면 “알림을 보내지 않는 구현”을 주입하거나, use case 자체를 configuration에서 다른 implementation으로 조립하는 편이 책임을 단순하게 만들 수 있습니다.

```java
class NoopNotifier implements Notifier {
    public void send(Message message) { }
}
```

다만 Null Object도 실패를 숨겨서는 안 됩니다. 결제 승인처럼 collaborator 부재가 업무 실패인 경우 noop implementation은 위험합니다.

### optionality는 domain 의미부터 정한다

선택적 의존성을 설계할 때 순서는 다음과 같습니다.

1. collaborator가 없어도 객체/기능이 정상인가?
2. 부재가 environment configuration인가 request별 business state인가?
3. caller가 부재를 알아야 하는가, implementation이 흡수해야 하는가?
4. 부재가 실수라면 startup을 실패시키는 편이 낫지 않은가?

Spring은 여러 injection 도구를 제공하지만 **무엇이 optional인가를 결정하는 것은 framework가 아니라 application 의미**입니다.
