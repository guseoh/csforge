---
kind: concept
contentKey: operating-systems.core.scheduling.sjf
topicContentKey: operating-systems.core.scheduling
slug: sjf
title: "SJF"
summary: "짧은 작업 우선 정책과 평균 대기시간 전제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# SJF

SJF는 예상 CPU burst가 가장 짧은 작업을 먼저 선택한다. 모든 작업이 동시에 도착하고 burst를 정확히 안다는 이상적 조건에서는 평균 waiting time을 줄이는 근거가 있다.

실제 시스템에서는 미래 burst를 정확히 알 수 없고, 긴 작업이 계속 뒤로 밀릴 수 있다. 예측 오차, preemption 여부, aging 보완을 함께 설계해야 정책이 현실적인 계약이 된다.

### Backend 연결

request cost를 추정해 작은 요청을 우선할 때 큰 요청의 starvation과 추정 오차를 감시한다. 사용자에게 제공하는 API에서 size-based priority가 공정성을 해치지 않도록 quota를 둔다.

