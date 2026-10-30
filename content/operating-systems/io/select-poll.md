---
kind: concept
contentKey: operating-systems.core.io.select-poll
topicContentKey: operating-systems.core.io
slug: select-poll
title: "select와 poll"
summary: "여러 파일 디스크립터의 준비 상태를 한 대기 지점에서 감시하는 방식과 호출마다 관심 집합을 검사하는 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/poll.2.html"
    title: "poll(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "descriptor 배열의 requested/reported event와 timeout·interruption semantics를 확인한다."
    displayOrder: 1
---
# select와 poll

블로킹 I/O는 파일 디스크립터 하나가 준비될 때까지 기다리는 데는 단순하지만, 많은 파일 디스크립터를 동시에 다뤄야 할 때 각각에 별도 스레드를 두면 실행 자원과 메모리 비용이 커질 수 있다. `select()`와 `poll()`은 여러 파일 디스크립터 중 **현재 I/O를 시도할 준비가 된 대상이 있는지 하나의 대기 지점에서 확인하는 준비 상태 다중화(readiness multiplexing) 인터페이스**다.

`poll()`을 단순화하면 호출자는 `(fd, 관심 이벤트)` 목록을 커널에 넘긴다. 준비된 파일 디스크립터가 없으면 호출한 실행 흐름은 기다릴 수 있고, 조건이 생기면 커널이 각 항목의 결과 이벤트를 표시해 반환한다. 이후 애플리케이션이 실제 `read()`나 `write()`를 호출한다. 즉 `poll()`의 반환은 I/O 완료가 아니라 **어떤 파일 디스크립터에서 지금 I/O를 시도할 가치가 있는지 알려주는 준비 상태 결과**다.

### 큰 관심 집합에서는 반복 검사 비용이 생긴다

전형적인 `select()`와 `poll()` 사용에서는 대기를 호출할 때마다 감시할 집합을 전달하고, 반환 뒤 어떤 파일 디스크립터가 준비됐는지 결과를 확인해야 한다. 감시하는 파일 디스크립터가 매우 많고 실제 준비된 대상은 적다면 매 호출마다 큰 관심 집합을 다루는 비용이 커질 수 있다.

`select()`는 fd 집합 표현과 최대 파일 디스크립터 번호에 제약이 있고, `poll()`은 배열 기반 인터페이스로 이런 제약 일부를 완화한다. 그러나 둘 모두 **관심 집합을 지속적으로 보관하면서 준비된 집합만 따로 관리하는 방식은 아니다.** 이 한계가 연결은 많지만 대부분 유휴 상태인 작업 부하에서 `epoll` 같은 기능이 필요한 배경이 된다.

### 준비 알림 이후에도 실제 I/O 결과는 다시 확인한다

준비 이벤트를 받았더라도 실제 `read()`가 애플리케이션 메시지 전체를 반환한다는 보장은 없다. 상태가 바뀌었거나 일부 데이터만 존재할 수 있으며, 논블로킹 파일 디스크립터에서는 `EAGAIN`도 정상적인 결과가 될 수 있다. 따라서 다중화는 “어디를 다시 시도할지”를 알려줄 뿐 부분 읽기·쓰기와 프로토콜 상태 관리까지 대신하지 않는다.

`select`와 `poll`의 핵심은 **여러 파일 디스크립터의 준비 상태를 하나의 대기 지점에서 감시할 수 있지만, 관심 집합이 커질수록 매 호출의 집합 전달·검사 비용이 커질 수 있다는 것**이다.

### 흐름으로 보기

```text
관심 파일 디스크립터와 이벤트
          │ select()/poll() 대기
          ▼
준비 결과 반환 ── 준비 알림이지 I/O 완료가 아님
          │
          ▼
애플리케이션이 read()/write() 시도
          │
          └── 일부만 처리되거나 EAGAIN일 수 있음
```