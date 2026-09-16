---
kind: concept
contentKey: operating-systems.core.filesystem.write-flush-fsync
topicContentKey: operating-systems.core.filesystem
slug: write-flush-fsync
title: "write, flush·fsync"
summary: "application write 완료와 user buffer flush, kernel write-back, filesystem durability가 서로 다른 경계인 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-journaling.pdf"
    title: "Crash Consistency: FSCK and Journaling"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "여러 filesystem metadata/data write가 crash 중 일부만 반영될 때 consistency를 유지하는 방식을 확인한다."
    displayOrder: 2
  - url: "https://man7.org/linux/man-pages/man2/write.2.html"
    title: "write(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux write의 partial-write 가능성과 성공 반환이 disk commit을 보장하지 않는 경계를 확인한다."
    displayOrder: 3
  - url: "https://man7.org/linux/man-pages/man2/fsync.2.html"
    title: "fsync(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux fsync의 file data/metadata persistence와 directory entry durability의 별도 경계를 확인한다."
    displayOrder: 4
---
# write, flush·fsync

Application이 file에 data를 썼다는 사건과 **crash 이후에도 그 data가 남는다는 durability 사건은 같은 완료 지점이 아니다.** I/O path에 여러 buffer와 persistent metadata 단계가 있기 때문에 각 API가 어느 경계까지 완료하는지 구분해야 한다.

![application write부터 durability boundary까지의 단계](/learning/operating-systems/write-flush-fsync.svg)

### `write()` 성공은 stable storage 완료와 다르다

일반적인 buffered I/O에서 `write(fd, buf, n)`가 성공하면 kernel이 반환된 byte 수만큼 data를 받아 file state에 반영할 책임을 갖게 된다. 하지만 그 data가 이미 persistent storage에 기록되었다고 볼 수는 없다. API에 따라 partial write도 가능하므로 반환 byte 수를 확인해야 한다.

### Library `flush()`는 자기 buffer를 비운다

Buffered stream의 `flush()`는 일반적으로 user-space buffer에 있던 bytes를 underlying stream으로 전달한다. Underlying stream이 file이면 kernel write로 이어질 수 있지만, 이것만으로 filesystem/storage durability가 보장되는 것은 아니다.

```text
library buffer flush
        ↓
kernel에 전달
        ↓
page cache / filesystem
        ↓
storage durability는 아직 별도
```

### `fsync()`는 더 강한 persistence 경계를 요청한다

Unix 계열의 `fsync()`는 file의 dirty data와 필요한 metadata를 persistent storage 쪽으로 동기화하도록 요청한다. 하지만 application이 원하는 durable state에 directory entry 변경까지 포함된다면 file 자체의 fsync만으로 충분하다고 일반화할 수 없다. Linux에서는 새 file 이름이나 rename 같은 directory metadata의 durability를 위해 containing directory의 동기화 계약도 별도로 고려해야 한다.

### Durability와 crash consistency도 구분한다

File update는 data block, allocation metadata, inode, directory entry처럼 여러 persistent structure를 바꿀 수 있다. Filesystem의 journaling 같은 mechanism은 crash 중 일부 update만 반영되어 structure가 깨지는 문제를 다룬다. Application이 `fsync()`를 호출하는 것과 filesystem 내부의 crash-consistency mechanism은 서로 다른 책임이다.

`write`, library `flush`, `fsync`의 핵심 차이는 **data를 다음 계층에 넘긴 것과 crash 후 보존 가능한 상태까지 동기화한 것을 분리하는 것**이다.