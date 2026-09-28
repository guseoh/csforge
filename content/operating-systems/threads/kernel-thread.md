---
kind: concept
contentKey: operating-systems.core.threads.kernel-thread
topicContentKey: operating-systems.core.threads
slug: kernel-thread
title: "커널 스레드(커널 스레드)"
summary: "커널 스케줄러가 직접 인식하는 실행 단위와 블로킹·병렬성의 관계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/clone.2.html"
    title: "clone(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 실행 task가 address space·file table 등 자원을 공유하도록 구성하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://openjdk.org/jeps/444"
    title: "JEP 444: Virtual Threads"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 JDK의 platform thread가 OS thread의 thin wrapper로 구현되고 virtual thread와 어떻게 구분되는지 확인한다."
    displayOrder: 2
---
# 커널 스레드(커널 스레드)

이 Concept에서 커널 스레드 또는 커널-level 스레드는 **운영체제 스케줄러가 직접 인식하고 scheduling하는 실행 단위**를 뜻한다. Linux 내부 전용 `kthread`만을 의미하는 표현으로 한정하지 않는다. 사용자 애플리케이션의 스레드도 커널이 별도 작업로 관리할 수 있다.

커널-visible 스레드마다 실행 문맥와 scheduling 상태가 있으므로 한 스레드가 I/O를 기다려 sleep 상태가 되어도 같은 프로세스의 다른 실행 가능 스레드는 계속 실행될 수 있다.

```text
Process
├─ Thread A → blocking I/O → waiting
└─ Thread B → runnable → scheduler가 CPU 배정 가능
```

### 커널이 각각의 스레드를 scheduling한다

스케줄러는 각 스레드를 실행 가능/대기 같은 상태로 추적하고 CPU를 배분한다. 여러 CPU가 있다면 서로 다른 커널-visible 스레드를 실제로 동시에 실행할 수도 있다.

다만 스레드 수를 늘린다고 CPU 병렬성이 무한히 늘어나는 것은 아니다. 동시에 실행할 수 있는 계산의 수는 CPU core와 워크로드의 의존 관계/자원 조건에 제한된다. 실행 가능 스레드가 지나치게 많아지면 스케줄러 큐와 문맥-switch 비용이 증가할 수 있다.

### Linux의 프로세스와 스레드를 구현 객체 이름만으로 구분하지 않는다

Linux에서는 작업가 어떤 자원를 공유할지를 `clone` 계열 의미로 구성할 수 있다. 따라서 `process 객체`와 `thread 객체`가 완전히 다른 두 종류의 커널 객체라고 외우기보다, **스케줄러가 별도 실행 단위로 보는가와 주소 공간·파일 table 같은 자원를 무엇과 공유하는가**를 구분해 이해하는 편이 정확하다.

현재 JDK의 platform 스레드는 OS 스레드와 밀접하게 대응하므로 OS 스케줄러가 실제 CPU 실행을 담당한다. Java virtual 스레드처럼 런타임이 더 많은 logical 스레드를 그 위에 multiplex하는 모델은 뒤에서 별도로 다룬다.