---
kind: concept
contentKey: operating-systems.core.virtual-memory.demand-paging
topicContentKey: operating-systems.core.virtual-memory
slug: demand-paging
title: "요구 페이징(Demand Paging)"
summary: "실제 접근할 때까지 페이지의 물리 메모리 준비를 미루는 이유와 첫 접근 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf"
    title: "Beyond Physical Memory: Mechanisms"
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

요구 페이징은 프로세스의 모든 페이지를 시작할 때부터 물리 메모리에 준비하지 않고, **실제로 접근한 페이지를 필요한 시점에 상주시켜 사용하는 정책**이다. 사용하지 않는 코드나 데이터에 미리 프레임과 I/O 비용을 쓰지 않으므로 물리 메모리 사용량과 초기 준비 비용을 줄일 수 있다.

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

필요한 페이지를 나중에 준비하므로 첫 접근에서 페이지 폴트 비용을 지불한다. 익명 페이지라면 새 프레임을 준비하면 될 수 있고, 파일 기반 페이지가 메모리에 없다면 저장 장치에서 내용을 읽어와야 할 수도 있다.

그래서 큰 작업 집합(working set)을 처음 한 번 순회하면 차가운 상태에서 페이지 폴트가 몰릴 수 있고, 이후 필요한 페이지가 메모리에 상주한 상태에서는 훨씬 빠르게 보일 수 있다.

### 물리 메모리가 부족하면 페이지 교체와 연결된다

여유 프레임이 충분할 때는 새 페이지를 준비하면 되지만 메모리 압박이 커지면 기존 상주 페이지 가운데 하나를 내보내 프레임을 확보해야 할 수 있다.

```text
demand access
→ page fault
→ free frame 확인
→ 필요하면 replacement
→ page 준비
→ mapping 갱신
```

요구 페이징의 핵심은 **필요하지 않은 페이지의 물리 메모리 비용을 미루는 대신, 실제 첫 접근에서 페이지 폴트와 페이지 준비 비용을 지불하는 정책**이라는 점이다.