---
kind: concept
contentKey: computer-architecture.core.device-io.device-cpu-memory-path
topicContentKey: computer-architecture.core.device-io
slug: device-cpu-memory-path
title: "장치·CPU·메모리 입출력 경로(Device, CPU and Memory Path)"
summary: "디스크립터 준비부터 DMA·완료·인터럽트 또는 폴링·소프트웨어 소비까지 장치 입출력의 전체 데이터 경로를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.kernel.org/core-api/dma-api-howto.html"
    title: "Dynamic DMA mapping Guide"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "coherent·streaming mapping, DMA ownership과 sync 시점을 확인한다."
    displayOrder: 1
---
# 장치·CPU·메모리 입출력 경로(Device, CPU and Memory Path)

지금까지 본 Programmed I/O, MMIO, DMA와 인터럽트는 실제 입출력 경로에서 서로 연결되어 사용될 수 있다. 장치에서 애플리케이션이 사용할 수 있는 데이터까지 도달하는 과정을 하나의 흐름으로 보면 각 메커니즘의 역할을 구분하기 쉽다.

수신 경로를 단순화하면 CPU/드라이버가 먼저 디스크립터와 버퍼를 준비하고 장치가 데이터를 받은 뒤 DMA로 메모리에 기록할 수 있다. 전송이 끝나면 완료 상태를 남기고 인터럽트 또는 폴링으로 소프트웨어가 이를 확인한다.

```text
CPU/driver
  descriptor + buffer 준비
            ↓
          device
            ↓ DMA
          memory
            ↓
     completion state
            ↓
 interrupt / polling
            ↓
   software가 data 소비
```

### 각 단계의 완료 시점은 서로 다르다

다음 사건은 같은 시점이 아니다.

- 장치가 외부 데이터를 받았다.
- DMA가 메모리 쓰기를 끝냈다.
- 완료 엔트리가 준비됐다.
- 인터럽트가 CPU에 전달됐다.
- 핸들러 또는 폴링 코드가 완료를 확인했다.
- 상위 소프트웨어가 데이터를 사용하기 시작했다.

이 구분이 중요한 이유는 어느 단계에서 기다리고 있는지에 따라 지연 시간의 원인과 다음 동작이 달라지기 때문이다.

### 버퍼 소유권도 단계에 따라 이동한다

CPU가 디스크립터를 제출해 장치에 버퍼를 넘긴 동안에는 소프트웨어가 그 버퍼를 임의로 재사용하면 안 된다. DMA 완료 이후 필요한 동기화를 마친 뒤 다시 CPU가 버퍼를 소유하고 처리할 수 있다.

```text
CPU prepares
   ↓ hand-off
Device transfers
   ↓ completion
CPU reclaims
```

### 완료 알림과 데이터 이동을 분리한다

DMA는 데이터 전송을 담당하고, 인터럽트나 폴링은 완료를 알아차리는 방법이다. 인터럽트 핸들러에 들어왔다는 사실만으로 애플리케이션 수준 입출력이 모두 끝난 것도 아니다. 소프트웨어는 완료 상태와 바이트 수·오류를 확인하고 다음 처리 단계로 넘겨야 한다.

이 Topic의 핵심은 입출력을 `CPU가 장치에서 값을 한 번 읽는다`는 단일 동작으로 보지 않는 것이다. **제어 레지스터 접근, 데이터 전송, 완료 알림과 소프트웨어 소비가 서로 다른 단계로 이어진다.**
