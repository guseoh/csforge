---
kind: concept
contentKey: operating-systems.core.io.epoll
topicContentKey: operating-systems.core.io
slug: epoll
title: "epoll"
summary: "Linux에서 persistent interest set과 ready list를 분리해 많은 디스크립터의 준비 상태를 관리하는 방식을 설명한다."
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
    title: "HTTPS 전환 과정에서 read 타임아웃 오류 해결 과정"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "blocking worker 구조에서 Linux epoll/NIO 기반 이벤트 처리로 전환해 timeout과 CPU를 개선한 실제 운영 사례를 확인한다."
    displayOrder: 2
---
# epoll

`epoll`은 Linux의 준비 상태 notification facility다. `select()`나 `poll()`처럼 wait를 호출할 때마다 전체 디스크립터 집합을 다시 넘기는 대신, epoll instance에 **관심 디스크립터 집합을 등록해 두고 현재 ready한 디스크립터 목록을 별도로 관리**한다.

![epoll interest list와 ready list의 역할 분리](/learning/operating-systems/epoll-interest-ready.svg)

애플리케이션은 `epoll_ctl()` 계열 연산으로 관심 대상을 등록·수정·삭제하고, `epoll_wait()`로 현재 ready 이벤트를 받는다. 감시 중인 연결이 많지만 실제 activity는 일부에 집중되는 워크로드에서 이 구조는 매번 전체 집합을 선형으로 확인하는 부담을 줄이는 데 유리하다.

### Interest list와 ready list는 역할이 다르다

Interest list는 "어떤 디스크립터의 어떤 이벤트를 감시할 것인가"를 나타낸다. Ready list는 그중 현재 처리할 이벤트가 생긴 디스크립터를 나타낸다. 따라서 등록된 디스크립터 수와 한 번에 애플리케이션이 처리해야 할 ready 이벤트 수를 분리해서 생각할 수 있다.

그렇다고 `epoll은 무조건 O(1)`처럼 단순화하면 안 된다. 등록·삭제, ready-list 관리, wakeup, 실제 핸들러 실행에는 여전히 비용이 있고 워크로드와 커널 구현에 따라 성능 특성이 달라진다.

### Level-triggered와 edge-triggered

Level-triggered에서는 readable 같은 조건이 계속 참이면 처리하지 않은 상태가 남아 있는 동안 다시 이벤트를 받을 수 있다. Edge-triggered에서는 준비 상태 상태 변화에 맞춰 notification을 받으므로 보통 디스크립터를 non-블로킹으로 사용하고 현재 가능한 I/O를 `EAGAIN`이 나올 때까지 처리해야 한다.

```text
edge event 발생
   ↓
read 가능한 만큼 반복
   ↓
EAGAIN
   ↓
다음 readiness 변화 대기
```

일부 data를 남겨 둔 채 다음 edge만 기다리면 이미 readable 상태인 디스크립터에 새로운 변화가 생기지 않아 진행가 멈출 수 있다.

### epoll은 완료 interface가 아니다

`epoll_wait()`가 fd를 반환했다는 것은 특정 `read()`가 완료되었다는 뜻이 아니다. 애플리케이션은 이벤트를 받은 뒤 실제 I/O를 호출하고 partial 결과나 `EAGAIN`을 처리한다. 즉 epoll의 핵심은 **많은 디스크립터의 준비 상태를 persistent interest set과 ready list로 관리하는 것**이며, 연산 submission과 완료 결과를 연결하는 asynchronous 완료 model과는 다르다.
