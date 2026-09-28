---
kind: concept
contentKey: operating-systems.core.race-critical-section.interleaving
topicContentKey: operating-systems.core.race-critical-section
slug: interleaving
title: "실행 교차(Interleaving)"
summary: "여러 실행 단계가 서로 끼어들 때 같은 소스 코드가 다른 결과를 만드는 과정을 추적한다."
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
# 실행 교차(Interleaving)

소스 코드 한 줄도 실제 실행에서는 여러 단계로 나뉠 수 있다. `counter++`를 단순화하면 `읽기 → 더하기 → 쓰기`가 필요하다. 여러 스레드가 동시에 실행될 수 있는 환경에서는 스케줄러와 CPU 실행 순서에 따라 이 단계들이 서로 끼어들 수 있다.

초기값이 `counter = 0`이고 T1과 T2가 각각 한 번 증가한다고 하자.

```text
안전한 순서                      위험한 순서
T1 read 0                       T1 read 0
T1 add 1                        T2 read 0
T1 write 1                      T1 add 1
T2 read 1                       T1 write 1
T2 add 1                        T2 add 1
T2 write 2                      T2 write 1

result = 2                      result = 1
```

두 스레드가 실행한 코드는 같지만 단계가 교차되는 순서가 달라지면서 한 번의 갱신이 사라진다.

### 단일 코어에서도 실행 교차는 가능하다

경쟁 상태를 이해할 때 반드시 두 CPU 코어가 같은 순간에 명령어를 실행한다고 가정할 필요는 없다. 한 코어에서도 T1이 값을 읽은 뒤 선점되고 T2가 실행된 다음 T1이 다시 이어서 실행되면 같은 문제가 생길 수 있다.

즉 병렬 실행(parallelism)은 경쟁 상태의 필수 조건이 아니다. 중요한 것은 **하나의 논리적 연산이 끝나기 전에 다른 실행 흐름이 그 중간 단계에 끼어들 수 있는가**이다.

### 재현 빈도와 코드의 정확성은 다른 문제다

위험한 실행 교차가 드물게 발생한다고 해서 코드가 안전한 것은 아니다. 테스트에서 문제가 보이지 않았다는 사실은 단지 해당 순서를 아직 만나지 않았을 수 있다는 뜻이다.

실행 교차의 핵심은 **하나의 논리적 연산을 구성하는 여러 단계 사이에 다른 실행 흐름이 끼어들면서 관찰 가능한 결과가 달라질 수 있다는 것**이다.
