---
kind: concept
contentKey: computer-architecture.core.device-io.programmed-io
topicContentKey: computer-architecture.core.device-io
slug: programmed-io
title: "프로그램 제어 입출력(Programmed I/O)"
summary: "CPU가 장치 상태와 데이터 레지스터를 직접 확인하며 전송을 진행하는 Programmed I/O의 흐름과 폴링 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/6.7/driver-api/device-io.html"
    title: "Linux Kernel: Bus-Independent Device Accesses"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "device register I/O accessors와 MMIO 접근 경계를 확인한다."
    displayOrder: 1
---
# 프로그램 제어 입출력(Programmed I/O)

Programmed I/O에서는 CPU가 장치의 제어·상태·데이터 레지스터를 직접 읽고 쓰며 입출력 진행을 제어한다. 가장 단순한 형태는 폴링(polling)이다. CPU가 장치의 준비 상태를 반복해서 확인하고, 준비되면 데이터 레지스터를 읽거나 쓴다.

```text
CPU ── read status ──> device
CPU ── read status ──> device
CPU ── read status ──> device
             │ ready
             ▼
       read/write data
```

### 폴링은 단순하지만 CPU가 기다림에 참여한다

장치가 빠르게 준비되고 폴링 시간이 매우 짧다면 제어 흐름이 단순하다는 장점이 있다. 하지만 장치가 CPU보다 훨씬 느리면 CPU는 준비될 때까지 상태 레지스터를 반복해서 확인하는 데 주기를 소비한다.

폴링 주기를 짧게 하면 완료를 빠르게 발견할 수 있지만 CPU와 인터커넥트 사용량이 늘어난다. 반대로 폴링 빈도를 낮추면 CPU 사용량은 줄어도 완료를 알아차리는 시간이 늦어질 수 있다.

### 장치 레지스터 접근은 일반 메모리 읽기와 같다고 가정하지 않는다

상태나 데이터 레지스터는 일반적인 캐시 가능 RAM이 아닐 수 있다. 읽기 자체가 장치 상태를 바꾸거나, 버스 접근 비용과 순서 규칙이 일반 메모리와 다를 수 있다.

그래서 Programmed I/O를 이해할 때는 단순히 `while` 반복문이 돈다는 사실보다 **CPU가 장치 레지스터를 직접 확인하고 데이터 이동에 계속 관여한다**는 점이 중요하다.

### 인터럽트와 DMA는 다른 부담을 줄이는 방법이다

인터럽트 기반 입출력은 CPU가 장치를 계속 폴링하지 않고 완료 이벤트를 알림받게 한다. DMA는 더 나아가 대량 데이터 전송 자체를 CPU가 바이트마다 수행하지 않게 한다.

둘은 Programmed I/O와 비교할 수 있는 다른 메커니즘이지만 세부 동작은 뒤 Concept에서 각각 다룬다.
