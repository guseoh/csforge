---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-replacement
topicContentKey: operating-systems.core.virtual-memory
slug: page-replacement
title: "페이지 교체(Page Replacement)"
summary: "free 프레임이 부족할 때 어떤 상주 page를 희생 작업으로 고를지 지역성와 eviction cost를 기준으로 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical 메모리: Policies"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 페이지 교체(Page Replacement)

새 page를 상주하게 만들어야 하는데 free 프레임이 부족하면 운영체제는 기존 상주 page 중 하나를 **희생 작업**으로 골라 프레임을 재사용해야 한다. 이 결정을 page replacement라고 한다.

![Free 프레임이 없을 때 상주 page 중 희생 작업을 골라 내보내고 새 page를 프레임에 배치하는 흐름](/learning/operating-systems/page-replacement.svg)

```text
새 page 필요
    ↓
free frame 없음
    ↓
victim 선택
    ↓
필요하면 victim 내용 저장
    ↓
frame 재사용 → 새 page 적재
```

### 좋은 희생 작업은 앞으로 덜 필요할 page다

미래의 메모리 참조를 정확히 안다면 가장 늦게 다시 사용할 page를 내보내는 것이 유리하다. 하지만 실제 OS는 미래를 알 수 없으므로 과거 참조를 이용해 지역성를 근사한다.

FIFO는 들어온 순서를 이용하고, LRU 계열은 최근 사용 정보를 이용하며, CLOCK 같은 정책은 참조 bit를 활용해 최근 사용 여부를 근사한다. 실제 구현에서는 정확한 LRU 순서를 유지하는 비용도 고려해야 한다.

### Eviction 비용도 page마다 다를 수 있다

변경되지 않은 clean page는 backing source가 있다면 필요할 때 다시 읽어올 수 있다. 반대로 수정된 dirty page는 재사용 전에 내용을 backing store로 반영해야 할 수 있어 eviction 비용이 더 커질 수 있다.

### Replacement 정책에도 한계가 있다

현재 워크로드가 실제로 반복 사용하는 working set이 available frames보다 훨씬 크다면 어떤 replacement 정책도 fault를 크게 줄이기 어렵다. Active page를 내보내고 곧 다시 가져오는 일이 반복되기 때문이다.

Page Replacement의 핵심은 **free 프레임이 부족할 때 재사용 가능성이 낮고 eviction 비용이 합리적인 page를 선택해 fault 비용을 줄이는 OS 정책**이며, 작업 집합(working set) 자체가 메모리 용량를 넘으면 정책 선택만으로 해결할 수 없다는 점이다.