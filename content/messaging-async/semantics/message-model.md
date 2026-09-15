---
kind: concept
contentKey: messaging.core.semantics.message-model
topicContentKey: messaging.core.semantics
slug: message-model
title: "명령·이벤트·메시지의 역할"
summary: "비동기 전달 수단인 message 안에서도 특정 처리를 요구하는 command와 이미 발생한 사실을 알리는 event의 의도와 결합 방향을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kafka.apache.org/documentation/"
    title: "Apache Kafka Documentation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "producer·consumer·topic 기반 event streaming 개념 확인"
---
# 명령·이벤트·메시지의 역할

비동기 시스템에서는 여러 종류의 정보를 broker를 통해 전달할 수 있습니다. 모두 message라는 봉투에 담길 수 있지만 **무엇을 요구하는지와 누가 그 의미를 소유하는지**는 다릅니다.

```text
Command
Order service ── ChargeOrder ──▶ Payment consumer
              "이 작업을 수행해 줘"

Event
Order service ── OrderPlaced ──▶ Search / Analytics / Notification
              "이 일이 이미 발생했어"
```

### Command는 처리 의도가 중심이다

Command는 특정 능력을 가진 consumer가 어떤 작업을 수행하기를 기대합니다. `ChargeOrder`, `GenerateReport`처럼 이름도 보통 해야 할 동작을 나타냅니다.

따라서 producer는 적어도 **어떤 책임을 수행시키려는지** 알고 있습니다. 처리 실패, 재시도, 중복 실행이 실제 업무 결과에 어떤 영향을 주는지도 함께 설계해야 합니다.

### Event는 이미 발생한 사실을 표현한다

`OrderPlaced`, `PaymentApproved` 같은 event는 producer가 이미 확정한 사실을 표현합니다. 이후 어떤 consumer가 검색 색인을 갱신하거나 통계를 만들지는 producer가 모두 알 필요가 없습니다.

```text
OrderPlaced
- eventId
- orderId
- occurredAt
- 필요한 business facts
```

그렇다고 event가 자유 형식 broadcast라는 뜻은 아닙니다. Consumer가 서로 다른 시점에 배포되고 과거 message를 replay할 수 있으므로 payload 역시 장기적인 계약이 됩니다.

### 비동기로 바꾸면 완료 시점도 바뀐다

HTTP 요청 안에서 직접 실행하던 작업을 event consumer로 옮기면 사용자 응답 시점과 실제 후처리 완료 시점이 분리됩니다.

```text
HTTP request
  ├─ 주문 canonical state 저장
  └─ success response
           │
           └─ 이후 event consumer가 검색/통계 갱신
```

검색 색인처럼 잠시 늦어도 되는 작업에는 자연스럽지만, 요청이 성공하기 전에 반드시 확인해야 하는 재고 규칙이나 canonical write를 무조건 async로 미루면 제품 의미가 달라질 수 있습니다.

Command와 event를 구분하는 목적은 용어를 엄격하게 나누는 데 있지 않습니다. **요청하는 작업인지 이미 발생한 사실인지, 그리고 비동기로 분리했을 때 무엇이 아직 끝나지 않은 상태로 남는지**를 명확히 하기 위해서입니다.
