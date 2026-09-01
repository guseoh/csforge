---
kind: concept
contentKey: operating-systems.core.race-critical-section.race-condition
topicContentKey: operating-systems.core.race-critical-section
slug: race-condition
title: "Race Condition"
summary: "실행 순서에 따라 invariant와 결과가 달라지는 race condition을 data race와 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Race Condition

### 결과가 timing에 의존한다는 것이 핵심이다

race condition은 둘 이상의 concurrent action의 상대적인 실행 순서가 program correctness에 영향을 주는 상황이다. 모든 가능한 interleaving이 같은 valid state로 끝난다면 concurrent access가 있어도 그 invariant에 대한 race condition은 아닐 수 있다.

반대로 같은 결과가 대부분 나오더라도 특정 순서에서만 잘못된 state가 만들어진다면 race가 있다. 이런 bug는 부하, CPU 수, scheduler timing이 바뀔 때만 드러날 수 있어 재현 빈도만으로 안전성을 판단하기 어렵다.

### data race와 더 넓은 race condition

`data race`는 language/runtime memory model에서 정의하는 더 좁은 용어일 수 있다. 예를 들어 Java에서는 conflicting access와 happens-before 관계를 기준으로 reasoning한다. 반면 race condition은 file creation, distributed request, check-then-act처럼 동일한 memory address를 직접 공유하지 않아도 순서 경쟁 때문에 잘못된 결과가 생기는 상황까지 넓게 말할 수 있다.

따라서 OS 학습에서 `race condition = 두 thread가 같은 변수에 접근`으로 끝내지 않는다. 무엇이 shared resource인지, 어떤 invariant가 깨지는지, 어느 순서가 위험한지를 설명해야 한다.

### 해결책은 invariant의 위치에 따라 다르다

process-local counter라면 atomic primitive나 mutex가 적절할 수 있다. database의 unique identity라면 DB unique constraint와 transaction이 더 강한 canonical boundary가 될 수 있다. 여러 HTTP retry의 중복 effect라면 idempotency key가 필요할 수 있다.

lock은 여러 도구 중 하나일 뿐이다. `어떤 상태를 한 번만 바꿔야 하는가`, `누가 동시에 접근하는가`, `최종 authoritative state가 어디에 있는가`부터 결정해야 한다.
