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
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# Open File State

`file descriptor = file`이라고 단순화하면 duplicate descriptor와 concurrent offset 동작을 설명하기 어렵다. Linux를 예로 들면 process의 descriptor table entry는 **open file description**을 가리키고, 그 description이 current offset과 file status flags, underlying file object에 대한 reference를 가진다.

개념적으로 다음처럼 나눠 볼 수 있다.

`process fd entry → open-file description(offset/status) → filesystem file/inode`

### open을 두 번 한 경우와 dup한 경우

같은 pathname `/tmp/a`를 두 번 `open()`하면 두 fd가 같은 underlying file을 가리킬 수 있지만 일반적으로 별도의 open-file description이 만들어지므로 file offset은 독립적으로 움직일 수 있다.

반대로 `fd2 = dup(fd1)`이라면 두 descriptor는 같은 open-file description을 공유한다. `fd1`에서 100 byte를 읽어 offset이 100만큼 이동한 뒤 `fd2`에서 읽으면 shared offset의 영향을 받을 수 있다. `fork()`로 descriptor table이 상속되는 경우에도 parent와 child가 같은 open-file description을 참조하는 관계가 생길 수 있다.

### 왜 이 구분이 concurrency에서 중요한가

두 worker가 같은 fd/open description을 공유하면서 seek와 read를 조합하면 서로 offset을 변경해 예상하지 못한 위치를 읽을 수 있다. 반대로 각 worker가 파일을 독립적으로 open하면 offset은 분리되지만 kernel/file-system 차원의 content 자체는 공유되므로 concurrent write correctness 문제는 여전히 남는다.

`O_APPEND` 같은 status flag의 의미도 단순한 application boolean이 아니라 open-file state와 filesystem의 write semantics에 연결된다. 어떤 상태가 descriptor entry에 있고 어떤 상태가 open description이나 file object에 있는지는 실제 OS API 계약을 확인해야 한다.

Backend file processor에서 병렬 range read가 필요하다면 shared mutable offset에 기대기보다 명시적인 positional I/O나 독립 handle을 선택하는 편이 reasoning하기 쉽다. resource pooling을 한다면 이전 사용자의 offset/status가 다음 작업에 그대로 남지 않는지도 확인한다.
