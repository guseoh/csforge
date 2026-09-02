---
kind: concept
contentKey: operating-systems.core.kernel-boundary.interrupt-exception-system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: interrupt-exception-system-call
title: "Interrupt, Exception and System Call"
summary: "비동기 interrupt, 현재 instruction과 연관된 exception, 의도적인 system-call request의 관계를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/intro.html"
    title: "RISC-V Unprivileged ISA: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ISA가 정의하는 software-visible architecture와 구현 선택의 경계를 확인한다."
    displayOrder: 1
---
# Interrupt, Exception and System Call

Kernel mode로 control이 넘어가는 원인을 모두 “interrupt”라고 부르면 중요한 차이를 놓치게 된다. **외부에서 비동기적으로 도착한 사건**, **현재 instruction 실행과 직접 연관된 동기적 사건**, **application이 의도적으로 OS service를 요청한 사건**은 발생 원인과 처리 후 복귀 의미가 다르다.

Architecture마다 세부 용어와 entry mechanism은 조금씩 다를 수 있다. 여기서는 관계를 명확히 하기 위해 RISC-V의 terminology를 concrete model로 사용한다. RISC-V는 현재 hart의 instruction과 관련해 발생하는 unusual condition을 **exception**, 외부 asynchronous event를 **interrupt**, exception 또는 interrupt 때문에 handler로 control이 전달되는 사건을 **trap**이라고 정의한다.

```text
                 Trap
              /        \
     synchronous       asynchronous
      exception          interrupt
          │
          ├─ page/access/illegal instruction 등
          │
          └─ ECALL 같은 requested exception
                 │
                 └─ Unix-like 환경에서 system call에 사용 가능
```

따라서 RISC-V 문맥에서 `trap`은 interrupt/exception과 나란히 놓이는 세 번째 원인 종류가 아니다. **Exception 또는 interrupt가 발생해 trap handler로 control이 넘어가는 것**을 가리킨다.

### Interrupt: 현재 instruction과 독립적으로 도착할 수 있는 사건

Timer나 external device 같은 source는 CPU가 현재 어떤 application instruction을 실행 중인지와 별개로 interrupt를 발생시킬 수 있다. 이런 사건은 비동기적이다. Timer interrupt는 scheduler가 CPU 시간을 다시 평가할 기회를 만들 수 있고, device interrupt는 I/O 관련 event가 발생했음을 kernel에 알릴 수 있다.

Interrupt가 왔다고 해서 application이 명시적으로 요청한 것은 아니다. 그래서 handler는 interruption 전에 실행하던 context를 보존하고, 필요한 event를 처리한 뒤 기존 execution을 계속할 수 있도록 해야 한다.

### Exception: 현재 instruction 실행과 연결된 동기 사건

Exception은 현재 실행 중인 instruction과 원인 관계가 있다. 잘못된 instruction, 접근 권한 위반, page translation과 관련된 fault, 명시적인 environment call처럼 instruction 실행 때문에 발생하는 사건이 예가 될 수 있다.

“Exception = 항상 프로그램 버그”도 아니다. Demand paging에서는 접근한 virtual page가 아직 resident하지 않아 page fault가 발생해도 OS가 page를 준비한 뒤 execution을 이어갈 수 있다. 반면 illegal instruction처럼 정상 복구가 어려운 exception도 있다. **발생 원인이 동기적이라는 것과 복구 가능 여부는 별개의 축**이다.

### System call: application이 의도적으로 만든 kernel-service request

System call은 application 관점에서 의도적인 요청이다. 하지만 hardware가 별도의 “system-call event category”를 반드시 가져야 한다는 뜻은 아니다. Architecture가 제공하는 synchronous exception/trap mechanism을 이용해 controlled kernel entry를 구현할 수 있다.

RISC-V에서는 `ECALL`이 execution environment에 service를 요청하는 instruction이고, originating privilege mode에 따른 environment-call exception을 발생시킨다. Unix-like OS는 이런 mechanism을 system-call entry로 사용할 수 있다.

즉 다음 층을 구분해야 한다.

```text
Application semantics
"kernel service를 요청한다" = system call
             ↓
OS / ABI
syscall number와 arguments 규칙
             ↓
ISA mechanism
예: RISC-V ECALL → synchronous exception → trap handler
```

### 같은 handler 진입 구조를 써도 처리 의미는 다르다

Interrupt와 exception이 공통 trap-entry infrastructure를 사용할 수 있어도 handler는 cause를 구분해야 한다. Timer interrupt라면 timer source와 scheduling state를 처리하고, page fault라면 faulting address와 access type, mapping 상태를 검사해야 한다. System-call request라면 syscall number와 caller arguments를 해석한다.

복귀 위치도 cause에 따라 달라질 수 있다. 어떤 fault는 원래 instruction을 다시 실행해야 하고, 의도적으로 실행한 system-call instruction은 service가 끝난 뒤 다음 instruction으로 진행하도록 ABI/handler가 state를 조정할 수 있다. 구체적인 saved-PC semantics는 architecture 규칙을 따라야 한다.

### Backend에서 왜 구분해야 하는가

Backend 개발자가 hardware interrupt handler를 직접 작성하는 경우는 드물지만 이 구분은 I/O와 scheduler를 이해하는 기반이다. Network packet arrival이나 timer 같은 비동기 event, application의 명시적 I/O system call, memory access 중 발생하는 page fault는 서로 다른 원인으로 kernel work를 만든다.

그래서 “kernel에 들어갔다”는 사실만으로 latency 원인을 설명하지 않는다. **누가 사건을 발생시켰는지, 현재 instruction과 동기적인지, handler 뒤 원래 실행을 어떻게 이어가는지**를 구분해야 OS 실행 흐름을 정확히 이해할 수 있다.
