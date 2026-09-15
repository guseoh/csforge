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
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# Buffering

Buffering은 producer와 consumer의 속도나 처리 단위가 다를 때 **data를 잠시 모아 두어 I/O 호출과 실제 전송 시점을 분리하는 방식**이다. 하나의 I/O path에는 user-space library buffer, kernel page cache, device queue처럼 여러 buffer가 존재할 수 있다.

```text
application
   ↓
user-space buffer
   ↓
kernel/page cache
   ↓
block/device layer
   ↓
storage
```

### User-space buffer는 작은 호출을 모을 수 있다

Application이 아주 작은 write를 반복하면 system call 수가 많아질 수 있다. Library buffer는 여러 write를 모아 더 큰 단위로 다음 계층에 전달해 호출 overhead를 줄일 수 있다.

이때 library의 `flush()`는 보통 **그 library가 보유한 buffer를 다음 계층으로 밀어내는 것**을 뜻한다. Storage durability까지 완료했다는 의미는 아니다.

### Kernel도 별도의 buffering을 할 수 있다

Kernel은 write data를 page cache에 받아 두고 나중에 write-back하거나, read에서 readahead를 사용해 앞으로 필요할 data를 미리 가져올 수 있다. 이런 buffering은 처리량을 높일 수 있지만 data가 어느 단계까지 이동했는지 구분해야 한다.

Buffer가 너무 작으면 호출 횟수가 늘고, 너무 크면 memory 사용량과 data가 머무는 시간이 길어질 수 있다. 적절한 크기는 access pattern과 각 계층의 처리 단위에 따라 달라진다.

Buffering의 핵심은 **I/O data가 여러 계층의 buffer를 거칠 수 있으며, 한 계층에서 flush되었다는 사실이 다음 계층의 완료나 durability까지 자동으로 보장하지 않는다는 점**이다.