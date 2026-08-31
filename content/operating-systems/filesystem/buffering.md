---
kind: concept
contentKey: operating-systems.core.filesystem.buffering
topicContentKey: operating-systems.core.filesystem
slug: buffering
title: "Buffering"
summary: "사용자·kernel buffer가 write 호출과 device 전송을 분리하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# Buffering

user-space library, kernel page cache, device queue가 각각 데이터를 buffer할 수 있다. 작은 write를 모아 큰 I/O로 만들면 syscall과 device overhead를 줄이지만 flush 전 crash 시 보이지 않는 데이터가 생길 수 있다.

buffer의 owner와 flush·close·fsync 시점을 구분한다. “buffer에 복사됐다”, “kernel이 받았다”, “storage에 안정적으로 기록됐다”는 서로 다른 상태다.

### Backend 연결

CSV/JSON export는 writer flush만으로 성공 처리하지 말고 파일 교체와 durability 요구를 정의한다. 응답으로 다운로드를 시작한 뒤 백그라운드 flush가 실패하는 경우도 상태에 반영한다.

