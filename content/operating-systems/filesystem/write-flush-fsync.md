---
kind: concept
contentKey: operating-systems.core.filesystem.write-flush-fsync
topicContentKey: operating-systems.core.filesystem
slug: write-flush-fsync
title: "write, flush and fsync"
summary: "application write 완료와 user buffer flush, kernel write-back, filesystem durability가 서로 다른 경계인 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-journaling.pdf"
    title: "Crash Consistency: FSCK and Journaling"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "여러 filesystem metadata/data write가 crash 중 일부만 반영될 때 consistency를 유지하는 방식을 확인한다."
    displayOrder: 2
---
# write, flush and fsync

file에 bytes를 썼다는 application-level 사건과 그 bytes가 crash 이후에도 남는다는 durability 사건은 같은 시점이 아니다. storage stack에는 user-space buffer, kernel page cache, filesystem metadata, block/device queue와 controller cache 같은 여러 단계가 있을 수 있다. 그래서 어떤 API가 반환했다고 **어느 단계까지 완료되었는지**를 구분해야 한다.

### `write()` 성공은 무엇을 뜻하는가

일반적인 buffered file I/O에서 `write(fd, buf, n)`가 성공하면 kernel이 일부 또는 전체 bytes를 받아 file state에 반영할 책임을 갖게 되지만, 그 data가 이미 stable storage에 기록되었다고 일반화할 수 없다. partial write가 가능한 API에서는 요청한 `n`보다 적은 bytes만 받아들였을 수도 있으므로 return value도 확인해야 한다.

kernel page cache에 반영된 dirty data는 같은 system의 이후 read에서는 보일 수 있지만 power loss나 kernel crash에 대한 durability와는 별개다.

### library `flush()`는 보통 한 단계의 buffer를 비운다

`BufferedWriter.flush()` 같은 API는 해당 library의 user-space buffer를 underlying stream으로 밀어낸다. underlying stream이 file이라면 결국 kernel write로 이어질 수 있지만, 이것만으로 filesystem과 storage의 persistence가 끝났다고 볼 수 없다.

즉 다음 두 문장은 다르다.

- “Java writer가 더 이상 bytes를 자기 buffer에 들고 있지 않는다.”
- “filesystem/storage가 crash 후에도 bytes를 보존할 수 있는 durability boundary를 완료했다.”

### `fsync()`는 더 강한 durability 요청이다

Unix 계열의 `fsync()`는 file의 dirty data와 필요한 metadata를 persistent storage 쪽으로 동기화하도록 요청하는 API다. 하지만 application이 원하는 crash-consistent state가 file 하나의 data만으로 완성되는 것은 아닐 수 있다.

예를 들어 새 temp file을 작성한 뒤 rename으로 `current.dat`을 교체한다고 하자. 요구하는 보장이 `crash 후 새 이름과 새 data가 함께 보인다`라면 file content의 durability뿐 아니라 **directory entry/rename metadata의 durability**도 고려해야 한다. 구체적으로 어떤 directory sync가 필요한지는 OS/filesystem 계약에 따라 확인해야 한다.

### 왜 모든 write마다 fsync하지 않는가

persistence를 기다리는 연산은 storage ordering과 flush를 강제해 throughput과 tail latency 비용을 만들 수 있다. 따라서 로그 한 줄, 임시 cache file, canonical state file이 모두 같은 durability 요구를 가진다고 가정하지 않는다. 업무 invariant에 따라 batching/group commit이나 더 약한 persistence를 선택할 수 있다.

### Crash consistency는 여러 persistent update의 순서 문제다

file size, data block, allocation metadata, directory entry처럼 여러 on-disk structure가 바뀌는 도중 crash가 나면 일부만 반영될 수 있다. journaling 같은 filesystem 기술은 이런 multi-write update를 복구 가능한 형태로 만들기 위한 메커니즘이다. application `fsync()`와 filesystem 내부 journaling도 같은 책임이 아니며 둘을 구분한다.

Backend에서는 `파일 생성 성공`, `application flush 완료`, `durability 확보`, `DB transaction commit`을 필요하면 별도 상태로 모델링한다. 두 저장소를 동시에 사용하면서 실제 distributed transaction이 없는데 “둘 다 원자적으로 저장된다”고 표현하지 않는다.
