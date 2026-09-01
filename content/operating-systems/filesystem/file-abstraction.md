---
kind: concept
contentKey: operating-systems.core.filesystem.file-abstraction
topicContentKey: operating-systems.core.filesystem
slug: file-abstraction
title: "File Abstraction"
summary: "persistent byte sequence와 metadata를 file로 추상화하고 pathname·open state와 구분하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# File Abstraction

file system에서 file은 persistent storage 위의 data를 application이 다룰 수 있게 만든 핵심 abstraction이다. 일반적인 regular file은 **이름 자체가 아니라 byte sequence와 metadata를 가진 object**로 생각하는 편이 정확하다. pathname은 그 object를 찾기 위한 namespace 경로이고, inode 같은 내부 identifier와도 역할이 다르다.

### 이름과 file object는 같은 것이 아니다

`/data/a.txt`라는 pathname으로 file을 찾았다고 하자. directory traversal은 각 path component를 따라가 최종 file object를 식별한다. 그 뒤 file이 열리면 application은 pathname을 매 read마다 다시 해석하는 대신 file descriptor를 사용한다. file을 rename해 pathname이 달라져도 이미 열려 있는 descriptor가 같은 open file object를 계속 참조할 수 있는 이유가 이 구분에 있다.

hard link가 가능한 filesystem에서는 서로 다른 pathname이 같은 inode/file object를 가리킬 수도 있다. 따라서 `filename = file identity`라고 단정하면 rename, unlink, hard link와 열린 descriptor의 동작을 설명할 수 없다.

### content와 metadata도 구분한다

file의 byte content 외에도 size, ownership, permission, timestamp 같은 metadata가 존재한다. metadata 변경과 content write는 서로 다른 persistent update일 수 있으며 crash consistency에서는 이 둘의 기록 순서도 문제가 된다.

또한 `write()`가 application buffer의 bytes를 kernel에 전달하는 데 성공했다고 해서 그 bytes가 즉시 durable storage에 안전하게 기록되었다는 뜻은 아니다. page cache와 buffering을 거칠 수 있고, durability가 필요한 지점은 `fsync()`와 filesystem/storage 계약을 별도로 이해해야 한다.

### “모든 것은 file이다”의 경계

Unix 계열에서 socket, pipe, device도 file descriptor라는 integer handle을 통해 `read`/`write` 같은 공통 I/O interface를 사용할 수 있다. 하지만 이것이 socket이나 pipe가 regular filesystem file과 동일한 persistence, seek, metadata semantics를 가진다는 뜻은 아니다. **공통 descriptor interface와 대상 object의 실제 semantics를 구분**해야 한다.

Backend의 업로드·export 기능에서도 pathname, file content, metadata, open stream state, durability를 하나의 상태로 합치지 않는다. 임시 파일 생성 성공과 최종 rename/fsync 완료를 별도 단계로 모델링하면 crash 이후 어떤 결과가 보장되는지 더 명확해진다.
