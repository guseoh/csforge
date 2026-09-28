---
kind: concept
contentKey: operating-systems.core.threads.user-level-thread
topicContentKey: operating-systems.core.threads
slug: user-level-thread
title: "사용자 수준 스레드(User-Level Thread)"
summary: "런타임이 논리 스레드를 스케줄링하고 커널 스레드에 매핑하는 실행 모델을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    relationNote: "이 Concept에서는 사용자 공간 런타임이 논리 스레드를 하나 이상의 커널 스레드에 매핑할 때의 전환 비용과 블로킹 경계를 중심으로 읽는다."
    displayOrder: 1
---
# 사용자 수준 스레드(User-Level Thread)

사용자 수준 스레드는 **애플리케이션 런타임이나 라이브러리가 논리적 실행 문맥과 스케줄링을 관리하는 모델**이다. 논리 스레드 사이를 전환할 때마다 커널 스케줄러를 거치지 않아도 되는 구조라면 생성·전환 비용을 줄이고, 많은 논리 작업을 더 적은 수의 커널 스레드 위에 올릴 수 있다.

```text
논리 스레드 A ─┐
논리 스레드 B ─┼─ 런타임 스케줄러 → 커널 스레드 → OS 스케줄러 → CPU
논리 스레드 C ─┘
```

### 실제 CPU 병렬성은 아래쪽 실행 자원에 제한된다

논리 스레드가 수만 개 있어도 동시에 CPU에서 실행되는 수가 그만큼 늘어나는 것은 아니다. 런타임은 여러 논리 스레드를 하나 이상의 커널 스레드에 매핑하고, 실제 병렬성은 커널이 실행 대상으로 인식하는 스레드 수와 CPU 코어 수에 제한된다.

### 블로킹의 영향은 논리 스레드와 커널 스레드의 매핑 방식에 따라 달라진다

가장 단순한 다대일(many-to-one) 모델에서는 여러 논리 스레드가 커널 스레드 하나를 공유한다. 이 커널 스레드가 블로킹 시스템 콜에서 멈추면, 그 위에 매핑된 다른 논리 스레드도 CPU에서 실행할 수 없게 된다.

하지만 사용자 수준 스레드가 항상 이 한계를 그대로 갖는 것은 아니다. 런타임이 여러 커널 스레드를 운반자로 사용하거나, 블로킹 연산을 감지해 기다리는 논리 스레드만 내려놓고 다른 논리 스레드를 실행할 수 있다면 영향을 줄일 수 있다. 따라서 핵심 질문은 **한 논리 스레드가 기다릴 때 그 아래의 커널 스레드를 다른 작업에 재사용할 수 있는가**이다.

사용자 수준 스레드의 핵심은 스레드 수 자체가 아니라 **논리적 스케줄링을 사용자 공간이 맡으면서 커널이 볼 수 있는 실행 자원과의 매핑을 어떻게 구성하는가**에 있다. Java 가상 스레드는 이 계층 구분을 이해하는 데 도움이 되는 현대적인 사례이며 뒤 Concept에서 구체적으로 다룬다.