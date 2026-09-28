---
kind: concept
contentKey: operating-systems.core.io.non-blocking-io
topicContentKey: operating-systems.core.io
slug: non-blocking-io
title: "논블로킹 입출력(Non-Blocking I/O)"
summary: "지금 가능한 만큼만 진행하고 즉시 반환할 때 호출자가 부분 진행 상태와 재시도 시점을 관리해야 하는 이유를 설명한다."
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
# 논블로킹 입출력(Non-Blocking I/O)

논블로킹 I/O는 I/O 연산을 지금 진행할 수 없을 때 호출한 실행 흐름을 재우지 않고 **즉시 제어권을 돌려주는 방식**이다. Linux의 논블로킹 파일 디스크립터에서 `read()`를 지금 진행할 수 없다면 `EAGAIN`이나 `EWOULDBLOCK` 같은 결과를 받을 수 있다.

```text
read()
  ↓
데이터 있음? ── 예 → 가능한 만큼 반환
  │
  아니오
  ↓
즉시 EAGAIN → 호출자가 나중에 다시 시도
```

### 호출자가 부분 진행 상태를 관리한다

현재 2KiB만 읽을 수 있다면 10KiB 메시지를 기다리고 있더라도 `read()`는 2KiB만 반환할 수 있다. `write()`도 출력 버퍼가 받아들일 수 있는 일부 바이트만 진행할 수 있다.

따라서 호출자는 버퍼 위치와 남은 데이터, 프로토콜 파싱 상태를 보존하고 다음 호출에서 이어서 처리해야 한다.

### 바쁜 폴링과는 다르다

논블로킹이라는 이유로 준비되지 않은 fd에 `read()`를 계속 반복하면 CPU를 낭비한다. 보통 준비 알림(readiness notification)과 결합해 **언제 다시 시도할 가치가 있는지**를 기다린다.

논블로킹 I/O는 연산을 제출한 뒤 커널이 나중에 완료 결과를 돌려주는 비동기 완료 모델과도 다르다. 핵심은 **지금 가능한 만큼만 수행하고, 불가능하면 기다리지 않은 채 반환하며 재시도 책임을 호출자가 가진다는 점**이다.