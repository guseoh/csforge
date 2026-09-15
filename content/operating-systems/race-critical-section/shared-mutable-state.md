---
kind: concept
contentKey: operating-systems.core.race-critical-section.shared-mutable-state
topicContentKey: operating-systems.core.race-critical-section
slug: shared-mutable-state
title: "Shared Mutable State"
summary: "여러 실행 흐름이 같은 변경 가능한 invariant에 접근할 때 concurrency 문제가 생기는 이유를 설명한다."
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
# Shared Mutable State

동시성 문제가 생기는 핵심 조건은 여러 실행 흐름이 **같은 변경 가능한 state를 함께 사용한다는 것**이다. 읽기만 하는 immutable data는 update 경쟁이 없지만, 둘 이상의 thread가 같은 state를 읽고 수정하면 상대적인 실행 순서가 결과에 영향을 줄 수 있다.

예를 들어 두 값이 항상 함께 바뀌어야 한다고 하자.

```text
balance = 100
version = 7
```

Thread A가 `balance`를 먼저 바꾸고 `version`을 나중에 갱신하는 중간 순간에 Thread B가 두 값을 읽으면 서로 다른 시점의 조합을 볼 수 있다. 따라서 보호해야 하는 대상은 변수 하나가 아니라 **여러 값이 함께 만족해야 하는 invariant**일 수 있다.

### 공유 범위를 줄이면 경쟁 범위도 줄어든다

State를 한 execution flow가 소유하게 하거나 immutable snapshot을 전달하면 같은 mutable state를 동시에 수정하는 상황을 줄일 수 있다. 반대로 shared memory를 사용한다면 어떤 operation이 하나의 일관된 transition으로 보여야 하는지 정해야 한다.

중요한 것은 `공유 state가 있으니 lock 하나를 붙인다`가 아니다. 먼저 **어떤 state가 공유되고, 어떤 invariant가 깨질 수 있으며, 어느 operation들이 함께 보호되어야 하는지**를 찾는 것이 출발점이다.