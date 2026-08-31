---
kind: concept
contentKey: backend.core.retry.deadline
topicContentKey: backend.core.retry
slug: deadline
title: deadline과 retry budget
summary: Deadline은 유스케이스가 언제까지 완료돼야 의미가 있는지 정하는 상위 시간 예산이며 개별 timeout과 retry를 그 안에 배치한다.
level: 3
status: PUBLISHED
displayOrder: 30
references: []
---
# deadline과 retry budget

개별 timeout만 설정하면 전체 요청이 얼마나 오래 걸릴지는 보장되지 않습니다. **Deadline은 이 유스케이스가 언제까지 완료돼야 의미가 있는지 정하는 상위 시간 예산**입니다.

### timeout을 더하면 전체 시간이 커진다

```text
remote call timeout = 1s
retry               = 3회
backoff             = 0.2s + 0.4s

최악의 단순 합 ≈ 3.6s + local work
```

사용자 SLA가 2초라면 이 정책은 이미 모순입니다.

### 남은 budget을 하위 호출에 전달한다

```text
Request deadline 2000 ms
  ├─ elapsed 300 ms
  └─ remaining 1700 ms
        ├─ remote A max 800 ms
        └─ response/render reserve
```

하위 호출이 상위 deadline보다 긴 timeout을 가지지 않도록 합니다.

### cancellation과 실제 side effect

deadline이 지났다고 외부 시스템의 작업이 취소됐다는 뜻은 아닙니다. client가 기다리기를 중단한 것뿐일 수 있습니다. 그래서 non-idempotent operation은 결과 조회/reconciliation 경로가 필요합니다.

### background job에는 다른 deadline이 필요하다

사용자 HTTP 요청과 nightly batch의 시간 가치는 다릅니다. 모든 operation에 동일 2초 timeout을 적용하면 batch는 불필요하게 실패할 수 있습니다.

### deadline은 UX와 자원 정책을 연결한다

얼마나 기다릴지를 명시하면 retry count, timeout, queue wait, fallback을 하나의 budget 안에서 설계할 수 있습니다.
