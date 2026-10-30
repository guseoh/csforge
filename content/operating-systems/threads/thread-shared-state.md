---
kind: concept
contentKey: operating-systems.core.threads.thread-shared-state
topicContentKey: operating-systems.core.threads
slug: thread-shared-state
title: "스레드 간 공유 상태(Thread-Shared State)"
summary: "같은 프로세스의 스레드가 공유하는 메모리·자원과 경쟁 상태의 경계를 설명한다."
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
# 스레드 간 공유 상태(Thread-Shared State)

같은 프로세스의 스레드는 같은 가상 주소 공간을 사용하므로 코드, 힙, 전역·정적 데이터에 함께 접근할 수 있다. 파일 디스크립터처럼 프로세스가 보유한 운영체제 자원도 여러 스레드가 함께 사용할 수 있다.

이 공유는 별도의 프로세스 간 통신(IPC) 없이 데이터를 전달할 수 있게 하지만, 동시에 여러 실행 흐름이 같은 가변 상태를 변경할 수 있다는 뜻이기도 하다.

```text
프로세스의 공유 상태
├─ 힙 객체
├─ 전역/정적 데이터
└─ 열린 자원
     ▲       ▲
  스레드 A  스레드 B
```

### 공유된다는 사실과 안전하게 수정할 수 있다는 사실은 다르다

두 스레드가 같은 `counter`를 동시에 증가시킨다고 하자. `counter = counter + 1`은 개념적으로 읽기 → 계산 → 쓰기 여러 단계로 나뉠 수 있다. 실행이 교차되면 둘 다 같은 이전 값을 읽고 한 번의 갱신이 사라질 수 있다.

즉 같은 메모리를 볼 수 있다는 사실은 연산의 원자성이나 올바른 실행 순서를 보장하지 않는다. 구체적인 경쟁 상태, 임계 구역과 동기화 방법은 뒤 Topic에서 다룬다.

### 공유 자원은 메모리만이 아니다

같은 파일 디스크립터를 여러 스레드가 사용하면 그 디스크립터가 가리키는 파일이나 소켓의 상태에도 함께 영향을 줄 수 있다. 어떤 상태가 스레드별인지 프로세스 단위인지 API와 운영체제 계약을 확인해야 한다.

스레드 간 공유 상태의 핵심은 **프로세스 자원을 쉽게 공유할 수 있는 만큼 공유된 가변 상태와 자원을 안전하게 조정할 책임도 함께 생긴다**는 점이다.