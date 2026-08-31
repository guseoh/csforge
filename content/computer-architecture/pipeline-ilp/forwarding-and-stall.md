---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.forwarding-and-stall
topicContentKey: computer-architecture.core.pipeline-ilp
slug: forwarding-and-stall
title: "Forwarding and Stall"
summary: "dependency를 forwarding과 bubble로 처리하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Forwarding and Stall

### 결과를 기다리는 두 방법

`add r1,...` 직후 `sub ...,r1`이 오면 writeback 전의 r1이 필요하다. forwarding은 이미 execution unit 결과가 나온 지점에서 다음 ALU 입력으로 우회하고, 결과가 아직 만들어지지 않았거나 load가 memory에서 오지 않았으면 pipeline에 bubble을 넣어 consumer를 늦춘다.

forwarding은 register file에 쓰고 다시 읽는 왕복을 줄이지만 모든 dependency를 없애지 못한다. stall을 잘못 생략하면 최신 값 대신 이전 값이 계산되고, 과도한 stall은 correctness는 보존해도 throughput을 떨어뜨린다.

### Backend 연결

컴파일러 최적화나 vector code를 검토할 때 dependency graph와 실제 target pipeline을 함께 본다. 결과 검증 없이 instruction 재배열을 하면 data race와 무관하게 single-thread 값도 깨질 수 있다.
