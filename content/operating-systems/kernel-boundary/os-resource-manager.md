---
kind: concept
contentKey: operating-systems.core.kernel-boundary.os-resource-manager
topicContentKey: operating-systems.core.kernel-boundary
slug: os-resource-manager
title: "운영체제와 자원 관리"
summary: "운영체제가 CPU·메모리·장치 같은 제한된 자원을 여러 프로세스에 배분하고 보호·회수하는 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/02-intro.pdf"
    title: "운영체제: 아주 쉬운 세 가지 이야기 — 운영체제 개요"
    referenceType: BOOK
    language: ko
    depth: chapter
    recommendation: "운영체제가 CPU·메모리·저장장치를 추상화하고 여러 프로그램이 자원을 안전하게 공유하도록 관리하는 전체 역할을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux 시스템 Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 사용자 프로그램이 커널 서비스를 요청하는 시스템 콜 경계를 확인한다."
    relationNote: "이 Concept에서는 운영체제의 전체 자원 관리 역할 가운데 사용자 공간과 커널 서비스 사이의 구체적인 요청 경계를 확인하는 보조 자료로 사용한다."
    displayOrder: 2
---
# 운영체제와 자원 관리

여러 프로그램이 동시에 실행되면 CPU, 물리 메모리, 저장장치와 네트워크 장치 같은 제한된 하드웨어를 함께 사용해야 한다. 각 애플리케이션이 이런 자원을 직접 제어하도록 두면 한 프로그램의 오류가 다른 프로그램의 실행과 메모리까지 침범할 수 있다.

운영체제는 애플리케이션과 하드웨어 사이에서 자원을 관리한다. 애플리케이션은 물리 CPU나 디스크 컨트롤러를 직접 소유하는 대신 프로세스, 가상 주소 공간, 파일, 소켓 같은 운영체제 추상화를 사용한다.

```text
애플리케이션
    ↓
프로세스 / 가상 메모리 / 파일 / 소켓
    ↓
운영체제
    ↓
CPU / RAM / 저장장치 / 장치
```

### 운영체제는 자원을 배분하고 보호한다

CPU에서는 스케줄러가 실행 가능한 작업에 CPU 시간을 배분한다. 메모리에서는 프로세스별 주소 공간과 페이지 매핑을 관리하고, 파일과 장치에는 접근 권한과 생명 주기를 둔다.

즉 운영체제의 역할은 하드웨어 API를 감싸는 데 그치지 않는다.

- **배분**: 누가 언제 얼마나 자원을 사용할지 정한다.
- **보호**: 한 프로세스가 다른 프로세스나 커널 자원을 임의로 침범하지 못하게 한다.
- **회수**: 프로세스가 종료되거나 자원이 더 이상 필요하지 않을 때 다시 사용할 수 있게 한다.

### 제한된 자원에는 대기와 실패가 생긴다

CPU가 모두 사용 중이면 작업은 준비 큐에서 기다릴 수 있다. 메모리가 부족하면 회수(reclaim)나 할당 실패가 발생할 수 있고, 파일 디스크립터 같은 커널 자원도 제한에 도달할 수 있다.

그래서 애플리케이션이 자원을 요청했다는 사실과 즉시 사용할 수 있다는 사실은 다르다. 운영체제는 제한된 하드웨어를 여러 실행 주체 사이에서 안전하게 공유하도록 **자원의 생명 주기와 경쟁을 관리하는 계층**이다.

다음 Concept에서는 이런 보호를 가능하게 하는 CPU 권한 경계인 사용자 모드와 커널 모드를 본다.
