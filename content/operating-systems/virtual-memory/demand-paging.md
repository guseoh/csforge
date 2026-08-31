---
kind: concept
contentKey: operating-systems.core.virtual-memory.demand-paging
topicContentKey: operating-systems.core.virtual-memory
slug: demand-paging
title: "Demand Paging"
summary: "실제 접근 시점까지 page load를 미루는 이점과 fault 비용을 분석한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Demand Paging

demand paging은 process가 실제 page를 접근할 때까지 physical frame 할당이나 file load를 미룬다. 실행하지 않는 code/data를 미리 올리지 않아 memory를 절약하고 process 시작을 빠르게 할 수 있다.

첫 접근 fault, page-in latency, working set이 memory보다 클 때의 eviction 비용이 trade-off다. mapping 성공이 곧 모든 데이터가 resident라는 뜻은 아니므로 cold path를 별도로 측정한다.

### Backend 연결

대규모 Elasticsearch나 import 파일을 직접 mmap할 때 cold-start fault가 request latency에 섞일 수 있다. warm-up, prefetch, bounded concurrency로 동시에 발생하는 fault를 제한한다.
