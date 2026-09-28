---
kind: concept
contentKey: operating-systems.core.threads.thread-count-workload
topicContentKey: operating-systems.core.threads
slug: thread-count-workload
title: "작업 부하별 스레드 수(Thread Count by Workload)"
summary: "CPU 중심·블로킹 작업 부하와 하위 시스템 용량을 바탕으로 적정 스레드 수를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    relationNote: "이 Concept에서는 CPU를 실제 사용하는 시간과 대기 시간을 구분하고, 실행 가능한 스레드 수를 CPU 코어·메모리·연결 수 같은 제한 자원과 함께 판단한다."
    displayOrder: 1
---
# 작업 부하별 스레드 수(Thread Count by Workload)

적절한 스레드 수는 하나의 공식으로 정할 수 없다. **CPU를 계속 사용하는 작업인지, 자주 블로킹되는 작업인지**에 따라 실행 가능한 스레드가 실제 CPU를 사용하는 방식이 달라지기 때문이다.

### CPU 중심 작업에서는 코어 수가 실제 병렬성을 제한한다

4코어 CPU에서 대부분의 시간을 계산에 쓰는 작업 부하라면 실행 가능한 스레드를 4개에서 40개로 늘려도 같은 순간 계산할 수 있는 코어 수는 늘지 않는다. 추가 스레드는 CPU를 더 만들지 않고 실행 대기열과 문맥 전환 비용을 늘릴 수 있다.

```text
CPU 중심 작업
실행 가능한 스레드 ↑
       │
       ├─ 남는 코어가 있음 → 병렬성 활용 가능
       └─ 코어가 이미 포화 → 대기열 / 문맥 전환 증가 가능
```

### 블로킹 작업에서는 더 많은 동시성이 유리할 수 있다

한 스레드가 CPU를 잠깐 사용한 뒤 입출력 완료를 오래 기다린다면, 기다리는 동안 다른 실행 가능한 스레드가 CPU를 사용할 수 있다. 그래서 블로킹 비율이 높은 작업 부하에서는 CPU 코어 수보다 많은 스레드가 유용할 수 있다.

하지만 스레드 수를 무한히 늘릴 수는 없다. 각 스레드의 스택과 메타데이터가 메모리를 사용하고, 실행 가능한 스레드가 많아지면 스케줄링 비용도 커진다. 또한 실제 작업이 파일 디스크립터, 데이터베이스 연결, 장치 대기열 같은 다른 제한 자원을 필요로 한다면 그 자원이 새로운 상한이 된다.

### 핵심은 CPU 사용 시간·대기 시간·하위 시스템 한계를 함께 보는 것이다

CPU 중심인지 I/O 중심인지 한 단어로만 분류하기보다 다음을 함께 본다.

- 실제 CPU에서 실행된 시간과 대기 시간의 비율
- 동시에 실행 가능한 스레드 수와 실행 대기열 길이
- CPU 코어 수와 현재 활용률
- 스레드가 기다리는 운영체제·외부 자원 경계
- 데이터베이스 연결 풀, 외부 API 제한처럼 하위 시스템이 감당할 수 있는 동시 처리량

핵심은 **CPU 중심 작업에서는 과도한 실행 가능 스레드가 스케줄링 비용을 키울 수 있고, 블로킹 작업에서는 대기 시간을 다른 작업과 겹치기 위해 더 많은 동시성이 필요할 수 있다는 절충**이다. 스레드 수를 늘릴 때는 CPU뿐 아니라 실제 제한 자원까지 함께 측정해야 한다.