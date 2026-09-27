---
kind: concept
contentKey: messaging.core.workflow.backpressure-capacity
topicContentKey: messaging.core.workflow
slug: backpressure-capacity
title: "생산 속도와 컨슈머 처리 용량"
summary: "프로듀서가 컨슈머보다 빠를 때 lag와 지연 시간이 누적되는 이유를 이해하고 생산 제한·컨슈머 확장·재시도 분리로 전체 처리 용량을 조정한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kafka.apache.org/42/operations/basic-kafka-operations/"
    title: "Apache Kafka 4.2 Operations: Basic Kafka Operations"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "컨슈머 그룹의 할당 파티션과 lag를 운영 명령으로 확인하는 절차를 참고한다."
    displayOrder: 1
    relationNote: "컨슈머 그룹의 파티션 할당과 consumer lag를 운영에서 확인하는 방법 참고"
  - url: "https://engineering.linecorp.com/ko/blog/how-line-openchat-server-handles-extreme-traffic-spikes"
    title: "LINE Engineering: LINE 오픈챗 서버가 100배 급증하는 트래픽을 다루는 방법"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "핫 챗의 파티션 집중, offset lag와 소비자 자원 부하를 관찰한 운영 사례를 확인한다."
    displayOrder: 2
    relationNote: "핫 챗의 파티션 랙·CPU 부하를 통해 key skew와 소비 용량 병목을 관찰한 사례 확인"
---
# 생산 속도와 컨슈머 처리 용량

프로듀서가 초당 10,000개의 메시지를 만들지만 컨슈머가 초당 6,000개만 처리한다면 남은 4,000개는 매초 적체(backlog)로 쌓입니다. 브로커가 이를 보관해 주더라도 **사용자가 결과를 보게 되는 시간은 계속 늦어집니다.**

```text
producer 10k/s ─▶ broker ─▶ consumer 6k/s
                         +4k/s lag
```

이 상태가 10분 지속되면 lag는 240만 건까지 늘어날 수 있습니다. 따라서 브로커 저장 공간이 충분한지만 보는 것으로는 부족합니다.

### 큐는 처리 용량을 만들어 주지 않는다

메시지 브로커는 프로듀서와 컨슈머의 속도 차이를 잠시 흡수할 수 있지만, 컨슈머의 실제 처리 능력을 늘려 주지는 않습니다. 적체가 계속 증가한다면 언젠가는 보존 기간(retention), 디스크, 최신성 SLA 중 하나가 한계에 도달합니다.

컨슈머가 가져온 레코드를 메모리에 무한히 쌓는 것도 해결책이 아닙니다. 진행 중 작업 수를 제한하지 않으면 프로세스 힙과 하위 시스템 연결 풀이 먼저 고갈될 수 있습니다.

### 어디를 조절할지 병목을 보고 결정한다

```text
producer rate
   │
   ▼
broker backlog
   │
   ▼
consumer workers
   │
   ▼
DB / external API capacity
```

컨슈머 수와 파티션 수를 늘리면 처리량이 올라갈 수 있지만 DB 연결 풀이나 외부 API가 이미 병목이라면 하위 시스템 장애만 키울 수 있습니다. 반대로 중요하지 않은 작업이라면 생산 유입 제한(admission control)이나 낮은 우선순위 이벤트 제거·압축 같은 정책을 검토할 수도 있습니다.

### 재시도도 전체 처리량을 소비한다

실패 메시지를 즉시 여러 번 재시도하면 신규 메시지를 처리할 용량이 줄어듭니다. 독성 메시지 하나가 파티션을 계속 막는다면 지연 재시도나 별도 재시도 경로로 정상 트래픽과 분리할 수 있습니다.

```text
consumer capacity 6k/s
  ├─ normal work 5k/s
  └─ retry work  1k/s
```

재시도가 늘어나면 정상 처리에 사용할 수 있는 용량이 줄어드는 구조입니다.

역압(backpressure)을 다룬다는 것은 큐를 크게 만드는 것이 아니라 **생산률, 소비률, 적체 증가 속도와 하위 시스템 한계를 함께 측정하고 시스템이 감당할 수 있는 속도로 흐름을 제한하는 것**입니다.
