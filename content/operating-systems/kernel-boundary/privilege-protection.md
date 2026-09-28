---
kind: concept
contentKey: operating-systems.core.kernel-boundary.privilege-protection
topicContentKey: operating-systems.core.kernel-boundary
slug: privilege-protection
title: "특권과 보호(Privilege and Protection)"
summary: "CPU 권한 수준과 메모리 접근 권한이 낮은 권한의 실행 주체가 커널과 다른 프로세스의 자원을 침범하지 못하게 하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.riscv.org/reference/isa/priv/priv-intro.html"
    title: "RISC-V Privileged Architecture: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RISC-V에서 권한 수준별 실행 환경과 허용되지 않은 동작이 예외를 일으키는 보호 구조를 확인한다."
    relationNote: "이 Concept에서는 CPU 권한과 보호된 상태 접근이 운영체제의 강제 가능한 보호 경계를 만드는 기반을 확인한다."
    displayOrder: 1
---
# 특권과 보호(Privilege and Protection)

사용자 모드와 커널 모드가 실제 보호 경계가 되려면 낮은 권한의 코드가 금지된 연산을 시도했을 때 CPU와 메모리 관리 장치가 이를 막을 수 있어야 한다.

CPU의 권한 수준은 현재 모드에서 실행할 수 있는 **특권 명령어(privileged instruction)**와 제어 상태 접근을 제한한다. 메모리 보호는 페이지 매핑과 접근 권한을 통해 어떤 가상 주소를 읽고·쓰고·실행할 수 있는지 제한한다.

```text
현재 권한 수준
      │
      ├─ 명령어 실행 허용 여부
      └─ 메모리 R/W/X 허용 여부
               │
               ├─ 허용 → 실행
               └─ 거부 → fault / exception
```

### 명령어 특권과 메모리 접근 권한은 서로 다른 보호 축이다

특권 명령어를 제한한다고 프로세스의 메모리 격리가 자동으로 완성되는 것은 아니다. 사용자 프로세스가 다른 프로세스나 커널 메모리를 읽지 못하게 하려면 주소 공간 매핑과 페이지 접근 권한도 함께 필요하다.

반대로 가상 주소가 매핑되어 있다고 해서 현재 접근 방식이 모두 허용되는 것도 아니다. 읽기 전용 페이지에 저장하거나 실행 권한이 없는 매핑에서 명령어를 가져오려고 하면 fault가 발생할 수 있다.

### 커널에 진입한 뒤에도 사용자 입력은 신뢰할 수 없다

시스템 콜로 커널 모드에 들어왔다고 사용자가 넘긴 포인터, 길이, 플래그가 안전해지는 것은 아니다. 커널은 높은 권한으로 동작하기 때문에 오히려 낮은 권한에서 전달된 인자를 검증해야 한다.

예를 들어 사용자 버퍼를 읽는 시스템 콜은 해당 주소 범위가 호출자의 주소 공간에서 접근 가능한지 확인해야 한다. 잘못된 사용자 포인터를 커널 포인터처럼 사용하면 보호 경계 자체가 무너질 수 있다.

특권과 보호의 핵심은 커널이 단순히 `더 강한 코드`라는 데 있지 않다. **하드웨어가 권한 수준과 메모리 접근을 제한하고, 커널이 그 위에서 검증된 자원 정책을 집행하도록 강제 가능한 경계를 만드는 것**이다.
