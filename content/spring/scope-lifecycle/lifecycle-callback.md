---
kind: concept
contentKey: spring.core.scope-lifecycle.lifecycle-callback
topicContentKey: spring.core.scope-lifecycle
slug: lifecycle-callback
title: "초기화·소멸 callback"
summary: "Bean 생성 이후 dependency injection과 post-processing을 거쳐 사용할 준비가 되고 context 종료 시 resource를 정리하는 lifecycle을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html"
    title: "Spring Framework Reference: Customizing the Nature of a Bean"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "lifecycle callbacks, initialization/destruction hooks와 BeanPostProcessor 관계 확인"
---
# 초기화·소멸 callback

어떤 객체는 constructor가 끝났다고 바로 외부 요청을 받을 준비가 끝나는 것이 아닙니다. connection pool, scheduler, client처럼 configuration과 dependency가 모두 들어온 뒤 초기화해야 하는 자원이 있고 application 종료 전에 정리해야 하는 자원도 있습니다.

Spring Bean lifecycle을 아주 단순화하면 다음 흐름으로 볼 수 있습니다.

```text
instance 생성
   │
   ▼
dependency 설정
   │
   ▼
BeanPostProcessor before-init
   │
   ▼
@PostConstruct / init method
   │
   ▼
BeanPostProcessor after-init
   │
   ▼
사용 가능한 Bean
   │
   ▼
context shutdown
   │
   ▼
@PreDestroy / destroy method
```

실제 lifecycle에는 더 많은 extension point가 있지만 이 순서를 이해하면 “constructor에서 해야 할 일”과 “모든 dependency가 준비된 뒤 해야 할 일”을 나누기 쉽습니다.

### constructor에서 외부 side effect를 과하게 시작하지 않는다

```java
@Component
class ReportScheduler {
    ReportScheduler(ReportClient client) {
        // 여기서 별도 thread를 바로 시작?
    }
}
```

constructor는 객체의 기본 invariant를 만드는 데 집중하고, container integration이 끝난 뒤 시작해야 하는 작업은 명시적인 initialization callback을 고려할 수 있습니다. 특히 constructor가 실패하면 Bean creation 자체가 실패하므로 network call을 무분별하게 넣으면 startup이 외부 장애에 과도하게 민감해질 수 있습니다.

### `@PostConstruct`가 모든 startup orchestration 장소는 아니다

초기화 callback은 **그 Bean 자신의 lifecycle 준비**에 적합합니다. 여러 domain use case를 실행하거나 대량 데이터 migration을 수행하는 장소로 사용하면 startup semantics가 숨겨질 수 있습니다. application startup task가 필요하다면 명시적인 runner/job/migration mechanism이 더 적합한지 검토합니다.

### 소멸 callback은 resource ownership과 연결된다

```java
@Component
class ExternalClientHolder {
    private final SomeClient client;

    @PreDestroy
    void close() {
        client.close();
    }
}
```

이 코드가 자연스러운지 판단하려면 **이 Bean이 client lifecycle을 실제로 소유하는가**를 봐야 합니다. 외부에서 공유되는 client를 주입받았는데 임의로 close하면 다른 Bean이 사용할 자원까지 닫을 수 있습니다.

### prototype lifecycle은 별도로 주의한다

container는 prototype Bean을 생성하고 dependency를 넣어 주지만 singleton처럼 모든 prototype instance의 destruction을 추적하지 않습니다. 따라서 prototype object가 socket/file 같은 자원을 소유한다면 caller가 close 책임을 가져야 할 수 있습니다.

### shutdown 때 callback이 항상 무한히 기다릴 수 있는 것도 아니다

production 종료에는 orchestrator/process 종료 timeout이 존재할 수 있습니다. destroy callback에서 끝나지 않는 작업을 기다리면 graceful shutdown이 실패할 수 있습니다. lifecycle hook은 cleanup 기회이지 무제한 실행 시간이 보장되는 별도 batch job이 아닙니다.

Bean lifecycle을 알면 “언제 호출되는 annotation인가”보다 **객체가 어느 시점에 사용할 준비가 되고 누가 자원을 닫는가**라는 ownership 문제로 이해할 수 있습니다.
