---
kind: concept
contentKey: operating-systems.core.filesystem.directory-path
topicContentKey: operating-systems.core.filesystem
slug: directory-path
title: "Directory and Path"
summary: "directory entry와 path lookup이 inode를 찾는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/open.2.html"
    title: "open(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file descriptor와 filesystem I/O 경계를 확인한다."
    displayOrder: 1
---
# Directory and Path

directory는 이름과 file object reference를 매핑하는 특별한 file-like 구조다. path lookup은 root 또는 current directory에서 시작해 각 component를 순서대로 찾아 최종 object를 결정한다.

상대 path는 process의 current directory에 의존하고 symbolic link, mount point, permission이 lookup 결과를 바꿀 수 있다. path 문자열 검증만으로 안전한 접근을 보장하지 않고 실제 resolved path와 권한을 확인한다.

### Backend 연결

업로드·export directory를 만들 때 user-supplied filename으로 parent traversal이 일어나지 않게 한다. canonical ID를 파일명으로 쓰고 원래 이름은 metadata로 보존한다.

