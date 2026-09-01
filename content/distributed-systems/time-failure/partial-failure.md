---
kind: concept
contentKey: distributed.core.time-failure.partial-failure
topicContentKey: distributed.core.time-failure
slug: partial-failure
title: "partial failure"
summary: "network delay·loss·process crash가 전체 failure와 다른 이유 및 unknown outcome을 설명한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "client/server의 성공 판단이 어긋날 수 있는 RPC failure 확인"
  - url: "https://etcd.io/docs/v3.5/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "leader failure·partition·majority failure의 차이 확인"
---
# partial failure

단일 process에서는 호출이 성공하거나 실패한 것처럼 보이지만, 분산 호출에서는 request가 server에 도착해 처리됐고 response만 유실될 수 있습니다. caller가 timeout을 받았다는 사실은 server side effect가 없었다는 뜻이 아니며, 각 node가 서로 다른 관찰을 하는 상태가 생깁니다.

```text
client ──request──▶ server ──commit──▶ DB
client ◀─timeout── response 유실
       └─ outcome unknown: retry가 duplicate를 만들 수 있음
```

### failure를 분류한다

process crash, network partition, packet loss, overloaded server, slow dependency는 같은 “오류”가 아닙니다. transport error가 재시도 가능하다는 뜻도 아닙니다. side effect가 일어났을 가능성, caller의 deadline, server의 cancellation 확인과 reconciliation을 기준으로 상태를 나눕니다.

### 성공의 관찰자가 다르다

server가 작업을 commit하고 response를 보내기 전에 client deadline이 끝날 수 있습니다. 반대로 client가 응답을 받았어도 비동기 후속 작업이 실패할 수 있습니다. API는 pending/unknown을 표현하거나 operation status 조회·idempotency key·outbox와 reconciliation을 제공해야 합니다.

### partition에서는 격리된 세계가 된다

한쪽이 살아 있다고 다른 쪽이 죽었다고 단정할 수 없습니다. 연결 실패와 data absence를 구분하고, 외부 상태를 변경하는 leader·worker는 lease/fencing이나 quorum으로 ownership을 확인해야 합니다. 장애 복구 때 지연된 request와 event가 재등장한다는 가정도 필요합니다.

### 문제를 풀 때 확인할 것

1. request가 server에 도착·실행·commit됐는지 구분합니다.
2. timeout 뒤 side effect 가능성을 명시합니다.
3. unknown outcome을 pending·조회·reconciliation으로 처리합니다.
4. partition 중 각 node의 관찰과 허용 동작을 정의합니다.
5. delayed response·duplicate request가 복구 후 영향을 주는지 검토합니다.

### 면접에서 설명한다면

분산 호출의 timeout은 “아무 일도 일어나지 않음”이 아니라 outcome unknown일 수 있습니다. request 도착·side effect·response 전달을 별도로 보고, pending 조회·idempotency·reconciliation을 두며, partition 중 ownership과 stale request를 fencing 또는 명시적 consistency policy로 제한합니다.
