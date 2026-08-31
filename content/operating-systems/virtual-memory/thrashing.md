---
kind: concept
contentKey: operating-systems.core.virtual-memory.thrashing
topicContentKey: operating-systems.core.virtual-memory
slug: thrashing
title: "Thrashing"
summary: "fault 처리에 대부분의 시간을 써서 유효 실행이 줄어드는 조건을 추론한다."
level: 3
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Thrashing

thrashing은 process의 working set을 memory에 유지할 frame이 부족해 page fault와 swap I/O가 유효한 instruction 실행보다 많아지는 상태다. CPU 사용률이 낮아지고 disk activity와 fault latency가 함께 올라갈 수 있다.

동시 process 수를 줄이거나 working set을 줄이고, memory를 늘리거나 admission control을 적용해 완화한다. 단순히 CPU를 더 배정해도 page-in 병목은 해결되지 않는다.

### Backend 연결

JVM heap과 native/file cache가 container limit 안에서 경쟁하면 GC와 major fault가 동시에 증가할 수 있다. memory limit, heap, cache, concurrency를 하나의 예산으로 관리한다.
