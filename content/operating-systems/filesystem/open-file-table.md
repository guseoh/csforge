---
kind: concept
contentKey: operating-systems.core.filesystem.open-file-table
topicContentKey: operating-systems.core.filesystem
slug: open-file-table
title: "Open File Table"
summary: "descriptor·open-file entry·inode 사이의 offset 공유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# Open File Table

일반적인 filesystem 모델에서 process descriptor table의 각 slot은 open-file entry를 가리키고, entry는 inode나 file object와 현재 offset·flags를 연결한다. 같은 entry를 공유하면 descriptor 숫자가 달라도 offset이나 status 변경이 공유될 수 있다.

이 구분은 `open`을 두 번 한 경우와 `dup`한 경우의 동작 차이를 설명한다. pathname metadata와 open stream state를 하나로 생각하면 concurrent read/write와 append 동작을 잘못 예측한다.

### Backend 연결

파일 처리 worker가 stream을 공유할지 독립적으로 열지 결정할 때 offset ownership을 명시한다. pooled resource를 반환할 때 buffered state와 file position을 초기화한다.

