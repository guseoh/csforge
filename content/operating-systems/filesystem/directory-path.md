---
kind: concept
contentKey: operating-systems.core.filesystem.directory-path
topicContentKey: operating-systems.core.filesystem
slug: directory-path
title: "Directory and Path"
summary: "directory entry를 단계적으로 해석해 pathname을 file object로 resolve하는 과정과 이름·identity 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf"
    title: "Interlude: Files and Directories"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "file, pathname, descriptor, shared open-file state를 Unix file-system API 흐름으로 확인한다."
    displayOrder: 1
---
# Directory and Path

pathname은 file object 그 자체가 아니라 **filesystem namespace에서 object를 찾아가기 위한 이름의 연쇄**다. directory는 entry name을 다음 directory나 file의 identifier에 연결하며, path resolution은 root 또는 current working directory에서 시작해 component를 하나씩 해석한다.

예를 들어 `/var/app/data.txt`를 연다면 개념적으로 다음 흐름을 거친다.

`/ → "var" entry → var directory → "app" entry → app directory → "data.txt" entry → target file`

중간 component 하나라도 존재하지 않거나 directory가 아니거나 접근 권한이 없다면 최종 file이 존재하더라도 lookup은 실패한다.

### Absolute path와 relative path

absolute path는 root를 기준으로 시작하지만 relative path는 process의 current working directory 같은 시작점에 의존한다. 따라서 같은 문자열 `data/a.txt`도 process 상태가 달라지면 다른 object를 resolve할 수 있다. `.`과 `..`, symbolic link, mount point도 resolution 과정에 영향을 준다.

중요한 점은 path 문자열을 정규화한 것과 **실제 kernel이 최종 object를 resolve한 결과**가 항상 같은 보안 판단을 주는 것은 아니라는 점이다. symbolic link나 concurrent rename처럼 namespace가 바뀔 수 있는 조건에서는 string check와 object access 사이의 경계가 생긴다. 여기서는 filesystem mechanics를 이해하고, 구체적인 공격 방어 정책은 Security 영역에서 다룬다.

### 이름 삭제와 file lifetime은 다르다

`unlink()`는 directory entry라는 이름 연결을 제거한다. 하지만 해당 file을 가리키는 다른 hard link나 열린 file descriptor가 남아 있다면 underlying object가 즉시 사라진다고 단정할 수 없다. pathname namespace와 open-file lifetime을 분리해야 `삭제했는데 process가 계속 읽을 수 있는 이유`를 설명할 수 있다.

Backend에서 사용자 filename을 저장할 때도 display name과 실제 storage key/path를 분리하는 편이 안전하고 관리하기 쉽다. file lifecycle을 추적할 때는 path 존재 여부뿐 아니라 open handle과 link/object 상태를 함께 본다.
