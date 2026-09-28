---
kind: concept
contentKey: operating-systems.core.kernel-boundary.system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: system-call
title: "시스템 콜(System Call)"
summary: "사용자 애플리케이션이 커널이 소유한 서비스를 요청하는 명시적인 운영체제 인터페이스를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/syscalls.2.html"
    title: "Linux System Calls"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 사용자 프로그램이 커널 서비스를 요청하는 시스템 콜 경계를 확인한다."
    relationNote: "이 Concept에서는 애플리케이션 API와 커널 서비스 경계를 구분하고 Linux가 제공하는 시스템 콜 집합을 확인한다."
    displayOrder: 1
---
# 시스템 콜(System Call)

사용자 모드 애플리케이션은 파일 시스템, 소켓, 프로세스 생성, 가상 메모리 매핑처럼 커널이 관리하는 자원을 직접 조작할 수 없다. 이런 기능이 필요할 때 애플리케이션은 운영체제가 제공하는 **시스템 콜 인터페이스(system-call interface)**를 통해 커널 서비스를 요청한다.

```text
애플리케이션
   ↓ 요청
시스템 콜 인터페이스
   ↓
커널 서비스
   ↓
파일 / 소켓 / 프로세스 / 메모리 ...
```

### 라이브러리 API와 시스템 콜은 같은 호출 단위가 아니다

애플리케이션은 보통 시스템 콜 명령어를 직접 작성하지 않고 언어 런타임이나 라이브러리 API를 사용한다. 라이브러리 함수는 사용자 공간에서만 끝날 수도 있고, 내부 버퍼링을 통해 여러 호출을 하나의 시스템 콜로 묶을 수도 있다.

반대로 하나의 고수준 API가 여러 시스템 콜을 사용할 수도 있다.

```text
라이브러리·런타임 API ≠ 시스템 콜 1:1 대응
```

시스템 콜은 **커널 서비스 경계의 단위**이고 라이브러리 API는 애플리케이션이 사용하는 추상화의 단위다.

### 시스템 콜 ABI가 요청을 전달한다

커널은 어떤 서비스를 요청했는지와 인자가 무엇인지 알아야 한다. 그래서 운영체제와 CPU 아키텍처는 시스템 콜 번호, 인자 전달 위치, 통제된 진입 방식 같은 ABI 규칙을 정한다.

구체적인 명령어와 레지스터 배치는 아키텍처마다 다르므로 시스템 콜을 특정한 하나의 어셈블리 명령어로 일반화하지 않는다.

### 반환 결과도 하나의 성공 상태만 있는 것은 아니다

커널 서비스는 정상 결과뿐 아니라 오류나 부분 결과를 반환할 수 있다. I/O 요청은 요청한 바이트보다 적게 처리될 수도 있고, 자원이 준비될 때까지 현재 작업이 대기 상태로 들어갈 수도 있다.

시스템 콜을 이해할 때 핵심은 어셈블리 이름을 외우는 것이 아니라 **사용자 애플리케이션이 커널 자원을 요청하는 명시적 보호 경계이며, 인자와 결과가 운영체제의 계약에 따라 전달된다는 점**이다.
