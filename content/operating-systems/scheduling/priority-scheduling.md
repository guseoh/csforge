---
kind: concept
contentKey: operating-systems.core.scheduling.priority-scheduling
topicContentKey: operating-systems.core.scheduling
slug: priority-scheduling
title: "Priority Scheduling"
summary: "우선순위 선택과 낮은 priority의 지연 문제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Priority Scheduling

priority scheduling은 runnable task 중 우선순위가 높은 것을 선택한다. priority가 정적이면 예측이 쉽고 동적이면 deadline, waiting time, 최근 CPU 사용량을 반영할 수 있다.

높은 priority task가 계속 도착하면 낮은 task가 실행되지 않는 starvation이 생긴다. 우선순위 상속·aging·quota 같은 보완책은 priority 의미를 바꾸므로 정책과 관측 지표를 함께 정의한다.

### Backend 연결

health check와 user request에 priority를 줄 때 background import가 영원히 밀리지 않게 최소 service rate를 보장한다. priority 값은 신뢰할 수 없는 입력이 직접 scheduler를 조작하지 못하게 제한한다.

