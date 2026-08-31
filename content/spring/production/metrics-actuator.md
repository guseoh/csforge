---
kind: concept
contentKey: spring.core.production.metrics-actuator
topicContentKey: spring.core.production
slug: metrics-actuator
title: "Actuator와 metrics로 애플리케이션 상태 관측하기"
summary: "health와 metrics가 서로 다른 질문에 답한다는 점을 이해하고, 요청 latency·error·JVM·connection pool 지표를 실제 원인 추적에 연결하며 endpoint 노출 위험을 함께 판단한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-boot/reference/actuator/index.html"
    title: "Spring Boot Reference: Actuator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Actuator endpoint와 production-ready feature 확인
  - url: "https://docs.micrometer.io/micrometer/reference/"
    title: "Micrometer Reference"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: meter, tag, timer 등 metrics instrumentation 모델 확인
---
# Actuator와 metrics로 애플리케이션 상태 관측하기

애플리케이션이 “살아 있다”는 것과 “정상적으로 일하고 있다”는 것은 다릅니다. 프로세스가 실행 중이어도 DB connection pool이 고갈되어 모든 요청이 5초씩 기다릴 수 있고, 평균 응답 시간은 괜찮아도 상위 1% 요청만 심하게 느릴 수 있습니다. Actuator와 Micrometer는 이런 상태를 **추측이 아니라 관측 가능한 값**으로 바꾸는 도구입니다.

### health와 metrics는 답하는 질문이 다르다

`/actuator/health`는 보통 현재 컴포넌트가 사용 가능한 상태인지 빠르게 판단하는 데 쓰입니다. metrics는 시간이 흐르면서 얼마나 자주, 얼마나 오래, 얼마나 많이 발생했는지를 봅니다.

| 관측                  | 주로 답하는 질문                 |
| --------------------- | -------------------------------- |
| health                | 지금 요청을 받아도 되는가?       |
| request count         | 트래픽이 얼마나 들어오는가?      |
| latency               | 요청이 얼마나 오래 걸리는가?     |
| error count/rate      | 실패가 증가했는가?               |
| Hikari active/pending | DB connection이 고갈되고 있는가? |
| JVM heap/GC           | 메모리 압박이나 긴 GC가 있는가?  |

예를 들어 `500`이 증가했다는 사실만으로 원인을 알 수는 없습니다. 같은 시간대에 DB connection pending이 증가했고 query latency도 같이 올라갔다면 DB 경로를 우선 조사할 근거가 생깁니다.

### 평균값 하나만 보면 장애가 숨는다

요청 시간이 다음과 같다고 해 봅시다.

```text
98개 요청:  80 ms
 1개 요청: 900 ms
 1개 요청: 5,000 ms
```

평균만 보면 대략 138ms라 “괜찮아 보일” 수 있지만 실제 사용자 일부는 5초를 기다립니다. 그래서 latency는 histogram/percentile 등 분포를 함께 보는 경우가 많습니다. 다만 percentile을 무작정 많이 활성화하면 저장 비용과 cardinality가 커질 수 있으므로 필요한 SLI에 맞춰 측정합니다.

### tag는 편리하지만 cardinality가 비용을 만든다

다음처럼 사용자 ID를 tag로 넣으면 사용자별 latency를 볼 수 있을 것 같습니다.

```java
registry.counter("order.created", "memberId", memberId.toString()).increment();
```

하지만 member가 수십만 명이면 metric series도 폭발할 수 있습니다. metric tag에는 보통 `status`, `method`, 제한된 `uri template`처럼 값 종류가 제한된 dimension을 사용하고, 개별 요청 ID나 사용자 ID 같은 고유값은 log/trace 쪽으로 넘기는 것이 자연스럽습니다.

### Actuator endpoint는 운영 정보이기도 하다

`env`, `configprops`, `beans`, `mappings` 같은 endpoint는 진단에 유용하지만 설정값과 내부 구조를 노출할 수 있습니다. 그래서 production에서는 필요한 endpoint만 노출하고 인증·network 접근 범위를 함께 제한해야 합니다.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

이 설정 자체가 정답은 아닙니다. 외부 공개 endpoint와 내부 운영 endpoint의 경계를 어떻게 둘지 deployment 구조와 함께 결정해야 합니다.

### 측정은 개선보다 먼저 온다

“Redis를 쓰면 빨라질 것 같다”, “thread pool을 늘리면 될 것 같다”는 판단보다 먼저 현재 latency, query 수, connection wait, CPU, heap, error pattern을 확인합니다. metrics의 목적은 숫자를 많이 모으는 것이 아니라 **문제의 위치를 좁히고 변경 전후를 비교할 근거를 만드는 것**입니다.
