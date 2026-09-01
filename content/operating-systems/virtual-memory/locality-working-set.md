---
kind: concept
contentKey: operating-systems.core.virtual-memory.locality-working-set
topicContentKey: operating-systems.core.virtual-memory
slug: locality-working-set
title: "Locality and Working Set"
summary: "최근 실제로 반복 사용하는 page 집합이 resident frame 요구량과 fault rate를 결정하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf"
    title: "Beyond Physical Memory: Policies"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "replacement policy와 locality가 hit/miss 및 working-set 유지에 미치는 영향을 확인한다."
    displayOrder: 1
---
# Locality and Working Set

프로그램은 전체 address space를 매 순간 균등하게 접근하지 않는다. loop에서 같은 code와 data를 반복하거나 배열의 인접 원소를 연속으로 읽는 것처럼 일정 기간에는 작은 범위의 page를 집중적으로 사용하는 경향이 있다. temporal locality는 최근 사용한 위치를 다시 사용할 가능성이 높다는 성질이고, spatial locality는 가까운 주소를 곧 사용할 가능성이 높다는 성질이다.

### Working set은 현재 실행 단계에 필요한 page 집합이다

working set은 일정 시간 또는 최근 reference window에서 활발히 사용되는 page 집합으로 생각할 수 있다. 예를 들어 한 phase에서 page `1,2,3,2,1,3`만 반복한다면 이 시점의 active working set은 대략 `{1,2,3}`이다. 세 page를 유지할 frame이 충분하면 warm-up 이후 fault가 크게 줄 수 있다.

프로그램 phase가 바뀌면 working set도 바뀐다. parsing 단계에서 사용하는 buffer와 aggregation 단계에서 사용하는 table이 다르면 한 번의 고정된 working-set 숫자로 전체 실행을 설명할 수 없다. 그래서 locality를 이해하려면 access trace의 시간적 구간을 같이 봐야 한다.

### frame 수가 working set보다 작으면 어떤 일이 생기는가

active set이 5 page인데 process가 실질적으로 3 frame만 활용할 수 있다면 replacement policy는 계속 필요한 page 중 하나를 내보낼 수밖에 없다. 다음 접근에서 방금 eviction한 page가 다시 필요해 fault가 발생하고, 또 다른 active page를 밀어낸다. 이 상태가 심해지면 replacement policy 차이보다 memory shortage 자체가 지배적인 문제가 된다.

### Backend에서의 locality

대형 batch가 전체 table을 무작위로 scan하면 OS page cache와 DB buffer pool의 interactive working set을 밀어낼 수 있다. 반대로 key 순서나 range 단위로 처리하면 같은 page와 cache line의 재사용을 높일 수 있다. 운영에서는 RSS 총량만 보지 말고 fault rate, storage read, workload phase와 batch access pattern을 함께 본다.
