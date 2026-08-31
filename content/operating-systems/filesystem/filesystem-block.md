---
kind: concept
contentKey: operating-systems.core.filesystem.filesystem-block
topicContentKey: operating-systems.core.filesystem
slug: filesystem-block
title: "File-System Block"
summary: "logical file content가 block 단위로 storage에 배치되는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# File-System Block

filesystem은 logical file content를 고정 크기 block과 metadata 구조로 배치한다. block 단위 allocation은 device I/O와 free-space 관리를 단순하게 하지만 작은 파일의 내부 낭비와 큰 파일의 여러 lookup을 만든다.

연속 block 접근은 seek와 cache locality에 유리하고, 흩어진 block은 fragmentation으로 읽기 비용이 커질 수 있다. logical offset을 physical 위치와 동일시하지 않으며 filesystem과 storage layer가 각각 cache와 readahead를 가진다.

### Backend 연결

대량 export 파일을 한 번에 쓰더라도 filesystem block과 disk flush 비용이 따로 존재한다. batch write 크기와 fsync 빈도를 durability 요구에 맞춰 선택한다.

