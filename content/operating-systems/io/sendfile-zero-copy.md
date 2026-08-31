---
kind: concept
contentKey: operating-systems.core.io.sendfile-zero-copy
topicContentKey: operating-systems.core.io
slug: sendfile-zero-copy
title: "sendfile and Zero-Copy"
summary: "kernel 내부 전송으로 user-space copy를 줄이는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man2/sendfile.2.html"
    title: "sendfile(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file-to-socket I/O 경계와 copy 비용을 확인한다."
    displayOrder: 1
---
# sendfile and Zero-Copy

zero-copy는 데이터가 kernel buffer와 user buffer 사이에서 불필요하게 복사되는 횟수를 줄이는 설계다. `sendfile` 같은 경로는 file descriptor의 content를 socket으로 전달하는 작업을 kernel에 맡겨 CPU copy 비용을 낮출 수 있다.

zero-copy가 항상 device까지 복사가 0이라는 뜻은 아니며, TLS 암호화·압축·변환이 끼면 user-space 처리가 필요할 수 있다. partial send, offset, file 변경과 backpressure를 일반 write와 동일하게 처리한다.

### Backend 연결

대형 export 다운로드는 serialization 후 bytes를 다시 복사하는 경로가 병목일 수 있다. 파일이 이미 canonical artifact인지, 권한 검사를 어느 시점에 하는지 확인하고 zero-copy를 correctness보다 우선하지 않는다.

