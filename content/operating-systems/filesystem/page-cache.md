---
kind: concept
contentKey: operating-systems.core.filesystem.page-cache
topicContentKey: operating-systems.core.filesystem
slug: page-cache
title: "Page Cache"
summary: "file data를 memory page로 cache해 read/write를 가속하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# Page Cache

page cache는 filesystem file content를 memory page로 보관해 반복 read를 storage 접근 없이 처리한다. write는 dirty page로 먼저 기록되고 나중에 write-back될 수 있어 write syscall 완료와 stable storage 완료가 다르다.

cache가 memory를 압박하면 다른 page가 eviction되고, random scan은 유용한 working set을 밀어낼 수 있다. direct I/O는 일부 cache 경로를 우회하지만 alignment와 application buffering 책임을 늘린다.

### Backend 연결

Elasticsearch와 PostgreSQL buffer pool, JVM cache가 OS page cache와 경쟁할 수 있다. cache hit만 보고 memory를 늘리지 말고 eviction과 major fault를 함께 관찰한다.

