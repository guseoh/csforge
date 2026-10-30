---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.superscalar-out-of-order
topicContentKey: computer-architecture.core.pipeline-ilp
slug: superscalar-out-of-order
title: "슈퍼스칼라와 비순차 실행(Superscalar and Out-of-Order Execution)"
summary: "여러 명령어를 동시에 발행하고 준비된 명령어를 먼저 실행하면서도 의존성과 정확한 아키텍처 상태를 보존하는 원리를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://ocw.mit.edu/courses/6-823-computer-system-architecture-fall-2005/resources/l14_superscalar/"
    title: "MIT 6.823: Advanced Superscalar Architectures (Lecture 14)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "out-of-order issue, register renaming, speculative execution과 misprediction recovery를 확인한다."
    displayOrder: 1
    relationNote: "여러 execution unit, rename과 실행 순서 복구의 세부 동작을 보완한다."
---
# 슈퍼스칼라와 비순차 실행(Superscalar and Out-of-Order Execution)

기본적인 single-issue 파이프라인은 여러 명령어의 단계를 겹치더라도 한 주기에 새 명령어 하나만 발행한다. 슈퍼스칼라 CPU는 여러 실행 장치와 더 넓은 front-end를 사용해 **한 주기에 둘 이상의 명령어를 진행시킬 수 있도록** 설계한다.

하지만 실행 장치 수가 많다고 모든 명령어를 동시에 실행할 수 있는 것은 아니다. 앞 명령어의 결과가 뒤 명령어에 필요한 진짜 의존성(true dependency)이 있으면 그 값이 준비될 때까지 기다려야 한다. 실제 성능은 하드웨어가 독립적인 명령어 수준 병렬성(ILP)을 얼마나 찾아 활용할 수 있는지에 달려 있다.

### 비순차 실행은 준비된 명령어를 먼저 실행한다

다음 흐름을 생각해 보자.

```text
A: 오래 걸리는 load
B: A 결과가 필요함
C: A와 독립적인 계산
```

순차 실행에서는 A가 막히면 뒤의 B와 C도 함께 기다릴 수 있다. 비순차 실행 CPU는 C의 피연산자와 실행 장치가 준비되어 있다면 C를 먼저 실행해 A의 대기 시간을 일부 숨길 수 있다.

여기서 중요한 점은 **실행 순서를 바꾸는 것과 프로그램이 관찰하는 결과를 마음대로 바꾸는 것은 다르다**는 것이다.

### 진짜 의존성과 이름 의존성을 구분한다

RAW(Read After Write)는 실제 값의 생산과 소비 관계이므로 보존해야 한다. 반면 WAR와 WAW는 아키텍처 레지스터 이름을 재사용하면서 생기는 이름 의존성이다.

레지스터 이름 바꾸기(register renaming)는 새 물리 레지스터를 할당해 WAR/WAW 같은 거짓 의존성을 제거한다. 그러면 실제 데이터 의존성이 없는 명령어는 같은 레지스터 이름 때문에 불필요하게 기다리지 않아도 된다.

### 실행과 확정을 분리한다

비순차 실행 CPU는 명령어를 서로 다른 순서로 실행할 수 있지만, 아키텍처 상태와 예외는 ISA가 요구하는 의미를 유지해야 한다. 그래서 완료된 결과를 추적하다가 앞선 명령어의 상태가 안전하게 확정되면 프로그램 순서에 맞춰 retire/commit하는 구조를 사용한다.

```text
issue/execute:   A(wait)   C(done)   B(wait)
                         ↓
architectural state: A → B → C 순서의 의미를 보존
```

앞선 명령어에서 예외나 분기 예측 실패가 발견되면 뒤에서 추측적으로 실행한 결과는 아키텍처 상태에 남지 않아야 한다. 이것이 정확한 상태(precise state)를 유지하는 핵심이다.

### 비순차 실행도 의존성과 메모리 지연을 없애지는 못한다

포인터 추적처럼 다음 메모리 주소가 앞선 load 결과에 달려 있으면 독립적으로 실행할 명령어가 부족할 수 있다. 캐시 미스가 오래 걸리더라도 뒤에 준비된 독립 작업이 없다면 넓은 실행 윈도도 지연을 숨길 수 없다.

따라서 슈퍼스칼라 폭과 비순차 실행 윈도를 크게 만드는 것만으로 성능이 비례해서 증가하지는 않는다. 더 많은 명령어를 추적하는 하드웨어 비용과 전력도 커지고, 작업 부하가 실제로 충분한 ILP를 제공해야 이 구조의 이점을 얻을 수 있다.

CPU가 명령어를 비순차로 실행한다는 사실은 Java 같은 언어의 스레드 동기화 규칙을 대체하지 않는다. 하드웨어는 ISA와 언어·런타임이 요구하는 프로그램에서 관찰 가능한 계약을 보존하는 범위에서 내부 실행 순서를 조정한다.
