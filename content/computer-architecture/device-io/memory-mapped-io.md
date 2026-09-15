---
kind: concept
contentKey: computer-architecture.core.device-io.memory-mapped-io
topicContentKey: computer-architecture.core.device-io
slug: memory-mapped-io
title: "Memory-Mapped I/O"
summary: "device register를 CPU address space에 mapping해 load/store로 접근할 때 normal memory와 달라지는 side effect·cacheability·ordering을 설명한다."
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
# Memory-Mapped I/O

Memory-Mapped I/O(MMIO)는 device의 control/status/data register를 CPU address space의 특정 영역에 배치하고, CPU가 load/store 형태로 접근하도록 만드는 방식이다.

주소를 사용한다는 점은 RAM 접근과 비슷하지만 **그 주소 뒤에 있는 것은 일반 memory가 아니라 device register**다.

```text
CPU load/store
      ↓
address decode
   ├─ RAM range    → memory
   └─ MMIO range   → device register
```

### Read와 write가 device 동작을 만들 수 있다

RAM read는 저장된 값을 읽는 것이 주된 의미지만 MMIO read는 device status를 조회하거나 FIFO에서 data를 꺼내는 side effect를 만들 수 있다. MMIO write도 단순히 값을 보관하는 것이 아니라 device operation을 시작하거나 interrupt 상태를 clear하는 command가 될 수 있다.

따라서 MMIO register는 일반 pointer가 가리키는 변수처럼 자유롭게 읽고 쓰면 안 된다. Device specification이 요구하는 access width, 순서와 의미를 따라야 한다.

### Cache와 ordering도 normal memory와 다를 수 있다

Device status를 일반 RAM처럼 CPU cache에 오래 보관하면 hardware가 변경한 최신 상태를 보지 못할 수 있다. 그래서 MMIO 영역은 architecture와 OS가 적절한 memory attribute로 mapping하고, driver는 정해진 accessor를 사용한다.

또한 CPU가 MMIO write instruction을 실행했다고 device가 같은 순간 그 write를 관찰했다고 단정할 수 없다. Interconnect나 posted write 때문에 전달 시점이 다를 수 있으며, device가 요구하는 순서를 보장해야 할 때는 architecture와 driver API의 ordering 규칙을 따라야 한다.

### MMIO는 주소 사용 방식이지 일반 memory semantics가 아니다

MMIO를 이해할 때 핵심은 `device를 memory처럼 저장한다`가 아니다. **Device register를 CPU의 address 기반 load/store mechanism으로 접근할 수 있게 연결한다**는 것이다.

다음 Concept에서는 bulk data를 CPU가 직접 옮기는 부담을 줄이는 DMA를 본다.
