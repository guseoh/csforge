---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-replacement
topicContentKey: operating-systems.core.virtual-memory
slug: page-replacement
title: "페이지 교체(Page Replacement)"
summary: "여유 프레임이 부족할 때 어떤 상주 페이지를 내보낼지 지역성과 내보내기 비용을 기준으로 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical Memory: Policies"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 페이지 교체(Page Replacement)

새 페이지를 메모리에 상주시켜야 하는데 여유 프레임이 부족하면 운영체제는 기존 상주 페이지 가운데 하나를 **교체 대상(victim)**으로 골라 프레임을 재사용해야 한다. 이 결정을 페이지 교체라고 한다.

![여유 프레임이 없을 때 상주 페이지 중 교체 대상을 골라 내보내고 새 페이지를 프레임에 배치하는 흐름](/learning/operating-systems/page-replacement.svg)

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

### 좋은 교체 대상은 앞으로 덜 필요할 페이지다

미래의 메모리 접근을 정확히 안다면 가장 늦게 다시 사용할 페이지를 내보내는 것이 유리하다. 하지만 실제 운영체제는 미래를 알 수 없으므로 과거 접근 기록을 이용해 지역성(locality)을 근사한다.

FIFO는 들어온 순서를 이용하고, LRU 계열은 최근 사용 정보를 이용하며, CLOCK 같은 정책은 참조 비트를 활용해 최근 사용 여부를 근사한다. 실제 구현에서는 정확한 LRU 순서를 유지하는 비용도 함께 고려해야 한다.

### 내보내기 비용도 페이지마다 다를 수 있다

변경되지 않은 깨끗한 페이지(clean page)는 원본 파일 같은 뒷받침 저장소가 있다면 필요할 때 다시 읽어올 수 있다. 반대로 수정된 더티 페이지(dirty page)는 프레임을 재사용하기 전에 변경 내용을 적절한 저장소에 반영해야 할 수 있어 비용이 더 커질 수 있다.

### 교체 정책에도 한계가 있다

현재 작업 부하가 실제로 반복 사용하는 작업 집합이 사용할 수 있는 프레임보다 훨씬 크다면 어떤 교체 정책도 페이지 폴트를 크게 줄이기 어렵다. 아직 필요한 페이지를 내보내고 곧 다시 가져오는 일이 반복되기 때문이다.

페이지 교체의 핵심은 **여유 프레임이 부족할 때 재사용 가능성이 낮고 내보내기 비용이 합리적인 페이지를 선택해 페이지 폴트 비용을 줄이는 운영체제 정책**이며, 작업 집합 자체가 메모리 용량을 넘으면 정책 선택만으로 해결할 수 없다는 점이다.