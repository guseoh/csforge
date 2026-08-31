---
kind: concept
contentKey: operating-systems.core.synchronization.contention
topicContentKey: operating-systems.core.synchronization
slug: contention
title: "Contention"
summary: "동일 lock 대기와 context switch가 throughput을 떨어뜨리는 경로를 추론한다."
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
# Contention

contention은 여러 실행 흐름이 같은 lock, CPU, memory bandwidth, downstream resource를 얻으려 경쟁하는 상태다. lock wait가 길어지면 worker가 useful work를 하지 못하고 context switch와 cache disruption도 늘어난다.

경쟁을 줄이는 방법은 critical section을 줄이는 것, state를 분할하는 것, queue로 직렬화하는 것, work를 batch하는 것 등이다. 분할하면 다른 형태의 contention과 consistency 비용이 생기는지 같이 본다.

### Backend 연결

API latency 상승 때 DB lock만 추측하지 말고 executor queue, connection pool, synchronized cache, CPU를 함께 측정한다. p99와 lock wait를 같은 trace로 연결해야 원인을 좁힐 수 있다.
