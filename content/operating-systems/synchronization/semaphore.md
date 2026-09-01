---
kind: concept
contentKey: operating-systems.core.synchronization.semaphore
topicContentKey: operating-systems.core.synchronization
slug: semaphore
title: "Semaphore"
summary: "counting permit로 동시 접근 수와 event handoff를 표현하는 semaphore semantics를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-sema.pdf"
    title: "Operating Systems: Three Easy Pieces — Semaphores"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "counting semaphore가 mutual exclusion과 ordering/condition signaling을 표현하는 방식을 확인한다."
    displayOrder: 1
---
# Semaphore

### 정수 permit로 접근 가능 수를 표현한다

semaphore는 내부 count를 통해 동시에 사용할 수 있는 permit 수를 표현한다. acquire/wait 연산은 permit를 하나 소비하고, permit가 없으면 caller를 기다리게 한다. release/post는 permit를 되돌려 waiter가 진행할 수 있게 한다.

예를 들어 connection 3개만 동시에 사용할 수 있도록 semaphore count를 3으로 두면 세 task까지 acquire할 수 있고 네 번째는 permit가 반환될 때까지 기다린다. mutex가 `한 owner의 배타적 critical section`을 표현하는 데 초점이 있다면 counting semaphore는 **N개의 동일한 capacity**를 표현하기 좋다.

### binary semaphore와 mutex는 비슷해 보여도 의미가 다르다

count가 0/1인 binary semaphore는 mutual exclusion처럼 사용할 수 있지만 전형적인 mutex의 ownership 규칙과 항상 같지는 않다. semaphore는 한 execution이 wait하고 다른 execution이 post하는 synchronization에도 사용할 수 있어 resource ownership과 event signaling을 더 일반적으로 표현한다.

그래서 `count=1이면 무조건 mutex와 완전히 동일하다`고 외우기보다 어떤 protocol을 표현하는지 봐야 한다.

### permit 누수와 과다 release도 correctness 문제다

acquire 후 error path에서 release를 빼먹으면 permit가 점점 줄어 결국 모든 caller가 기다릴 수 있다. 반대로 실제 resource보다 더 많이 release하면 semaphore count가 resource capacity를 초과해 보호가 무너질 수 있다.

Backend에서 semaphore로 external API 동시 호출을 20개로 제한한다면 timeout, cancellation, exception에서도 permit 반환이 보장되는지 확인해야 한다. semaphore는 queue 자체가 아니라 **동시에 통과할 수 있는 수를 제한하는 primitive**이므로 queue length와 timeout 정책은 별도로 설계한다.
