---
kind: concept
contentKey: computer-architecture.core.cache-organization.direct-mapped-cache
topicContentKey: computer-architecture.core.cache-organization
slug: direct-mapped-cache
title: "직접 사상 캐시(Direct-Mapped Cache)"
summary: "각 메모리 블록이 캐시의 한 위치로만 매핑될 때 조회가 단순해지는 대신 충돌 미스가 생기는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 직접 사상 캐시(Direct-Mapped Cache)

직접 사상 캐시에서는 각 메모리 블록이 캐시의 **정해진 라인 하나에만** 들어갈 수 있다. 주소의 인덱스가 확인할 라인을 바로 선택하고, 그 라인에 저장된 태그가 요청한 메모리 블록과 같은지 비교한다.

후보가 하나뿐이므로 조회 구조가 단순하다.

```text
memory block ──> index 계산 ──> cache line 하나 선택
                                  │
                                  └─ tag 일치? → hit / miss
```

### 단순한 대신 충돌에 취약하다

서로 다른 메모리 블록이 같은 인덱스로 매핑될 수 있다. 예를 들어 A와 B가 같은 라인을 사용해야 하고 프로그램이 다음처럼 반복 접근한다고 하자.

```text
A → B → A → B → ...
```

A를 넣으면 B가 밀려나고, B를 넣으면 A가 밀려난다. 캐시의 다른 라인이 비어 있어도 두 블록은 그 위치밖에 사용할 수 없기 때문에 계속 미스가 날 수 있다. 이것이 충돌 미스(conflict miss)다.

### 전체 용량만으로 적중 여부를 판단할 수 없다

작업 집합의 크기가 캐시 용량보다 작더라도 주소들이 같은 인덱스에 몰리면 실제 적중률은 낮아질 수 있다. 직접 사상 구조에서는 **어느 주소가 어느 라인으로 매핑되는가**가 중요하다.

이 충돌을 줄이기 위해 다음 Concept의 집합 연관 캐시는 하나의 인덱스에 여러 후보 라인을 둔다. 대신 조회와 교체 구조는 더 복잡해진다.
