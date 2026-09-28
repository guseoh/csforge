---
kind: concept
contentKey: computer-architecture.core.isa-execution.addressing-modes
topicContentKey: computer-architecture.core.isa-execution
slug: addressing-modes
title: "주소 지정 방식(Addressing Modes)"
summary: "명령어가 immediate·레지스터·base plus offset 같은 방식으로 피연산자나 유효 주소를 만드는 원리를 대상 ISA의 실제 인코딩과 구분해 이해한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/rv32.html"
    title: "RV32I Base Integer Instruction Set"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RV32I instruction formats, registers, load/store와 control-transfer encoding을 확인한다."
    displayOrder: 1
---
# 주소 지정 방식(Addressing Modes)

명령어는 연산 종류뿐 아니라 **피연산자를 어디에서 가져올지**도 정해야 한다. 주소 지정 방식은 명령어가 값 자체나 메모리에 접근할 유효 주소(effective address)를 어떻게 얻는지를 설명하는 개념이다.

가장 단순한 경우는 명령어 안의 상수를 바로 사용하는 immediate와 레지스터 값을 피연산자로 사용하는 방식이다.

```text
immediate → instruction 내부 상수
register  → register file의 값
```

메모리에 접근할 때는 레지스터와 작은 오프셋을 조합하는 방식이 자주 사용된다. RISC-V RV32I의 load/store를 예로 들면 유효 주소는 base register와 부호 확장한 immediate를 더해 계산한다.

```text
effective address = register[rs1] + offset
```

예를 들어 base register가 `0x1000`, offset이 12라면 접근할 주소는 `0x100C`다. 객체나 구조체의 시작 주소에서 고정된 필드 위치로 이동하는 상황을 이런 형태로 표현할 수 있다.

더 복잡한 주소 계산은 명령어 하나에 모두 들어가지 않을 수도 있다. 배열의 `base + index × elementSize` 같은 주소는 먼저 산술 명령어로 계산한 뒤 그 결과 레지스터를 load/store의 base로 사용할 수 있다.

여기서 중요한 점은 교재에서 말하는 `immediate`, `indirect`, `indexed` 같은 분류와 **특정 ISA가 실제로 제공하는 명령어 인코딩을 같은 것으로 보지 않는 것**이다. 고수준 코드의 포인터 역참조 하나가 기계 수준에서는 여러 load 명령어로 나뉠 수도 있다.

또한 유효 주소 계산에 성공했다고 실제 메모리 접근이 성공하는 것은 아니다. 주소 변환, 정렬, 접근 권한 같은 조건은 이후 메모리 시스템이 별도로 확인한다.

주소 지정 방식의 핵심은 **명령어의 제한된 필드와 레지스터 상태를 사용해 피연산자와 메모리 위치를 어떻게 지정하는가**다.
