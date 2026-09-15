---
kind: concept
contentKey: distributed.core.time-failure.partial-failure
topicContentKey: distributed.core.time-failure
slug: partial-failure
title: "부분 장애와 알 수 없는 결과"
summary: "요청, 처리, 응답이 서로 다른 지점에서 실패할 수 있어 timeout만으로 server side effect의 성공·실패를 확정할 수 없는 이유를 이해한다."
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
# 부분 장애와 알 수 없는 결과

한 process 안의 함수 호출은 실패하면 호출자와 실행 주체가 같은 상태를 관찰하기 쉽습니다. 하지만 network를 사이에 둔 호출은 요청 전달, server 처리, 응답 전달이 각각 독립적으로 실패할 수 있어 **client와 server가 같은 결론을 보지 못하는 상황**이 생깁니다.

```text
client ── request ──▶ server
                     └─ DB commit 성공
client ◀─ response 유실
        └─ timeout
```

이때 client가 본 timeout은 “server가 아무것도 하지 않았다”는 증거가 아닙니다. Server가 요청을 받지 못했을 수도 있고, 처리 중일 수도 있으며, 이미 commit했지만 응답만 잃었을 수도 있습니다. 이런 상태를 unknown outcome으로 다루지 않고 무조건 retry하면 주문·결제 같은 side effect가 중복될 수 있습니다.

그래서 분산 API는 실패를 단순 성공/실패 두 값으로만 생각하기 어렵습니다. Operation ID나 idempotency key를 사용해 같은 요청을 식별하고, 처리 상태를 조회하거나 reconciliation으로 최종 상태를 맞추는 방법이 필요할 수 있습니다.

또한 process crash, network partition, packet loss, 과부하로 인한 느린 응답은 겉으로는 모두 timeout처럼 보일 수 있지만 복구 방식은 다릅니다. Timeout은 일정 시간 동안 응답을 관찰하지 못했다는 사실일 뿐, 상대가 실제로 죽었다는 직접 증거가 아닙니다.

분산 시스템의 핵심 난점은 모든 component가 동시에 실패하는 것이 아니라 **일부만 실패하고 서로 다른 사실을 관찰할 수 있다는 점**입니다. 다음 failure detector에서는 이 불확실한 관찰을 이용해 다른 node의 상태를 어떻게 추정하는지 살펴봅니다.
