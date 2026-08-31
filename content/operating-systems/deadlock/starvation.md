---
kind: concept
contentKey: operating-systems.core.deadlock.starvation
topicContentKey: operating-systems.core.deadlock
slug: starvation
title: "Starvation"
summary: "특정 실행 흐름이 계속 기회를 못 얻는 원인과 완화책을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Starvation

starvation은 system이 계속 움직이지만 특정 process나 thread가 CPU, lock, queue service를 충분히 얻지 못하는 상태다. deadlock처럼 모두가 cycle로 서로를 기다릴 필요는 없으며, priority와 unfair lock이 원인이 될 수 있다.

aging, fair queue, FIFO lock, quota와 예약된 capacity로 기회를 보장할 수 있다. 평균 throughput이 좋아도 한 작업의 최대 대기시간이 무제한이면 사용자 관점의 품질은 나빠진다.

### Backend 연결

대형 batch가 interactive request를 모두 밀거나 그 반대가 되지 않도록 queue별 service share와 deadline을 둔다. starvation 알람은 평균이 아니라 oldest age와 p99 wait로 만든다.

