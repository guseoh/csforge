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
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5"
    title: "The Java Language Specification — 17.4.5 Happens-before Order"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java에서 conflicting access와 happens-before를 기준으로 data race를 정의하는 정확한 경계를 확인한다."
    displayOrder: 2
---
# Race Condition

### 결과가 timing에 의존한다는 것이 핵심이다

race condition은 둘 이상의 concurrent action의 상대적인 실행 순서가 program correctness에 영향을 주는 상황이다. 모든 가능한 interleaving이 같은 valid state로 끝난다면 concurrent access가 있어도 그 invariant에 대한 race condition은 아닐 수 있다.

반대로 같은 결과가 대부분 나오더라도 특정 순서에서만 잘못된 state가 만들어진다면 race가 있다. 이런 bug는 부하, CPU 수, scheduler timing이 바뀔 때만 드러날 수 있어 재현 빈도만으로 안전성을 판단하기 어렵다.

### data race는 더 구체적인 memory-model 용어다

`data race`와 `race condition`을 완전히 같은 말로 사용하면 문제의 층위를 놓치기 쉽다. Java Language Specification에서는 같은 variable에 대한 두 **conflicting access**가 happens-before 관계로 정렬되지 않을 때 data race가 있다고 정의한다. 두 access가 conflicting하려면 같은 variable을 대상으로 하고 적어도 하나는 write여야 한다.

즉 Java의 data race는 language memory model 안에서 access와 happens-before를 기준으로 판단하는 구체적인 용어다. 반면 race condition은 file creation, distributed 요청, check-then-act처럼 동일한 memory address를 직접 공유하지 않아도 상대적인 순서 때문에 잘못된 결과가 생기는 상황까지 넓게 말할 수 있다.

예를 들어 두 요청이 각각 DB를 조회해 "아직 주문이 없다"고 판단한 뒤 같은 주문을 생성하는 문제는 application memory의 같은 Java variable을 동시에 쓰지 않아도 발생할 수 있다. 이 경우 핵심은 두 요청의 check와 act가 경쟁하면서 business invariant가 깨지는 것이다.

따라서 OS 학습에서 `race condition = 두 thread가 같은 변수에 접근`으로 끝내지 않는다. 무엇이 shared resource인지, 어떤 invariant가 깨지는지, 어느 순서가 위험한지를 설명해야 한다.

### 해결책은 invariant의 위치에 따라 다르다

process-local counter라면 atomic primitive나 mutex가 적절할 수 있다. database의 unique identity라면 DB unique constraint와 transaction이 더 강한 canonical boundary가 될 수 있다. 여러 HTTP retry의 중복 effect라면 idempotency key가 필요할 수 있다.

lock은 여러 도구 중 하나일 뿐이다. `어떤 상태를 한 번만 바꿔야 하는가`, `누가 동시에 접근하는가`, `최종 authoritative state가 어디에 있는가`부터 결정해야 한다. race가 발생하는 층과 invariant를 실제로 강제할 수 있는 층이 다르면 process-local lock만 추가해서는 문제가 해결되지 않을 수 있다.

### 핵심을 다시 연결하면

Race condition은 **상대적인 실행 순서가 correctness를 바꾸는 더 넓은 문제**이고, Java의 data race는 **conflicting memory access가 happens-before로 정렬되지 않은 경우**라는 더 구체적인 정의를 가진다. 문제를 해결할 때는 이름보다 invariant의 위치와 경쟁하는 주체의 범위를 먼저 찾아야 한다.
