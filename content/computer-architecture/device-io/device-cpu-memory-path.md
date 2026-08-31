---
kind: concept
contentKey: computer-architecture.core.device-io.device-cpu-memory-path
topicContentKey: computer-architecture.core.device-io
slug: device-cpu-memory-path
title: "Device, CPU and Memory Path"
summary: "device·memory·CPU의 data path와 완료 interrupt를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Device, CPU and Memory Path

bulk input의 한 경로는 `Device → Memory (DMA) → CPU (interrupt)`다. CPU는 descriptor와 buffer를 준비하고, device/DMA가 data를 옮긴 뒤 완료 status를 기록하며, interrupt가 kernel을 깨워 buffer를 소비하게 한다. 작은 register 작업은 programmed I/O가 이 경로를 대신할 수 있다.

각 단계에는 ownership과 실패 상태가 있다. DMA 완료 전 buffer를 수정하거나 interrupt만 받고 device status를 확인하지 않으면 중복 처리·data corruption·무한 재시도가 생긴다.

### Backend 연결

NIC와 storage driver의 queue depth, DMA buffer, completion latency를 관찰한다. application read 완료는 device 전송과 같은 순간이 아니므로 callback·polling·flush 경계를 명확히 기록한다.
