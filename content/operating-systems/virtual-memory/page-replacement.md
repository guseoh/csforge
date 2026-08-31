---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-replacement
topicContentKey: operating-systems.core.virtual-memory
slug: page-replacement
title: "Page Replacement"
summary: "free frame이 없을 때 victim page를 고르는 policy를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Page Replacement

free frame이 없으면 kernel은 어떤 resident page를 내보낼지 선택해야 한다. 최근 참조를 이용하는 LRU 근사, FIFO, working-set 기반 policy는 fault 수와 구현 비용, scan overhead가 서로 다르다.

dirty page는 내보내기 전에 write-back이 필요하고 clean file-backed page는 다시 읽을 수 있어 victim 비용이 다르다. 단순히 오래된 page 하나를 고르는 정책은 write 비용과 locality를 놓칠 수 있다.

### Backend 연결

application cache eviction과 OS page replacement는 다른 계층이다. JVM cache를 무제한으로 늘려 OS가 file page를 밀어내게 만들지 말고 heap·filesystem cache budget을 함께 측정한다.
