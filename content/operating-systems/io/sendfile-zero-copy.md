---
kind: concept
contentKey: operating-systems.core.io.sendfile-zero-copy
topicContentKey: operating-systems.core.io
slug: sendfile-zero-copy
title: "sendfile and Zero-Copy"
summary: "file-to-output 전송에서 user-space copy를 줄이는 kernel path와 'zero-copy'라는 표현의 구현 경계를 설명한다."
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
# sendfile and Zero-Copy

전통적인 file-to-socket 전송을 단순화하면 application이 `read(file, userBuffer)`로 data를 user space에 받은 뒤 다시 `write(socket, userBuffer)`로 kernel에 넘길 수 있다. 이 과정에서 application이 bytes 자체를 검사하거나 변환하지 않는다면 user/kernel 사이의 copy와 syscall이 불필요한 overhead가 될 수 있다.

`sendfile()`은 input file descriptor의 data를 output descriptor 쪽으로 전송하는 작업을 kernel에 맡겨 **application user buffer를 거치는 단계를 줄일 수 있는 Linux API**다.

### Zero-copy는 '물리적 copy가 절대 0번'이라는 보장이 아니다

zero-copy라는 표현은 보통 특정 data path에서 CPU가 수행하는 불필요한 memory copy를 줄인다는 뜻으로 사용된다. storage device → memory, kernel buffer/page cache → NIC DMA 같은 hardware transfer까지 모든 환경에서 copy가 0이라는 수학적 보장을 뜻하지 않는다. kernel version, device capability, filesystem/network stack에 따라 실제 path가 달라질 수 있다.

따라서 benchmark에서 CPU usage와 memory bandwidth가 줄었는지 측정해야지 `sendfile API를 호출했다 = zero CPU copy 확정`이라고 표현하지 않는다.

### partial transfer와 backpressure는 그대로 존재한다

`sendfile()`이 성공해도 요청한 byte 수보다 적게 전송할 수 있다. non-blocking output에서 지금 더 보낼 수 없다면 `EAGAIN`이 발생할 수도 있다. application은 offset과 남은 byte 수를 유지하고 이후 writable condition에서 계속 전송해야 한다.

즉 optimized data path가 **stream protocol의 partial-write 문제를 없애지는 않는다.**

### 변환이 필요한 data에는 맞지 않을 수 있다

application이 bytes를 압축하거나 동적으로 serialize하거나 content를 변환해야 한다면 data를 application/runtime에서 처리해야 한다. TLS도 구체적인 kernel/user-space offload와 framework support에 따라 path가 달라질 수 있으므로 `HTTPS에서는 sendfile이 절대 불가능하다`거나 반대로 `항상 zero-copy다`라고 일반화하지 않는다.

이미 완성된 static file이나 large artifact를 그대로 전송하는 workload에서 특히 후보가 될 수 있다.

### mmap과도 목적이 다르다

mmap은 file을 process address space로 연결해 application이 memory access로 data를 읽고 다루게 하는 방식이다. sendfile은 application이 content를 직접 읽지 않고 file-to-output transfer를 kernel에 맡기는 방식이다. **application이 data를 계산에 사용할 것인지, 그대로 전달할 것인지**에 따라 선택 기준이 다르다.

Backend에서 대형 export artifact 다운로드가 CPU copy 때문에 병목인지 먼저 profile하고, 실제 file이 immutable/complete한지와 authorization을 확인한 뒤 optimized transfer를 검토한다. correctness와 access control을 copy 절감보다 먼저 둔다.
