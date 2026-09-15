---
kind: concept
contentKey: operating-systems.core.filesystem.filesystem-block
topicContentKey: operating-systems.core.filesystem
slug: filesystem-block
title: "File-System Block"
summary: "logical file offset을 filesystem allocation unit에 배치하고 VM page·device sector와 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# File-System Block

Application은 file을 연속된 byte sequence로 보지만 filesystem은 persistent data를 관리하기 위해 일정한 크기의 **block 단위**로 나누어 배치한다. File의 logical offset은 어느 logical block과 그 block 내부 위치인지로 나눌 수 있고, filesystem metadata가 logical block을 실제 storage 위치에 연결한다.

예를 들어 block size가 4KiB라면 offset 9000은 세 번째 logical block의 808번째 byte에 해당한다.

```text
9000 / 4096 = logical block 2
9000 % 4096 = block offset 808
```

Logical block들이 storage에서 반드시 연속된 물리 위치에 놓이는 것은 아니다.

### VM page와 device sector와는 다른 단위다

Virtual-memory page는 memory mapping과 residency의 단위이고, filesystem block은 persistent file data와 free-space allocation을 관리하는 단위다. Storage device의 sector나 내부 flash page는 다시 다른 계층의 단위다.

크기가 우연히 같을 수 있어도 책임은 다르기 때문에 `4KiB VM page = 4KiB filesystem block = device atomic-write unit`이라고 추론하면 안 된다.

### Block 크기도 trade-off를 만든다

큰 block은 큰 file을 적은 metadata로 관리하기 쉽고 sequential access에 유리할 수 있지만 작은 file의 마지막 block에서 낭비되는 공간이 커질 수 있다. 작은 block은 세밀한 allocation이 가능하지만 더 많은 mapping metadata가 필요할 수 있다.

File-System Block의 핵심은 **연속된 file bytes를 persistent storage에 배치하고 추적하기 위한 filesystem의 allocation 단위이며, memory page나 hardware sector와는 다른 층의 개념이라는 점**이다.