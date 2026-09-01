---
kind: concept
contentKey: computer-architecture.core.datapath-control.critical-path
topicContentKey: computer-architecture.core.datapath-control
slug: critical-path
title: "Critical Path"
summary: "register-to-register 최장 조합 경로가 clock period를 제한하는 이유와 pipeline trade-off를 설명한다."
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

### Clock period는 평균 경로가 아니라 가장 느린 경로를 버텨야 한다

동기식 datapath에서 한 register가 clock edge에 값을 내보내면 그 값은 ALU, mux, address calculation 같은 combinational logic을 통과해 다음 state element의 입력에 도착한다. 다음 clock edge가 오기 전에 결과가 안정되어 setup requirement를 만족해야 한다.

여러 register-to-register 경로 중 propagation delay가 가장 큰 경로를 critical path라고 한다. 다른 경로가 훨씬 짧더라도 이 최장 경로가 끝나기 전에 다음 clock edge를 허용할 수 없으므로 전체 clock period의 하한을 결정한다.

단순화하면 다음 관계로 생각할 수 있다.

```text
clock period >= register overhead + longest combinational delay + timing margin
```

실제 processor timing에는 clock skew와 setup time 같은 요소가 더 들어가지만 핵심은 “가장 긴 안전한 state transition을 clock 하나가 수용해야 한다”는 것이다.

### Instruction마다 datapath 길이가 다를 수 있다

Single-cycle processor를 생각하면 register-register arithmetic보다 load instruction의 경로가 더 길 수 있다.

```text
register read
   ↓
address ALU
   ↓
data memory
   ↓
writeback mux
   ↓
register write
```

모든 instruction을 한 cycle에 완료시키려면 가장 긴 instruction path에 맞춰 cycle time을 잡아야 한다. 그러면 짧은 arithmetic instruction도 같은 긴 cycle을 사용하게 된다. 이것이 multi-cycle 또는 pipeline design을 고려하는 이유 중 하나다.

### Pipeline은 critical path를 잘게 나누지만 공짜가 아니다

긴 combinational path 중간에 pipeline register를 넣으면 한 stage가 담당하는 logic을 줄여 더 짧은 clock period를 사용할 수 있다. 하지만 stage가 늘면 pipeline register overhead가 증가하고 instruction latency, forwarding network, hazard 처리와 branch misprediction recovery가 복잡해진다.

또한 stage delay가 균형적이지 않으면 가장 느린 stage가 다시 pipeline clock을 제한한다. Logic gate 수만 줄였다고 clock이 비례해서 빨라지는 것도 아니다. Cache access, wire delay, clock distribution 같은 요소가 critical path를 지배할 수 있다.

### Frequency와 application latency를 직접 동일시하지 않는다

Critical path 개선은 CPU clock을 높일 가능성을 만들지만 application latency가 같은 비율로 줄어든다는 뜻은 아니다. Workload가 DRAM, lock, system call, disk 또는 network를 기다리는 시간이 크다면 CPU cycle이 짧아져도 end-to-end latency의 대부분은 남는다.

따라서 CPU 성능을 볼 때 clock frequency, CPI, cache miss, branch miss와 실제 CPU time을 함께 보고, backend 요청에서는 wall-clock latency와 CPU-bound 구간을 분리한다. Critical path는 hardware timing 개념이지 서비스 요청의 '가장 느린 함수'를 그대로 부르는 용어가 아니다.
