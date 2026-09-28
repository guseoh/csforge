---
kind: concept
contentKey: messaging.core.semantics.message-model
topicContentKey: messaging.core.semantics
slug: message-model
title: "명령·이벤트·메시지의 역할"
summary: "비동기 전달 수단인 메시지 안에서도 특정 처리를 요구하는 명령과 이미 발생한 사실을 알리는 이벤트의 의도와 결합 방향을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kafka.apache.org/intro/"
    title: "Apache Kafka Documentation: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "이벤트·메시지 용어와 키 기반 파티셔닝, 토픽 보존·소비자 분리의 기본 동작을 확인한다."
    displayOrder: 1
    relationNote: "Kafka의 이벤트·레코드·메시지 용어, 프로듀서·컨슈머 분리와 토픽 기반 이벤트 스트리밍 확인"
  - url: "https://learn.microsoft.com/ko-kr/azure/architecture/guide/technology-choices/messaging"
    title: "Microsoft Azure Architecture Center: 비동기 메시징 옵션"
    referenceType: OFFICIAL
    language: ko
    depth: section
    recommendation: "명령이 특정 작업을 요청하고 이벤트가 이미 발생한 사실을 알리는 메시지라는 의미 차이를 확인한다."
    displayOrder: 2
    relationNote: "명령과 이벤트의 의도·결합 차이를 직접 설명하는 아키텍처 수준 정의 확인"
  - url: "https://engineering.linecorp.com/ko/blog/how-to-use-kafka-in-line-1/"
    title: "LINE Engineering: LINE에서 Kafka를 사용하는 방법 - 1편"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "분산 작업 큐와 여러 서비스가 이벤트 허브를 활용하는 사례를 확인한다."
    displayOrder: 3
    relationNote: "분산 작업 큐와 여러 서비스로 사실을 전달하는 이벤트 허브의 실무 사례 확인"
---
# 명령·이벤트·메시지의 역할

비동기 시스템에서는 여러 종류의 정보를 브로커를 통해 전달할 수 있습니다. 모두 메시지라는 봉투에 담길 수 있지만 **무엇을 요구하는지와 누가 그 의미를 소유하는지**는 다릅니다.

```text
명령(Command)
Order service ── ChargeOrder ──▶ Payment consumer
              "이 작업을 수행해 줘"

이벤트(Event)
Order service ── OrderPlaced ──▶ Search / Analytics / Notification
              "이 일이 이미 발생했어"
```

### 명령은 처리 의도가 중심이다

명령은 특정 능력을 가진 컨슈머가 어떤 작업을 수행하기를 기대합니다. `ChargeOrder`, `GenerateReport`처럼 이름도 보통 해야 할 동작을 나타냅니다.

따라서 프로듀서는 적어도 **어떤 책임을 수행시키려는지** 알고 있습니다. 처리 실패, 재시도, 중복 실행이 실제 업무 결과에 어떤 영향을 주는지도 함께 설계해야 합니다.

### 이벤트는 이미 발생한 사실을 표현한다

`OrderPlaced`, `PaymentApproved` 같은 이벤트는 프로듀서가 이미 확정한 사실을 표현합니다. 이후 어떤 컨슈머가 검색 색인을 갱신하거나 통계를 만들지는 프로듀서가 모두 알 필요가 없습니다.

```text
OrderPlaced
- eventId
- orderId
- occurredAt
- 필요한 업무 사실
```

그렇다고 이벤트가 자유 형식의 무차별 전파라는 뜻은 아닙니다. 컨슈머가 서로 다른 시점에 배포되고 과거 메시지를 다시 읽을 수 있으므로 페이로드 역시 장기적인 계약이 됩니다.

### 비동기로 바꾸면 완료 시점도 바뀐다

HTTP 요청 안에서 직접 실행하던 작업을 이벤트 컨슈머로 옮기면 사용자 응답 시점과 실제 후처리 완료 시점이 분리됩니다.

```text
HTTP 요청
  ├─ 주문 기준 상태 저장
  └─ 성공 응답
           │
           └─ 이후 이벤트 컨슈머가 검색/통계 갱신
```

검색 색인처럼 잠시 늦어도 되는 작업에는 자연스럽지만, 요청이 성공하기 전에 반드시 확인해야 하는 재고 규칙이나 기준 데이터 쓰기를 무조건 비동기로 미루면 제품 의미가 달라질 수 있습니다.

명령과 이벤트를 구분하는 목적은 용어를 엄격하게 나누는 데 있지 않습니다. **요청하는 작업인지 이미 발생한 사실인지, 그리고 비동기로 분리했을 때 무엇이 아직 끝나지 않은 상태로 남는지**를 명확히 하기 위해서입니다.
