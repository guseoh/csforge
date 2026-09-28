---
kind: concept
contentKey: operating-systems.core.io.async-io
topicContentKey: operating-systems.core.io
slug: async-io
title: "비동기 입출력(Asynchronous I/O)"
summary: "I/O 연산을 먼저 제출하고 나중에 완료 결과를 수집하는 모델과 버퍼·취소·백프레셔 책임을 설명한다."
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/io_uring.7.html"
    title: "io_uring(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux io_uring의 submission queue와 completion queue가 operation/result를 연결하는 모델을 확인한다."
    displayOrder: 1
  - url: "https://tech.kakao.com/posts/680"
    title: "실시간 메시징 시스템 개발기 - 성능 개선 레슨런"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "실시간 messaging server에서 io_uring 도입을 검토하며 syscall/context-switch 비용과 실제 성능을 평가한 사례를 확인한다."
    displayOrder: 2
---
# 비동기 입출력(Asynchronous I/O)

비동기 I/O는 호출자가 I/O 연산을 먼저 제출하고 그 자리에서 완료를 기다리지 않은 뒤, **나중에 그 연산의 완료 결과를 받는 모델**이다. 준비 알림(readiness)이 "지금 I/O를 시도할 수 있다"는 상태를 알려주는 것이라면, 완료 통지(completion)는 "앞서 제출한 이 연산이 이런 결과로 끝났다"는 사건을 알려준다.

Linux의 `io_uring`을 예로 들면 사용자 공간은 제출 큐(submission queue)를 통해 연산을 제출하고, 커널은 처리 결과를 완료 큐(completion queue)로 돌려준다. `io_uring`이 모든 운영체제의 표준이라는 뜻은 아니지만 **연산 제출과 완료 결과 수집을 분리해 이해하기 좋은 사례**다.

### 제출과 완료 사이에도 관리해야 할 상태가 있다

비동기 읽기를 제출할 때는 파일 오프셋, 목적지 버퍼, 연산을 식별할 토큰 같은 정보가 필요할 수 있다. 완료 통지가 오기 전까지 이 상태와 관련 자원의 생명주기를 안전하게 유지해야 한다. API에 따라 커널이나 런타임이 버퍼를 직접 참조할 수 있으므로 **제출 직후 그 버퍼를 자유롭게 재사용해도 된다고 일반화하면 안 된다.**

완료 결과도 성공한 바이트 수, EOF, 오류, 취소 여부를 구분해야 한다. 읽기 연산 하나가 완료되었다고 애플리케이션 수준의 메시지 전체가 완성되었다는 뜻은 아니다.

### 논블로킹 I/O와는 다르다

논블로킹 I/O에서는 지금 진행할 수 없으면 즉시 반환하고 호출자가 나중에 다시 `read()`나 `write()`를 시도한다. 반면 완료 기반 비동기 I/O에서는 **연산을 먼저 제출하고, 그 연산의 결과를 나중에 받는다.**

```text
준비 알림 / 논블로킹
준비됨 → 애플리케이션이 read() 호출 → 결과 처리

완료 기반 비동기 I/O
read 제출 → 다른 작업 수행 → 완료 결과 수신
```

### 비동기라고 처리 용량이 무한해지는 것은 아니다

호출 스레드가 블로킹되지 않는다고 장치 처리량과 메모리가 무한해지는 것은 아니다. 제출 속도가 완료 속도보다 계속 빠르면 처리 중인 연산 수, 버퍼 메모리, 장치 큐가 계속 늘어날 수 있다. 따라서 **최대 동시 처리 수(max in-flight), 큐 깊이, 타임아웃, 취소 정책 같은 제한**이 필요하다.

취소도 별도의 상태 전이다. 애플리케이션이 더 이상 결과를 원하지 않는 것과 이미 시작된 실제 I/O가 중단된 것은 같은 사건이 아닐 수 있다. 비동기 I/O의 핵심은 **기다림 자체를 없애는 것이 아니라, 연산의 제출과 완료를 분리하고 그 사이의 상태·자원·생명주기를 명시적으로 관리하는 것**이다.
