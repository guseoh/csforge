---
kind: concept
contentKey: operating-systems.core.process.program-vs-process
topicContentKey: operating-systems.core.process
slug: program-vs-process
title: "프로그램과 프로세스(Program and Process)"
summary: "저장된 실행 파일과 운영체제가 실행 상태·자원을 관리하는 프로세스를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/execve.2.html"
    title: "execve(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "새 program image가 현재 process image를 대체하는 Linux execve semantics를 확인한다."
    displayOrder: 1
---
# 프로그램과 프로세스(Program and Process)

프로그램은 디스크 등에 저장된 명령어와 정적 데이터의 집합이고, 프로세스는 그 프로그램을 실제로 실행하기 위해 운영체제가 관리하는 **동적인 실행 상태**다.

같은 실행 파일을 두 번 실행하면 프로그램 파일은 하나여도 서로 다른 프로세스 두 개가 생길 수 있다. 각 프로세스는 자신만의 PID, 가상 주소 공간, CPU 실행 상태, 열린 자원과 스케줄링 상태를 가진다.

```text
프로그램
코드 + 정적 데이터
      │ 실행
      ▼
프로세스
├─ 식별 정보
├─ 가상 주소 공간
├─ CPU 실행 상태
├─ 열린 자원
└─ 스케줄링 / 생명주기 상태
```

### 프로세스는 중단했다가 다시 이어갈 수 있어야 한다

프로세스가 단순히 `현재 실행 중인 코드`라면 CPU에서 잠시 내려온 뒤 어디서 다시 시작해야 하는지 알 수 없다. 운영체제는 현재 실행 위치, 필요한 레지스터와 실행 문맥, 메모리 매핑과 자원 관계를 추적한다.

그래서 준비(ready)나 대기(waiting) 상태의 프로세스도 여전히 프로세스다. 그 순간 CPU 명령어를 실행하지 않더라도 운영체제가 재개 가능한 실행 주체로 관리하고 있기 때문이다.

### 프로세스 생성과 프로그램 교체를 구분한다

Unix 계열 모델에서 `fork`는 새로운 프로세스를 만드는 동작이고, `execve`는 성공하면 **현재 프로세스의 프로그램 이미지(program image)를 다른 프로그램으로 교체**한다.

```text
부모 프로세스
   │ fork
   ├────────> 자식 프로세스
   │              │ exec
   │              ▼
   │        새 프로그램 이미지
```

따라서 `새 프로그램을 실행한다`와 `새 프로세스를 생성한다`는 항상 같은 사건이 아니다.

프로그램과 프로세스를 구분하면 이후 주소 공간, 프로세스 상태, 생성과 종료를 `파일의 성질`이 아니라 **운영체제가 관리하는 실행 생명주기**로 이해할 수 있다.
