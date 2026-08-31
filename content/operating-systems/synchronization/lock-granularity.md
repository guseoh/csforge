---
kind: concept
contentKey: operating-systems.core.synchronization.lock-granularity
topicContentKey: operating-systems.core.synchronization
slug: lock-granularity
title: "Lock Granularity"
summary: "coarse/fine lock이 contention·parallelism·복잡도에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Lock Granularity

coarse-grained lock은 많은 state를 하나로 보호해 invariant를 단순하게 하지만 contention을 키운다. fine-grained lock은 독립 state의 병렬성을 높일 수 있으나 여러 lock 순서, deadlock, cross-object invariant가 복잡해진다.

lock 분할은 “더 많이 나누면 더 빠르다”가 아니라 실제 경쟁과 invariant 경계에 근거해야 한다. lock을 나눈 뒤 원자적으로 갱신해야 하는 관계가 남으면 오히려 correctness가 어려워진다.

### Backend 연결

cache 전체 lock을 entry lock으로 바꿀 때 eviction, size, metrics 같은 전역 invariant를 다시 검토한다. profiler 없이 fine-grained lock을 늘리는 것은 운영 복잡도만 키울 수 있다.
