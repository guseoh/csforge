---
kind: concept
contentKey: operating-systems.core.filesystem.inode
topicContentKey: operating-systems.core.filesystem
slug: inode
title: "아이노드(아이노드)"
summary: "경로명과 분리된 파일 시스템 객체 메타데이터가 data block과 link/수명을 연결하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf"
    title: "파일 시스템 Implementation"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "inode, directory entry, data block, allocation 구조가 file-system access path를 만드는 방식을 확인한다."
    displayOrder: 1
---
# 아이노드(아이노드)

아이노드는 Unix 계열 파일 시스템에서 **파일 이름과 분리된 파일 시스템 객체의 메타데이터**를 이해하기 위한 대표 구조다. 디렉터리 entry가 `name → inode number` 관계를 저장하고, 아이노드는 파일 type, 소유자, 권한, size, timestamp와 data 위치를 찾는 정보를 가진다.

![디렉터리 엔트리, 아이노드 메타데이터, data block의 관계](/learning/operating-systems/아이노드-파일-layout.svg)

```text
directory entry
"a.txt" ──> inode 42 ──> metadata + data block mapping
```

### 여러 이름이 같은 아이노드를 가리킬 수 있다

Hard link를 사용하면 `a.txt`와 `b.txt`가 같은 아이노드를 가리킬 수 있다. 한 이름을 `unlink()`해도 다른 link가 남아 있으면 파일 객체는 계속 존재한다. 마지막 경로명 link가 사라져도 열린 디스크립터가 남아 있다면 객체 수명이 즉시 끝나지 않을 수 있다.

따라서 경로명 삭제와 파일 객체 삭제는 같은 사건이 아니다.

### 아이노드와 파일 content도 분리된다

아이노드는 메타데이터와 data 위치 정보를 담고, 실제 파일 바이트는 별도의 data block에 저장된다. 큰 파일의 block을 어떻게 가리키는지는 direct/indirect pointer, extent 등 파일 시스템마다 다를 수 있다.

아이노드의 핵심은 **이름을 디렉터리 네임스페이스에 두고, persistent 파일 객체의 메타데이터와 data 위치 정보를 별도 구조로 관리한다는 점**이다. 이 분리가 hard link, rename, unlink와 open-파일 수명을 설명하는 기반이 된다.