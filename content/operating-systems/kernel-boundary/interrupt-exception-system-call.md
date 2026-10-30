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

커널 처리기로 제어가 넘어간다는 공통점 때문에 인터럽트, 예외, 시스템 콜을 같은 종류의 사건으로 생각하기 쉽다. 하지만 세 가지는 **무엇이 발생 원인인지와 현재 명령어 실행에 어떤 관계가 있는지**를 구분해야 한다.

### 인터럽트는 현재 명령어와 직접 연결되지 않은 비동기 사건이다

타이머 만료나 장치 작업 완료는 현재 CPU가 실행 중인 명령어 자체와 무관하게 도착할 수 있다. 이런 외부 사건이 CPU에 전달되는 것이 **인터럽트(interrupt)**다.

```text
장치 / 타이머 ── 비동기 ──> 인터럽트
```

### 예외는 현재 명령어 실행과 연결된 동기 사건이다

잘못된 명령어를 실행하거나 허용되지 않은 메모리에 접근하는 등, 현재 명령어를 처리하는 과정에서 발견된 조건은 **예외(exception)**로 분류할 수 있다. 발생 원인이 현재 명령어와 동기적이라는 뜻이지 반드시 복구할 수 없는 프로그램 오류라는 뜻은 아니다.

예를 들어 페이지 폴트(page fault)는 필요한 페이지가 아직 준비되지 않았다는 상태를 나타낼 수 있다. 운영체제가 필요한 매핑이나 페이지를 준비한 뒤 폴트가 발생한 명령어를 다시 실행해 정상적으로 이어 갈 수도 있다.

### 시스템 콜은 애플리케이션 관점의 의도적인 서비스 요청이다

시스템 콜은 애플리케이션이 커널 서비스를 요청한다는 **운영체제 인터페이스의 의미**다. 하드웨어에 `system call`이라는 별도의 세 번째 사건 종류가 반드시 존재해야 하는 것은 아니다.

예를 들어 RISC-V에서는 `ECALL` 명령이 환경 호출 예외(environment-call exception)를 발생시키고, 운영체제는 이 트랩 진입을 시스템 콜 요청을 처리하는 경계로 사용할 수 있다.

```text
애플리케이션의 의도
시스템 콜 요청
      ↓
운영체제 / ABI
시스템 콜 번호 + 인자
      ↓
ISA 메커니즘
예: ECALL → 동기 예외 → 트랩 처리기
```

### 같은 커널 진입 기반을 사용해도 처리 의미는 다르다

인터럽트라면 외부 사건의 발생원을 확인하고, 페이지 폴트라면 폴트가 난 주소와 매핑 상태를 확인하며, 시스템 콜이라면 호출자가 요청한 서비스와 인자를 해석한다.

복귀 방식도 원인에 따라 달라질 수 있다. 복구 가능한 폴트라면 원래 명령어를 다시 시도할 수 있고, 시스템 콜은 서비스가 끝난 뒤 호출 결과를 전달하고 사용자 코드 실행을 이어 간다.

정리하면 **인터럽트와 예외는 하드웨어·ISA 관점에서 커널 진입을 일으키는 사건의 원인을 설명하고, 시스템 콜은 애플리케이션이 커널 서비스를 요청한다는 운영체제 인터페이스의 의미를 설명한다.** 이 층위를 분리하면 커널 진입 흐름을 더 정확하게 이해할 수 있다.