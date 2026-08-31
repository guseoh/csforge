---
kind: concept
contentKey: operating-systems.core.filesystem.file-descriptor
topicContentKey: operating-systems.core.filesystem
slug: file-descriptor
title: "File Descriptor"
summary: "process의 작은 정수 handle이 open file state를 가리키는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# File Descriptor

file descriptor는 process의 descriptor table에서 open file description을 가리키는 작은 정수 handle이다. descriptor에는 access mode와 reference가 있고, open-file entry에는 현재 offset과 status flags 같은 공유 state가 있을 수 있다.

descriptor를 fork나 duplicate하면 같은 open-file state를 공유할 수 있어 한 쪽의 read/write offset 변화가 다른 쪽에 영향을 줄 수 있다. 사용이 끝난 descriptor를 close하지 않으면 limit 고갈과 EOF 지연이 발생한다.

### Backend 연결

server의 socket, log, pipe, database native handle은 모두 process 자원 예산에 들어간다. connection leak을 heap leak과 별도로 추적하고 graceful shutdown에서 close 순서를 검증한다.

