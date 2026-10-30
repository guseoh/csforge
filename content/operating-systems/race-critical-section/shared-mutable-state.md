---
kind: concept
contentKey: operating-systems.core.race-critical-section.shared-mutable-state
topicContentKey: operating-systems.core.race-critical-section
slug: shared-mutable-state
title: "공유 가변 상태(Shared Mutable State)"
summary: "여러 실행 흐름이 같은 변경 가능한 상태와 불변 조건을 함께 다룰 때 동시성 문제가 생기는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# 공유 가변 상태(Shared Mutable State)

동시성 문제가 생기는 핵심 조건은 여러 실행 흐름이 **같은 변경 가능한 상태를 함께 사용한다는 것**이다. 읽기만 하는 불변 데이터는 갱신 경쟁이 없지만, 둘 이상의 스레드가 같은 상태를 읽고 수정하면 상대적인 실행 순서에 따라 결과가 달라질 수 있다.

예를 들어 두 값이 항상 함께 바뀌어야 한다고 하자.

```text
balance = 100
version = 7
```

스레드 A가 `balance`를 먼저 바꾸고 `version`을 나중에 갱신하는 중간 순간에 스레드 B가 두 값을 읽으면 서로 다른 시점의 값을 조합해서 볼 수 있다. 따라서 보호해야 하는 대상은 변수 하나가 아니라 **여러 값이 함께 만족해야 하는 불변 조건(invariant)**일 수 있다.

### 공유 범위를 줄이면 경쟁 범위도 줄어든다

상태를 하나의 실행 흐름이 소유하게 하거나 불변 스냅샷을 전달하면 같은 가변 상태를 동시에 수정하는 상황을 줄일 수 있다. 반대로 공유 메모리를 사용한다면 어떤 연산들이 하나의 일관된 상태 전이로 보여야 하는지 먼저 정해야 한다.

중요한 것은 `공유 상태가 있으니 락 하나를 붙인다`에서 시작하지 않는 것이다. 먼저 **어떤 상태를 공유하는지, 어떤 불변 조건이 깨질 수 있는지, 어느 연산들을 함께 보호해야 하는지**를 찾는 것이 출발점이다.
