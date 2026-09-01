---
kind: concept
contentKey: operating-systems.core.kernel-boundary.privilege-protection
topicContentKey: operating-systems.core.kernel-boundary
slug: privilege-protection
title: "Privilege and Protection"
summary: "CPU privilege와 memory permission이 kernel의 보호 정책을 어떻게 강제하는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.riscv.org/reference/isa/priv/priv-intro.html"
    title: "RISC-V Privileged Architecture: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "privilege level이 software stack 사이의 protection을 제공하고 허용되지 않은 동작이 exception을 일으키는 구조를 확인한다."
    displayOrder: 1
---
# Privilege and Protection

User/kernel mode가 실제 보호 경계가 되려면 “application은 하지 말아야 한다”는 규칙만 있어서는 안 된다. 악성 코드나 버그가 그 규칙을 무시하더라도 **CPU와 memory-management hardware가 금지된 동작을 실행하지 못하게 강제**해야 한다.

CPU architecture는 현재 privilege level에서 허용되는 instruction과 control state 접근을 제한한다. 예를 들어 RISC-V에서는 hart가 U/S/M 같은 privilege mode 중 하나에서 실행되고, 현재 mode에서 허용되지 않은 privileged operation을 시도하면 exception을 통해 더 높은 privilege의 handler로 control이 넘어갈 수 있다. 이것은 특정 Linux 함수의 정책이 아니라 ISA가 제공하는 protection mechanism의 예다.

### Instruction privilege와 memory protection은 별개 축이다

Privileged instruction을 제한한다고 해서 memory isolation이 자동으로 끝나는 것은 아니다. Process가 어떤 virtual address를 read/write/execute할 수 있는지도 page-table permission과 address-space mapping 같은 별도의 mechanism으로 제한해야 한다.

```text
현재 CPU privilege
      │
      ├─ 이 instruction을 실행할 권한이 있는가?
      │
      └─ 이 virtual address에 R/W/X 접근할 권한이 있는가?
                         │
                         ▼
                 허용 또는 fault/exception
```

따라서 “주소가 존재한다”와 “그 주소를 지금 이 방식으로 접근할 수 있다”는 다른 질문이다. Executable code page를 write할 수 없게 하거나 read-only mapping에 store를 막는 것처럼 read/write/execute permission을 구분할 수 있다. 구체적인 PTE bit 이름과 의미는 architecture마다 다르므로 `present`, `valid`, `accessed` 같은 특정 bit를 모든 시스템의 공통 보장처럼 일반화하지 않는다.

### Kernel도 user input을 신뢰하지 않는다

System call을 통해 kernel mode로 들어왔다고 해서 user가 넘긴 pointer와 length가 자동으로 안전해지는 것은 아니다. Kernel은 caller의 address space에서 해당 memory를 읽거나 쓸 수 있는지 검증하고, length 계산 overflow나 잘못된 범위를 처리해야 한다.

예를 들어 application이 `buffer address + length`를 kernel에 전달한다고 하자. Kernel이 length를 그대로 신뢰해 자신의 memory까지 접근한다면 user/kernel boundary 자체가 공격 경로가 된다. 그래서 kernel interface에서 user memory는 신뢰 경계 밖의 입력으로 취급한다.

또한 validation과 실제 사용 사이에 user memory가 바뀔 수 있는 경우처럼 concurrency/TOCTOU 문제도 별도의 설계 대상이 된다. 중요한 원리는 “kernel mode이므로 안전하다”가 아니라 **높은 privilege를 가진 코드일수록 낮은 privilege에서 넘어온 state를 더 엄격히 검증해야 한다**는 것이다.

### OS permission과 application authorization은 다른 층이다

Backend에서 `ADMIN` 권한을 가진 사용자가 있다고 해서 Linux file permission을 우회할 수 있는 것은 아니다. 반대로 Linux process user가 파일을 읽을 수 있다고 해서 해당 HTTP 사용자가 application business policy상 그 파일을 조회할 권한이 있는 것도 아니다.

```text
Application authorization
사용자/role/domain policy
          ↓ 별도 경계
OS protection
UID/GID, process address space, file permission, capabilities
          ↓
CPU / MMU protection
privilege mode, address permission
```

장애나 보안 문제를 분석할 때 이 층들을 합쳐서 “권한 문제”라고만 부르면 원인을 놓치기 쉽다. Privilege and Protection의 핵심은 CPU의 특권 수준, memory 접근 권한, kernel의 validation이 함께 작동해 **낮은 권한의 실행 주체가 시스템 전체 state를 임의로 변경하지 못하게 하는 것**이다.
