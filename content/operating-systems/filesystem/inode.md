---
kind: concept
contentKey: operating-systems.core.filesystem.inode
topicContentKey: operating-systems.core.filesystem
slug: inode
title: "아이노드(Inode)"
summary: "경로명과 분리된 파일 객체의 메타데이터가 데이터 블록과 링크·생명주기를 연결하는 방식을 설명한다."
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
# 아이노드(Inode)

아이노드는 Unix 계열 파일 시스템에서 **파일 이름과 분리된 파일 객체의 메타데이터**를 이해하기 위한 대표 구조다. 디렉터리 항목이 `이름 → inode 번호` 관계를 저장하고, 아이노드는 파일 종류, 소유자, 접근 권한, 크기, 시각 정보와 데이터 위치를 찾는 정보를 가진다.

![디렉터리 항목, 아이노드 메타데이터, 데이터 블록의 관계](/learning/operating-systems/inode-file-layout.svg)

```text
directory entry
"a.txt" ──> inode 42 ──> metadata + data block mapping
```

### 여러 이름이 같은 아이노드를 가리킬 수 있다

하드 링크를 사용하면 `a.txt`와 `b.txt`가 같은 아이노드를 가리킬 수 있다. 한 이름을 `unlink()`해도 다른 링크가 남아 있으면 파일 객체는 계속 존재한다. 마지막 경로명 링크가 사라져도 열린 파일 디스크립터가 남아 있다면 객체의 생명주기가 즉시 끝나지 않을 수 있다.

따라서 경로명을 삭제하는 사건과 실제 파일 객체가 제거되는 사건은 같지 않다.

### 아이노드와 파일 내용도 분리된다

아이노드는 메타데이터와 데이터 위치 정보를 담고, 실제 파일 바이트는 별도의 데이터 블록에 저장된다. 큰 파일의 블록을 어떻게 가리키는지는 직접·간접 포인터나 extent 등 파일 시스템 구현마다 다를 수 있다.

아이노드의 핵심은 **이름을 디렉터리 이름 공간에 두고, 영속적인 파일 객체의 메타데이터와 데이터 위치 정보를 별도 구조로 관리한다는 점**이다. 이 분리가 하드 링크, `rename()`, `unlink()`와 열린 파일의 생명주기를 설명하는 기반이 된다.