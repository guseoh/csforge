---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-exception-trap
topicContentKey: computer-architecture.core.device-io
slug: interrupt-exception-trap
title: "인터럽트·예외와 트랩(Interrupt, Exception and Trap)"
summary: "인터럽트와 예외의 발생 원인을 구분하고 둘이 트랩 진입을 통해 핸들러로 제어를 넘기는 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.riscv.org/reference/isa/v20240411/unpriv/intro.html"
    title: "RISC-V Unprivileged ISA: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "exception·interrupt의 원인과 trap handler로의 transfer 관계를 확인한다."
    displayOrder: 1
---
# 인터럽트·예외와 트랩(Interrupt, Exception and Trap)

CPU가 현재 명령어 흐름을 실행하던 중 다른 핸들러로 제어를 넘겨야 하는 사건이 생길 수 있다. 이때 원인이 현재 명령어 바깥에서 비동기적으로 들어왔는지, 현재 명령어 실행 자체에서 발생했는지 먼저 구분하면 인터럽트와 예외를 이해하기 쉽다.

### 인터럽트는 외부에서 비동기적으로 들어온다

타이머 만료나 장치 완료처럼 현재 실행 중인 명령어와 직접 관계없이 발생하는 이벤트를 인터럽트라고 한다. CPU는 아키텍처가 정한 조건과 시점에 인터럽트를 받아 핸들러로 제어를 옮긴다.

```text
CPU executing instructions
          │
          └── device/timer event ──> interrupt pending
```

### 예외는 현재 명령어와 연결된다

잘못된 명령어, 주소 변환 오류, 권한 오류처럼 현재 명령어를 처리하는 과정에서 발생한 조건은 예외로 분류할 수 있다. 소프트웨어가 명시적으로 트랩을 요청하는 명령어도 아키텍처에 따라 예외 범주에 포함될 수 있다.

### 트랩은 원인 이름이 아니라 핸들러로 들어가는 제어 이전이다

인터럽트와 예외를 `interrupt / exception / trap`이라는 세 개의 동급 원인으로 외우면 경계가 흐려진다. RISC-V 문맥에서는 인터럽트나 예외가 발생해 트랩 핸들러로 제어가 전달되는 사건을 트랩이라고 설명할 수 있다.

```text
asynchronous interrupt ─┐
                        ├─> trap entry ─> handler
synchronous exception ──┘
```

트랩 진입에서는 원인과 재개에 필요한 PC 같은 아키텍처 상태가 보존된다. 이후 핸들러가 원인을 처리하고 원래 실행을 재개할지 종료할지는 예외 종류와 OS 정책에 따라 달라진다.

정확히 어느 명령어에서 재개하는지, 어떤 권한 수준로 진입하는지, 어떤 상태를 하드웨어가 자동 보존하는지는 ISA와 privileged architecture의 규칙을 따라야 한다. 다음 Concept에서는 이 핸들러 진입의 상태 변화를 더 구체적으로 본다.
