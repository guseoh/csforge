---
kind: concept
contentKey: operating-systems.core.ipc.ipc-tradeoff
topicContentKey: operating-systems.core.ipc
slug: ipc-tradeoff
title: "IPC 방식 선택(IPC Trade-offs)"
summary: "복사 비용·지연 시간·격리·백프레셔 관점에서 IPC 방식을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Pipe capacity가 제한되어 있고 full pipe에 대한 blocking write가 reader가 공간을 만들 때까지 멈출 수 있음을 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/2922312"
    title: "최신 브라우저의 내부 살펴보기 1 - CPU, GPU, 메모리 그리고 다중 프로세스 아키텍처"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "브라우저가 process를 분리해 fault와 권한 경계를 만들고 IPC로 협력하는 사례를 확인한다."
    displayOrder: 2
---
# IPC 방식 선택(IPC Trade-offs)

IPC는 단순히 "가장 빠른 방식" 하나를 고르는 문제가 아니다. 프로세스 사이에서 **데이터를 어떤 형태로 전달할지, 커널이 어디까지 관리할지, 복사·동기화·실패 경계를 누가 책임질지**에 따라 적절한 선택이 달라진다.

![IPC 방식별 복사, 격리, 동기화 책임 비교](/learning/operating-systems/ipc-tradeoff.svg)

| 방식 | 기본 데이터 경계 | 장점 | 주요 책임 |
| --- | --- | --- | --- |
| 파이프 | 커널 바이트 스트림 | 단순한 생산자-소비자 구조 | 프레이밍, 용량, 파일 디스크립터 생명주기 |
| 메시지 큐 | 독립된 메시지 | 메시지 경계 보존 | 큐 용량, 메시지 크기 제한 |
| 공유 메모리 | 공유 기반 메모리 | payload 복사 감소 가능 | 동기화, 데이터 배치, 참여 프로세스 생명주기 |
| 유닉스 도메인 소켓 | 호스트 내부 소켓 | 양방향 소켓 인터페이스 | 스트림 프레이밍 또는 데이터그램 계약, 엔드포인트 생명주기 |
| 네트워크 소켓 | 호스트/네트워크 소켓 | 원격 프로세스까지 확장 | 직렬화, 프레이밍, 네트워크 실패 |

### 복사가 적다는 것과 통신 프로토콜이 단순하다는 것은 다르다

공유 메모리는 보내는 쪽과 받는 쪽이 같은 기반 데이터를 직접 볼 수 있어 복사를 줄일 수 있지만 동기화를 직접 설계해야 한다. 파이프나 소켓은 커널 버퍼를 사이에 두어 각 프로세스의 메모리를 분리하지만 데이터 복사와 유한 버퍼 비용을 지불한다.

### 메시지 경계도 중요한 선택 기준이다

파이프와 스트림 소켓은 바이트 스트림이므로 애플리케이션이 메시지 프레이밍을 정의해야 한다. 메시지 큐는 독립된 메시지 경계를 보존한다. 공유 메모리는 바이트 표현과 레코드 배치 자체를 참여 프로세스들이 합의해야 한다.

### 프로세스와 호스트 경계가 넓어질수록 실패 모델도 커진다

한 호스트 안의 IPC에서는 상대 프로세스 종료와 파일 디스크립터·엔드포인트 생명주기가 주요 실패 조건이다. 네트워크 소켓으로 호스트 경계를 넘으면 도달 가능성, 타임아웃, 연결 재설정 같은 네트워크 실패가 추가된다. 따라서 IPC 선택은 지연 시간 하나만이 아니라 **복사 비용, 데이터 경계, 동기화 책임, 격리 수준, 실패 범위**를 함께 비교해야 한다.

핵심은 가장 빠른 IPC를 찾는 것이 아니라 **필요한 통신 범위와 정확성 요구를 가장 단순하고 명확하게 표현할 수 있는 방식을 선택하는 것**이다.
