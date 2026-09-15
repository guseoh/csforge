---
kind: concept
contentKey: operating-systems.core.filesystem.file-descriptor
topicContentKey: operating-systems.core.filesystem
slug: file-descriptor
title: "File Descriptor"
summary: "process-local integer handle이 kernel의 open object를 가리키고 lifetime·limit·inheritance를 만드는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 file descriptor가 process-local handle이며 open file description을 참조하는 구조를 확인한다."
    displayOrder: 2
---
# File Descriptor

Unix 계열에서 file descriptor(fd)는 process가 이미 열린 I/O object를 참조할 때 사용하는 **작은 정수 handle**이다. `open()`이 성공하면 kernel은 open state를 만들고 process의 descriptor table에 entry를 추가한 뒤 fd를 반환한다.

![process-local descriptor가 kernel open state를 가리키는 구조](/learning/operating-systems/file-descriptor-open-state.svg)

```text
process fd table
fd 0 → ...
fd 1 → ...
fd 3 → kernel open state → file/socket/pipe ...
```

### fd 숫자 자체는 object identity가 아니다

Fd `3`은 특정 file을 영구적으로 뜻하지 않는다. 해당 fd를 close한 뒤 다른 object를 열면 같은 숫자가 재사용될 수 있다. 다른 process의 fd 3도 전혀 다른 object를 가리킬 수 있다.

따라서 file descriptor는 **process-local table의 index**로 이해하는 편이 정확하다.

### Descriptor는 resource lifetime과 연결된다

Open file, socket, pipe 같은 kernel object는 descriptor를 통해 참조된다. 필요 없는 fd를 닫지 않으면 process의 descriptor limit을 소비하고 underlying resource의 lifetime도 예상보다 길어질 수 있다.

`dup()`이나 `fork()`로 descriptor가 복제되면 서로 다른 fd entry가 같은 open-file state를 참조할 수도 있다. 이때 어떤 상태가 공유되는지는 다음 Concept에서 다룬다.

File Descriptor의 핵심은 **pathname과 달리 이미 열린 kernel object를 가리키는 process-local handle이며, 숫자 자체보다 참조 관계와 lifetime이 중요하다는 점**이다.