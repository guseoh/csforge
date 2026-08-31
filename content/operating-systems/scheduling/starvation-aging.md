---
kind: concept
contentKey: operating-systems.core.scheduling.starvation-aging
topicContentKey: operating-systems.core.scheduling
slug: starvation-aging
title: "Starvation and Aging"
summary: "기아 상태와 aging으로 우선순위를 보정하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man7/sched.7.html"
    title: "sched(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "scheduler 정책과 context 전환 비용을 확인한다."
    displayOrder: 1
---
# Starvation and Aging

starvation은 task가 ready 상태인데도 경쟁 task 때문에 충분히 실행되지 못하는 현상이다. aging은 기다린 시간에 따라 priority를 높여 오래 기다린 task가 결국 선택될 가능성을 보장하는 정책이다.

aging 증가율이 너무 빠르면 원래 priority 의미가 사라지고 너무 느리면 tail latency가 그대로다. fairness를 측정하려면 평균 CPU 사용률보다 task별 최대 대기시간을 봐야 한다.

### Backend 연결

background reindex와 interactive query를 함께 처리할 때 각 queue의 최대 대기시간을 알람으로 둔다. 무제한 priority 상승 대신 rate limit과 작업 만료를 명시한다.

