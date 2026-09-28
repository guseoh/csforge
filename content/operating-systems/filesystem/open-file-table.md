---
kind: concept
contentKey: operating-systems.core.filesystem.open-file-table
topicContentKey: operating-systems.core.filesystem
slug: open-file-table
title: "열린 파일 상태(Open File State)"
summary: "파일 디스크립터 항목과 커널의 열린 파일 상태, 실제 파일 객체를 분리해 오프셋·상태 플래그 공유를 설명한다."
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
# 열린 파일 상태(Open File State)

파일 디스크립터와 실제 파일 객체 사이에는 **현재 열린 I/O 세션의 상태**가 있다. Linux를 예로 들면 파일 디스크립터 항목이 열린 파일 기술(open file description)을 가리키고, 이 상태가 현재 파일 오프셋과 일부 상태 플래그, 실제 파일 객체에 대한 참조를 가진다.

![파일 디스크립터 항목과 공유되는 열린 파일 상태, 실제 파일 객체의 관계](/learning/operating-systems/file-descriptor-open-state.svg)

```text
fd entry → open-file state(offset, flags) → filesystem object
```

### 같은 파일을 열어도 열린 상태는 다를 수 있다

같은 경로명을 두 번 `open()`하면 두 파일 디스크립터가 같은 파일 객체를 가리키더라도 일반적으로 서로 다른 열린 파일 상태를 가지므로 파일 오프셋을 독립적으로 이동할 수 있다.

반대로 `dup()`으로 파일 디스크립터를 복제하면 두 fd가 같은 열린 파일 상태를 참조한다. 한 fd에서 `read()`해 오프셋이 이동하면 다른 fd의 다음 `read()`도 그 **공유 오프셋**의 영향을 받는다. `fork()`로 상속된 파일 디스크립터가 생기는 경우에도 같은 열린 파일 상태를 공유할 수 있다.

### 파일 내용과 열린 세션 상태를 분리한다

두 파일 디스크립터가 독립적인 오프셋을 가진다고 파일 내용까지 분리되는 것은 아니다. 서로 다른 `open()`으로 만든 열린 상태라도 같은 실제 파일 객체를 수정한다면 변경은 같은 파일 내용에 반영된다.

열린 파일 상태의 핵심은 **프로세스의 fd 항목, 열린 세션의 오프셋·상태 플래그, 영속적인 파일 객체가 서로 다른 층이며 `open()`과 `dup()`에 따라 어떤 상태가 공유되는지가 달라진다는 점**이다.