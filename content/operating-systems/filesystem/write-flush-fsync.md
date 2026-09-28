---
kind: concept
contentKey: operating-systems.core.filesystem.write-flush-fsync
topicContentKey: operating-systems.core.filesystem
slug: write-flush-fsync
title: "파일 쓰기와 동기화(write, flush, fsync)"
summary: "애플리케이션 write 완료와 사용자 버퍼 flush, 커널 쓰기 반영(write-back), 파일 시스템 영속성가 서로 다른 경계인 이유를 설명한다."
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
# 파일 쓰기와 동기화(write, flush, fsync)

애플리케이션이 파일에 data를 썼다는 사건과 **crash 이후에도 그 data가 남는다는 영속성 사건은 같은 완료 지점이 아니다.** I/O 경로에 여러 버퍼와 persistent 메타데이터 단계가 있기 때문에 각 API가 어느 경계까지 완료하는지 구분해야 한다.

![애플리케이션 write부터 영속성 경계까지의 단계](/learning/operating-systems/write-flush-fsync.svg)

### `write()` 성공은 stable 저장소 완료와 다르다

일반적인 buffered I/O에서 `write(fd, buf, n)`가 성공하면 커널이 반환된 바이트 수만큼 data를 받아 파일 상태에 반영할 책임을 갖게 된다. 하지만 그 data가 이미 persistent 저장소에 기록되었다고 볼 수는 없다. API에 따라 partial write도 가능하므로 반환 바이트 수를 확인해야 한다.

### 라이브러리 `flush()`는 자기 버퍼를 비운다

Buffered 스트림의 `flush()`는 일반적으로 사용자 공간 버퍼에 있던 바이트를 underlying 스트림으로 전달한다. Underlying 스트림이 파일이면 커널 write로 이어질 수 있지만, 이것만으로 파일 시스템/저장소 영속성가 보장되는 것은 아니다.

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

Unix 계열의 `fsync()`는 파일의 dirty data와 필요한 메타데이터를 persistent 저장소 쪽으로 동기화하도록 요청한다. 하지만 애플리케이션이 원하는 durable 상태에 디렉터리 엔트리 변경까지 포함된다면 파일 자체의 fsync만으로 충분하다고 일반화할 수 없다. Linux에서는 새 파일 이름이나 rename 같은 디렉터리 메타데이터의 영속성를 위해 containing 디렉터리의 동기화 계약도 별도로 고려해야 한다.

### 영속성와 crash consistency도 구분한다

파일 갱신는 data block, 할당 메타데이터, 아이노드, 디렉터리 entry처럼 여러 persistent structure를 바꿀 수 있다. 파일 시스템의 journaling 같은 메커니즘은 crash 중 일부 갱신만 반영되어 structure가 깨지는 문제를 다룬다. 애플리케이션이 `fsync()`를 호출하는 것과 파일 시스템 내부의 crash-consistency 메커니즘은 서로 다른 책임이다.

`write`, 라이브러리 `flush`, `fsync`의 핵심 차이는 **data를 다음 계층에 넘긴 것과 crash 후 보존 가능한 상태까지 동기화한 것을 분리하는 것**이다.