---
kind: concept
contentKey: operating-systems.core.kernel-boundary.privilege-protection
topicContentKey: operating-systems.core.kernel-boundary
slug: privilege-protection
title: "Privilege와 Protection"
summary: "CPU privilege와 memory permission이 낮은 권한의 실행 주체가 kernel과 다른 process 자원을 침범하지 못하게 하는 방식을 설명한다."
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
# Privilege와 Protection

User/kernel mode가 실제 보호 경계가 되려면 낮은 권한의 code가 금지된 operation을 시도했을 때 CPU와 MMU가 이를 막을 수 있어야 한다.

CPU privilege는 현재 mode에서 실행할 수 있는 privileged instruction과 control state 접근을 제한한다. Memory protection은 page mapping과 permission을 통해 어떤 virtual address를 read/write/execute할 수 있는지 제한한다.

```text
current privilege
      │
      ├─ instruction 허용 여부
      └─ memory R/W/X 허용 여부
               │
               ├─ allowed → 실행
               └─ denied  → fault / exception
```

### Instruction privilege와 memory permission은 다른 보호 축이다

Privileged instruction을 제한한다고 process memory isolation이 자동으로 완성되는 것은 아니다. User process가 다른 process나 kernel memory를 읽지 못하게 하려면 address-space mapping과 permission도 함께 필요하다.

반대로 virtual address가 mapping되어 있다고 해도 현재 access type이 허용된다는 뜻은 아니다. Read-only page에 store하거나 executable permission이 없는 mapping에서 instruction을 fetch하려 하면 fault가 발생할 수 있다.

### Kernel entry 이후에도 user input은 신뢰할 수 없다

System call로 kernel mode에 들어왔다고 user가 넘긴 pointer, length와 flag가 안전해지는 것은 아니다. Kernel은 높은 privilege로 동작하기 때문에 오히려 낮은 privilege에서 전달된 argument를 검증해야 한다.

예를 들어 user buffer를 읽는 system call은 해당 address range가 caller의 address space에서 접근 가능한지 확인해야 한다. 잘못된 pointer를 kernel pointer처럼 사용하면 protection boundary 자체가 무너질 수 있다.

Privilege와 protection의 핵심은 kernel이 단순히 `더 강한 code`라는 데 있지 않다. **Hardware가 privilege와 memory access를 제한하고, kernel이 그 위에서 검증된 resource policy를 집행하도록 경계를 만드는 것**이다.
