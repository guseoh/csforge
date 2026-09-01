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
---
# epoll

`epoll`은 Linux가 제공하는 readiness notification facility다. `select/poll`처럼 매 wait마다 전체 관심 descriptor 배열을 다시 전달하는 대신, **epoll instance에 관심 descriptor를 등록해 둔 interest list와 현재 I/O-ready 상태의 ready list를 분리**한다. application은 등록/수정/삭제와 event wait를 별도 operation으로 수행한다.

### 등록된 수와 실제 ready 수를 분리한다

server가 50,000 connection을 유지하지만 한 순간에 실제 data가 도착한 connection은 100개뿐이라고 하자. epoll 모델에서는 kernel이 readiness 변화에 따라 ready list를 관리하고 application은 `epoll_wait()`로 현재 ready event를 받아 처리한다. 이 구조는 mostly-idle large connection set에서 매번 전체 목록을 선형 scan하는 부담을 줄이는 데 유리하다.

그렇다고 epoll의 모든 operation이 connection 수와 완전히 무관하거나 `O(1)`이라고 단순화하면 안 된다. registration, ready-list 관리, wakeup, application handler 비용은 여전히 존재하고 workload와 kernel 구현에 따라 성능이 달라진다.

### Level-triggered와 edge-triggered

level-triggered에서는 descriptor가 계속 readable한 상태라면 처리하지 않은 data가 남아 있는 동안 다시 event를 받을 수 있다. edge-triggered에서는 readiness 상태 변화에 기반해 notification을 받으므로 보통 descriptor를 non-blocking으로 사용하고 **현재 가능한 I/O를 `EAGAIN`까지 drain**해야 한다.

예를 들어 socket에 16KiB가 들어왔는데 edge-triggered event에서 4KiB만 읽고 중단하면 나머지 12KiB가 이미 readable 상태로 남아 있어 새로운 edge가 생기지 않을 수 있다. 이 경우 event loop가 다음 notification만 기다리면 connection이 멈춘 것처럼 보일 수 있다.

### Event는 connection lifecycle과도 연결된다

readable뿐 아니라 hangup/error 같은 상태도 처리해야 하고, descriptor를 close/reuse하는 lifecycle에서는 stale application state와 새 fd를 혼동하지 않아야 한다. connection object의 generation/lifecycle을 별도로 관리하는 이유다.

### epoll은 completion API가 아니다

`epoll_wait()`가 fd를 반환했다는 것은 특정 `read()` operation이 이미 완료되었다는 뜻이 아니다. application은 event를 받은 뒤 실제 read/write를 호출하고 partial result와 `EAGAIN`을 처리한다. 이는 submission/completion queue로 operation result를 받는 `io_uring` 같은 completion-oriented model과 다르다.

Netty 같은 framework를 사용할 때 application이 epoll을 직접 호출하지 않아도 event loop의 핵심 제약은 남는다. handler에서 blocking DB/file call을 오래 수행하면 해당 event-loop thread가 맡은 다른 ready channel의 progress가 지연된다.
