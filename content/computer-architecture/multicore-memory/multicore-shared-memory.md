---
kind: concept
contentKey: computer-architecture.core.multicore-memory.multicore-shared-memory
topicContentKey: computer-architecture.core.multicore-memory
slug: multicore-shared-memory
title: "멀티코어 공유 메모리(Multicore Shared Memory)"
summary: "여러 코어가 같은 물리 메모리를 공유할 때 코어별 캐시·캐시 일관성·메모리 순서가 각각 맡는 역할을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "multicore cache sharing, coherence protocol, false sharing과 shared-memory ordering 경계를 확인한다."
    displayOrder: 1
---
# 멀티코어 공유 메모리(Multicore Shared Memory)

멀티코어 프로세서에서는 여러 코어가 같은 물리 메모리를 공유할 수 있다. 하지만 각 코어에는 자기 레지스터, 파이프라인, store buffer와 코어별 캐시가 있을 수 있으므로 모든 load/store가 하나의 중앙 메모리에서 순서대로 처리되는 것은 아니다.

```text
core A ── private cache ─┐
                        ├─ shared memory hierarchy ── DRAM
core B ── private cache ─┘
```

같은 메모리를 여러 코어가 접근할 수 있다는 장점과 함께, 여러 캐시에 존재하는 복사본을 어떻게 일관되게 유지할지와 메모리 연산의 순서를 어떻게 관찰할지가 문제가 된다.

### 캐시 일관성은 같은 위치의 복사본을 다룬다

같은 캐시 라인이 여러 코어별 캐시에 존재할 때 한 코어가 값을 수정하면 다른 코어가 오래된 복사본을 계속 사용하지 않도록 조정해야 한다. 이 문제를 캐시 일관성(cache coherence)이라고 한다.

캐시 일관성은 주로 **같은 메모리 위치의 최신 복사본과 읽기·쓰기 권한**을 관리한다.

### 메모리 순서는 서로 다른 연산의 순서를 다룬다

캐시 일관성이 정상이라고 해서 서로 다른 주소의 모든 load/store가 다른 코어에 프로그램 순서 그대로 관찰된다는 뜻은 아니다. 어떤 메모리 연산 순서를 반드시 보존해야 하는지는 아키텍처의 메모리 일관성 모델(memory consistency model)이 정한다.

즉 두 질문을 분리해야 한다.

```text
coherence       → 같은 location의 값과 ownership
memory ordering → 여러 memory operation 사이의 관찰 순서
```

### 원자성도 별도 문제다

캐시 일관성이 있어도 `x++` 같은 read-modify-write 연산 전체가 자동으로 원자적(atomic)으로 수행되는 것은 아니다. 여러 코어가 같은 이전 값을 읽고 각각 새 값을 쓰면 lost update가 생길 수 있다.

원자적 명령이나 lock 같은 메커니즘은 이런 복합 연산의 원자성을 제공하는 별도 계층이다.

Java 같은 언어의 동시성 정확성은 다시 언어 메모리 모델의 계약으로 판단한다. 하드웨어 캐시 일관성과 메모리 순서는 그 아래에서 런타임이 사용하는 구현 기반이지 Java 동기화를 대신하는 규칙이 아니다.
