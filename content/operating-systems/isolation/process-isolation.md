---
kind: concept
contentKey: operating-systems.core.isolation.process-isolation
topicContentKey: operating-systems.core.isolation
slug: process-isolation
title: "프로세스 격리(Process Isolation)"
summary: "프로세스별 주소 공간과 권한 경계가 서로의 상태를 직접 침범하는 것을 막는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/2922312"
    title: "최신 브라우저의 내부 살펴보기 1 - CPU, GPU, 메모리 그리고 다중 프로세스 아키텍처"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "브라우저가 process를 분리해 fault와 권한 경계를 만들고 IPC로 협력하는 사례를 확인한다."
    displayOrder: 2
---
# 프로세스 격리(Process Isolation)

프로세스는 자신의 가상 주소 공간과 실행·자원 문맥을 가지는 운영체제의 기본 격리 단위다. 일반적인 사용자 프로세스는 다른 프로세스의 메모리를 임의의 포인터로 직접 읽거나 덮어쓸 수 없고, 필요한 데이터 교환은 IPC나 명시적으로 공유한 자원을 통해 이루어진다.

![별도 주소 공간을 가진 프로세스와 명시적 IPC 경계](/learning/operating-systems/process-isolation.svg)

### 분리와 공유는 동시에 존재한다

주소 공간은 프로세스마다 분리되지만 커널과 물리 CPU, 파일 시스템 객체, 네트워크 스택 같은 시스템 자원은 여러 프로세스가 공유한다. `fork()`처럼 파일 디스크립터와 매핑 관계 일부를 상속하는 API도 있으므로 **프로세스를 만들었다고 모든 자원이 독립적으로 복제되는 것은 아니다.**

### 스레드보다 강한 메모리 경계를 가진다

같은 프로세스의 스레드는 힙과 많은 프로세스 자원을 공유한다. 반면 별도 프로세스 사이에는 주소 공간 경계가 있으므로 한 프로세스의 잘못된 사용자 공간 메모리 쓰기가 다른 프로세스의 힙을 직접 덮어쓰는 것을 막을 수 있다. 대신 프로세스 사이의 통신에는 파이프, 소켓, 공유 메모리 같은 IPC가 필요하다.

### 격리는 절대적인 분리를 뜻하지 않는다

프로세스들은 같은 커널을 사용하고 권한, 공유 파일, 공유 메모리 같은 연결점을 가질 수 있다. 따라서 프로세스 격리는 **주소 공간과 자원 접근을 기본적으로 분리하는 운영체제 경계**이지 모든 자원과 장애를 완전히 독립시키는 의미는 아니다.
