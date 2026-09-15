---
kind: concept
contentKey: operating-systems.core.filesystem.open-file-table
topicContentKey: operating-systems.core.filesystem
slug: open-file-table
title: "Open File State"
summary: "descriptor entry와 kernel open-file description, underlying file object를 분리해 offset·flags 공유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/dup.2.html"
    title: "dup(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "duplicated descriptor가 같은 open file description과 offset/status flags를 공유하는 Linux 동작을 확인한다."
    displayOrder: 2
---
# Open File State

File descriptor와 file object 사이에는 **현재 열린 I/O session의 상태**가 있을 수 있다. Linux를 예로 들면 descriptor entry가 open file description을 가리키고, 그 description이 current file offset과 일부 status flag, underlying file object에 대한 reference를 가진다.

![descriptor entry와 shared open-file description, underlying file object 관계](/learning/operating-systems/file-descriptor-open-state.svg)

```text
fd entry → open-file state(offset, flags) → filesystem object
```

### 같은 file을 열어도 open state는 다를 수 있다

같은 pathname을 두 번 `open()`하면 두 descriptor가 같은 underlying file을 가리키더라도 일반적으로 서로 다른 open-file state를 가지므로 offset을 독립적으로 이동할 수 있다.

반대로 `dup()`으로 descriptor를 복제하면 두 fd가 같은 open-file state를 참조한다. 한 fd에서 read해 offset이 이동하면 다른 fd의 다음 read도 그 shared offset의 영향을 받는다. `fork()`로 inherited descriptor가 생기는 경우에도 같은 open-file description을 공유할 수 있다.

### File content와 open-session state를 분리한다

두 descriptor가 독립적인 offset을 가진다고 file content까지 분리되는 것은 아니다. 같은 underlying file을 수정하면 content는 같은 filesystem object에 반영된다.

Open File State의 핵심은 **process의 fd entry, 열린 session의 offset/status, persistent file object가 서로 다른 층이며 `open()`과 `dup()`에 따라 어떤 상태가 공유되는지가 달라진다는 점**이다.