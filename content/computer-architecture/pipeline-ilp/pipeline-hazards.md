---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-hazards
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-hazards
title: "파이프라인 해저드(Pipeline Hazards)"
summary: "다음 명령어가 예정된 주기에 진행하지 못하게 만드는 구조·데이터·제어 해저드를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "pipeline stages, structural/data/control hazards, forwarding/stall, branch prediction과 recovery를 확인한다."
    displayOrder: 1
---
# 파이프라인 해저드(Pipeline Hazards)

파이프라인에서는 여러 명령어가 동시에 진행되므로 항상 다음 단계로 이동할 수 있는 것은 아니다. 필요한 하드웨어가 이미 사용 중이거나, 앞 명령어의 결과가 아직 준비되지 않았거나, 다음 PC가 정해지지 않았다면 진행을 늦춰야 한다. 이런 제약을 파이프라인 해저드라고 한다.

해저드를 제대로 처리하지 않으면 단순히 느려지는 것이 아니라 잘못된 값을 읽거나 잘못된 경로를 실행할 수 있다. 따라서 CPU는 원인에 따라 스톨, 포워딩, 분기 예측 같은 방법으로 진행 순서를 조정한다.

### 구조 해저드: 같은 하드웨어 자원이 동시에 필요할 때

같은 주기에 둘 이상의 단계가 하나뿐인 하드웨어 자원을 요구하면 구조 해저드가 생긴다. 예를 들어 명령어 인출과 데이터 접근이 같은 단일 메모리 포트를 동시에 써야 한다면 두 요청을 모두 같은 순간 처리할 수 없다.

해결 방법은 자원을 분리·복제하거나 한쪽을 기다리게 하는 것이다. 어느 쪽이든 면적, 전력, 처리량 사이의 절충이 생긴다.

### 데이터 해저드: 앞 명령어의 값이 아직 준비되지 않았을 때

대표적인 데이터 해저드는 RAW(Read After Write)다.

```text
I1: r1 = r2 + r3
I2: r4 = r1 - r5
```

I2는 I1이 만드는 `r1`을 사용하므로, 그 값이 준비되기 전에 실행하면 이전 값을 읽게 된다. 고전적인 순차 발행 파이프라인에서는 이런 진짜 데이터 의존성이 핵심 문제다.

WAR와 WAW는 같은 레지스터 이름을 재사용하면서 생기는 이름 의존성이다. 단순한 순차 파이프라인에서는 보통 문제가 되지 않지만 비순차 실행에서는 별도로 다뤄야 한다.

### 제어 해저드: 다음 PC가 아직 정해지지 않았을 때

분기가 나오면 CPU는 조건 결과가 확정될 때까지 다음에 어느 명령어를 가져와야 할지 모를 수 있다. 결과를 기다리면 파이프라인 앞부분이 비고, 미리 추측하면 틀렸을 때 잘못 가져온 명령어를 버려야 한다.

```text
structural → resource 충돌
      data → 필요한 값이 아직 없음
   control → 다음 PC가 아직 확정되지 않음
```

세 해저드는 원인이 다르므로 해결 방법도 다르다. 다음 Concept에서는 RAW 의존성을 포워딩과 스톨로 처리하는 과정을 구체적으로 본다.
