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

pathname은 file object 그 자체가 아니라 **filesystem namespace에서 object를 찾아가기 위한 이름의 연쇄**다. Unix-like filesystem 모델에서 directory는 entry name을 다음 directory나 file의 identifier에 연결하며, path resolution은 정해진 시작 directory에서 component를 하나씩 해석한다. 이 개념에서 말하는 directory entry와 identifier의 관계는 inode 기반 filesystem에서 특히 선명하게 드러나지만, 모든 filesystem이 내부적으로 동일한 자료구조를 사용한다는 뜻은 아니다.

예를 들어 `/var/app/data.txt`를 연다면 개념적으로 다음 흐름을 거친다.

`/ → "var" entry → var directory → "app" entry → app directory → "data.txt" entry → target file`

중간 component 하나라도 존재하지 않거나 directory가 아니거나 접근 권한이 없다면 최종 file이 존재하더라도 lookup은 실패한다.

### Absolute path와 relative path

absolute path는 root를 기준으로 시작하지만 relative path는 process의 current working directory(cwd) 또는 `openat()` 같은 API에 전달한 directory descriptor를 시작점으로 삼는다. cwd는 단순한 문자열이 아니라 process가 보유한 directory context이므로, 같은 문자열 `data/a.txt`도 process의 cwd나 기준 directory descriptor가 달라지면 다른 object를 resolve할 수 있다.

`.`은 현재 lookup directory를, `..`은 부모 directory를 뜻하는 component로 해석된다. 다만 root에서는 `..`이 더 위로 올라가지 않고 root에 머무르며, mount 경계나 구현의 namespace 규칙에 따라 관찰되는 부모 관계가 달라질 수 있다. symbolic link를 만난 경우에는 link가 가진 target pathname을 현재 resolution에 다시 삽입해 해석하므로, 단순히 문자열 component를 한 번 훑는 과정으로 생각하면 안 된다. link cycle, 너무 긴 resolution, 중간 component의 directory/permission 조건 때문에 lookup이 실패할 수도 있다.

중요한 점은 path 문자열을 정규화한 것과 **실제 kernel이 최종 object를 resolve한 결과**가 항상 같은 보안 판단을 주는 것은 아니라는 점이다. symbolic link나 concurrent rename처럼 namespace가 바뀔 수 있는 조건에서는 string check와 object access 사이의 경계가 생긴다. 여기서는 filesystem mechanics를 이해하고, 구체적인 공격 방어 정책은 Security 영역에서 다룬다.

### 이름 삭제와 file lifetime은 다르다

`unlink()`는 directory entry라는 이름 연결을 제거한다. 하지만 해당 file을 가리키는 다른 hard link나 열린 file descriptor가 남아 있다면 underlying object가 즉시 사라진다고 단정할 수 없다. pathname namespace와 open-file lifetime을 분리해야 `삭제했는데 process가 계속 읽을 수 있는 이유`를 설명할 수 있다.

Backend에서 사용자 filename을 저장할 때도 display name과 실제 storage key/path를 분리하는 편이 안전하고 관리하기 쉽다. file lifecycle을 추적할 때는 path 존재 여부뿐 아니라 open handle과 link/object 상태를 함께 본다.
