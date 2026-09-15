---
kind: concept
contentKey: operating-systems.core.filesystem.directory-path
topicContentKey: operating-systems.core.filesystem
slug: directory-path
title: "Directory·Path"
summary: "directory entry를 단계적으로 해석해 pathname을 file object로 resolve하는 과정과 이름·identity 경계를 설명한다."
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
# Directory·Path

Pathname은 file object 자체가 아니라 **filesystem namespace에서 object를 찾아가기 위한 이름의 경로**다. Directory는 entry name을 다음 directory나 file object의 identifier에 연결하고, path resolution은 시작 directory에서 component를 하나씩 해석한다.

예를 들어 `/var/app/data.txt`는 개념적으로 다음처럼 resolve된다.

```text
/ → "var" → var directory
  → "app" → app directory
  → "data.txt" → target file
```

중간 component가 없거나 directory가 아니거나 접근 권한이 없으면 최종 file object를 찾을 수 없다.

### Absolute path와 relative path는 시작점이 다르다

Absolute path는 root에서 시작하고, relative path는 current working directory나 directory descriptor처럼 지정된 기준 directory에서 시작한다. 같은 문자열 `data/a.txt`라도 시작 context가 다르면 다른 object를 찾을 수 있다.

Symbolic link가 있으면 target pathname을 다시 해석해야 하므로 단순 문자열 분할만으로 실제 object resolution을 설명할 수 없다.

### 이름과 object lifetime은 분리된다

`unlink()`는 directory entry라는 이름 연결을 제거한다. 하지만 같은 object를 가리키는 다른 hard link나 열린 descriptor가 남아 있다면 underlying object가 즉시 사라지지 않을 수 있다.

Directory·Path의 핵심은 **pathname이 namespace lookup을 위한 이름이고 file identity와 open lifetime은 별도 상태라는 점**, 그리고 path resolution이 component별 directory lookup의 연쇄라는 점이다.