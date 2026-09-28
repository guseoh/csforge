---
kind: concept
contentKey: computer-architecture.core.datapath-control.critical-path
topicContentKey: computer-architecture.core.datapath-control
slug: critical-path
title: "임계 경로(Critical Path)"
summary: "레지스터 사이의 가장 긴 조합 논리 경로가 클록 주기의 하한을 정하는 이유를 설명한다."
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
# 임계 경로(Critical Path)

동기식 CPU에서는 한 클록 에지에서 나온 값이 조합 논리를 지나 다음 레지스터 입력에 도착하고, 다음 클록 에지 전에 충분히 안정되어야 한다. 이때 여러 레지스터 사이 경로 중 **가장 오래 걸리는 경로**를 임계 경로라고 한다.

```text
register ──> combinational logic ──> register
              ALU / mux / memory
              <─ longest delay ─>
```

다른 경로가 아무리 짧아도 가장 느린 경로가 끝나기 전에 다음 상태를 확정할 수는 없다. 그래서 클록 주기는 대략 레지스터 오버헤드, 가장 긴 조합 논리 지연, 타이밍 여유를 모두 감당할 만큼 길어야 한다.

### 가장 긴 경로가 전체 주기를 제한한다

단순한 single-cycle 데이터패스에서는 명령어마다 지나가는 경로 길이가 다를 수 있다. 예를 들어 레지스터끼리 더하는 연산보다 load 명령은 주소 계산과 메모리 접근, write-back까지 거치므로 더 긴 경로가 될 수 있다.

모든 명령어를 한 주기에 끝내야 한다면 짧은 명령어도 이 가장 긴 경로에 맞춘 주기를 사용한다. 즉 평균 경로가 아니라 **최악의 타이밍 경로**가 클록 주기를 결정한다.

### 경로를 나누면 더 짧은 주기를 사용할 수 있다

긴 조합 논리 중간에 레지스터를 두고 여러 단계로 나누면 한 단계가 담당하는 경로를 짧게 만들 수 있다. 이것이 파이프라인으로 이어지는 중요한 동기 중 하나다.

다만 단계를 나눈다고 성능이 공짜로 좋아지는 것은 아니다. 각 파이프라인 레지스터에도 비용이 있고, 단계 길이가 고르지 않으면 가장 느린 단계가 다시 클록을 제한한다. 여러 명령어가 동시에 진행될 때 생기는 의존성과 해저드는 다음 Topic에서 다룬다.

임계 경로는 CPU 회로의 타이밍 개념이다. 애플리케이션에서 가장 느린 함수나 가장 오래 걸린 요청을 같은 의미로 부르는 개념은 아니다.
