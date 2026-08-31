---
kind: concept
contentKey: operating-systems.core.filesystem.allocation
topicContentKey: operating-systems.core.filesystem
slug: allocation
title: "Block Allocation"
summary: "연속·연결·indexed allocation의 fragmentation과 lookup 비용을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# Block Allocation

연속 allocation은 sequential access와 direct 위치 계산이 빠르지만 파일 확장과 외부 fragmentation에 취약하다. 연결 allocation은 빈 block을 유연하게 사용하지만 pointer를 따라가야 하고 random access가 느릴 수 있다.

indexed allocation은 index block을 통해 큰 파일의 block 목록을 찾지만 metadata 접근과 multi-level index 비용을 만든다. 실제 filesystem은 여러 방식을 조합해 파일 크기와 access pattern을 맞춘다.

### Backend 연결

검색 index나 content archive의 파일 배치에서 random read와 append를 따로 측정한다. 하나의 storage layout이 모든 query pattern을 최적화한다고 가정하지 않는다.

