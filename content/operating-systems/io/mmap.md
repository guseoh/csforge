---
kind: concept
contentKey: operating-systems.core.io.mmap
topicContentKey: operating-systems.core.io
slug: mmap
title: "mmap"
summary: "file 또는 anonymous object를 virtual address range로 접근하게 만들고 fault·sharing·durability 경계를 설명한다."
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

`mmap()`은 file이나 anonymous memory object를 process의 virtual address range에 연결해 **load/store instruction으로 해당 mapping을 접근할 수 있게 만드는 interface**다. `read()`처럼 application buffer를 명시적으로 넘기는 대신 memory access 자체가 I/O-backed state와 연결된다.

### mapping 생성과 page residency는 다르다

큰 file을 mmap해도 모든 file page가 즉시 RAM에 올라오는 것은 아니다. virtual mapping을 만든 뒤 실제 address를 처음 touch할 때 page fault가 발생하고 page cache/file backing에서 content가 준비될 수 있다. 그래서 mmap latency는 mapping call 하나보다 **first-touch fault와 working-set behavior**까지 봐야 한다.

### MAP_PRIVATE와 MAP_SHARED는 수정 의미가 다르다

private mapping에서 write는 일반적으로 copy-on-write 방식으로 process-private page를 만들 수 있어 underlying file에 동일하게 반영된다고 기대하면 안 된다. shared file mapping은 mapping을 공유하는 process들이 같은 backing content 변경을 관찰할 수 있지만 synchronization과 durability가 자동 해결되는 것은 아니다.

여러 process가 shared mapping의 counter를 동시에 수정하면 shared-memory race가 생길 수 있다. `memory를 공유한다`는 것과 `atomicity/ordering이 보장된다`는 것은 별개의 문제다.

### File size와 mapping lifetime을 조심한다

mapped range와 backing file의 크기/lifetime이 어긋나는 상황에서는 access failure가 발생할 수 있다. mapping한 file을 다른 actor가 truncate하거나 replace할 수 있는 workflow라면 pathname 변경과 mapping이 가리키는 underlying object를 구분하고 failure contract를 확인해야 한다.

### mmap이 항상 faster 또는 zero-copy는 아니다

mmap은 explicit read syscall과 user-buffer copy를 줄일 수 있는 workload가 있지만 page fault, page-table/TLB pressure, random access, memory pressure 비용이 생긴다. kernel page cache를 사용하는 buffered `read()` 역시 cache hit에서는 매우 빠를 수 있으므로 `syscall이 없으니 mmap이 항상 빠르다`고 결론내리지 않는다.

### Durability는 별도 문제다

shared file mapping을 수정했다고 durable storage까지 즉시 반영되는 것은 아니다. dirty mapped page의 write-back과 필요한 sync API semantics를 별도로 확인해야 한다. memory visibility와 filesystem persistence도 서로 다른 층이다.

Backend에서 large read-only index나 file format을 mmap할 때는 access locality, cold-fault p99, resident set, file replacement lifecycle을 측정한다. 작은 file이나 sequential stream에서는 단순 buffered I/O가 더 읽기 쉽고 충분히 빠를 수 있다.
