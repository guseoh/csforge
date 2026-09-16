---
kind: concept
contentKey: operating-systems.core.isolation.user-group-permission
topicContentKey: operating-systems.core.isolation
slug: user-group-permission
title: "User, Group·Permission"
summary: "owner·group·mode permission이 resource 접근을 제한하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/credentials.7.html"
    title: "credentials(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process credentials와 effective user/group이 permission 검사에 쓰이는 방식을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man7/path_resolution.7.html"
    title: "path_resolution(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "directory traversal와 각 pathname component의 search permission 경계를 확인한다."
    displayOrder: 2
---
# User, Group·Permission

Unix-like OS는 process가 가진 credential과 filesystem object의 permission을 비교해 access를 허용하거나 거부한다. 기본 mode bit는 owner, group, other에 대해 read·write·execute 권한을 표현하며, 실제 판정에는 process의 effective user/group 정보가 사용된다.

### File과 directory의 permission 의미는 다르다

Regular file에서 read는 content 읽기, write는 content 변경, execute는 실행 가능 여부와 연결된다. Directory에서는 read가 entry 목록 조회, write가 entry 생성·삭제 같은 namespace 변경, execute가 path component를 통과해 lookup할 수 있는 search 권한과 연결된다.

따라서 `/srv/app/config.yaml`을 읽으려면 마지막 file의 read 권한만이 아니라 중간 directory들을 traverse할 권한도 필요하다.

### Credential은 단순히 사용자 이름 하나가 아니다

Process는 user ID와 group 정보를 가진다. Supplementary group, capability, ACL 같은 추가 mechanism도 access decision에 영향을 줄 수 있으므로 `owner/group/other bit만 보면 모든 permission을 설명할 수 있다`고 일반화하면 안 된다.

### Permission은 namespace visibility와 다른 문제다

Path를 알고 있거나 namespace 안에서 object를 볼 수 있다고 실제 access가 허용되는 것은 아니다. Namespace는 무엇을 보느냐를, permission은 그 resource에 어떤 operation을 할 수 있느냐를 다룬다.

이 Concept의 핵심은 **process credential과 object permission을 비교해 resource access를 제한하며, directory traversal과 file content permission의 의미가 서로 다르다는 것**이다.
