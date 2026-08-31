---
kind: concept
contentKey: operating-systems.core.virtual-memory.locality-working-set
topicContentKey: operating-systems.core.virtual-memory
slug: locality-working-set
title: "Locality and Working Set"
summary: "최근 참조 집합이 필요한 frame 수와 page fault에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Locality and Working Set

temporal locality는 최근 접근한 데이터가 다시 사용될 가능성이고 spatial locality는 가까운 주소가 함께 접근될 가능성이다. working set은 일정 window 동안 실제로 필요한 page 집합으로, 충분한 frame이 이 집합을 담으면 fault가 안정된다.

working set보다 frame이 작으면 page를 넣자마자 다른 page를 내보내는 thrashing이 생길 수 있다. access pattern과 window를 측정하지 않고 cache size만 늘리는 것은 memory pressure를 다른 계층으로 미룬다.

### Backend 연결

repository query와 batch 처리의 데이터 locality가 DB buffer pool과 OS page cache에 영향을 준다. 무작위 대량 scan은 interactive query의 cache locality를 훼손할 수 있어 시간대와 batch size를 조정한다.
