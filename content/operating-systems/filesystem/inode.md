---
kind: concept
contentKey: operating-systems.core.filesystem.inode
topicContentKey: operating-systems.core.filesystem
slug: inode
title: "Inode"
summary: "name과 분리된 metadata·block pointer 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# Inode

inode는 파일 이름 자체와 분리되어 type, permission, owner, size, timestamps와 data block 위치 같은 metadata를 표현한다. directory entry가 name을 inode에 연결하므로 hard link와 rename semantics를 이해하는 기반이 된다.

inode metadata 변경과 content block write는 서로 다른 durability·ordering 문제를 가질 수 있다. 파일이 삭제되어도 open descriptor가 남아 있으면 inode와 block이 즉시 회수되지 않을 수 있다.

### Backend 연결

임시 파일을 원자적으로 교체할 때 pathname과 open handle의 lifetime을 구분한다. upload 완료 상태를 파일 존재만으로 판단하지 말고 database metadata와 checksum으로 검증한다.

