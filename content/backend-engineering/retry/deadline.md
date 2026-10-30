---
kind: concept
contentKey: backend.core.retry.deadline
topicContentKey: backend.core.retry
slug: deadline
title: "Deadline과 Retry Budget"
summary: "유스케이스가 언제까지 완료되어야 의미가 있는지 상위 deadline을 정하고, 개별 timeout·backoff·retry 횟수를 남은 시간 예산 안에 배치한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
- url: https://grpc.io/docs/guides/deadlines/
  title: 'gRPC Documentation: Deadlines'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: deadline 설정과 하위 RPC propagation에서 elapsed time을 제외한 remaining budget 전달 확인
---
# Deadline과 Retry Budget

개별 외부 호출에 timeout이 있어도 전체 사용자 요청이 언제 끝날지는 자동으로 정해지지 않습니다. 호출 하나당 1초 timeout을 두고 세 번 재시도하면 backoff와 local work까지 포함해 상위 API의 허용 시간을 쉽게 넘길 수 있습니다.

```text
remote timeout 1s × 최대 3회
backoff 200ms + 400ms
local work

→ 사용자 SLA가 2초라면 애초에 맞지 않는 정책
```

Deadline은 **이 유스케이스가 언제까지 완료되어야 결과에 의미가 있는지**를 나타내는 상위 시간 예산입니다.

### 남은 시간을 기준으로 다음 시도를 결정한다

```text
request deadline: 2000ms

DB 조회에 300ms 사용
        ↓
remaining 1700ms
        ↓
remote call + 필요 시 retry + response 작성
```

하위 호출의 timeout이 상위 요청의 남은 시간보다 길면 사용자는 이미 결과를 포기했는데 서버 worker는 계속 기다릴 수 있습니다. gRPC처럼 deadline propagation을 지원하는 시스템에서는 이미 경과한 시간을 제외한 남은 budget을 하위 RPC에 전달할 수 있습니다.

일반 HTTP client에서도 자동 지원 여부와 별개로 같은 원칙을 적용할 수 있습니다. **다음 시도가 남은 시간 안에 실제로 완료될 가능성이 있는지**를 확인하고 retry 여부를 결정합니다.

### Deadline 초과가 remote 작업 취소를 보장하지는 않는다

클라이언트가 더 이상 기다리지 않더라도 상대 시스템은 이미 side effect를 수행했을 수 있습니다.

```text
client deadline 초과
       │
       └─ 기다리기 중단

remote
       └─ 작업은 이미 commit했을 수도 있음
```

그래서 결제·주문 생성 같은 non-idempotent 작업은 deadline과 별도로 idempotency와 결과 조회·reconciliation 정책이 필요합니다.

### 모든 작업에 같은 deadline을 사용할 필요는 없다

사용자 HTTP 요청은 몇 초 안에 결과가 없으면 가치가 크게 떨어질 수 있지만, nightly batch나 비동기 reconciliation은 훨씬 긴 시간 budget을 가질 수 있습니다. Deadline은 기술 설정 하나가 아니라 **작업의 시간 가치와 자원 점유 허용 범위**를 반영해야 합니다.

### Retry 정책은 deadline 안의 일부다

```text
overall deadline
  ├─ local processing
  ├─ attempt 1 timeout
  ├─ backoff
  ├─ attempt 2 timeout
  └─ 최종 응답을 만들 여유
```

`maxAttempts=3`을 먼저 정하고 deadline을 맞추는 것이 아니라, 상위 시간 예산 안에서 몇 번의 시도가 실제로 가능한지 역으로 계산하는 편이 자연스럽습니다.

Deadline을 두는 목적은 모든 요청을 빨리 실패시키는 것이 아니라 **timeout·backoff·retry·fallback이 서로 독립적으로 시간을 소비하지 않도록 하나의 유스케이스 budget 안에 묶는 것**입니다.
