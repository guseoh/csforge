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
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
  - url: "https://toss.tech/article/flink-realtime-frequency-capping"
    title: "Apache Flink + RocksDB 튜닝으로 광고 Frequency Capping 실시간 집계를 일주일까지 확장하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Direct I/O로 OS page cache를 우회했을 때 cache miss와 memory-control trade-off가 어떻게 바뀌는지 실제 운영 사례로 확인한다."
    displayOrder: 2
---
# Page Cache

Page cache는 **file data를 physical memory에 보관해 반복되는 storage I/O를 줄이는 OS cache**다. File을 읽을 때 필요한 page가 이미 cache에 있으면 storage에서 다시 가져오지 않고 memory의 data를 사용할 수 있다.

```text
file read
   ↓
page cache lookup
   ├─ hit  → memory data 사용
   └─ miss → storage read → page cache에 보관 → 사용
```

### Read에서는 locality를 재사용한다

같은 file region을 다시 읽거나 sequential access를 수행하면 이미 resident한 page와 readahead를 이용해 storage 지연을 줄일 수 있다. 그래서 cold cache에서의 첫 read와 warm cache에서의 반복 read는 크게 다른 성능을 보일 수 있다.

### Write에서는 dirty page가 생길 수 있다

Buffered write는 kernel page cache의 page를 수정하고 dirty 상태로 만든 뒤 반환될 수 있다. Dirty page는 이후 write-back을 통해 storage에 전달된다.

```text
application write
→ dirty page cache
→ write-back
→ storage
```

Page cache에서 최신 data를 읽을 수 있다는 사실과 power loss 이후에도 data가 남는다는 durability 보장은 다르다.

### Page cache도 physical memory를 사용한다

File-backed cache page도 다른 process memory와 같은 physical-memory capacity를 사용한다. Memory pressure가 생기면 clean cache page를 reclaim하거나 dirty page의 write-back이 필요할 수 있다.

Page Cache의 핵심은 **storage data를 memory에 재사용해 I/O를 줄이는 대신, dirty write-back과 physical-memory pressure라는 별도 상태를 만든다는 점**이다.