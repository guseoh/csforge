---
kind: concept
contentKey: operating-systems.core.virtual-memory.virtual-address-space
topicContentKey: operating-systems.core.virtual-memory
slug: virtual-address-space
title: "Virtual Address Space"
summary: "각 process가 독립적인 연속 주소처럼 보는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Virtual Address Space

process는 virtual address를 사용해 자신만의 연속적인 주소 공간을 보는 것처럼 실행한다. MMU와 page table이 virtual page를 physical frame이나 file-backed page로 변환하므로 process마다 같은 virtual address가 다른 실제 자원을 가리킬 수 있다.

공간의 hole, guard page, permission은 실제 memory 사용량과 다르다. mapping을 예약했다고 모든 physical page가 즉시 소비되는 것도 아니며, 접근 시점에 allocation이나 page fault가 발생할 수 있다.

### Backend 연결

JVM heap 크기, mapped file, container memory limit은 virtual size와 resident memory를 다르게 만든다. OOM 진단에서 RSS와 address-space reservation을 함께 본다.
