---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.branch-prediction
topicContentKey: computer-architecture.core.pipeline-ilp
slug: branch-prediction
title: "Branch Prediction"
summary: "branch 결과가 확정되기 전에 다음 PC를 예측해 fetch를 이어가고, 틀렸을 때 speculative work를 버리는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Branch Prediction

Pipeline에서는 branch 조건이 확정되기 전에 다음 instruction을 가져와야 할 수 있다. 결과를 기다릴 때마다 fetch를 멈추면 pipeline 앞부분이 비기 때문이다. Branch prediction은 **다음 PC가 어디일지 미리 추측해 실행을 계속하는 방법**이다.

Conditional branch에서는 보통 두 가지를 예측할 수 있다.

- branch가 taken인지 not-taken인지
- taken이라면 어느 target에서 fetch를 이어갈지

이때 예측된 경로의 instruction은 아직 program 결과로 확정된 것이 아니라 speculative하게 처리되는 작업이다.

### 예측이 맞으면 기다리는 시간을 숨길 수 있다

예측이 실제 branch 결과와 맞으면 CPU는 결과를 기다리는 동안에도 올바른 경로의 instruction을 미리 fetch·decode할 수 있다.

```text
predict taken ──> target에서 fetch ──> branch 결과 확인
                                      ├─ 맞음 → 계속 진행
                                      └─ 틀림 → 버리고 올바른 PC로 이동
```

반대로 예측이 틀리면 wrong-path instruction을 버리고 올바른 PC에서 pipeline을 다시 채워야 한다. 이때 잃는 시간이 misprediction penalty다.

### Predictor는 과거 실행 패턴을 이용할 수 있다

가장 단순한 방식은 항상 taken 또는 항상 not-taken처럼 고정된 규칙을 사용하는 것이다. 더 발전된 predictor는 같은 branch의 최근 결과나 여러 branch의 history를 이용해 반복되는 패턴을 추정한다.

Loop 종료 조건처럼 반복성이 강한 branch는 비교적 예측하기 쉽지만, 입력에 따라 거의 무작위로 갈리는 조건은 과거 기록이 미래를 잘 설명하지 못할 수 있다.

### 추측한 실행과 확정된 결과를 구분한다

잘못 예측한 경로에서 일부 instruction을 실행했더라도 그 결과가 최종 architectural state로 남아서는 안 된다. Prediction은 성능을 위한 microarchitecture 기법이지 ISA의 program semantics를 바꾸는 기능이 아니다.

Pipeline이 깊거나 한 번에 많은 instruction을 처리할수록 잘못된 예측에서 버리는 작업량도 커질 수 있다. 그래서 prediction accuracy와 predictor의 hardware 비용 사이에 trade-off가 생긴다.
