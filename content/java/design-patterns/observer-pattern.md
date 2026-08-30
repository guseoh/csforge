---
kind: concept
contentKey: java.core.design-patterns.observer-pattern
topicContentKey: java.core.design-patterns
slug: observer-pattern
title: "Observer 패턴과 구독 알림"
summary: "한 주체의 상태 변화를 여러 구독자에게 전달하되 결합과 실패 범위를 관리한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Observable.html"
    title: "Observable API (Java SE 25, deprecated)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 고전적인 Observable API와 현재 사용 주의점 확인
  - url: "https://refactoring.guru/design-patterns/observer"
    title: "Observer Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: subject와 observer 구독 관계 참고
---
# Observer 패턴과 구독 알림

## 쉬운 진입

주문이 결제되면 메일, 재고, 분석 등 여러 반응이 필요할 수 있다. 주문 객체가 모든 처리기를
직접 생성하면 하나를 추가할 때 핵심 로직도 바뀐다. 구독자는 주문 이벤트를 받아 자기 일을 한다.

## 정확한 메커니즘

```text
Order ──publishes──> OrderObserver
                       ├─ MailSender
                       ├─ InventoryUpdater
                       └─ AnalyticsRecorder
```

Subject는 구독 목록과 알림 시점을 관리하고 observer는 알림을 처리한다. 동기 observer는
알림 처리 시간과 실패가 주체 호출에 영향을 주며, 비동기 메시징을 도입할 때는 순서·재시도·
중복 계약을 별도로 설계해야 한다.

## 실전·면접 연결

구독 해제 누락은 메모리와 오래된 참조를 만든다. 이벤트 payload에는 필요한 불변 사실만
담고, observer가 subject의 내부 상태를 직접 들여다보지 않게 하면 결합이 줄어든다.

## 흔한 오해

- Observer는 “자동 비동기 처리”와 같은 말이 아니다.
- Java의 `Observable`이 deprecated라는 사실은 패턴 자체가 금지됐다는 뜻이 아니다.
- 구독자가 많으면 단순한 동기 호출로 모든 운영 요구를 만족할 수 없다.
