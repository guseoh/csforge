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

초기 `counter = 0`에서 T1과 T2가 각각 한 번 증가한다고 하자.

```
T1 read 0
T2 read 0
T1 add 1
T1 write 1
T2 add 1
T2 write 1
```

두 번 증가했지만 최종값은 1이다. 반대로 T1의 read-add-write가 모두 끝난 뒤 T2가 실행되면 최종값은 2가 된다. 같은 source code라도 가능한 interleaving에 따라 결과가 달라질 수 있다.

### single-core에서도 interleaving은 가능하다

race를 이해할 때 반드시 여러 CPU가 동시에 instruction을 실행한다고 가정할 필요는 없다. 한 core에서도 timer interrupt, blocking, scheduler decision으로 T1과 T2가 번갈아 실행되면 문제가 생길 수 있다. parallelism은 race를 더 쉽게 노출할 수 있지만 interleaving 자체는 concurrency만으로도 가능하다.

### 재현되지 않는 것은 안전하다는 증거가 아니다

동시성 bug가 테스트 1,000번 동안 보이지 않아도 scheduler가 위험한 순서를 선택하지 않았을 뿐일 수 있다. correctness를 특정 timing에 기대지 말고 어떤 interleaving에서도 invariant가 유지되는지 reasoning해야 한다.

check-then-act도 대표적이다. `존재하지 않으면 insert`를 두 request가 동시에 수행하면 둘 다 check 시점에는 없음으로 볼 수 있다. DB unique constraint처럼 더 강한 canonical invariant를 함께 두는 이유가 여기에 있다.
