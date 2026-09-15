---
kind: concept
contentKey: operating-systems.core.io.epoll
topicContentKey: operating-systems.core.io
slug: epoll
title: "epoll"
summary: "Linux에서 persistent interest set과 ready list를 분리해 많은 descriptor의 readiness를 관리하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux readiness model에서 interest list와 ready list, level/edge-triggered semantics를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/1469717"
    title: "HTTPS 전환 과정에서 read timeout 오류 해결 과정"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "blocking worker 구조에서 Linux epoll/NIO 기반 이벤트 처리로 전환해 timeout과 CPU를 개선한 실제 운영 사례를 확인한다."
    displayOrder: 2
---
# epoll

`epoll`은 Linux의 readiness notification facility다. `select()`나 `poll()`처럼 wait를 호출할 때마다 전체 descriptor 집합을 다시 넘기는 대신, epoll instance에 **관심 descriptor 집합을 등록해 두고 현재 ready한 descriptor 목록을 별도로 관리**한다.

![epoll interest list와 ready list의 역할 분리](/learning/operating-systems/epoll-interest-ready.svg)

Application은 `epoll_ctl()` 계열 operation으로 관심 대상을 등록·수정·삭제하고, `epoll_wait()`로 현재 ready event를 받는다. 감시 중인 connection이 많지만 실제 activity는 일부에 집중되는 workload에서 이 구조는 매번 전체 집합을 선형으로 확인하는 부담을 줄이는 데 유리하다.

### Interest list와 ready list는 역할이 다르다

Interest list는 "어떤 descriptor의 어떤 event를 감시할 것인가"를 나타낸다. Ready list는 그중 현재 처리할 event가 생긴 descriptor를 나타낸다. 따라서 등록된 descriptor 수와 한 번에 application이 처리해야 할 ready event 수를 분리해서 생각할 수 있다.

그렇다고 `epoll은 무조건 O(1)`처럼 단순화하면 안 된다. 등록·삭제, ready-list 관리, wakeup, 실제 handler 실행에는 여전히 비용이 있고 workload와 kernel 구현에 따라 성능 특성이 달라진다.

### Level-triggered와 edge-triggered

Level-triggered에서는 readable 같은 조건이 계속 참이면 처리하지 않은 상태가 남아 있는 동안 다시 event를 받을 수 있다. Edge-triggered에서는 readiness 상태 변화에 맞춰 notification을 받으므로 보통 descriptor를 non-blocking으로 사용하고 현재 가능한 I/O를 `EAGAIN`이 나올 때까지 처리해야 한다.

```text
edge event 발생
   ↓
read 가능한 만큼 반복
   ↓
EAGAIN
   ↓
다음 readiness 변화 대기
```

일부 data를 남겨 둔 채 다음 edge만 기다리면 이미 readable 상태인 descriptor에 새로운 변화가 생기지 않아 progress가 멈출 수 있다.

### epoll은 completion interface가 아니다

`epoll_wait()`가 fd를 반환했다는 것은 특정 `read()`가 완료되었다는 뜻이 아니다. Application은 event를 받은 뒤 실제 I/O를 호출하고 partial result나 `EAGAIN`을 처리한다. 즉 epoll의 핵심은 **많은 descriptor의 readiness를 persistent interest set과 ready list로 관리하는 것**이며, operation submission과 completion result를 연결하는 asynchronous completion model과는 다르다.
