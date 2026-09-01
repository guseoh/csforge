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
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# File-System Block

application은 file을 연속된 byte sequence처럼 보지만 filesystem은 그 bytes를 storage에 관리하기 위해 일정한 allocation unit으로 나눈다. 이 단위를 설명 모델에서 file-system block이라고 부를 수 있다. file의 logical offset이 어느 block에 속하는지 계산하고, inode나 extent 같은 metadata를 통해 그 logical block이 실제 storage의 어느 위치에 배치되었는지 찾는다.

예를 들어 block size가 4KiB라면 file offset `9000`은 단순 모델에서 `floor(9000 / 4096) = 2`인 세 번째 logical block에 속하고, block 내부 offset은 `9000 mod 4096 = 808`이다. 하지만 이 logical block 2가 storage에서 file의 앞 block 바로 다음 위치에 있다고 보장되지는 않는다.

### VM page와 filesystem block은 같은 개념이 아니다

VM page는 virtual-memory translation과 residency의 단위이고 filesystem block은 persistent file data와 free-space allocation을 관리하는 단위다. 두 크기가 우연히 같을 수는 있지만 책임은 다르다. device의 sector나 SSD 내부 flash page도 또 다른 층의 단위다.

따라서 `4KiB page를 쓰니 disk도 4KiB atomic write를 보장한다`거나 `filesystem block 하나가 항상 hardware sector 하나다`라고 추론하면 안 된다. durability와 atomicity는 filesystem, block layer, storage device 계약을 따로 확인해야 한다.

### Block 배치가 locality를 만든다

sequential file의 인접 logical block이 storage에서도 가까이 배치되면 sequential read와 readahead가 효율적으로 동작할 가능성이 높다. free space가 조각나거나 file이 여러 위치에 분산되면 추가 metadata lookup과 device access 비용이 생길 수 있다. modern SSD에서는 고전적인 seek 비용의 의미가 달라져도 locality와 request aggregation 자체가 사라지는 것은 아니다.

### 작은 file과 큰 file의 trade-off

block 단위로 공간을 관리하면 free-space bookkeeping이 단순해지지만 file 마지막 block에서 사용하지 않는 공간이 생길 수 있다. 반대로 block을 너무 작게 만들면 큰 file을 표현하기 위해 더 많은 mapping metadata가 필요하다. filesystem은 block 크기와 extent, allocation policy를 통해 이 비용을 조정한다.

Backend에서 큰 export file을 sequential하게 만들거나 random range read를 수행할 때 application buffer 크기만 보지 않고 filesystem/page cache와 실제 access pattern을 함께 관찰한다. 다만 application batch size를 filesystem block size에 무조건 맞추는 것이 정답은 아니며 syscall 수, cache, storage throughput을 실제로 측정해야 한다.
