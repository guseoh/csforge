---
kind: concept
contentKey: computer-architecture.core.isa-execution.registers
topicContentKey: computer-architecture.core.isa-execution
slug: registers
title: "레지스터(Registers)"
summary: "명령어가 직접 읽고 쓰는 아키텍처 레지스터와 메모리의 역할을 구분하고 load/store가 둘을 연결하는 흐름을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.riscv.org/reference/abi/v1.0/riscv-cc-register-convention.html"
    title: "RISC-V ABI: Register Convention"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RISC-V integer register 역할과 caller/callee 보존 규칙을 확인한다."
    displayOrder: 1
---
# 레지스터(Registers)

레지스터는 명령어가 직접 이름을 지정해 읽고 쓸 수 있는 CPU의 작은 아키텍처 상태다. 산술 피연산자와 중간 결과를 담는 범용 레지스터가 있고, PC처럼 제어 흐름을 나타내는 특별한 레지스터도 있다.

레지스터와 메모리는 역할이 다르다. 메모리는 훨씬 큰 데이터를 저장할 수 있지만 산술 명령어가 메모리 전체를 직접 다루는 것은 아니다. Load/store 아키텍처를 단순화해서 보면 필요한 값을 메모리에서 레지스터로 가져온 뒤 계산하고, 결과를 다시 메모리에 저장한다.

```text
memory[address]
      │ load
      ▼
   register
      │ arithmetic
      ▼
   register
      │ store
      ▼
memory[address2]
```

레지스터는 캐시와도 같은 개념이 아니다. 캐시는 메모리 블록의 복사본을 하드웨어가 자동으로 관리하는 계층이고, 아키텍처 레지스터는 명령어 의미에 직접 등장하는 프로그램에서 관찰 가능한 상태다.

레지스터 수는 제한되어 있다. 동시에 필요한 값이 많으면 컴파일러는 일부 값을 메모리의 스택 슬롯 등에 임시로 저장했다가 다시 가져올 수 있는데, 이를 spill이라고 부른다. 그래서 레지스터에 오래 머무는 값과 반복되는 load/store는 실제 실행 비용에 영향을 줄 수 있다.

함수 호출에서는 레지스터에 추가 의미가 붙을 수 있다. 예를 들어 인자를 어떤 레지스터에 전달하고 어떤 레지스터를 호출 전후에 보존할지는 ISA 자체가 아니라 보통 ABI/호출 규약이 정한다. 이 세부 규칙은 뒤의 기계 수준 함수 호출에서 다룬다.

핵심은 **레지스터는 CPU가 명령어 수준에서 직접 다루는 작은 상태이고, 메모리와 레지스터 사이의 이동 자체가 실행 흐름의 일부**라는 점이다.
