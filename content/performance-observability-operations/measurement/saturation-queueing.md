---
kind: concept
contentKey: performance.core.measurement.saturation-queueing
topicContentKey: performance.core.measurement
slug: saturation-queueing
title: "포화와 대기열"
summary: "제한된 자원이 포화될 때 대기열이 쌓이고 대기 시간이 늘어나는 흐름을 이해하고 이용률과 대기열 깊이를 함께 해석한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/handling-overload/"
    title: "Google SRE Book: Handling Overload"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "과부하 상태의 신호·대기열·요청 거절과 부하 완화 판단 확인"
  - url: "https://pubsonline.informs.org/doi/fpi/10.1287/opre.9.3.383"
    title: "A Proof for the Queuing Formula: L = λW"
    referenceType: PAPER
    language: en
    depth: section
    recommendation: "리틀의 법칙(Little's Law)에서 시스템 내 평균 작업 수·도착률·체류 시간의 관계와 가정을 확인한다."
    displayOrder: 2
    relationNote: "대기열과 처리 중 작업, 유입률, 평균 체류 시간을 연결하는 식의 근거 확인"
---
# 포화와 대기열

CPU, 작업자 스레드, DB 연결, 메시지 소비자처럼 동시에 처리할 수 있는 양이 제한된 자원에는 반드시 용량의 경계가 있습니다. 요청이 그 처리 속도보다 빠르게 들어오기 시작하면 바로 실패하기보다 먼저 대기열이 쌓이고, 사용자는 실제 작업 시간에 더해 대기 시간까지 지불하게 됩니다.

```text
도착
  │
  ▼
[ 대기열 ] ─▶ 작업자 ─▶ 응답
       ▲
       └─ 처리 속도보다 유입이 빠르면 증가
```

그래서 이용률만 보고 포화를 판단하면 늦을 수 있습니다. CPU가 아직 100%가 아니어도 스레드 풀 앞의 대기열이 계속 늘거나 DB 연결 대기가 길어지면 이미 사용자 지연 시간은 악화되고 있을 수 있습니다. 자원마다 포화를 드러내는 신호도 다릅니다.

| 자원 | 함께 볼 신호 |
| --- | --- |
| CPU | 이용률, 스로틀링, 실행 대기열 |
| DB 연결 풀 | 사용 중/대기 연결 수, 연결 획득 대기 시간 |
| 작업 대기열 | 대기열 깊이, 가장 오래된 작업의 대기 시간 |
| 메모리 | 할당 압력, GC, OOM |

시스템 경계를 정하고 유입과 완료가 대체로 균형을 이루는 안정 구간에서는 리틀의 법칙(Little's Law) `L = λW`를 적용할 수 있습니다. `L`은 대기 중이거나 처리 중인 작업 수의 평균, `λ`는 초당 도착률, `W`는 작업 하나가 그 경계 안에 머무는 시간의 평균입니다. 예를 들어 같은 경계 안에 평균 120건이 있고 초당 40건이 완료된다면 평균 체류 시간은 `120 ÷ 40 = 3초`입니다. 단위와 관측 경계가 맞지 않거나 대기열이 계속 증가하는 구간의 수치에는 이 해석을 그대로 적용하지 않습니다.

포화 이후 무제한 대기열로 버티면 장애가 사라지는 것이 아니라 긴 시간 초과와 메모리 압력으로 형태가 바뀝니다. 따라서 크기 제한 대기열, 동시성 제한, 유입 제어(admission control)나 부하 차단(load shedding)처럼 **받을 수 있는 양을 명시적으로 제한하는 정책**이 필요하며, 어떤 요청을 거절해도 되는지는 제품 중요도와 복구 가능성을 기준으로 정합니다.
