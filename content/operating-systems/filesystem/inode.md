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
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# Inode

Inode는 Unix 계열 filesystem에서 **file 이름과 분리된 filesystem object의 metadata**를 이해하기 위한 대표 구조다. Directory entry가 `name → inode number` 관계를 저장하고, inode는 file type, owner, permission, size, timestamp와 data 위치를 찾는 정보를 가진다.

![directory entry, inode metadata, data block의 관계](/learning/operating-systems/inode-file-layout.svg)

```text
directory entry
"a.txt" ──> inode 42 ──> metadata + data block mapping
```

### 여러 이름이 같은 inode를 가리킬 수 있다

Hard link를 사용하면 `a.txt`와 `b.txt`가 같은 inode를 가리킬 수 있다. 한 이름을 `unlink()`해도 다른 link가 남아 있으면 file object는 계속 존재한다. 마지막 pathname link가 사라져도 열린 descriptor가 남아 있다면 object lifetime이 즉시 끝나지 않을 수 있다.

따라서 pathname 삭제와 file object 삭제는 같은 사건이 아니다.

### Inode와 file content도 분리된다

Inode는 metadata와 data 위치 정보를 담고, 실제 file bytes는 별도의 data block에 저장된다. 큰 file의 block을 어떻게 가리키는지는 direct/indirect pointer, extent 등 filesystem마다 다를 수 있다.

Inode의 핵심은 **이름을 directory namespace에 두고, persistent file object의 metadata와 data 위치 정보를 별도 구조로 관리한다는 점**이다. 이 분리가 hard link, rename, unlink와 open-file lifetime을 설명하는 기반이 된다.