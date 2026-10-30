---
kind: concept
contentKey: computer-architecture.core.device-io.memory-mapped-io
topicContentKey: computer-architecture.core.device-io
slug: memory-mapped-io
title: "메모리 사상 입출력(Memory-Mapped I/O)"
summary: "장치 레지스터를 CPU 주소 공간에 매핑해 load/store로 접근할 때 일반 메모리와 달라지는 부수 효과·캐시 가능성·순서 규칙을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.kernel.org/6.7/driver-api/device-io.html"
    title: "Linux Kernel: Bus-Independent Device Accesses"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "device register I/O accessors와 MMIO 접근 경계를 확인한다."
    displayOrder: 1
---
# 메모리 사상 입출력(Memory-Mapped I/O)

Memory-Mapped I/O(MMIO)는 장치의 제어·상태·데이터 레지스터를 CPU 주소 공간의 특정 영역에 배치하고, CPU가 load/store 형태로 접근하도록 만드는 방식이다.

주소를 사용한다는 점은 RAM 접근과 비슷하지만 **그 주소 뒤에 있는 것은 일반 메모리가 아니라 장치 레지스터**다.

```text
CPU load/store
      ↓
address decode
   ├─ RAM range    → memory
   └─ MMIO range   → device register
```

### 읽기와 쓰기가 장치 동작을 만들 수 있다

RAM 읽기는 저장된 값을 읽는 것이 주된 의미지만 MMIO 읽기는 장치 상태를 조회하거나 FIFO에서 데이터를 꺼내는 부수 효과를 만들 수 있다. MMIO 쓰기도 단순히 값을 보관하는 것이 아니라 장치 동작을 시작하거나 인터럽트 상태를 지우는 명령이 될 수 있다.

따라서 MMIO 레지스터는 일반 포인터가 가리키는 변수처럼 자유롭게 읽고 쓰면 안 된다. 장치 명세가 요구하는 접근 폭, 순서와 의미를 따라야 한다.

### 캐시와 순서도 일반 메모리와 다를 수 있다

장치 상태를 일반 RAM처럼 CPU 캐시에 오래 보관하면 하드웨어가 변경한 최신 상태를 보지 못할 수 있다. 그래서 MMIO 영역은 아키텍처와 OS가 적절한 메모리 속성으로 매핑하고, 드라이버는 정해진 접근 API를 사용한다.

또한 CPU가 MMIO 쓰기 명령을 실행했다고 장치가 같은 순간 그 쓰기를 관찰했다고 단정할 수 없다. 인터커넥트나 posted write 때문에 전달 시점이 다를 수 있으며, 장치가 요구하는 순서를 보장해야 할 때는 아키텍처와 드라이버 API의 순서 규칙을 따라야 한다.

### MMIO는 주소 사용 방식이지 일반 메모리 의미론이 아니다

MMIO를 이해할 때 핵심은 `장치를 메모리처럼 저장한다`가 아니다. **장치 레지스터를 CPU의 주소 기반 load/store 메커니즘으로 접근할 수 있게 연결한다**는 것이다.

다음 Concept에서는 대량 데이터를 CPU가 직접 옮기는 부담을 줄이는 DMA를 본다.
