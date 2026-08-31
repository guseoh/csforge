---
kind: concept
contentKey: operating-systems.core.io.device-io-kernel-path
topicContentKey: operating-systems.core.io
slug: device-io-kernel-path
title: "Device I/O Kernel Path"
summary: "user request가 syscall·driver·device를 거쳐 돌아오는 경로를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# Device I/O Kernel Path

application의 I/O 요청은 system call을 통해 kernel object와 driver로 전달되고, driver가 device protocol과 interrupt·DMA를 사용해 결과를 돌려준다. user code는 device register를 직접 만지지 않고 이 보호된 경계를 사용한다.

read나 write가 즉시 끝나지 않으면 kernel은 request를 queue하고 thread를 재우거나 readiness event를 기록한다. 같은 descriptor라도 device type과 blocking mode에 따라 완료 경로가 달라진다.

### Backend 연결

HTTP server의 socket readiness와 실제 response bytes 전송은 서로 다른 상태다. request lifecycle에 queued, ready, partial write, completed를 분리한다.

