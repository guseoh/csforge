---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-replacement
topicContentKey: operating-systems.core.virtual-memory
slug: page-replacement
title: "Page Replacement"
summary: "free frame이 부족할 때 어떤 resident page를 victim으로 고를지 locality와 eviction cost를 기준으로 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical Memory: Policies"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# Page Replacement

새 page를 resident로 만들어야 하는데 사용할 free frame이 부족하면 OS는 기존 resident page 중 하나를 victim으로 골라 frame을 재사용해야 한다. 이 결정을 page replacement라고 한다. 핵심 목표는 단순히 `가장 오래된 page를 지운다`가 아니라 **앞으로 다시 필요할 가능성이 낮고 내보내는 비용도 합리적인 page를 선택해 fault 비용을 줄이는 것**이다.

### 왜 미래를 정확히 알 수 없는가

이상적인 OPT 정책은 앞으로 가장 늦게 다시 사용할 page를 내보내면 되지만 실제 OS는 미래 access를 알 수 없다. 그래서 FIFO는 들어온 순서, LRU 계열은 최근 참조 정보, CLOCK 같은 정책은 reference bit를 이용해 locality를 근사한다. LRU도 정확한 최근 사용 순서를 모두 추적하려면 overhead가 크기 때문에 실제 구현에서는 approximation이 중요해진다.

예를 들어 3개의 frame에서 reference string이 `1, 2, 3, 1, 4`라면 마지막 `4`를 넣을 때 victim을 골라야 한다. 최근 `1`이 다시 사용되었다는 정보를 활용하는 정책은 `1`을 남길 가능성이 높지만 FIFO는 최초 진입 순서만 보고 `1`을 내보낼 수도 있다. 이런 차이가 이후 fault 횟수로 이어진다.

### victim의 종류도 비용을 바꾼다

clean file-backed page는 필요하면 원본 file에서 다시 읽을 수 있어 mapping을 제거하는 비용이 상대적으로 작을 수 있다. 반대로 dirty anonymous/page-cache page는 backing store에 write-back이 필요할 수 있다. 따라서 replacement는 reuse 가능성뿐 아니라 dirty state와 write cost, page type을 함께 고려한다.

### Working set을 보존하지 못하면 정책 전체가 무너진다

좋은 replacement policy라도 workload의 active working set이 available frames보다 훨씬 크면 fault를 근본적으로 줄일 수 없다. page 하나를 가져오면서 곧 다시 쓸 page를 내보내고, 다시 그 page를 가져오기 위해 다른 page를 내보내는 상황이 반복된다. 이때는 policy 미세 조정보다 memory budget이나 multiprogramming level 자체를 조정해야 한다.

### Backend 연결

OS page replacement와 application cache eviction은 서로 다른 계층이지만 physical memory를 두고 경쟁한다. JVM heap이나 in-memory cache를 크게 잡아 file-backed working set을 계속 밀어내면 application cache hit는 좋아져도 major fault와 I/O latency가 증가할 수 있다. heap·RSS·page cache·fault를 하나의 memory budget으로 관찰한다.
