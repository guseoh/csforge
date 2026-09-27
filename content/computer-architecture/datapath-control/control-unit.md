---
kind: concept
contentKey: computer-architecture.core.datapath-control.control-unit
topicContentKey: computer-architecture.core.datapath-control
slug: control-unit
title: "제어 장치(Control Unit)"
summary: "명령어 해독 결과가 ALU 연산·피연산자 선택·메모리 접근·레지스터 쓰기·다음 PC 선택 신호로 이어지는 흐름을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf"
    title: "Computer Organization: Datapath"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register와 combinational datapath 사이의 timing 관계를 확인한다."
    relationNote: "명령어 해독이 ALU 연산, 메모리 접근, 레지스터 쓰기와 멀티플렉서 제어 신호로 이어지는 부분을 확인한다."
    displayOrder: 1
---
# 제어 장치(Control Unit)

데이터패스에는 ALU, 레지스터 파일, 메모리 인터페이스, 멀티플렉서처럼 여러 구성 요소가 있지만 이들이 항상 같은 방식으로 연결되지는 않는다. **제어 장치는 현재 명령어를 해독해 어떤 경로와 상태 변경을 사용할지 결정하는 신호를 만든다.**

예를 들어 산술 명령과 load 명령은 같은 ALU를 사용할 수 있지만 목적이 다르다.

```text
ADD  → register operand 선택 → ALU add → register write
LOAD → base + immediate       → ALU add → memory read → register write
```

제어 신호는 이 차이를 데이터패스에 전달한다. 어떤 피연산자를 ALU 입력으로 보낼지, 메모리를 읽거나 쓸지, 레지스터 쓰기를 허용할지, 다음 PC를 어디에서 가져올지를 선택한다.

### 계산 결과가 있어도 상태 반영은 별도다

ALU가 올바른 값을 계산했더라도 레지스터 쓰기 신호가 꺼져 있으면 그 결과는 아키텍처 상태에 기록되지 않는다. 반대로 잘못된 피연산자 선택 신호가 들어가면 ALU 자체가 정상이어도 엉뚱한 값을 계산하게 된다.

따라서 명령어 실행은 `계산 장치가 값을 만든다`와 `제어 신호가 그 결과를 어느 상태에 반영할지 고른다`를 함께 봐야 한다.

### 제어 방식은 구현에 따라 달라질 수 있다

제어 신호를 조합·순차 논리로 직접 만드는 hardwired control과, 제어 저장소의 microinstruction 순서로 구성하는 microprogrammed control을 대표적으로 비교할 수 있다. 전자는 빠르고 직접적일 수 있지만 복잡한 변경이 어렵고, 후자는 복잡한 동작을 구조화하기 쉬운 대신 추가 조회·순서 제어 비용이 생길 수 있다.

이 선택은 ISA의 명령어 의미를 바꾸는 것이 아니라 그 의미를 구현하는 마이크로아키텍처 선택이다.
