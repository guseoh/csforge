---
kind: concept
contentKey: operating-systems.core.filesystem.directory-path
topicContentKey: operating-systems.core.filesystem
slug: directory-path
title: "디렉터리와 경로(디렉터리 and 경로)"
summary: "디렉터리 entry를 단계적으로 해석해 경로명을 파일 객체로 resolve하는 과정과 이름·식별자 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# 디렉터리와 경로(디렉터리 and 경로)

경로명은 파일 객체 자체가 아니라 **파일 시스템 네임스페이스에서 객체를 찾아가기 위한 이름의 경로**다. 디렉터리는 entry name을 다음 디렉터리나 파일 객체의 identifier에 연결하고, 경로 resolution은 시작 디렉터리에서 component를 하나씩 해석한다.

예를 들어 `/var/app/data.txt`는 개념적으로 다음처럼 resolve된다.

```text
/ → "var" → var directory
  → "app" → app directory
  → "data.txt" → target file
```

중간 component가 없거나 디렉터리가 아니거나 접근 권한이 없으면 최종 파일 객체를 찾을 수 없다.

### Absolute 경로와 relative 경로는 시작점이 다르다

Absolute 경로는 root에서 시작하고, relative 경로는 current working 디렉터리나 디렉터리 디스크립터처럼 지정된 기준 디렉터리에서 시작한다. 같은 문자열 `data/a.txt`라도 시작 문맥가 다르면 다른 객체를 찾을 수 있다.

Symbolic link가 있으면 target 경로명을 다시 해석해야 하므로 단순 문자열 분할만으로 실제 객체 resolution을 설명할 수 없다.

### 이름과 객체 수명은 분리된다

`unlink()`는 디렉터리 entry라는 이름 연결을 제거한다. 하지만 같은 객체를 가리키는 다른 hard link나 열린 디스크립터가 남아 있다면 underlying 객체가 즉시 사라지지 않을 수 있다.

디렉터리·경로의 핵심은 **경로명이 네임스페이스 lookup을 위한 이름이고 파일 식별자와 open 수명은 별도 상태라는 점**, 그리고 경로 resolution이 component별 디렉터리 lookup의 연쇄라는 점이다.