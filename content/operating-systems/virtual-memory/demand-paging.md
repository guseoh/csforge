---
kind: concept
contentKey: operating-systems.core.virtual-memory.demand-paging
topicContentKey: operating-systems.core.virtual-memory
slug: demand-paging
title: "요구 페이징(Demand Paging)"
summary: "실제 접근할 때까지 page의 상주 준비를 미루는 이유와 첫 접근 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf"
    title: "Beyond Physical 메모리: Mechanisms"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "page fault에서 OS가 translation 상태를 해석하고 page-in 또는 실패를 결정하는 흐름을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux mmap의 lazy population과 MAP_POPULATE 같은 explicit prefault 선택지를 구분한다."
    displayOrder: 2
---
# 요구 페이징(Demand Paging)

Demand paging은 프로세스의 모든 page를 시작할 때부터 physical 메모리에 준비하지 않고, **실제로 접근한 page를 필요 시점에 상주하게 만드는 정책**이다. 사용하지 않는 코드나 data에 미리 프레임과 I/O를 쓰지 않으므로 physical-메모리 사용과 초기 준비 비용을 줄일 수 있다.

```text
virtual mapping 생성
      ↓
아직 접근하지 않은 page
      ↓ first access
page fault
      ↓
frame/content 준비
      ↓
resident mapping으로 실행 계속
```

### 비용을 없애는 것이 아니라 뒤로 미룬다

필요한 page를 나중에 준비하므로 처음 접근할 때 페이지 폴트 비용을 지불한다. Anonymous page라면 프레임을 새로 준비할 수 있고, 파일 기반 page가 메모리에 없다면 저장소에서 읽어와야 할 수도 있다.

그래서 큰 working set을 처음 한 번에 순회하면 cold 상태에서 fault가 몰리고, 이후 상주 상태에서는 훨씬 빠르게 보일 수 있다.

### Physical 메모리가 부족하면 replacement와 연결된다

Free 프레임이 충분할 때는 새 page를 준비하면 되지만 메모리 pressure가 커지면 다른 상주 page를 희생 작업으로 골라 프레임을 확보해야 한다.

```text
demand access
→ page fault
→ free frame 확인
→ 필요하면 replacement
→ page 준비
→ mapping 갱신
```

Demand Paging의 핵심은 **필요하지 않은 page의 physical-메모리 비용을 미루는 대신, 실제 첫 접근에서 fault와 page 준비 비용을 지불하는 정책**이라는 점이다.