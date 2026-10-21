---
kind: concept
contentKey: distributed.core.time-failure.causal-ordering
topicContentKey: distributed.core.time-failure
slug: causal-ordering
title: "분산 사건의 인과적 순서와 논리 시계"
summary: "프로세스 내부 순서·메시지 전달의 happens-before 관계와 독립적인 사건을 구별하고 Lamport 논리 시계의 보장·한계를 판단한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.microsoft.com/en-us/research/publication/time-clocks-ordering-events-distributed-system/"
    title: "Leslie Lamport: Time, Clocks and the Ordering of Events in a Distributed System"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "사건의 happens-before 부분 순서와 논리 시계의 단방향 보장"
  - url: "https://doi.org/10.1145/359545.359563"
    title: "Communications of the ACM: Time, Clocks, and the Ordering of Events in a Distributed System"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "1978년 원 논문의 인과적 순서와 논리 시계에 대한 원문 연결"
---
# 분산 사건의 인과적 순서와 논리 시계

주문 서비스가 승인 이벤트를 보내고 재고 서비스가 그 메시지를 받아 예약했다고 하겠습니다. 서로 다른 머신의 로그에 기록된 시각만 비교하면 실제 선후를 잘못 판단할 수 있습니다. 한 노드의 wall clock이 더 빠르다고 해서 그 노드의 사건이 다른 사건의 **원인**이었던 것은 아닙니다. 분산 환경에서는 로그의 시각과 사건 사이에 실제로 존재하는 인과관계를 구별해야 합니다.

## happens-before는 어떤 조건에서 성립하는가

사건의 인과적 선후(happens-before, →)는 **같은 프로세스의 사건 순서**, **메시지 전송에서 그 메시지의 수신으로 이어지는 순서**, 그리고 이들의 **전이적 연결**로 정의합니다. 이 규칙으로 어느 방향의 선후도 증명할 수 없는 두 사건은 동시적(concurrent)이라고 합니다. 여기서 동시는 정확히 같은 물리적 시각이라는 의미가 아니라 **주어진 통신 관계만으로 원인·결과 순서를 증명할 수 없다**는 뜻입니다.

\`\`\`text
주문 서비스 A                   재고 서비스 B
A1: 주문 승인
 │
A2: 이벤트 발행(C=2) ──────▶ B1: 메시지 수신(C=5)
                                   │
                              B2: 재고 예약(C=6)

A1 → A2 → B1 → B2  : 인과적 선후 관계

독립 통계 서비스 C의 사건 C1
C1 ↛ A2, A2 ↛ C1 : 주어진 사건·통신 경로에서 선후 불명
\`\`\`

주문 이벤트의 **수신**이 재고 업무 DB의 **커밋**을 뜻하지는 않습니다. Kafka 파티션 내부의 기록 순서, 서비스 간 메시지의 인과관계, DB 트랜잭션의 격리는 서로 다른 보장입니다.

## Lamport 시계가 만드는 순서

Lamport 논리 시계는 실제 초·밀리초 대신 정수 카운터를 사용합니다. 각 프로세스가 로컬 사건을 기록하거나 메시지를 전송할 때 카운터를 증가시키고, 전송 메시지에 그 값을 포함합니다. 수신자는 자신의 현재 카운터와 메시지의 시각 중 큰 값을 선택한 뒤 1을 더합니다.

\`\`\`text
A: 전송 직전 C=1 → M 전송 시 C=2
B: 수신 직전 C=4 → M 수신 시 max(4,2)+1 = 5
B: 이후 로컬 사건 → C=6
\`\`\`

따라서 사건 x가 y에 인과적으로 선행하면 **C(x) < C(y)** 입니다. 반대로 **C(x) < C(y)라는 숫자만으로 x → y를 증명할 수는 없습니다.** 독립 프로세스에서 서로 통신하지 않았더라도 카운터가 다르게 증가할 수 있기 때문입니다. 같은 논리 시각의 사건을 프로세스 ID로 추가 정렬해 전체 순서를 만들 수는 있지만, 그렇게 생긴 순서는 일부 동시 사건 사이의 *임의의 정렬*이지 실제 인과관계를 새로 만드는 것이 아닙니다.

원인 관계가 있는지의 여부까지 분명히 표현해야 할 때는 벡터 시계 등 더 많은 상태를 보유하는 모델이 유용할 수 있습니다. 그 대신 프로세스 수·멤버십 관리의 비용이 증가합니다. 단순 로그 정렬에 Lamport 시계를 넣었다고 모든 사건의 원인을 증명할 수 있는 것은 아닙니다.

## 실패·재시도·업무 상태와 구분

이벤트 전송 API가 시간 초과됐어도 수신자는 이벤트를 이미 처리했을 수 있습니다. 논리 시계의 숫자는 사건 순서를 분석하는 도구이지 **전달 성공, 한 번만 처리, 영구 보존**을 보장하지 않습니다. 같은 이벤트를 다시 보내는 경우에도 업무 DB의 상태 전이와 eventId 기반 중복 처리를 따로 검증해야 합니다.

장애 분석에서는 메시지 ID, 상위 Trace ID, 실제 송수신 기록과 재고 DB의 커밋 결과를 함께 확인합니다. wall clock이 뒤틀려 수신 로그가 더 일찍 기록되더라도 **해당 메시지 전송→수신**의 인과관계는 바뀌지 않습니다. 반면 상관없는 통계 이벤트의 시각이 더 크다는 이유만으로 주문 승인에 의해 발생했다고 주장해서는 안 됩니다.

이 Concept은 분산 사건의 **인과적 순서와 그 증명 가능한 범위**를 다룹니다. 실제 시계와 요청 기한은 기존 clocks-deadlines, Kafka의 파티션별 순서는 Messaging, 트랜잭션의 상태 경계는 Database에서 이어집니다.
