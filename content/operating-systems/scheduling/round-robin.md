---
kind: concept
contentKey: operating-systems.core.scheduling.round-robin
topicContentKey: operating-systems.core.scheduling
slug: round-robin
title: "Round Robin"
summary: "time quantum이 공정성·context switch 비용을 바꾸는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Round Robin

Round Robin은 runnable 작업을 queue 순서로 조금씩 실행하고 time quantum이 끝나면 다음 작업으로 넘긴다. quantum이 작으면 interactive response와 fairness가 좋아질 수 있지만 context switch overhead가 커진다.

quantum이 너무 크면 FCFS처럼 동작하고, 너무 작으면 useful work보다 전환이 많아진다. I/O로 일찍 양보하는 작업과 CPU-bound 작업의 혼합도 결과에 영향을 준다.

### Backend 연결

요청 worker에 공정한 처리 시간을 주려면 queue item의 최대 실행시간과 cancellation을 함께 둔다. 단순히 thread 수를 늘리는 것은 quantum 문제를 해결하지 않는다.

