---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.forwarding-and-stall
topicContentKey: computer-architecture.core.pipeline-ilp
slug: forwarding-and-stall
title: "포워딩과 스톨(Forwarding and Stall)"
summary: "RAW 의존성에서 값이 준비되는 시점에 따라 포워딩으로 우회할지 파이프라인을 멈출지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "pipeline stages, structural/data/control hazards, forwarding/stall, branch prediction과 recovery를 확인한다."
    displayOrder: 1
---
# 포워딩과 스톨(Forwarding and Stall)

RAW 의존성이 있다고 해서 항상 write-back이 끝날 때까지 기다려야 하는 것은 아니다. 앞 명령어의 결과가 레지스터 파일에는 아직 기록되지 않았더라도 ALU 출력처럼 파이프라인 내부의 다른 위치에는 이미 계산되어 있을 수 있다.

포워딩(forwarding) 또는 바이패싱(bypassing)은 이 값을 정상적인 write-back 경로까지 기다리지 않고 다음 명령어의 입력으로 직접 전달하는 방법이다.

```text
producer ALU result ───────────────┐
                                  ▼
register write-back 대신 ──> consumer ALU input
```

포워딩은 의존성 자체를 없애는 것이 아니다. **이미 계산된 값을 더 이른 경로로 전달**해 기다리는 시간을 줄이는 방법이다.

### 아직 만들어지지 않은 값은 포워딩할 수 없다

대표적인 예가 load-use 의존성이다.

```text
I1: load r1, 0(r2)
I2: add  r3, r1, r4
```

I1의 주소는 실행 단계에서 계산할 수 있지만 실제 `r1` 값은 메모리 접근이 끝나야 나온다. 단순한 5-stage 파이프라인에서 I2가 바로 다음 주기에 그 값을 필요로 한다면, 아직 존재하지 않는 값을 포워딩할 수는 없다.

이 경우 파이프라인은 I2의 진행을 잠시 멈추고 bubble을 넣는다. 이것이 스톨이다.

```text
값이 이미 준비됨  → forwarding
값이 아직 없음    → stall 후 진행
```

### 스톨은 정확성을 위한 대기다

스톨이 생기면 유효한 명령어가 진행하지 못하는 주기가 생겨 처리량이 떨어진다. 그렇다고 의존성을 무시하면 오래된 피연산자를 사용하게 되므로 정확성을 위해 필요한 대기는 반드시 지켜야 한다.

정확히 몇 주기를 기다리는지는 파이프라인 구조와 메모리 지연 시간에 따라 달라진다. `load 다음은 항상 1 cycle stall` 같은 규칙은 특정 교육용 파이프라인 모델의 결과이지 모든 CPU의 보장은 아니다.

더 복잡한 CPU는 독립적인 다른 명령어를 먼저 실행해 이 대기 시간을 숨길 수 있다. 하지만 실제 값에 의존하는 명령어는 결국 생산자의 결과가 준비될 때까지 기다려야 한다.
