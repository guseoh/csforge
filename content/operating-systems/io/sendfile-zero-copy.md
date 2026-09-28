---
kind: concept
contentKey: operating-systems.core.io.sendfile-zero-copy
topicContentKey: operating-systems.core.io
slug: sendfile-zero-copy
title: "sendfile과 제로 카피(복사 최소화(zero-복사))"
summary: "커널 내부 복사를 줄여 파일-to-socket 전송을 최적화하는 조건을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man2/sendfile.2.html"
    title: "sendfile(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file-to-output kernel transfer와 partial result/O_NONBLOCK 경계를 확인한다."
    displayOrder: 1
---
# sendfile과 제로 카피(복사 최소화(zero-복사))

일반적인 파일-to-socket 전송을 단순화하면 애플리케이션이 파일 data를 사용자 공간 버퍼로 읽고, 다시 socket으로 써서 커널에 전달한다. 애플리케이션이 바이트를 직접 검사하거나 변환하지 않는다면 이 경로의 복사와 syscall 일부는 불필요한 비용이 될 수 있다.

`sendfile()`은 input 파일 디스크립터의 data를 output 디스크립터 쪽으로 보내는 작업을 커널에 맡겨 **애플리케이션의 사용자 공간 버퍼를 거치는 data 복사를 줄일 수 있는 interface**다.

### Zero-복사는 복사가 물리적으로 0번이라는 뜻이 아니다

"복사 최소화(zero-복사)"는 보통 특정 경로에서 CPU가 수행하는 불필요한 메모리 복사를 줄인다는 의미다. 저장소에서 메모리로 data가 이동하거나 NIC가 DMA로 전송하는 것까지 모든 환경에서 복사가 전혀 없다는 뜻은 아니다. 실제 data 경로는 커널, 파일 시스템, 장치와 프로토콜 기능에 따라 달라질 수 있다.

따라서 중요한 것은 이름이 아니라 어떤 복사와 CPU 메모리 traffic을 줄였는지다.

### Partial transfer는 그대로 존재한다

`sendfile()`도 요청한 전체 바이트를 한 번에 전송한다고 보장하지 않는다. Output이 지금 받을 수 있는 양보다 요청이 크면 일부만 전송될 수 있고, 논블로킹 디스크립터에서는 나중에 다시 시도해야 할 수도 있다.

```text
전체 전송 길이 N
   ↓
sendfile() → n bytes 전송
   ↓
offset += n
   ↓
remaining > 0 이면 이후 계속 전송
```

즉 data 경로 최적화는 스트림의 partial-write와 역압(backpressure) 문제를 없애지 않는다.

### 애플리케이션이 content를 처리해야 하면 다른 경로가 필요하다

전송 중 압축, 변환, 동적 직렬화처럼 애플리케이션이 실제 바이트를 다뤄야 한다면 사용자 공간 processing이 필요할 수 있다. 반대로 이미 완성된 파일을 그대로 output으로 전달하는 경우에는 커널-assisted transfer가 잘 맞을 수 있다.

`mmap()`과도 목적이 다르다. mmap은 파일을 프로세스 address space에 연결해 애플리케이션이 메모리로 접근하게 하고, sendfile은 애플리케이션이 content를 직접 읽지 않은 채 파일-to-output transfer를 커널에 맡긴다. 핵심은 **애플리케이션이 data를 직접 소비할 것인지 그대로 전달할 것인지에 따라 data 경로를 선택하는 것**이다.
