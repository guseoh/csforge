---
kind: concept
contentKey: operating-systems.core.io.mmap
topicContentKey: operating-systems.core.io
slug: mmap
title: "mmap"
summary: "file과 address space를 mapping해 page fault로 데이터를 가져오는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux mmap의 lazy population과 MAP_POPULATE 같은 explicit prefault 선택지를 구분한다."
    displayOrder: 1
---
# mmap

`mmap()`은 file이나 anonymous object를 process의 virtual address range에 연결해, 이후 그 영역을 **일반 memory load/store로 접근할 수 있게 하는 interface**다. `read()`처럼 매번 application buffer를 명시적으로 넘기는 대신 file-backed state와 virtual-memory mapping을 연결한다.

![file mapping과 first-touch page fault 흐름](/learning/operating-systems/mmap-file-access.svg)

### Mapping과 residency는 같은 사건이 아니다

큰 file을 mapping했다고 모든 page가 즉시 physical memory에 올라오는 것은 아니다. Mapping은 먼저 virtual address range와 backing object의 관계를 만든다. 실제 page는 첫 접근에서 page fault를 통해 준비될 수 있다.

```text
mmap()
  ↓
virtual mapping 생성
  ↓
first touch
  ↓
page fault 가능
  ↓
page cache/backing에서 page 준비
```

따라서 mmap의 비용은 mapping syscall 하나만이 아니라 access locality, first-touch fault와 resident working set까지 함께 봐야 한다.

### MAP_PRIVATE와 MAP_SHARED

Private mapping의 변경은 보통 copy-on-write 방식으로 process-private page를 만들 수 있으므로 write가 underlying file에 그대로 반영된다고 기대하면 안 된다. Shared file mapping에서는 변경이 shared backing과 연결될 수 있지만, 여러 process가 동시에 같은 위치를 수정할 때 atomicity와 synchronization이 자동으로 제공되는 것은 아니다.

Mapping의 sharing semantics와 synchronization semantics는 별개의 계약이다.

### mmap은 durability를 보장하지 않는다

Shared mapping에 값을 썼다고 그 순간 stable storage까지 기록된 것은 아니다. Dirty mapped page의 write-back과 persistence에는 별도 sync contract가 필요하다. 즉 memory에서 변경이 보이는 것과 crash 이후에도 file 변경이 남는 것은 다른 문제다.

### mmap은 항상 더 빠른 I/O가 아니다

Explicit `read()`의 user-buffer copy를 줄일 수 있는 경우가 있지만 page fault, page-table/TLB pressure와 random access 비용도 있다. Buffered read 역시 page cache를 활용한다. 따라서 mmap은 "syscall이 적으니 항상 빠르다"는 선택이 아니라 **file을 process address space로 다뤄야 하는 access pattern과 lifecycle에 맞는지 판단하는 data-access 방식**이다.
