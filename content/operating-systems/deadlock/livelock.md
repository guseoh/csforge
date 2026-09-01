---
kind: concept
contentKey: operating-systems.core.deadlock.livelock
topicContentKey: operating-systems.core.deadlock
slug: livelock
title: "Livelock"
summary: "execution은 계속 움직이지만 서로의 반응 때문에 유효한 work가 완료되지 않는 livelock을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
---
# Livelock

### 멈춰 있지 않지만 progress도 없다

livelock에서는 execution이 block된 채 정지하지 않는다. thread나 process가 계속 retry, rollback, 양보 같은 action을 수행하지만 서로의 action에 반응해 실제 목표 상태에 도달하지 못한다.

두 사람이 복도에서 서로 비켜 주려고 동시에 왼쪽으로 움직였다가 다시 동시에 오른쪽으로 움직이는 비유가 자주 쓰인다. 상태는 계속 바뀌지만 둘 다 통과하지 못한다.

### retry가 liveness 문제를 만들 수 있다

두 transaction이 충돌할 때 둘 다 즉시 rollback하고 같은 timing으로 재시도하면 다시 같은 conflict를 만들 수 있다. retry가 무조건 progress를 보장하지 않는 이유다.

randomized/exponential backoff, jitter, priority 변화, retry budget은 symmetry를 깨고 한쪽이 먼저 진행할 기회를 만들 수 있다. 하지만 backoff 자체가 correctness를 보장하는 것은 아니며 terminal failure와 retry-safe effect가 별도로 필요하다.

### deadlock과 관측 증상이 다르다

Deadlock에서는 참여 execution들이 서로 기다리며 CPU 사용이 낮아질 수 있다. Livelock에서는 CPU, network request, lock acquisition attempt가 계속 발생할 수 있어 시스템이 바쁜데 throughput이 낮은 형태로 나타날 수 있다.

Backend에서 conflict retry rate는 높은데 성공 throughput이 오르지 않는다면 livelock 가능성을 본다. 단순히 retry 횟수를 더 늘리는 것은 문제를 악화할 수 있다.
