---
kind: concept
contentKey: operating-systems.core.filesystem.file-descriptor
topicContentKey: operating-systems.core.filesystem
slug: file-descriptor
title: "파일 디스크립터(File Descriptor)"
summary: "프로세스 내부의 정수 핸들이 커널의 열린 객체를 가리키고 생명주기·한도·상속을 만드는 구조를 설명한다."
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
# 파일 디스크립터(File Descriptor)

Unix 계열에서 파일 디스크립터(file descriptor, fd)는 프로세스가 이미 열린 I/O 객체를 참조할 때 사용하는 **작은 정수 핸들**이다. `open()`이 성공하면 커널은 열린 상태를 만들고 프로세스의 파일 디스크립터 테이블에 항목을 추가한 뒤 fd를 반환한다.

![프로세스별 파일 디스크립터가 커널의 열린 상태를 가리키는 구조](/learning/operating-systems/file-descriptor-open-state.svg)

```text
process fd table
fd 0 → ...
fd 1 → ...
fd 3 → kernel open state → file/socket/pipe ...
```

### fd 숫자 자체는 객체의 정체성이 아니다

fd `3`이 특정 파일을 영구적으로 뜻하는 것은 아니다. 해당 fd를 닫은 뒤 다른 객체를 열면 같은 숫자가 재사용될 수 있다. 다른 프로세스의 fd 3도 전혀 다른 객체를 가리킬 수 있다.

따라서 파일 디스크립터는 **프로세스별 테이블의 인덱스**로 이해하는 편이 정확하다.

### 파일 디스크립터는 자원의 생명주기와 연결된다

열린 파일, 소켓, 파이프 같은 커널 객체는 파일 디스크립터를 통해 참조된다. 필요 없는 fd를 닫지 않으면 프로세스의 파일 디스크립터 한도를 계속 소비하고, 참조 중인 커널 자원의 생명주기도 예상보다 길어질 수 있다.

`dup()`이나 `fork()`로 파일 디스크립터가 복제되면 서로 다른 fd 항목이 같은 열린 파일 상태를 참조할 수도 있다. 이때 어떤 상태가 공유되는지는 다음 Concept에서 다룬다.

파일 디스크립터의 핵심은 **경로명과 달리 이미 열린 커널 객체를 가리키는 프로세스 내부 핸들이며, 숫자 자체보다 무엇을 참조하고 언제 닫히는지가 중요하다는 점**이다.