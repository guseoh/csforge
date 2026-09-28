---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.memory-hierarchy
topicContentKey: computer-architecture.core.memory-hierarchy
slug: memory-hierarchy
title: "메모리 계층 구조(Memory Hierarchy)"
summary: "레지스터·캐시·DRAM·저장장치를 계층으로 두고 지역성을 이용해 평균 접근 비용을 낮추는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "memory hierarchy, temporal/spatial locality, cache line, hit/miss와 AMAT 관계를 확인한다."
    displayOrder: 1
---
# 메모리 계층 구조(Memory Hierarchy)

CPU가 필요한 모든 데이터를 DRAM이나 저장장치에서 매번 가져온다면 연산보다 메모리를 기다리는 시간이 더 길어질 수 있다. 반대로 CPU에 가까운 매우 빠른 저장 공간을 큰 용량으로 만드는 것은 비용·면적·전력 때문에 어렵다.

그래서 컴퓨터 시스템은 서로 다른 특성을 가진 저장 공간을 계층으로 배치한다.

```text
빠름 · 작음 · 비쌈
        register
        L1/L2/L3 cache
        DRAM
        storage
느림 · 큼 · 저렴
```

CPU에 가까운 계층은 작고 빠르며, 아래 계층으로 갈수록 더 크고 느리다. 위 계층은 아래 계층 데이터의 일부를 보관한다. 요청한 데이터가 가까운 계층에 있으면 빠르게 사용하고, 없다면 다음 계층에서 가져온다.

### 작은 캐시가 효과적인 이유는 지역성이다

프로그램은 모든 주소를 완전히 무작위로 접근하는 경우보다 최근 사용한 값을 다시 쓰거나 가까운 주소를 연속으로 사용하는 경우가 많다. 이런 접근 패턴을 지역성(locality)이라고 한다.

작은 캐시는 전체 메모리를 담지 못하지만, **곧 다시 사용할 가능성이 높은 일부 데이터**를 가까이 두면 많은 요청을 빠르게 처리할 수 있다.

### 적중과 미스 경로를 함께 봐야 한다

가까운 계층에서 데이터를 찾으면 적중(hit)이고, 찾지 못해 다음 계층으로 내려가면 미스(miss)다. 캐시 성능은 적중이 얼마나 자주 나는지만으로 결정되지 않는다. 적중 한 번의 비용과 미스가 발생했을 때 다음 계층을 기다리는 비용도 함께 봐야 한다.

단순화한 한 단계 캐시 모델에서는 다음 관계로 생각할 수 있다.

```text
평균 접근 시간 ≈ hit time + miss rate × miss penalty
```

실제 CPU는 여러 캐시 계층과 병렬 메모리 요청을 사용하므로 더 복잡하지만, 이 식은 메모리 계층의 핵심 절충 관계를 보여 준다.

OS page cache, DB buffer pool, application cache도 데이터를 재사용한다는 공통점은 있지만 CPU 캐시와 같은 하드웨어 메커니즘은 아니다. 여기서는 하드웨어 메모리 계층만 다룬다.
