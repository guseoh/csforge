---
kind: concept
contentKey: operating-systems.core.scheduling.fcfs
topicContentKey: operating-systems.core.scheduling
slug: fcfs
title: "FCFS"
summary: "도착 순서 실행과 convoy effect를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# FCFS

FCFS는 ready queue에 먼저 도착한 작업을 먼저 실행한다. 구현과 예측이 단순하고 starvation이 적지만, 긴 작업 하나가 앞에 있으면 뒤의 짧은 작업까지 오래 기다리는 convoy effect가 생긴다.

평균 대기시간은 arrival order와 burst time에 크게 좌우된다. interactive 요청과 긴 batch를 같은 queue에 넣는 상황에서는 response time이 급격히 나빠질 수 있다.

### Backend 연결

단일 worker에서 FIFO queue는 작업 순서를 보장하지만 큰 import 하나가 짧은 health task를 막을 수 있다. queue를 분리하거나 최대 실행시간을 두는 것은 비즈니스 우선순위와 함께 결정한다.

