---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.temporal-spatial-locality
topicContentKey: computer-architecture.core.memory-hierarchy
slug: temporal-spatial-locality
title: "시간적·공간적 지역성"
summary: "최근 사용한 데이터와 인접 데이터를 다시 사용할 가능성이 cache 재사용에 어떤 영향을 주는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# 시간적·공간적 지역성

Cache가 효과를 내는 이유는 프로그램의 memory access가 완전히 무작위인 경우가 드물기 때문이다. 최근 사용한 값을 다시 사용하거나, 사용한 주소 주변의 데이터를 이어서 읽는 패턴이 자주 나타난다. 이런 성질을 locality라고 한다.

### 시간적 지역성은 같은 데이터를 다시 쓰는 패턴이다

시간적 지역성(temporal locality)은 **최근 사용한 데이터가 가까운 미래에 다시 사용될 가능성이 높다**는 성질이다. 반복문에서 계속 사용하는 변수나 같은 table을 여러 번 조회하는 경우가 대표적이다.

최근 사용한 cache line이 eviction되지 않고 남아 있다면 다음 접근은 lower memory level까지 내려가지 않고 hit할 수 있다.

### 공간적 지역성은 가까운 주소를 이어서 쓰는 패턴이다

공간적 지역성(spatial locality)은 **어떤 주소를 사용하면 그 주변 주소도 곧 사용할 가능성이 높다**는 성질이다. CPU cache가 요청한 byte 하나가 아니라 주변 byte를 포함한 cache line 전체를 가져오는 이유다.

예를 들어 연속된 배열을 순서대로 읽으면 첫 원소에서 line을 가져온 뒤 같은 line에 포함된 다음 원소들을 재사용할 수 있다.

```text
memory: [A0][A1][A2][A3][A4][A5] ...
           └──── 한 cache line ────┘
```

반대로 큰 간격으로 주소를 건너뛰며 접근하면 가져온 line의 대부분을 사용하지 못할 수 있다.

### 자료구조 이름보다 실제 접근 패턴이 중요하다

`배열은 locality가 좋다`는 말도 순차 접근 같은 조건이 있을 때 유효하다. 큰 배열을 매우 큰 stride로 건너뛰거나 다시 사용하기 전에 cache에서 밀려나면 재사용 효과가 작아진다.

결국 locality는 자료구조 이름 자체보다 **어떤 주소를 어떤 순서와 간격으로 반복해서 접근하는가**에 달려 있다. 다음 Concept에서는 이 지역성을 활용하는 실제 이동 단위인 cache line을 본다.
