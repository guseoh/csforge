---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.branch-prediction
topicContentKey: computer-architecture.core.pipeline-ilp
slug: branch-prediction
title: "분기 예측(Branch Prediction)"
summary: "분기 결과가 확정되기 전에 다음 PC를 예측해 명령어 인출을 이어가고, 틀렸을 때 추측 실행 결과를 버리는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "pipeline stages, structural/data/control hazards, forwarding/stall, branch prediction과 recovery를 확인한다."
    displayOrder: 1
---
# 분기 예측(Branch Prediction)

파이프라인에서는 분기 조건이 확정되기 전에 다음 명령어를 가져와야 할 수 있다. 결과를 기다릴 때마다 인출을 멈추면 파이프라인 앞부분이 비기 때문이다. 분기 예측은 **다음 PC가 어디일지 미리 추측해 실행을 계속하는 방법**이다.

조건 분기에서는 보통 분기가 taken인지 not-taken인지, taken이라면 어느 목적지에서 인출을 이어갈지를 예측한다. 예측된 경로의 명령어는 아직 프로그램 결과로 확정된 것이 아니라 추측적으로 처리되는 작업이다.

### 예측이 맞으면 기다리는 시간을 숨길 수 있다

```text
predict taken ──> target에서 fetch ──> branch 결과 확인
                                      ├─ 맞음 → 계속 진행
                                      └─ 틀림 → 버리고 올바른 PC로 이동
```

예측이 틀리면 잘못된 경로의 명령어를 버리고 올바른 PC에서 파이프라인을 다시 채워야 한다. 이때 잃는 시간이 예측 실패 비용(misprediction penalty)이다.

### 예측기는 과거 실행 패턴을 이용할 수 있다

가장 단순한 방식은 항상 taken 또는 항상 not-taken처럼 고정된 규칙을 사용하는 것이다. 더 발전된 예측기는 같은 분기의 최근 결과나 여러 분기의 이력을 이용해 반복되는 패턴을 추정한다.

반복문 종료 조건처럼 반복성이 강한 분기는 비교적 예측하기 쉽지만, 입력에 따라 거의 무작위로 갈리는 조건은 과거 기록이 미래를 잘 설명하지 못할 수 있다.

### 추측한 실행과 확정된 결과를 구분한다

잘못 예측한 경로에서 일부 명령어를 실행했더라도 그 결과가 최종 아키텍처 상태로 남아서는 안 된다. 분기 예측은 성능을 위한 마이크로아키텍처 기법이지 ISA의 프로그램 의미를 바꾸는 기능이 아니다.

파이프라인이 깊거나 한 번에 많은 명령어를 처리할수록 잘못된 예측에서 버리는 작업량도 커질 수 있다. 그래서 예측 정확도와 예측기 하드웨어 비용 사이에 절충이 생긴다.
