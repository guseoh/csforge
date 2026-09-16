---
kind: concept
contentKey: operating-systems.core.io.blocking-io
topicContentKey: operating-systems.core.io
slug: blocking-io
title: "Blocking I/O"
summary: "I/O가 progress할 조건이 생길 때까지 호출 task가 기다리는 semantics와 resource 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/read.2.html"
    title: "read(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "read()의 partial result와 O_NONBLOCK/EAGAIN 계약을 확인한다."
    displayOrder: 1
---
# Blocking I/O

Blocking I/O는 호출한 task가 지금 원하는 I/O를 진행할 수 없을 때 **조건이 충족될 때까지 기다릴 수 있는 semantics**다. 예를 들어 blocking socket `read()`에서 받을 data가 없다면 kernel은 현재 task를 waiting 상태로 보내고, data가 도착한 뒤 다시 runnable하게 만들 수 있다.

```text
read()
  ↓
data 있음? ── yes → bytes 반환
  │
  no
  ↓
task waiting
  ↓ data arrival
runnable → 다시 실행 → read 완료
```

### Blocking은 busy waiting과 다르다

Task가 sleep 상태로 기다리는 동안 CPU를 계속 소비하는 것은 아니다. Scheduler는 다른 runnable task를 실행할 수 있다. 다만 해당 thread의 stack과 execution state, file/socket resource 같은 context는 계속 존재한다.

### Blocking과 전체 요청 완료도 구분한다

`read(fd, buf, 4096)`이 blocking call이라고 해서 반드시 4096 byte를 모두 채운 뒤 반환하는 것은 아니다. Object 종류와 상황에 따라 일부 byte만 정상 반환할 수 있고, EOF나 error로 끝날 수도 있다.

따라서 blocking은 **호출이 기다릴 수 있는가**에 대한 계약이지, 요청한 byte 수 전체를 한 번에 완료한다는 계약이 아니다.

이미 data가 준비되어 있다면 blocking descriptor의 read도 즉시 반환할 수 있다. Blocking I/O의 핵심은 **I/O 조건이 충족되지 않았을 때 호출 task 자체를 기다리게 할 수 있다는 점**이다.