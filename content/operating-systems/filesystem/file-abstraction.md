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
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# File Abstraction

Filesystem에서 regular file은 application이 persistent data를 **연속된 byte sequence와 metadata를 가진 object**로 다룰 수 있게 하는 abstraction이다. File의 이름(pathname), process가 연 뒤 사용하는 descriptor, kernel의 open state는 이 file object와 서로 다른 역할을 가진다.

```text
pathname ── lookup ──> file object
                         │
                       open
                         │
                         ▼
                process file descriptor
```

### 이름과 file identity를 구분한다

Pathname은 filesystem namespace에서 object를 찾기 위한 이름이다. 같은 file object에 여러 hard link가 연결될 수도 있고, rename으로 이름이 바뀌어도 이미 열린 descriptor는 기존 object를 계속 참조할 수 있다.

따라서 `filename = file identity`라고 보면 rename, unlink, hard link와 open descriptor의 lifetime을 설명하기 어렵다.

### Content와 metadata도 서로 다른 상태다

File에는 byte content 외에도 size, ownership, permission, timestamp 같은 metadata가 있다. Content 변경과 metadata 변경은 filesystem 내부에서 서로 다른 persistent update를 요구할 수 있다.

Unix 계열에서는 socket이나 pipe도 file descriptor를 통해 `read`/`write` 같은 공통 interface를 사용할 수 있다. 하지만 이것이 socket과 pipe가 regular file과 같은 persistence나 seek semantics를 가진다는 뜻은 아니다.

File Abstraction의 핵심은 **application에 공통 byte-oriented I/O object를 제공하면서, pathname·open handle·metadata·실제 persistent data를 서로 다른 층으로 구분하는 것**이다.