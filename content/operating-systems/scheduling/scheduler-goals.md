---
kind: concept
contentKey: operating-systems.core.scheduling.scheduler-goals
topicContentKey: operating-systems.core.scheduling
slug: scheduler-goals
title: "Scheduler Goals"
summary: "response time·throughput·fairness·utilization의 trade-off를 비교한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Scheduler Goals

response time은 개별 작업이 시작해 반응을 얻는 시간이고 throughput은 단위 시간당 완료량이다. fairness는 특정 흐름이 계속 밀리지 않는 성질이며 utilization은 CPU가 유용한 일을 하는 비율이다.

한 목표를 개선하면 다른 목표가 악화될 수 있다. 짧은 interactive 작업을 우선하면 batch 작업의 waiting이 길어질 수 있고, fairness를 위해 잦은 전환을 하면 throughput이 줄 수 있으므로 workload를 먼저 정의한다.

### Backend 연결

API 서버는 평균 latency만으로 충분하지 않고 tail latency와 처리량을 함께 봐야 한다. worker와 queue 정책을 변경할 때 성공률, p95/p99, CPU, 대기시간을 같은 기간에 비교한다.

