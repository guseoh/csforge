---
kind: concept
contentKey: operating-systems.core.synchronization.semaphore
topicContentKey: operating-systems.core.synchronization
slug: semaphore
title: "세마포어(Semaphore)"
summary: "허가 수를 세어 동시 접근 수를 제한하고 실행 흐름 사이의 신호 전달을 표현하는 세마포어를 설명한다."
level: 1
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
  - url: "https://man7.org/linux/man-pages/man7/sem_overview.7.html"
    title: "sem_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "POSIX semaphore의 count와 wait/post 기본 semantics를 확인한다."
    displayOrder: 2
---
# 세마포어(Semaphore)

세마포어는 **사용 가능한 허가(permit) 수를 카운터로 관리하는 동기화 도구**다. 허가가 남아 있으면 실행 흐름이 하나를 획득해 진행하고, 모두 사용 중이면 새로운 요청은 허가가 반환될 때까지 기다린다.

초기 허가 수가 3이라고 하자.

```text
T1 acquire  3 → 2
T2 acquire  2 → 1
T3 acquire  1 → 0
T4 acquire  0 → wait

누군가 release → 허가 수 증가 → T4 진행 가능
```

![Semaphore permit 획득과 반환 흐름](/learning/operating-systems/semaphore-permits.svg)

### 뮤텍스와 중심 의미가 다르다

카운트가 1인 이진 세마포어(binary semaphore)는 한 번에 하나만 통과시키는 데 사용할 수 있어 뮤텍스와 비슷해 보인다. 하지만 뮤텍스의 중심은 **소유권이 있는 상호 배제**이고, 세마포어의 중심은 **허가 수와 wait/post 규칙**이다.

세마포어는 한 실행 흐름이 기다리고 다른 실행 흐름이 `post`하여 다음 진행을 허용하는 신호 전달에도 사용할 수 있다. 따라서 값이 0과 1만 오간다는 사실만으로 뮤텍스와 완전히 같은 도구라고 보면 안 된다.

### 허가 수는 실제 용량과 맞아야 한다

세마포어가 실제 자원을 만들어 주는 것은 아니다. 허가 수는 보호하거나 제한하려는 자원의 용량을 표현할 뿐이다. 획득 뒤 반환을 누락하면 허가가 줄어든 채 돌아오지 않고, 반대로 의도보다 많이 반환하면 원래의 동시성 제한이 깨질 수 있다.

세마포어의 핵심은 **N개의 허가를 통해 동시에 진행할 수 있는 실행 흐름의 수나 실행 흐름 사이의 신호 전달을 명시적으로 표현하는 것**이다.
