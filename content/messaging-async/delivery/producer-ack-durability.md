---
kind: concept
contentKey: messaging.core.delivery.producer-ack-durability
topicContentKey: messaging.core.delivery
slug: producer-ack-durability
title: "Producer 발행 확인과 레코드 내구성"
summary: "Kafka Producer의 acks·ISR·최소 동기 복제본 조건과 재시도·확인 실패를 구분해 발행 성공과 Consumer 업무 처리가 서로 다른 계약임을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://kafka.apache.org/42/configuration/producer-configs/"
    title: "Apache Kafka 4.2 Configuration: Producer Configs"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "acks, enable.idempotence, retries 및 delivery.timeout.ms의 보장과 제약을 직접 확인한다."
    displayOrder: 1
    relationNote: "Producer 발행 요청의 성공 인정 기준, 재시도와 실패 보고 기한 확인"
  - url: "https://kafka.apache.org/42/configuration/topic-configs/"
    title: "Apache Kafka 4.2 Configuration: Topic Configs"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "min.insync.replicas와 acks=all의 관계 및 ISR 부족 시 오류 경계를 확인한다."
    displayOrder: 2
    relationNote: "토픽의 동기 복제본 최솟값, ISR의 실제 참여 수와 발행 성공 조건 확인"
---
# Producer 발행 확인과 레코드 내구성

주문 이벤트를 Kafka에 보냈을 때 Producer가 성공 콜백을 받았다고 해서 주문의 후속 처리까지 끝난 것은 아닙니다. 성공 콜백은 **Kafka가 해당 레코드 쓰기 요청을 설정된 수준으로 확인했다**는 뜻이며, Consumer가 이를 읽어 업무 DB를 변경했다거나 외부 결제를 실행했다는 뜻이 아닙니다. 발행 성공의 의미를 이해하려면 Producer, 파티션 리더와 복제본 사이의 확인 흐름부터 구분해야 합니다.

```text
주문 서비스 Producer
        │ record send
        ▼
Kafka partition leader
        │       ├─ follower A (ISR)
        │       └─ follower B (ISR)
        │
        └─ 설정된 acks 조건 만족 → Producer 성공 응답
                                         ≠ Consumer DB commit
```

ISR(in-sync replicas)은 해당 파티션에서 복제 진행 상태를 기준으로 동기화된 것으로 관리되는 복제본 집합입니다. 리더도 이 집합에 포함됩니다. `replication.factor=3`처럼 복제본 수를 설정하더라도 현재 ISR 크기는 네트워크·복제 지연·장애 상태에 따라 작아질 수 있으므로, **구성한 복제본 수와 지금 확인에 참여하는 ISR 수를 같은 값으로 생각하면 안 됩니다.**

### acks 값에 따라 어떤 순간을 성공으로 인정할까

| Producer 설정 | 성공 판단 | 주요 위험 |
| --- | --- | --- |
| `acks=0` | 브로커 응답을 기다리지 않음 | 브로커가 레코드를 받았는지 확인할 수 없음 |
| `acks=1` | 리더가 자신의 로그에 기록하면 응답 | 다른 복제본으로 전파하기 전에 리더가 실패하면 유실 가능 |
| `acks=all` | 현재 ISR에 있는 모든 복제본의 확인을 기다림 | 일부 ISR 장애·복제 지연 시 쓰기 지연 또는 실패 |

`acks=all`은 설정 가능한 가장 강한 Producer 확인 수준입니다. 다만 ISR에 리더 하나만 남아 있다면 `acks=all`이 자동으로 둘 이상의 복제를 보장하는 것은 아닙니다. 이를 막기 위해 쓰는 것이 토픽의 `min.insync.replicas`입니다. Kafka 4.2 기본 구성에 관한 공식 문서는 `acks=all`의 성공에 필요한 최소 ISR 수를 이 값으로 설명하고, 그 수가 부족하면 `NotEnoughReplicas` 계열의 오류가 발생할 수 있다고 명시합니다. 버전별 Eligible Leader Replicas(ELR) 기능을 사용하는 구성에서는 세부 의미가 달라질 수 있으므로 실제 클러스터 설정을 따로 확인해야 합니다.

```text
replication.factor=3, min.insync.replicas=2
리더 A + ISR follower B + ISR follower C

현재 ISR {A,B,C} → acks=all은 셋의 확인을 기다림
현재 ISR {A,B}   → acks=all은 둘의 확인을 기다림
현재 ISR {A}     → 최솟값 2 미만 → 발행 실패 가능
```

여기서 `min.insync.replicas=2`는 모든 성공 쓰기에 **정확히 두 복제본만 확인받는다**는 뜻이 아닙니다. ISR이 셋이면 `acks=all`은 현재 ISR 셋 전체의 확인을 기다립니다. 반대로 `acks=1`은 같은 최솟값을 두었다는 이유만으로 `acks=all`의 성공 조건을 얻지 않습니다.

### 재시도 중 실패 응답은 미발행 확정이 아니다

Producer가 발행 요청을 보낸 뒤 타임아웃을 받았다면 브로커가 아예 수신하지 못했을 수도 있지만, **기록과 확인이 끝난 뒤 응답만 유실**됐을 수도 있습니다. 따라서 사용자 코드가 같은 업무 이벤트를 새 레코드로 무조건 다시 만들면 중복 이벤트가 생길 수 있습니다.

```text
Producer ─ record M ─▶ Kafka 리더: M 기록
Producer ◀────── X ── 성공 응답 유실
     │
     └─ 결과 불명: 로그 기록 여부를 응답 하나로 확정 불가
```

Kafka Producer의 `retries`는 일시적인 전송 실패에 대응하며 `delivery.timeout.ms`는 전송 대기·재시도·확인 구간 전체의 실패 보고 상한을 제어합니다. `enable.idempotence=true`는 호환되는 `acks=all`, `retries>0`, `max.in.flight.requests.per.connection<=5` 설정과 함께 **같은 Producer 세션이 내부적으로 재시도한 레코드가 Kafka 로그에 중복 기록되지 않도록** 돕습니다. 이는 애플리케이션이 새 Producer나 새 업무 요청으로 같은 이벤트를 또 발행했을 때까지 자동으로 중복 제거한다는 뜻이 아닙니다. Producer 재시도 순서와 업무 이벤트의 실제 발생 순서 역시 별개의 문제입니다.

또한 강한 발행 확인은 브로커 복제 생존 조건을 강화하는 것이지 모든 복제본이 동시에 영구 손실되는 경우, 임의의 설정 변경, 외부 업무 시스템의 부수 효과까지 막는 보편적인 정확히 한 번 보장이 아닙니다.

### Consumer 확정 위치와 Outbox는 다른 실패 틈을 보호한다

발행 확인, Consumer 처리 완료, 원본 DB 이벤트 발행 의도는 각각 별도로 추적해야 합니다.

```text
[원본 주문 DB commit + outbox 기록]  ← 업무 상태 / 발행 의도
                    │ relay
                    ▼
[Kafka Producer acks=all 성공]        ← 브로커 기록 확인
                    │ consume
                    ▼
[Consumer 업무 DB commit]            ← 외부 업무 효과
                    │
                    ▼
[Consumer offset commit]             ← 다음 재시작 시 복구 기준
```

트랜잭셔널 아웃박스는 원본 DB 상태 변경과 발행 의도를 같은 로컬 트랜잭션에 저장하는 방식입니다. Producer의 `acks`는 그 의도가 Kafka 로그에 얼마나 안전하게 도달했는지를 다루며, Consumer 오프셋 확정은 **읽고 처리한 작업의 재개 위치**를 다룹니다. 어느 하나도 나머지 단계를 자동으로 커밋하지 않습니다. 특히 outbox relay가 브로커 기록 성공 후 응답을 잃으면 같은 이벤트를 다시 발행할 수 있으므로 `eventId` 기반 멱등 소비자·결과 대사 같은 보호가 필요합니다.

즉, 발행 내구성의 설계 질문은 “Kafka를 사용했는가”가 아니라 **어떤 복제본의 확인으로 레코드를 성공으로 인정하며, 확인 결과가 불명확할 때 무엇을 재시도하고 어떻게 중복 업무 효과를 막는가**입니다.
