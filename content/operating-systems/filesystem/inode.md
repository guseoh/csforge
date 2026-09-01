---
kind: concept
contentKey: operating-systems.core.filesystem.inode
topicContentKey: operating-systems.core.filesystem
slug: inode
title: "Inode"
summary: "pathname과 분리된 filesystem object metadata가 data block과 link/lifetime을 연결하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "File System Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# Inode

inode는 Unix 계열 filesystem을 설명할 때 file의 **이름과 분리된 내부 object metadata**를 이해하기 위한 핵심 구조다. directory entry가 `name → inode number` 관계를 저장하고, inode는 file type, owner, permission, size, timestamps, link count와 data block 위치를 찾는 정보를 가진다. 실제 inode field와 block-addressing 방식은 filesystem마다 다르지만 이름과 object metadata를 분리한다는 모델이 중요하다.

### 이름은 directory에 있고 inode는 object를 설명한다

`a.txt`와 `b.txt`라는 두 hard link가 같은 inode number를 가리킬 수 있다. 이때 이름은 두 개지만 underlying file object와 content는 하나다. 한 이름을 `unlink()`해도 다른 directory entry가 남아 있다면 inode와 data는 계속 접근 가능하다. 마지막 directory link가 사라져도 process가 해당 file을 open하고 있다면 filesystem은 open reference가 끝날 때까지 object/resource를 유지할 수 있다.

이 구조 때문에 `pathname 삭제 = 즉시 data block 삭제`라는 등식이 성립하지 않는다.

### inode는 content 자체가 아니다

inode에는 작은 metadata와 data 위치 정보가 있고 실제 file bytes는 별도 data block에 저장된다. file이 커지면 여러 block을 주소화해야 하므로 direct/indirect pointer나 extent 같은 구현 방식이 필요할 수 있다. 구체적인 방식은 filesystem마다 다르므로 `모든 inode는 동일한 direct pointer 개수를 가진다`고 일반화하면 안 된다.

### metadata와 data의 persistent update는 여러 write가 될 수 있다

file을 늘리려면 free block 할당 상태, inode size/block mapping, 실제 data block 등 여러 persistent structure가 바뀔 수 있다. crash가 중간에 발생하면 일부만 기록될 위험이 있기 때문에 journaling이나 copy-on-write filesystem 같은 crash-consistency 설계가 필요해진다.

Backend에서 temp file을 쓰고 rename으로 교체할 때도 pathname만 보면 안 된다. 새 file data, inode metadata, directory entry가 각각 어떤 시점에 durable한지는 별도의 filesystem 계약이다. 중요한 artifact를 저장한다면 application-level 상태와 checksum뿐 아니라 필요한 durability boundary까지 명확히 한다.
