---
kind: concept
contentKey: operating-systems.core.race-critical-section.interleaving
topicContentKey: operating-systems.core.race-critical-section
slug: interleaving
title: "Interleaving"
summary: "여러 execution step이 교차할 때 동일한 source code가 다른 결과를 만드는 과정을 추적한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Interleaving

### source code 한 줄도 여러 실행 step으로 나뉠 수 있다

`counter++` 같은 한 줄은 실행 관점에서 read → add → write 여러 step으로 나뉠 수 있다. scheduler가 thread를 instruction 경계 사이에서 교대시키면 다른 thread가 그 중간에 끼어들 수 있다.

초기 `counter = 0`에서 T1과 T2가 각각 한 번 증가한다고 하자. 두 thread의 연산 자체는 같아도 scheduler가 step을 어떻게 섞느냐에 따라 결과가 달라진다.

```text
안전한 schedule                  lost-update schedule
T1 read 0                       T1 read 0
T1 add 1                        T2 read 0
T1 write 1                      T1 add 1
T2 read 1                       T1 write 1
T2 add 1                        T2 add 1
T2 write 2                      T2 write 1

result = 2                      result = 1
```

왼쪽에서는 T1의 read-add-write가 끝난 뒤 T2가 최신 값 1을 읽는다. 오른쪽에서는 T1과 T2가 모두 같은 이전 값 0을 읽은 뒤 각각 1을 계산해 write한다. 두 번 증가를 요청했지만 한 번의 update가 덮어써져 최종값이 1이 된다. 이것이 lost update다.

중요한 점은 `counter++`라는 source line 자체가 바뀐 것이 아니라 **가능한 execution step의 상대적 순서가 달라졌다는 것**이다. 동시성 코드를 볼 때는 source line 수보다 어떤 read와 write 사이에 다른 실행 흐름이 끼어들 수 있는지를 추적해야 한다.

### single-core에서도 interleaving은 가능하다

race를 이해할 때 반드시 여러 CPU가 동시에 instruction을 실행한다고 가정할 필요는 없다. 한 core에서도 timer interrupt, blocking, scheduler decision으로 T1과 T2가 번갈아 실행되면 문제가 생길 수 있다. parallelism은 여러 instruction을 실제로 동시에 실행하는 문제이고, concurrency는 여러 실행 흐름의 진행이 시간상 겹칠 수 있는 문제다. race에 필요한 것은 위험한 interleaving이지 반드시 여러 core의 동시 실행은 아니다.

예를 들어 T1이 `counter`를 read한 직후 preempt되고 T2가 read-add-write를 끝낸 뒤 다시 T1이 재개되면 single-core에서도 같은 lost update가 만들어질 수 있다.

### 재현되지 않는 것은 안전하다는 증거가 아니다

동시성 bug가 테스트 1,000번 동안 보이지 않아도 scheduler가 위험한 순서를 선택하지 않았을 뿐일 수 있다. 테스트 횟수는 특정 interleaving을 더 자주 만날 기회를 줄 수 있지만 가능한 모든 실행 순서를 증명하지는 못한다.

따라서 correctness를 특정 timing에 기대지 말고 어떤 interleaving에서도 invariant가 유지되는지 reasoning해야 한다. `존재하지 않으면 insert` 같은 check-then-act도 같은 관점으로 볼 수 있다. 두 요청이 모두 check 시점에는 없음으로 보고 이후 insert를 시도할 수 있으므로, DB unique constraint처럼 더 강한 canonical invariant를 함께 두는 이유가 여기에 있다.

### 핵심을 다시 연결하면

Interleaving의 핵심은 "thread 두 개가 동시에 실행된다"는 표현보다 더 구체적이다. **하나의 논리적 operation이 여러 step으로 나뉘고, 그 사이에 다른 실행 흐름의 step이 들어오면서 관찰 가능한 결과가 달라질 수 있다는 것**이다. 그래서 single-core에서도 race가 가능하고, 테스트에서 우연히 재현되지 않았다는 사실만으로 안전성을 증명할 수 없다.
