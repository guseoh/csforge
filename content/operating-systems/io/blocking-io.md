---
kind: concept
contentKey: operating-systems.core.io.blocking-io
topicContentKey: operating-systems.core.io
slug: blocking-io
title: "블로킹 입출력(Blocking I/O)"
summary: "I/O를 진행할 조건이 생길 때까지 호출한 실행 흐름이 기다릴 수 있는 의미와 자원 비용을 설명한다."
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
# 블로킹 입출력(Blocking I/O)

블로킹 I/O는 호출한 실행 흐름이 지금 원하는 I/O를 진행할 수 없을 때 **조건이 충족될 때까지 기다릴 수 있는 방식**이다. 예를 들어 블로킹 소켓의 `read()`에서 받을 데이터가 없다면 커널은 현재 실행 흐름을 대기 상태로 보내고, 데이터가 도착한 뒤 다시 실행 가능한 상태로 바꿀 수 있다.

```text
read()
  ↓
데이터 있음? ── 예 → 가능한 바이트 반환
  │
  아니오
  ↓
실행 흐름 대기
  ↓ 데이터 도착
다시 실행 가능 → 스케줄됨 → read 완료
```

### 블로킹은 바쁜 대기와 다르다

실행 흐름이 잠든 상태로 기다리는 동안 CPU를 계속 소비하는 것은 아니다. 스케줄러는 다른 실행 가능한 스레드나 태스크를 실행할 수 있다. 다만 해당 스레드의 스택과 실행 상태, 파일·소켓 같은 자원에 대한 참조는 계속 존재한다.

### 블로킹과 요청한 양 전체의 완료도 구분한다

`read(fd, buf, 4096)`가 블로킹 호출이라고 해서 반드시 4096바이트를 모두 채운 뒤 반환하는 것은 아니다. 객체 종류와 현재 상태에 따라 일부 바이트만 정상적으로 반환할 수 있고, EOF나 오류로 끝날 수도 있다.

따라서 블로킹은 **호출이 조건을 기다릴 수 있는가**에 대한 계약이지, 요청한 바이트 수 전체를 한 번에 완료한다는 계약이 아니다.

이미 데이터가 준비되어 있다면 블로킹 파일 디스크립터의 `read()`도 즉시 반환할 수 있다. 블로킹 I/O의 핵심은 **I/O 조건이 충족되지 않았을 때 호출한 실행 흐름 자체를 기다리게 할 수 있다는 점**이다.