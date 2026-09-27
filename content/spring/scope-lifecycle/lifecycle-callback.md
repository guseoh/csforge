---
kind: concept
contentKey: spring.core.scope-lifecycle.lifecycle-callback
topicContentKey: spring.core.scope-lifecycle
slug: lifecycle-callback
title: "초기화·소멸 콜백"
summary: "Bean 생성 이후 의존성 주입과 후처리를 거쳐 사용할 준비가 되고 컨텍스트 종료 시 자원을 정리하는 생명주기를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html"
    title: "Spring Framework Reference: Customizing the Nature of a Bean"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "생명주기 콜백, 초기화·소멸 hook과 BeanPostProcessor 관계 확인"
---
# 초기화·소멸 콜백

어떤 객체는 생성자가 끝났다고 바로 외부 요청을 받을 준비가 끝나는 것이 아닙니다. connection pool, scheduler, client처럼 설정과 의존성이 모두 들어온 뒤 초기화해야 하는 자원이 있고 애플리케이션 종료 전에 정리해야 하는 자원도 있습니다.

Spring Bean 생명주기를 아주 단순화하면 다음 흐름으로 볼 수 있습니다.

```text
객체 생성
   │
   ▼
의존성 설정
   │
   ▼
BeanPostProcessor 초기화 전 처리
   │
   ▼
@PostConstruct / init method
   │
   ▼
BeanPostProcessor 초기화 후 처리
   │
   ▼
사용 가능한 Bean
   │
   ▼
컨텍스트 종료
   │
   ▼
@PreDestroy / destroy method
```

실제 생명주기에는 더 많은 확장 지점이 있지만 이 순서를 이해하면 “생성자에서 해야 할 일”과 “모든 의존성이 준비된 뒤 해야 할 일”을 나누기 쉽습니다.

### 생성자에서 외부 부수 효과를 과하게 시작하지 않는다

```java
@Component
class ReportScheduler {
    ReportScheduler(ReportClient client) {
        // 여기서 별도 스레드를 바로 시작?
    }
}
```

생성자는 객체의 기본 불변식을 만드는 데 집중하고, Spring의 의존성 연결과 후처리가 끝난 뒤 시작해야 하는 작업은 명시적인 초기화 콜백을 고려할 수 있습니다. 특히 생성자가 실패하면 Bean 생성 자체가 실패하므로 네트워크 호출을 무분별하게 넣으면 애플리케이션 시작이 외부 장애에 과도하게 민감해질 수 있습니다.

### `@PostConstruct`가 모든 시작 작업의 조정 장소는 아니다

초기화 콜백은 **그 Bean 자신의 사용 준비**에 적합합니다. 여러 도메인 기능을 실행하거나 대량 데이터 migration을 수행하는 장소로 사용하면 시작 시점의 의미가 숨겨질 수 있습니다. 애플리케이션 시작 작업이 필요하다면 명시적인 runner, job, migration 방식이 더 적합한지 검토합니다.

### 소멸 콜백은 자원 소유권과 연결된다

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

이 코드가 자연스러운지 판단하려면 **이 Bean이 client의 생명주기를 실제로 소유하는가**를 봐야 합니다. 외부에서 공유되는 client를 주입받았는데 임의로 `close()`하면 다른 Bean이 사용할 자원까지 닫을 수 있습니다.

### prototype 생명주기는 별도로 주의한다

컨테이너는 prototype Bean을 생성하고 의존성을 넣어 주지만 singleton처럼 모든 prototype 객체의 소멸을 추적하지 않습니다. 따라서 prototype 객체가 socket이나 file 같은 자원을 소유한다면 호출자가 정리 책임을 가져야 할 수 있습니다.

### 종료 콜백도 무한히 기다릴 수 있는 것은 아니다

운영 환경의 프로세스 종료에는 제한 시간이 있을 수 있습니다. 소멸 콜백에서 끝나지 않는 작업을 기다리면 정상 종료가 실패하고 배포 시스템이 강제 종료할 수 있습니다. 생명주기 콜백은 자원을 정리할 기회이지 무제한 실행 시간이 보장되는 별도 배치 작업이 아닙니다.

Bean 생명주기를 알면 “언제 호출되는 annotation인가”보다 **객체가 어느 시점에 사용할 준비가 되고 누가 자원을 닫는가**라는 소유권 문제로 이해할 수 있습니다.
