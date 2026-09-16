---
kind: concept
contentKey: computer-architecture.core.datapath-control.critical-path
topicContentKey: computer-architecture.core.datapath-control
slug: critical-path
title: "Critical Path"
summary: "register 사이의 가장 긴 조합 논리 경로가 clock period의 하한을 정하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf"
    title: "Computer Organization: Datapath"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register와 combinational datapath 사이의 timing 관계를 확인한다."
    displayOrder: 1
---
# Critical Path

동기식 CPU에서는 한 clock edge에서 나온 값이 조합 논리를 지나 다음 register 입력에 도착하고, 다음 clock edge 전에 충분히 안정되어야 한다. 이때 여러 register-to-register 경로 중 **가장 오래 걸리는 경로**를 critical path라고 한다.

```text
register ──> combinational logic ──> register
              ALU / mux / memory
              <─ longest delay ─>
```

다른 경로가 아무리 짧아도 가장 느린 경로가 끝나기 전에 다음 상태를 확정할 수는 없다. 그래서 clock period는 대략 다음 요소를 감당할 만큼 길어야 한다.

```text
clock period >= register overhead + longest combinational delay + timing margin
```

### 가장 긴 경로가 전체 cycle을 제한한다

단순한 single-cycle datapath에서는 instruction마다 지나가는 경로 길이가 다를 수 있다. 예를 들어 register끼리 더하는 연산보다 load instruction은 주소 계산과 memory access, writeback까지 거치므로 더 긴 경로가 될 수 있다.

```text
register read
   ↓
address calculation
   ↓
data memory
   ↓
writeback
   ↓
register write
```

모든 instruction을 한 cycle에 끝내야 한다면 짧은 instruction도 이 가장 긴 경로에 맞춘 cycle을 사용한다. 즉 평균 경로가 아니라 **최악의 timing 경로**가 clock period를 결정한다.

### 경로를 나누면 더 짧은 cycle을 사용할 수 있다

긴 조합 논리 중간에 register를 두고 여러 stage로 나누면 한 stage가 담당하는 경로를 짧게 만들 수 있다. 이것이 pipeline으로 이어지는 중요한 동기 중 하나다.

다만 stage를 나눈다고 성능이 공짜로 좋아지는 것은 아니다. 각 pipeline register에도 overhead가 있고, stage 길이가 고르지 않으면 가장 느린 stage가 다시 clock을 제한한다. 여러 instruction이 동시에 진행될 때 생기는 dependency와 hazard 문제는 다음 Pipeline/ILP Topic에서 다룬다.

Critical path는 CPU 회로의 timing 개념이다. 애플리케이션에서 가장 느린 함수나 가장 오래 걸린 요청을 같은 의미로 부르는 개념은 아니다.
