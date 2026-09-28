---
kind: concept
contentKey: operating-systems.core.io.device-io-kernel-path
topicContentKey: operating-systems.core.io
slug: device-io-kernel-path
title: "장치 입출력의 커널 경로(Device I/O Kernel Path)"
summary: "애플리케이션의 I/O 요청이 커널 객체·드라이버·장치를 거쳐 완료 결과로 돌아오는 책임 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.kernel.org/driver-api/index.html"
    title: "Linux Device Drivers API"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "kernel driver 계층이 다양한 device protocol을 공통 OS I/O 경계 뒤에 숨기는 역할을 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/47667"
    title: "TCP/IP 네트워크 스택 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Linux network I/O에서 NIC interrupt, NAPI polling, softirq와 driver가 연결되는 실제 사례를 확인한다."
    displayOrder: 2
---
# 장치 입출력의 커널 경로(Device I/O Kernel Path)

애플리케이션은 보통 저장 장치 컨트롤러나 NIC 레지스터를 직접 조작하지 않는다. 파일 디스크립터와 시스템 콜 같은 운영체제 인터페이스를 통해 요청을 커널에 전달하고, 커널의 I/O 객체·파일 시스템·네트워크 계층과 장치 드라이버가 하드웨어별 동작을 처리한다.

![애플리케이션 I/O 요청이 커널과 드라이버·장치를 거쳐 완료되는 경로](/learning/operating-systems/device-io-kernel-path.svg)

단순화하면 다음 흐름으로 볼 수 있다.

```text
애플리케이션
   ↓ 시스템 콜
커널 I/O 객체
   ↓
장치 드라이버
   ↓
장치
   ↓ 완료 알림
커널
   ↓
애플리케이션이 다시 진행 가능
```

### 요청 제출과 하드웨어 완료는 같은 순간이 아니다

커널이나 드라이버가 요청을 장치 큐에 넣은 뒤 실제 데이터 전송은 나중에 진행될 수 있다. 장치의 완료 사실은 인터럽트, 폴링, 완료 큐(completion queue) 같은 여러 방식으로 커널에 전달될 수 있다.

DMA와 인터럽트의 하드웨어 역할은 Computer Architecture에서 다룬다. 운영체제 관점에서 중요한 것은 **애플리케이션 요청과 장치 완료 사이에서 커널과 드라이버가 요청 상태와 기다리는 실행 흐름을 관리한다는 점**이다.

### 호출자가 기다리는 방식은 I/O 모델에 따라 달라진다

블로킹 I/O에서는 조건이 충족될 때까지 호출 실행 흐름이 기다릴 수 있고, 논블로킹 I/O에서는 지금 진행할 수 없으면 즉시 반환할 수 있다. 준비 알림(readiness) API는 다시 I/O를 시도할 조건을 알려주고, 완료 통지(completion) API는 이미 제출한 연산의 결과를 나중에 전달한다.

장치 입출력의 커널 경로에서 핵심은 **애플리케이션의 I/O 요청과 실제 장치 동작 사이를 커널과 드라이버가 중개하며, 요청 제출·장치 완료·애플리케이션이 관찰하는 완료가 서로 다른 단계라는 점**이다.