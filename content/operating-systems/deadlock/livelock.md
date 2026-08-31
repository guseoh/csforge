---
kind: concept
contentKey: operating-systems.core.deadlock.livelock
topicContentKey: operating-systems.core.deadlock
slug: livelock
title: "Livelock"
summary: "상태는 바뀌지만 유효한 진전이 없는 livelock을 deadlock과 구분한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Livelock

livelock에서는 thread가 계속 양보·retry·상태 변경을 하지만 실제 작업은 완료되지 않는다. deadlock처럼 정지해 보이지만 CPU와 message를 소비하며 양쪽이 동시에 같은 회복 규칙을 반복하는 경우가 많다.

randomized backoff, retry budget, 우선순위 변화와 progress counter로 livelock을 완화한다. retry가 성공할 것이라는 낙관만으로 무한 loop를 만들지 않고 terminal failure를 정의한다.

### Backend 연결

동시 import가 unique conflict를 만나 즉시 같은 key를 재시도하면 livelock이 될 수 있다. 지수 backoff와 충돌 원인 기록, 최대 시도 횟수를 적용한다.

