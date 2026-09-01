---
kind: concept
contentKey: operating-systems.core.filesystem.page-cache
topicContentKey: operating-systems.core.filesystem
slug: page-cache
title: "Page Cache"
summary: "file-backed data를 memory에 유지해 storage I/O를 줄이는 대신 dirty write-back과 memory pressure를 만드는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# Page Cache

storage access는 memory access보다 훨씬 비싸기 때문에 OS는 최근 읽거나 쓴 file data를 memory에 cache한다. Linux의 page cache를 mental model로 보면 regular file read가 필요한 data를 이미 memory에서 찾으면 storage read 없이 application buffer로 전달할 수 있고, 없다면 backing storage에서 가져온 뒤 cache에 보관할 수 있다.

### Read path에서 locality를 재사용한다

한 process가 file block을 읽은 뒤 다른 process나 이후 요청이 같은 file region을 읽으면 page cache에 남아 있는 data를 재사용할 수 있다. sequential access에서는 readahead가 앞으로 필요할 data를 미리 가져와 storage latency를 숨길 수도 있다. 반대로 거대한 one-time scan이 cache를 채우면 기존 interactive working set을 밀어낼 수 있다.

이 때문에 benchmark의 첫 read와 두 번째 read는 storage 성능이 아니라 `cold cache vs warm cache` 차이를 측정하고 있을 수 있다.

### Write path에서는 dirty state가 생길 수 있다

buffered write는 application bytes를 kernel memory/page cache에 반영하고 page를 dirty로 만든 뒤 syscall이 반환될 수 있다. dirty page는 나중에 write-back되어 backing storage에 전달된다. 따라서 다음 세 상태를 구분해야 한다.

`application buffer에만 존재 → kernel/page cache에 dirty data 존재 → storage durability boundary까지 완료`

구체적인 write-back timing과 durability는 filesystem/storage 계약에 따라 다르며 `write()` 반환만으로 마지막 상태를 보장할 수 없다.

### Page cache도 physical memory를 사용한다

file cache는 남는 RAM을 활용해 성능을 높이지만 anonymous/JVM heap/native memory와 physical capacity를 공유한다. memory pressure가 커지면 clean cache page를 reclaim하거나 dirty page write-back이 필요할 수 있다. application cache를 늘려 OS page cache working set을 밀어내면 전체 latency가 오히려 나빠질 수 있다.

### Direct I/O는 단순한 상위호환이 아니다

일부 direct-I/O 경로는 page cache를 우회해 double caching을 줄일 수 있지만 alignment, buffer lifetime, I/O scheduling 책임이 application 쪽으로 이동한다. 따라서 `page cache가 한 번 copy하니 direct I/O가 항상 빠르다`고 판단하지 않고 workload와 storage stack을 측정한다.

Backend 성능 분석에서는 file read latency와 함께 cache warm/cold 상태, resident memory, read I/O, reclaim을 같이 본다. PostgreSQL 같은 DB의 자체 buffer 관리와 OS page cache가 어떻게 상호작용하는지도 제품별 계약에 따라 따로 확인한다.
