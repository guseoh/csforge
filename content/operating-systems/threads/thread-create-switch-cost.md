---
kind: concept
contentKey: operating-systems.core.threads.thread-create-switch-cost
topicContentKey: operating-systems.core.threads
slug: thread-create-switch-cost
title: "스레드 생성과 문맥 전환 비용(Thread Creation and Context-Switch Cost)"
summary: "스레드의 스택·메타데이터·생성·스케줄링 비용이 작업 부하 선택에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    relationNote: "이 Concept에서는 스레드 생성에 필요한 스택·실행 문맥과 실행 가능한 스레드가 많을 때 생기는 문맥 전환·캐시 지역성 비용을 중심으로 읽는다."
    displayOrder: 1
---
# 스레드 생성과 문맥 전환 비용(Thread Creation and Context-Switch Cost)

스레드는 프로세스보다 공유하는 자원이 많아 상대적으로 가볍게 만들 수 있지만 비용이 없는 실행 단위는 아니다. 스레드를 만들려면 실행 문맥과 스택, 런타임이나 커널이 추적할 메타데이터가 필요하다. 커널이 직접 스케줄링하는 스레드라면 스케줄러가 관리할 실행 상태도 추가된다.

작업이 매우 짧은데 매번 새 스레드를 만들고 종료한다면 실제 작업보다 생성·초기화·정리 비용의 비중이 커질 수 있다.

### 실행 가능한 스레드가 많아지면 스케줄링 비용도 늘 수 있다

실행 가능한 스레드 수가 CPU가 동시에 실행할 수 있는 수보다 훨씬 많으면 스케줄러는 여러 스레드 사이에서 CPU를 반복해서 전환해야 한다.

```text
적은 실행 가능 스레드
→ 각 스레드가 비교적 오래 실행

너무 많은 실행 가능 스레드
→ 실행 대기열 증가
→ 문맥 전환 증가 가능
→ 캐시 지역성 악화 가능
```

문맥 전환에는 레지스터를 저장하고 복원하는 직접 비용이 있다. 여기에 새로 실행되는 스레드가 필요로 하는 코드와 데이터를 다시 캐시에 채우면서 캐시 지역성이 나빠지는 간접 비용도 생길 수 있다.

같은 프로세스 안의 스레드 전환과 서로 다른 프로세스 사이의 전환 비용이 항상 같다고 볼 수도 없다. 주소 공간을 공유하는지, CPU와 운영체제가 주소 변환 상태를 어떻게 관리하는지에 따라 비용 특성이 달라질 수 있기 때문이다.

### 스레드 수는 생성 비용 하나만 보고 정하지 않는다

스레드를 너무 적게 만들면 생성·전환 비용은 줄 수 있지만, 실행할 작업이 충분한데도 작업 스레드가 부족해 CPU가 놀거나 입출력 대기 시간을 다른 작업과 겹칠 기회를 놓칠 수 있다. 반대로 너무 많이 만들면 메모리 사용과 스케줄링 경쟁이 커질 수 있다.

핵심은 **스레드 하나마다 스택과 실행 메타데이터가 필요하고, 실행 가능한 스레드 수가 많아질수록 메모리·대기열·문맥 전환·캐시 비용을 함께 고려해야 한다는 점**이다. 적정 스레드 수는 다음 Concept에서 작업 부하의 성격과 함께 판단한다.