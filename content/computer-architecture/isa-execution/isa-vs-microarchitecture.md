---
kind: concept
contentKey: computer-architecture.core.isa-execution.isa-vs-microarchitecture
topicContentKey: computer-architecture.core.isa-execution
slug: isa-vs-microarchitecture
title: "ISA와 마이크로아키텍처(ISA and Microarchitecture)"
summary: "소프트웨어가 의존할 수 있는 ISA 계약과 이를 실행하는 마이크로아키텍처 구현을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/intro.html"
    title: "RISC-V Unprivileged ISA: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ISA가 정의하는 software-visible architecture와 구현 선택의 경계를 확인한다."
    displayOrder: 1
---
# ISA와 마이크로아키텍처(ISA and Microarchitecture)

### 프로그램이 의존할 수 있는 계약

ISA(Instruction Set Architecture)는 소프트웨어와 프로세서 사이의 계약 경계다. 어떤 명령어가 존재하는지, 아키텍처 레지스터가 무엇인지, 명령어가 어떤 결과와 예외를 만들어야 하는지처럼 프로그램이 관찰할 수 있는 동작을 정의한다. 컴파일러는 소스 코드를 특정 ISA의 명령어로 변환하고, 운영체제도 권한·예외·메모리와 관련된 아키텍처 계약을 기준으로 CPU를 제어한다.

이 계약이 중요한 이유는 같은 바이너리가 같은 ISA를 구현하는 서로 다른 프로세서에서도 의미를 유지해야 하기 때문이다. 예를 들어 `ADD`가 두 레지스터 값을 더해 목적지 레지스터에 결과를 기록한다는 것은 ISA 수준의 의미다. 반면 그 덧셈이 내부에서 몇 개의 파이프라인 단계를 지나고 어떤 실행 장치에서 처리되는지는 소프트웨어가 일반적으로 의존할 수 없는 구현 세부사항이다.

### 같은 ISA를 서로 다르게 실행할 수 있다

마이크로아키텍처는 ISA의 동작을 실제 하드웨어로 구현하는 방법이다. 파이프라인 깊이, issue 폭, 비순차 실행 윈도, 캐시 계층, 분기 예측기, 실행 장치 수처럼 CPU 내부 구조가 여기에 속한다. 두 CPU가 같은 RISC-V ISA나 x86-64 ISA를 구현하더라도 이러한 구조는 크게 다를 수 있다.

따라서 같은 명령어 열이라도 실행 시간은 달라질 수 있다. 한 CPU에서는 캐시 적중과 높은 분기 예측 정확도 덕분에 빠르게 끝나지만 다른 CPU에서는 더 많은 스톨과 미스를 겪을 수 있다. `명령어 수가 같다 = 실행 시간이 같다`가 아닌 이유다.

반대로 한 CPU에서 관찰한 실행 시간, 캐시 크기, 추측 실행 방식 등을 ISA의 보장처럼 사용하면 이식성이 깨진다. ISA가 정의하는 것은 아키텍처상 결과이지 특정 구현의 cycle-by-cycle 실행 과정이 아니다.

### 정확성과 성능을 다른 층에서 판단한다

정확성을 판단할 때는 ISA 또는 그 위의 언어·런타임 계약을 본다. 성능을 판단할 때는 동일한 ISA 위에서도 실제 마이크로아키텍처와 작업 부하를 측정해야 한다. 예를 들어 특정 명령어 확장을 사용할 수 있는지는 ISA 기능 문제지만, 그 명령어가 기존 명령어 열보다 실제로 빠른지는 해당 프로세서 구현의 문제다.

백엔드에서 네이티브 라이브러리나 JIT 결과를 볼 때도 이 구분이 필요하다. 배포 CPU가 필요한 ISA 확장을 지원하는지 먼저 확인하고, 성능은 실제 대상 장비의 캐시·파이프라인·메모리 동작까지 포함해 측정한다. 특정 CPU에서 빠르게 측정됐다는 사실을 다른 CPU에서도 성립하는 정확성 계약으로 기록하지 않는다.
