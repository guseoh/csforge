---
kind: concept
contentKey: operating-systems.core.filesystem.write-flush-fsync
topicContentKey: operating-systems.core.filesystem
slug: write-flush-fsync
title: "write, flush and fsync"
summary: "write() 성공과 stable storage durability가 다른 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# write, flush and fsync

`write()`는 호출자가 제공한 bytes를 다음 계층에 전달했다는 결과일 뿐, process buffer·kernel page cache·storage controller까지의 모든 durability를 보장하지 않을 수 있다. `flush`는 library buffer를 비우는 동작이고 `fsync`는 file의 dirty 상태를 storage에 반영하도록 요청하는 더 강한 경계다.

directory entry 교체나 rename을 내구성 있게 만들려면 file data와 directory metadata의 flush 순서도 고려한다. crash consistency 요구가 없는데 모든 write마다 fsync하면 성능 비용이 커질 수 있으므로 업무 invariant에 맞춘다.

### Backend 연결

canonical import 파일을 성공으로 표시할 시점은 bytes 생성, fsync, DB commit 중 무엇인지 명시한다. 데이터베이스가 source of truth라면 파일은 재생성 가능한 artifact로 두고 두 저장소의 원자성을 과장하지 않는다.

