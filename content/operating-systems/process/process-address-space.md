---
kind: concept
contentKey: operating-systems.core.process.process-address-space
topicContentKey: operating-systems.core.process
slug: process-address-space
title: "Process Address Space"
summary: "code·data·heap·stack으로 나뉜 process-visible 주소 공간을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Process Address Space

process address space는 code, read-only data, writable data, heap, stack 같은 논리 영역으로 구성된다. 각 process가 같은 virtual address를 사용해도 page table이 다른 physical frame으로 매핑해 독립성을 만든다.

heap은 동적 할당 lifetime을, stack은 호출 frame과 thread-local 실행 상태를 표현한다. 주소 영역의 경계와 permission은 ABI와 OS에 따라 달라질 수 있으므로 고정된 그림을 모든 환경의 물리 배치로 해석하지 않는다.

### Backend 연결

JVM heap, native memory, thread stack은 서로 다른 자원이다. OutOfMemoryError를 만났을 때 heap만 늘리기 전에 direct buffer, stack, mapped file과 process limit을 함께 확인한다.

