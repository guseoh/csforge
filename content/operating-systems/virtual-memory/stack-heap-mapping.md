---
kind: concept
contentKey: operating-systems.core.virtual-memory.stack-heap-mapping
topicContentKey: operating-systems.core.virtual-memory
slug: stack-heap-mapping
title: "Stack and Heap Mapping"
summary: "process address space에서 stack·heap 성장과 lifetime을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Stack and Heap Mapping

stack은 호출 frame과 local state를 thread별로 담고 호출·반환에 따라 lifetime이 자연스럽게 정해진다. heap은 동적 allocation의 lifetime을 가지며 allocator와 garbage collector가 회수를 관리한다.

둘 다 virtual address space의 mapping이지만 성장 방향과 guard page, allocation 실패 방식이 다를 수 있다. 큰 local object를 stack에 두거나 해제되지 않는 heap reference를 남기는 것은 서로 다른 failure mode를 만든다.

### Backend 연결

Java heap, native stack, direct buffer, memory-mapped file을 서로 다른 limit으로 관찰한다. StackOverflowError와 heap OOM을 동일한 memory 문제로 처리하지 않는다.
