---
kind: concept
contentKey: operating-systems.core.filesystem.buffering
topicContentKey: operating-systems.core.filesystem
slug: buffering
title: "Buffering"
summary: "user-space·kernel·device 계층이 서로 다른 이유로 I/O를 모으고 지연하며 flush 의미가 달라지는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# Buffering

I/O에서 buffer는 producer와 consumer의 속도·단위 차이를 흡수하기 위해 data를 잠시 모아 두는 공간이다. 중요한 점은 **buffer가 한 층에 하나만 존재하는 것이 아니라는 것**이다. application/library의 user-space buffer, kernel page cache, block/device queue, storage controller 내부 cache처럼 여러 단계가 있을 수 있고 각 단계의 flush 의미도 다르다.

### User-space buffering은 syscall 수를 줄일 수 있다

application이 1 byte씩 `write()`를 호출하면 syscall overhead가 과도해질 수 있다. `BufferedWriter` 같은 library는 여러 작은 write를 user-space buffer에 모았다가 한 번에 kernel로 전달해 호출 횟수를 줄인다. 이때 `flush()`는 보통 **library buffer의 bytes를 다음 계층으로 내보내는 것**이지 durable storage까지 보장하는 연산이 아니다.

따라서 다음 상태를 구분해야 한다.

`application object → user-space buffer → kernel/page cache → filesystem/block layer → storage`

앞 단계의 flush 성공이 뒤 단계까지 완료되었다는 뜻은 아니다.

### Kernel buffering은 scheduling과 aggregation에 쓰인다

kernel은 write를 page cache에 받아 dirty page로 유지하면서 여러 write를 묶거나 적절한 시점에 write-back할 수 있다. read path에서도 readahead와 cache를 통해 작은 application read를 더 효율적인 storage access로 바꿀 수 있다. 이는 throughput을 높이고 latency를 숨길 수 있지만 dirty data가 오래 남아 있는 동안 crash가 나면 durability 요구와 충돌할 수 있다.

### Buffer 크기도 trade-off다

너무 작은 buffer는 syscall/device request 수를 늘릴 수 있고, 너무 큰 buffer는 memory 사용량과 flush latency를 키운다. 또한 큰 buffer 하나가 항상 storage에 최적인 것도 아니다. access pattern, compression, network/file pipeline, downstream request size에 따라 적절한 단위가 달라진다.

### flush, close, fsync를 같은 것으로 보지 않는다

language/library의 `flush()`는 해당 library가 가진 buffer를 비우는 계약이고, `close()`는 resource lifetime을 끝내면서 내부 flush를 동반할 수 있지만 durable persistence를 자동 보장한다고 일반화할 수 없다. filesystem durability가 필요하면 OS가 제공하는 `fsync()`/관련 API와 storage semantics까지 확인해야 한다.

Backend export에서 `writer.flush()` 성공 직후 DB 상태를 `DURABLE`로 바꾸는 식의 설계는 계층을 섞은 것이다. 요구사항이 단순히 같은 process가 곧 읽을 수 있는 것인지, process crash 후에도 남아야 하는지, power loss까지 견뎌야 하는지에 따라 필요한 durability boundary를 명시한다.
