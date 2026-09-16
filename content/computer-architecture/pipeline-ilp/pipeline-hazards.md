---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-hazards
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-hazards
title: "파이프라인 Hazard"
summary: "다음 instruction이 예정된 cycle에 진행하지 못하게 만드는 structural·data·control hazard를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# 파이프라인 Hazard

파이프라인에서는 여러 instruction이 동시에 진행되므로 항상 다음 stage로 이동할 수 있는 것은 아니다. 필요한 hardware가 이미 사용 중이거나, 앞 instruction의 결과가 아직 준비되지 않았거나, 다음 PC가 정해지지 않았다면 진행을 늦춰야 한다. 이런 제약을 pipeline hazard라고 한다.

Hazard를 제대로 처리하지 않으면 단순히 느려지는 것이 아니라 잘못된 값을 읽거나 잘못된 경로를 실행할 수 있다. 따라서 CPU는 원인에 따라 stall, forwarding, prediction 같은 방법으로 진행 순서를 조정한다.

### Structural hazard: 같은 hardware가 동시에 필요할 때

Structural hazard는 같은 cycle에 둘 이상의 stage가 하나뿐인 hardware 자원을 요구할 때 생긴다. 예를 들어 instruction fetch와 data access가 같은 단일 memory port를 동시에 써야 한다면 두 요청을 모두 같은 순간 처리할 수 없다.

해결 방법은 resource를 분리·복제하거나 한쪽을 기다리게 하는 것이다. 어느 쪽이든 area, 전력, 처리량 사이의 trade-off가 생긴다.

### Data hazard: 앞 instruction의 값이 아직 준비되지 않았을 때

대표적인 data hazard는 RAW(Read After Write)다.

```text
I1: r1 = r2 + r3
I2: r4 = r1 - r5
```

I2는 I1이 만드는 `r1`을 사용하므로, 그 값이 준비되기 전에 실행하면 이전 값을 읽게 된다. 고전적인 in-order pipeline에서는 이런 true dependency가 핵심 문제다.

WAR와 WAW는 같은 register 이름을 재사용하면서 생기는 name dependency다. 단순한 in-order pipeline에서는 보통 문제가 되지 않지만 out-of-order 실행에서는 별도로 다뤄야 한다. 이 차이는 뒤의 Superscalar·Out-of-Order Concept에서 다시 본다.

### Control hazard: 다음 PC가 아직 정해지지 않았을 때

Branch가 나오면 CPU는 조건 결과가 확정될 때까지 다음에 어느 instruction을 fetch해야 할지 모를 수 있다. 결과를 기다리면 pipeline 앞부분이 비고, 미리 추측하면 틀렸을 때 잘못 가져온 instruction을 버려야 한다.

```text
structural → resource 충돌
      data → 필요한 값이 아직 없음
   control → 다음 PC가 아직 확정되지 않음
```

세 hazard는 원인이 다르므로 해결 방법도 다르다. 다음 Concept에서는 RAW dependency를 forwarding과 stall로 처리하는 과정을 구체적으로 본다.
