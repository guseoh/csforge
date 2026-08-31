---
kind: concept
contentKey: operating-systems.core.filesystem.file-abstraction
topicContentKey: operating-systems.core.filesystem
slug: file-abstraction
title: "File Abstraction"
summary: "바이트 stream과 metadata를 file이라는 공통 abstraction으로 보는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# File Abstraction

OS의 file abstraction은 regular file뿐 아니라 device, pipe, socket처럼 byte를 읽고 쓰는 대상을 공통 interface로 다룬다. 이름, permission, size, timestamp 같은 metadata와 실제 content stream은 서로 다른 상태다.

read/write가 성공했다고 durable storage에 기록되었다는 뜻은 아니며, offset과 concurrent access 정책도 file object의 일부다. filesystem type과 mount 옵션에 따라 semantics가 달라질 수 있다.

### Backend 연결

업로드 파일은 원본 bytes, metadata, 처리 상태를 별도 field로 저장한다. 파일 이름을 경로로 직접 사용하지 않고 허용된 directory와 크기·content type을 검증한다.

