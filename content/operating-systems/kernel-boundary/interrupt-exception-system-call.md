---
kind: concept
contentKey: operating-systems.core.kernel-boundary.interrupt-exception-system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: interrupt-exception-system-call
title: "인터럽트·예외·시스템 콜(Interrupt, Exception, and System Call)"
summary: "비동기 인터럽트, 현재 명령어 실행과 연결된 예외, 애플리케이션이 의도적으로 만든 시스템 콜 요청을 발생 원인과 복귀 의미로 구분한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.riscv.org/reference/isa/_attachments/riscv-privileged.pdf"
    title: "RISC-V Privileged ISA"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ECALL, exception, interrupt, trap의 ISA 정의와 권한 경계를 확인한다."
    displayOrder: 1
---
# 인터럽트·예외·시스템 콜(Interrupt, Exception, and System Call)

커널 처리기로 제어가 넘어간다는 공통점 때문에 인터럽트, 예외, 시스템 콜을 같은 사건으로 부르기 쉽다. 하지만 세 가지는 **누가 발생시켰는지와 현재 명령어 실행과 어떤 관계가 있는지**가 다르다.

### 인터럽트는 비동기적인 외부 사건이다

타이머나 장치 작업 완료는 현재 실행 중인 명령어 자체와 무관하게 발생할 수 있다. 이런 외부 사건이 CPU에 전달되는 것이 **인터럽트(interrupt)**다.

```text
장치 / 타이머 ── 비동기 ──> 인터럽트
```

### 예외는 현재 명령어 실행과 연결된다

잘못된 명령어, 메모리 접근 fault처럼 현재 명령어를 처리하다 발견된 조건은 **예외(exception)**다. 발생 원인이 동기적이라는 뜻이지 반드시 프로그램 버그라는 뜻은 아니다. 페이지 폴트처럼 운영체제가 필요한 상태를 준비한 뒤 원래 명령어를 다시 실행할 수 있는 경우도 있다.

### 시스템 콜은 애플리케이션 관점의 의도적인 서비스 요청이다

시스템 콜은 애플리케이션이 커널 서비스를 요청한다는 운영체제/API 의미다. 하드웨어에 `system call이라는 별도의 세 번째 사건 종류`가 반드시 존재해야 하는 것은 아니다.

예를 들어 RISC-V에서는 `ECALL`이 동기 예외를 일으키고, 운영체제가 이 trap 진입을 시스템 콜 경계로 사용할 수 있다.

```text
애플리케이션의 의도
시스템 콜 요청
      ↓
운영체제 / ABI
시스템 콜 번호 + 인자
      ↓
ISA 메커니즘
예: ECALL → exception → trap handler
```

### 같은 처리 기반을 사용해도 의미는 다르다

인터럽트라면 외부 사건의 발생원을 확인하고, 페이지 폴트라면 fault가 난 주소와 매핑 상태를 확인하며, 시스템 콜이라면 호출자가 요청한 서비스와 인자를 해석한다.

복귀 방식도 원인에 따라 다를 수 있다. Fault는 원래 명령어를 재시도할 수 있고, 시스템 콜은 서비스가 끝난 뒤 다음 명령어로 진행할 수 있다.

정리하면 `interrupt/exception`은 하드웨어·ISA 관점의 사건 원인을 설명하고, `system call`은 애플리케이션이 커널 서비스를 요청한다는 운영체제 인터페이스의 의미다. 이 층위를 분리하면 커널 진입 흐름을 더 정확하게 이해할 수 있다.
