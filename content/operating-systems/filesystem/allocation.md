---
kind: concept
contentKey: operating-systems.core.filesystem.allocation
topicContentKey: operating-systems.core.filesystem
slug: allocation
title: "Block Allocation"
summary: "file 성장과 access pattern에 맞춰 free block을 배치하고 metadata·fragmentation·locality trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# Block Allocation

filesystem은 새 file을 만들거나 기존 file이 커질 때 free-space 상태에서 data block을 골라 file의 logical block과 연결해야 한다. allocation policy는 단순히 빈 공간을 찾는 문제가 아니라 **file 성장, sequential/random access, locality, metadata overhead, fragmentation**을 함께 조정하는 문제다.

### 단순한 allocation 방식이 보여주는 trade-off

연속 allocation은 file block이 storage에서 연속된 위치에 있다는 가정 아래 시작 위치와 길이만으로 위치를 계산하기 쉽고 sequential access locality도 좋다. 하지만 file이 예상보다 커지는데 뒤 공간이 이미 사용 중이면 확장하기 어렵고, 가변 크기의 연속 영역을 찾다 보면 외부 fragmentation 문제가 생길 수 있다.

linked allocation은 각 block이 다음 block을 가리키는 식으로 흩어진 free block을 유연하게 사용할 수 있지만, 먼 logical offset에 도달하려면 중간 pointer를 따라가야 해 random access가 불리하다. indexed allocation은 별도 index metadata로 block 위치를 찾아 random lookup을 개선하지만 index 자체의 공간과 lookup 비용이 필요하다.

현대 filesystem이 이 세 이름 중 하나만 그대로 쓰는 것은 아니다. inode pointer, indirect block, extent, allocation group처럼 여러 아이디어를 조합해 workload와 storage 특성에 맞춘다. 따라서 이 분류는 설계 trade-off를 이해하기 위한 mental model로 보는 편이 좋다.

### Free-space 관리와 allocation은 함께 움직인다

어디가 비어 있는지 bitmap이나 free list 같은 구조로 추적해야 allocation이 가능하다. file 하나에 block을 배정하려면 free-space metadata를 갱신하고 file metadata에도 새 block mapping을 반영해야 한다. 이 둘 중 하나만 crash 전에 persistent해지면 leak이나 잘못된 block reference가 생길 수 있으므로 crash consistency와도 연결된다.

### Locality는 file 하나만의 문제가 아니다

한 file의 인접 block을 가깝게 배치하면 sequential access에는 좋지만, directory와 관련 file을 같이 읽는 workload에서는 서로 관련된 metadata/data를 가까이 두는 정책이 더 중요할 수 있다. 또한 SSD에서는 HDD의 seek cost와 다른 trade-off가 있지만 큰 sequential request와 fragmented random I/O의 차이가 완전히 사라지는 것은 아니다.

Backend에서 대용량 export, search index segment, append-heavy log를 같은 storage layout 감각으로 다루지 않는다. 먼저 실제 access가 sequential append인지 random range read인지, file이 얼마나 자주 성장하는지 측정하고 filesystem/storage 계층의 allocation 효과는 그 뒤 해석한다.
