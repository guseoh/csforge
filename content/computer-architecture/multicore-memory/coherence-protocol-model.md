---
kind: concept
contentKey: computer-architecture.core.multicore-memory.coherence-protocol-model
topicContentKey: computer-architecture.core.multicore-memory
slug: coherence-protocol-model
title: "캐시 일관성 프로토콜(Coherence Protocol Model)"
summary: "캐시 라인의 읽기·쓰기 권한과 최신 데이터 소유권을 상태 전이로 추적하는 캐시 일관성 프로토콜의 기본 모델을 설명한다."
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "multicore cache sharing, coherence protocol, false sharing과 shared-memory ordering 경계를 확인한다."
    displayOrder: 1
---
# 캐시 일관성 프로토콜(Coherence Protocol Model)

캐시 일관성 프로토콜은 캐시 라인마다 **누가 읽을 수 있고, 누가 쓸 수 있으며, 최신 데이터가 어디에 있는지**를 추적한다. 특정 프로토콜 이름을 외우기보다 라인의 권한과 소유권이 상태 전이로 바뀐다고 이해하는 것이 핵심이다.

MESI 계열에서는 Modified, Exclusive, Shared, Invalid 같은 상태 이름을 사용하지만 모든 CPU가 정확히 같은 상태 집합을 사용하는 것은 아니다. 프로토콜마다 추가 상태나 메시지가 있을 수 있다.

### 여러 reader가 있는 라인에 쓰려면 소유권이 필요하다

Core A와 B가 같은 라인을 읽기 전용 상태로 보유하고 있고 A가 쓰기를 수행하려 한다고 하자. A가 자기 복사본만 수정하면 B가 오래된 값을 계속 읽을 수 있으므로, A는 다른 복사본과 조정해 쓰기 권한을 얻어야 한다.

```text
A: Shared ── write request ──> write ownership
B: Shared ── invalidate ─────> Invalid
```

A가 소유권을 확보한 뒤 라인을 수정하면 B의 이전 복사본은 더 이상 사용할 수 없다. 이후 B가 다시 읽으려면 캐시 일관성 요청으로 최신 데이터를 받아야 한다.

### 캐시 일관성은 최신 데이터 위치도 추적해야 한다

Write-back 캐시에서는 최신 라인이 dirty 상태로 어떤 코어별 캐시에 있고 주 메모리는 이전 값을 가지고 있을 수 있다. 그래서 read miss가 났을 때 항상 DRAM만 보면 되는 것이 아니다.

프로토콜은 최신 데이터를 가진 소유자나 하위 캐시에서 값을 전달할 수 있도록 상태와 메시지를 관리한다.

### Snooping과 directory는 참여자를 찾는 방식이 다르다

작은 시스템에서는 캐시 일관성 요청을 여러 캐시가 공통 interconnect에서 관찰하는 snooping 모델로 설명할 수 있다. 코어 수가 커지면 directory가 어느 캐시가 라인을 보유하는지 추적하고 필요한 참여자에게만 메시지를 보내는 구조를 사용할 수 있다.

구체적인 토폴로지는 CPU마다 다르지만 목표는 같다. **오래된 복사본을 사용하지 않게 하고, 쓰기 소유권을 올바르게 조정하는 것**이다.

캐시 일관성 프로토콜은 같은 위치의 일관성을 다루지만 서로 다른 주소의 전체 메모리 순서까지 정의하지는 않는다. 그 문제는 뒤의 하드웨어 메모리 순서 Concept에서 다룬다.
