---
kind: concept
contentKey: operating-systems.core.io.mmap
topicContentKey: operating-systems.core.io
slug: mmap
title: "mmap"
summary: "파일이나 anonymous memory를 process 주소 공간에 매핑하는 흐름을 설명한다."
level: 2
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
# mmap

`mmap`은 file 또는 anonymous memory를 process virtual address space에 연결한다. mapping 생성은 주소 범위를 예약하는 단계일 수 있고, 실제 page load·allocation은 접근 시 page fault에서 일어날 수 있다.

shared mapping은 여러 process가 같은 physical page를 볼 수 있어 빠른 communication을 제공하지만 synchronization과 visibility 책임을 만든다. mapped file의 변경과 flush, truncation, signal 실패도 고려한다.

### Backend 연결

대형 읽기 전용 index에 mmap을 사용하면 copy와 syscall을 줄일 수 있지만, address space와 page fault를 운영 지표로 관리해야 한다. untrusted file size를 그대로 mapping하지 않는다.

