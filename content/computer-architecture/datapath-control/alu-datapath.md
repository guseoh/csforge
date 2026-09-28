---
kind: concept
contentKey: computer-architecture.core.datapath-control.alu-datapath
topicContentKey: computer-architecture.core.datapath-control
slug: alu-datapath
title: "ALU와 데이터패스(ALU and Datapath)"
summary: "레지스터에서 읽은 값이 ALU·메모리 인터페이스·멀티플렉서를 지나 결과 상태로 기록되는 데이터패스를 명령어별로 추적한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf"
    title: "Computer Organization: Datapath"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register와 combinational datapath 사이의 timing 관계를 확인한다."
    displayOrder: 1
---
# ALU와 데이터패스(ALU and Datapath)

ISA가 `ADD`, `LOAD`, `STORE` 같은 명령어의 의미를 정의했다면 CPU 내부에는 그 의미를 실제 값의 이동으로 구현하는 경로가 필요하다. **데이터패스(datapath)** 는 레지스터, ALU, 멀티플렉서, 메모리 인터페이스처럼 데이터가 이동하고 변환되는 하드웨어 경로다.

ALU(Arithmetic Logic Unit)는 덧셈·뺄셈·논리 연산·비교 같은 계산을 수행한다. 하지만 CPU 전체가 ALU 하나로 이루어진 것은 아니다. ALU는 데이터패스의 한 구성 요소이고, 피연산자를 고르는 멀티플렉서와 값을 저장하는 레지스터 같은 요소가 함께 동작해야 명령어 하나의 결과가 만들어진다.

레지스터끼리 더하는 명령은 다음처럼 단순화할 수 있다.

```text
register rs1 ─┐
              ├─▶ ALU(add) ─▶ result ─▶ register rd
register rs2 ─┘
```

Load 명령에서는 같은 ALU가 최종 데이터가 아니라 메모리 주소를 계산하는 데 사용될 수 있다.

```text
base register ─┐
               ├─▶ ALU(add) ─▶ address ─▶ memory ─▶ register rd
immediate ─────┘
```

즉 같은 하드웨어 구성 요소를 여러 명령어가 공유하되 **어떤 값을 입력으로 선택하고 결과를 어디에 기록할지**가 달라진다. 이 선택을 다음 Concept의 제어 장치가 담당한다.

데이터패스 안에서도 계산하는 부분과 값을 기억하는 부분을 구분해야 한다. ALU와 멀티플렉서 같은 조합 논리는 현재 입력에 따라 출력을 만들고, 레지스터와 PC 같은 상태 요소는 클록을 기준으로 값을 보존한다.

데이터패스를 이해하는 핵심은 명령어 이름을 외우는 것이 아니라 **어떤 상태에서 값이 출발해 어떤 계산을 거쳐 어느 상태를 바꾸는지 경로를 그릴 수 있는 것**이다.
