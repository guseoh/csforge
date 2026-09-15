---
kind: concept
contentKey: operating-systems.core.io.non-blocking-io
topicContentKey: operating-systems.core.io
slug: non-blocking-io
title: "Non-Blocking I/O"
summary: "지금 가능한 progress만 수행하고 즉시 반환할 때 caller가 partial state와 retry 시점을 관리하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man2/read.2.html"
    title: "read(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "read()의 partial result와 O_NONBLOCK/EAGAIN 계약을 확인한다."
    displayOrder: 1
  - url: "https://techblog.woowahan.com/2667/"
    title: "배달의민족 최전방 시스템! ‘가게노출 시스템’을 소개합니다."
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "실제 WebFlux 기반 서비스에서 non-blocking/event-driven I/O를 선택한 배경과 thread resource trade-off를 사례로 확인한다."
    displayOrder: 2
---
# Non-Blocking I/O

Non-blocking I/O는 operation이 지금 progress할 수 없을 때 호출 task를 재우지 않고 **즉시 control을 돌려주는 semantics**다. Linux의 non-blocking descriptor에서 read가 지금 진행될 수 없다면 `EAGAIN`/`EWOULDBLOCK` 같은 결과를 받을 수 있다.

```text
read()
  ↓
data 있음? ── yes → 가능한 만큼 반환
  │
  no
  ↓
즉시 EAGAIN → caller가 나중에 다시 시도
```

### Caller가 partial progress를 관리한다

현재 2KiB만 읽을 수 있다면 10KiB message를 기다리고 있더라도 read는 2KiB만 반환할 수 있다. Write도 output buffer가 받아들일 수 있는 일부 byte만 progress할 수 있다.

따라서 caller는 buffer 위치와 남은 data, protocol parsing state를 보존해야 한다.

### Busy polling과는 다르다

Non-blocking이라는 이유로 준비되지 않은 fd에 read를 계속 반복하면 CPU를 낭비한다. 보통 readiness notification과 결합해 **언제 다시 시도할 가치가 있는지** 기다린다.

Non-blocking I/O는 operation을 제출한 뒤 kernel이 나중에 자동으로 완료해 주는 asynchronous completion model과도 다르다. 핵심은 **지금 가능한 만큼만 수행하고, 불가능하면 기다리지 않은 채 반환하며 retry 책임을 caller가 가진다는 점**이다.