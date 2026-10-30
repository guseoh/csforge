---
kind: concept
contentKey: operating-systems.core.io.epoll
topicContentKey: operating-systems.core.io
slug: epoll
title: "epoll"
summary: "Linux에서 관심 파일 디스크립터 집합과 현재 준비된 목록을 분리해 많은 파일 디스크립터의 준비 상태를 관리하는 방식을 설명한다."
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

`epoll`은 Linux의 준비 상태 알림(readiness notification) 기능이다. `select()`나 `poll()`처럼 대기를 호출할 때마다 전체 파일 디스크립터 집합을 다시 넘기는 대신, epoll 인스턴스에 **관심 파일 디스크립터 집합을 등록해 두고 현재 준비된 파일 디스크립터 목록을 별도로 관리**한다.

![epoll 관심 목록과 준비 목록의 역할 분리](/learning/operating-systems/epoll-interest-ready.svg)

애플리케이션은 `epoll_ctl()` 계열 연산으로 관심 대상을 등록·수정·삭제하고, `epoll_wait()`로 현재 준비된 이벤트를 받는다. 감시 중인 연결은 많지만 실제 활동은 일부에 집중되는 작업 부하에서는 매번 전체 집합을 선형으로 확인하는 부담을 줄이는 데 유리할 수 있다.

### 관심 목록과 준비 목록은 역할이 다르다

관심 목록(interest list)은 “어떤 파일 디스크립터의 어떤 이벤트를 감시할 것인가”를 나타낸다. 준비 목록(ready list)은 그중 현재 처리할 이벤트가 생긴 파일 디스크립터를 나타낸다. 따라서 등록된 파일 디스크립터 수와 한 번에 애플리케이션이 처리해야 할 준비 이벤트 수를 분리해서 생각할 수 있다.

그렇다고 `epoll은 무조건 O(1)`처럼 단순화하면 안 된다. 등록·삭제, 준비 목록 관리, 깨우기, 실제 핸들러 실행에는 여전히 비용이 있고 작업 부하와 커널 구현에 따라 성능 특성이 달라진다.

### 레벨 트리거와 엣지 트리거

레벨 트리거(level-triggered)에서는 읽기 가능 같은 조건이 계속 참이면 처리하지 않은 상태가 남아 있는 동안 다시 이벤트를 받을 수 있다. 엣지 트리거(edge-triggered)에서는 준비 상태의 변화에 맞춰 알림을 받으므로 보통 파일 디스크립터를 논블로킹으로 사용하고 현재 가능한 I/O를 `EAGAIN`이 나올 때까지 처리해야 한다.

```text
엣지 이벤트 발생
   ↓
읽을 수 있는 만큼 반복
   ↓
EAGAIN
   ↓
다음 준비 상태 변화 대기
```

일부 데이터를 남겨 둔 채 다음 엣지만 기다리면 이미 읽기 가능한 상태인 파일 디스크립터에 새로운 상태 변화가 생기지 않아 진행이 멈출 수 있다.

### epoll은 완료 기반 인터페이스가 아니다

`epoll_wait()`가 fd를 반환했다는 것은 특정 `read()` 연산이 완료됐다는 뜻이 아니다. 애플리케이션은 이벤트를 받은 뒤 실제 I/O를 호출하고 부분 결과나 `EAGAIN`을 처리한다. 즉 epoll의 핵심은 **많은 파일 디스크립터의 준비 상태를 지속적인 관심 집합과 준비 목록으로 관리하는 것**이며, 연산 제출과 완료 결과를 연결하는 비동기 완료 모델과는 다르다.