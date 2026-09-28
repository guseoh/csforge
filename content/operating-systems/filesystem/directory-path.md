---
kind: concept
contentKey: operating-systems.core.filesystem.directory-path
topicContentKey: operating-systems.core.filesystem
slug: directory-path
title: "디렉터리와 경로(Directory and Path)"
summary: "디렉터리 항목을 단계적으로 해석해 경로명을 파일 객체로 찾는 과정과 이름·정체성의 경계를 설명한다."
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
# 디렉터리와 경로(Directory and Path)

경로명(pathname)은 파일 객체 자체가 아니라 **파일 시스템의 이름 공간에서 객체를 찾아가기 위한 이름의 경로**다. 디렉터리는 항목 이름을 다음 디렉터리나 파일 객체의 식별 정보에 연결하고, 경로 해석은 시작 디렉터리에서 각 구성 요소를 하나씩 찾아간다.

예를 들어 `/var/app/data.txt`는 개념적으로 다음처럼 해석된다.

```text
/ → "var" → var directory
  → "app" → app directory
  → "data.txt" → target file
```

중간 구성 요소가 존재하지 않거나 디렉터리가 아니거나 접근 권한이 없으면 최종 파일 객체까지 도달할 수 없다.

### 절대 경로와 상대 경로는 시작점이 다르다

절대 경로는 루트 디렉터리에서 시작하고, 상대 경로는 현재 작업 디렉터리나 디렉터리 파일 디스크립터처럼 지정된 기준 디렉터리에서 시작한다. 같은 문자열 `data/a.txt`라도 시작 기준이 다르면 다른 객체를 찾을 수 있다.

심볼릭 링크가 있으면 링크가 가리키는 경로명을 다시 해석해야 하므로 단순히 문자열을 나누는 것만으로 실제 경로 해석 과정을 설명할 수 없다.

### 이름과 객체의 생명주기는 분리된다

`unlink()`는 디렉터리 항목이라는 이름 연결을 제거한다. 하지만 같은 파일 객체를 가리키는 다른 하드 링크나 열린 파일 디스크립터가 남아 있다면 실제 파일 객체가 즉시 사라지지 않을 수 있다.

디렉터리와 경로의 핵심은 **경로명이 이름 공간을 탐색하기 위한 이름이고 파일 객체의 정체성과 열린 생명주기는 별도 상태라는 점**, 그리고 경로 해석이 디렉터리 항목을 단계별로 찾는 과정이라는 점이다.