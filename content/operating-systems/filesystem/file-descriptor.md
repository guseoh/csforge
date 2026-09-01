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
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# File Descriptor

Unix 계열에서 file descriptor(fd)는 process가 열린 I/O object를 참조할 때 사용하는 작은 정수다. `open()`이 성공하면 kernel은 open state를 만들고 process의 descriptor table에서 사용 가능한 slot을 골라 fd를 반환한다. application은 이후 `read(fd, ...)`, `write(fd, ...)`, `close(fd)`처럼 이 handle을 사용한다.

### fd 숫자는 object identity가 아니다

fd `3`이라는 값 자체가 특정 file을 영구적으로 뜻하지 않는다. process가 fd 3을 close한 뒤 다른 object를 열면 같은 숫자 3이 재사용될 수 있다. 또한 다른 process의 fd 3은 전혀 다른 object를 가리킬 수 있다. 따라서 로그에서 `fd=7`만 기록하고 process/lifecycle 정보를 잃으면 무엇을 가리켰는지 복원하기 어렵다.

### descriptor와 open-file state는 한 단계가 아니다

process의 descriptor entry는 kernel의 open-file description을 가리킨다. `dup()`이나 `fork()`로 descriptor가 복제되면 서로 다른 fd entry가 **같은 open-file description**을 참조할 수 있다. 이 경우 current file offset이나 일부 file status flag처럼 open description에 속한 상태를 공유할 수 있다. 반대로 pathname을 각각 `open()`한 두 descriptor는 같은 underlying inode를 가리키더라도 서로 독립된 open-file description과 offset을 가질 수 있다.

### close는 resource lifetime의 일부다

fd에는 process별 limit이 있고 socket, pipe, regular file 등 여러 kernel object가 descriptor를 사용한다. close 누수가 누적되면 새 connection이나 file open이 실패한다. pipe의 write end가 의도치 않게 복제된 fd에서 계속 열려 있으면 reader가 EOF를 받지 못하는 식으로 **lifetime 자체가 protocol semantics**에 영향을 줄 수도 있다.

Backend에서는 heap object reference를 놓는 것과 fd를 close하는 것을 같은 자원 회수로 생각하지 않는다. Java stream/socket wrapper가 최종적으로 어떤 native descriptor를 소유하는지, exception과 timeout 경로에서도 close가 보장되는지, subprocess에 descriptor가 의도치 않게 상속되는지를 별도로 확인한다.
