---
kind: concept
contentKey: operating-systems.core.synchronization.semaphore
topicContentKey: operating-systems.core.synchronization
slug: semaphore
title: "Semaphore"
summary: "counting permit로 동시 접근 수와 event handoff를 표현하는 semaphore semantics를 설명한다."
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
# Semaphore

Mutex가 한 owner에게 critical section의 배타적 권한을 준다면, semaphore는 **동시에 통과할 수 있는 permit 수**를 상태로 관리합니다. 그래서 connection pool 크기, 외부 API 동시 호출 수처럼 “최대 N개까지 허용한다”는 제한을 표현하기에 적합합니다.

![Semaphore permit 획득과 반환 흐름](/learning/operating-systems/semaphore-permits.svg)

### permit가 줄고 다시 늘어나는 흐름을 본다

초기 count가 3인 counting semaphore를 생각해 봅시다. 세 task가 각각 acquire/wait에 성공하면 사용할 수 있는 permit는 0이 되고, 네 번째 task는 누군가 release/post할 때까지 진행할 수 없습니다.

```text
초기 permit = 3

T1 acquire  3 → 2   진행
T2 acquire  2 → 1   진행
T3 acquire  1 → 0   진행
T4 acquire  0       대기

T2 release  0 → 1   → T4가 permit를 얻어 진행 가능
```

중요한 것은 semaphore가 resource 자체를 만들어 주지 않는다는 점입니다. permit count는 application이 관리하려는 실제 capacity와 맞아야 합니다. 예를 들어 DB connection이 실제로 3개뿐인데 semaphore count만 10으로 둔다고 connection이 10개가 되는 것은 아닙니다.

### binary semaphore와 mutex는 역할이 겹쳐도 계약은 다르다

count가 0과 1 사이에서 움직이는 binary semaphore는 한 실행 흐름만 통과시키는 데 사용할 수 있습니다. 이 모습만 보면 mutex와 비슷하지만, semaphore는 전형적으로 특정 owner가 unlock해야 한다는 소유권 의미보다 **permit 변화와 signaling protocol**에 초점을 둡니다.

한 thread가 wait하고 다른 thread가 post하여 “이제 다음 단계로 진행해도 된다”는 event handoff를 표현하는 것도 semaphore의 대표적인 사용 방식입니다. 따라서 primitive를 고를 때는 값이 0/1인지보다 **mutual exclusion을 표현하려는지, capacity나 ordering을 표현하려는지**를 봐야 합니다.

### permit 누수와 과다 release 모두 invariant를 깨뜨린다

acquire에 성공한 뒤 exception 경로에서 release를 빼먹으면 실제 작업이 끝났어도 permit가 돌아오지 않습니다. 이런 누수가 반복되면 semaphore count가 계속 줄어 결국 새로운 요청이 모두 기다리는 상태가 될 수 있습니다.

반대로 실제 capacity보다 더 많이 release하면 semaphore가 허용하는 동시 실행 수가 실제 resource 수보다 커집니다. 따라서 success뿐 아니라 exception, timeout, cancellation까지 포함해 **acquire와 release의 lifecycle이 실제 resource 사용과 대응되는지** 확인해야 합니다.

Backend에서 외부 API 동시 호출을 20개로 제한한다고 해도 semaphore는 queue length, 요청 timeout, overload rejection까지 자동으로 설계해 주지 않습니다. Semaphore는 어디까지나 동시에 통과 가능한 수를 제한하는 primitive이고, backpressure 정책은 별도 책임입니다.

### 면접에서 이렇게 나옵니다

#### Q. Binary semaphore와 mutex는 같은 것인가요?

항상 같다고 볼 수 없습니다. 둘 다 한 번에 하나만 통과시키는 형태로 사용할 수 있지만, mutex는 보통 owner가 획득하고 해제하는 mutual-exclusion 의미를 가지며 semaphore는 permit와 signaling을 표현합니다.

따라서 구현 이름보다 어떤 synchronization protocol과 invariant를 표현하려는지를 기준으로 구분해야 합니다.
