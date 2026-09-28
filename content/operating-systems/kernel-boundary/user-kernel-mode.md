---
kind: concept
contentKey: operating-systems.core.kernel-boundary.user-kernel-mode
topicContentKey: operating-systems.core.kernel-boundary
slug: user-kernel-mode
title: "사용자 모드와 커널 모드(User and Kernel Modes)"
summary: "CPU의 권한 수준을 나누어 애플리케이션의 직접적인 하드웨어 접근을 제한하고 커널 서비스를 보호하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.riscv.org/reference/isa/priv/priv-intro.html"
    title: "RISC-V Privileged Architecture: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RISC-V에서 권한 수준별 실행 환경과 허용되지 않은 동작이 예외를 일으키는 보호 구조를 확인한다."
    relationNote: "이 Concept에서는 사용자 코드와 운영체제 커널 사이에 CPU 권한 경계를 두는 이유를 확인한다."
    displayOrder: 1
---
# 사용자 모드와 커널 모드(User and Kernel Modes)

운영체제가 프로세스를 서로 격리하려면 `애플리케이션은 다른 프로세스의 메모리를 읽지 말아야 한다`는 규칙만으로는 부족하다. 버그가 있거나 악의적인 코드가 규칙을 무시해도 하드웨어가 금지된 동작을 막을 수 있어야 한다.

그래서 CPU는 실행 권한 수준(privilege level)을 나눈다. 일반 애플리케이션은 낮은 권한의 **사용자 모드(user mode)**에서 실행하고, 커널은 더 높은 권한의 **커널 모드(kernel mode)**에서 실행한다.

```text
사용자 모드
  애플리케이션 코드
      │
      │ 통제된 진입 경로
      ▼
커널 모드
  자원 관리 / 장치 드라이버 / 보호
```

### 사용자 모드는 제한된 권한으로 실행된다

사용자 프로세스는 일반 계산과 자신의 가상 주소 공간 접근을 수행할 수 있지만 페이지 테이블, 특권 제어 상태, 장치 레지스터처럼 시스템 전체에 영향을 줄 수 있는 자원을 임의로 변경할 수는 없다.

필요한 커널 서비스가 있다면 시스템 콜처럼 아키텍처와 운영체제가 정한 진입 경로를 사용해야 한다. 애플리케이션이 원하는 커널 주소로 단순히 점프한다고 더 높은 권한을 얻는 구조가 아니다.

### 커널 모드에 들어가는 원인은 하나가 아니다

시스템 콜은 애플리케이션이 의도적으로 커널 서비스를 요청하는 경로다. 현재 명령어를 실행하다 예외(exception)가 발생하거나 장치·타이머 인터럽트가 도착했을 때도 처리기를 실행하기 위해 더 높은 권한으로 제어가 넘어갈 수 있다.

이 원인들은 서로 다르지만 공통적으로 프로세서가 정의된 진입 메커니즘과 처리에 필요한 상태를 사용한다.

### 모드 전환과 문맥 전환은 다르다

같은 스레드가 시스템 콜을 처리하려고 사용자 모드에서 커널 모드로 들어갔다가 바로 돌아오면 권한 수준은 바뀌었지만 실행 주체가 다른 작업으로 교체된 것은 아닐 수 있다.

반면 **문맥 전환(context switch)**은 스케줄러가 다른 작업을 선택해 레지스터와 실행 문맥을 바꾸는 사건이다.

```text
모드 전환   → 권한 경계 변화
문맥 전환   → 실행 작업 변화
```

시스템 콜이 대기 상태로 들어가면 그 결과 문맥 전환이 뒤따를 수 있지만, 두 사건 자체는 같은 개념이 아니다.
