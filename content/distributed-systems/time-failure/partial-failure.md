---
kind: concept
contentKey: distributed.core.time-failure.partial-failure
topicContentKey: distributed.core.time-failure
slug: partial-failure
title: "부분 장애와 알 수 없는 결과"
summary: "요청 전달·처리·응답이 서로 다른 지점에서 실패할 수 있어 시간 초과만으로 서버의 부수 효과 여부를 확정할 수 없는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "클라이언트와 서버가 RPC 결과를 다르게 관찰할 수 있는 시간 초과 경계 확인"
  - url: "https://etcd.io/docs/v3.7/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "리더 장애·네트워크 분할·다수 노드 장애가 서로 다른 결과를 만드는 사례 확인"
  - url: "https://tech.kakaopay.com/post/msa-transaction/"
    title: "MSA 환경에서 네트워크 예외를 잘 다루는 방법"
    referenceType: OTHER
    language: ko
    displayOrder: 3
    relationNote: "결제 요청의 성공·실패를 확정할 수 없는 네트워크 예외와 멱등성 처리 사례 확인"
---
# 부분 장애와 알 수 없는 결과

한 프로세스 안의 함수 호출은 실패하면 호출자와 실행 주체가 같은 상태를 관찰하기 쉽습니다. 하지만 네트워크를 사이에 둔 호출은 요청 전달, 서버 처리, 응답 전달이 각각 독립적으로 실패할 수 있어 **클라이언트와 서버가 같은 결론을 보지 못하는 상황**이 생깁니다.

```text
클라이언트 ── 요청 ──▶ 서버
                       └─ DB 커밋 성공
클라이언트 ◀─ 응답 유실
           └─ 시간 초과
```

이때 클라이언트가 본 시간 초과는 “서버가 아무것도 하지 않았다”는 증거가 아닙니다. 서버가 요청을 받지 못했을 수도 있고, 처리 중일 수도 있으며, 이미 커밋했지만 응답만 잃었을 수도 있습니다. 이런 **결과를 알 수 없는 상태(unknown outcome)**를 고려하지 않고 무조건 재시도하면 주문·결제 같은 부수 효과가 중복될 수 있습니다.

그래서 분산 API는 실패를 단순한 성공/실패 두 값으로만 생각하기 어렵습니다. 작업 ID(Operation ID)나 멱등성 키(idempotency key)를 사용해 같은 요청을 식별하고, 처리 상태를 조회하거나 정합성 보정(reconciliation)을 통해 최종 상태를 맞추는 방법이 필요할 수 있습니다.

또한 프로세스 종료, 네트워크 분할, 패킷 유실, 과부하로 인한 느린 응답은 겉으로는 모두 시간 초과처럼 보일 수 있지만 복구 방식은 다릅니다. 시간 초과는 일정 시간 동안 응답을 관찰하지 못했다는 사실일 뿐, 상대가 실제로 종료됐다는 직접 증거가 아닙니다.

분산 시스템의 핵심 난점은 모든 구성 요소가 동시에 실패하는 것이 아니라 **일부만 실패하고 서로 다른 사실을 관찰할 수 있다는 점**입니다. 다음 장애 감지기에서는 이 불확실한 관찰을 이용해 다른 노드의 상태를 어떻게 추정하는지 살펴봅니다.
