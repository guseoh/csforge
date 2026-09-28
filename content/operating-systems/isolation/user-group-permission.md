---
kind: concept
contentKey: operating-systems.core.isolation.user-group-permission
topicContentKey: operating-systems.core.isolation
slug: user-group-permission
title: "사용자·그룹·권한(사용자, Group, and 권한)"
summary: "소유자·group·mode 권한이 자원 접근을 제한하는 과정을 설명한다."
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
# 사용자·그룹·권한(사용자, Group, and 권한)

Unix-like OS는 프로세스가 가진 credential과 파일 시스템 객체의 권한을 비교해 접근를 허용하거나 거부한다. 기본 mode bit는 소유자, group, other에 대해 read·write·execute 권한을 표현하며, 실제 판정에는 프로세스의 effective 사용자/group 정보가 사용된다.

### 파일과 디렉터리의 권한 의미는 다르다

Regular 파일에서 read는 content 읽기, write는 content 변경, execute는 실행 가능 여부와 연결된다. 디렉터리에서는 read가 entry 목록 조회, write가 entry 생성·삭제 같은 네임스페이스 변경, execute가 경로 component를 통과해 lookup할 수 있는 search 권한과 연결된다.

따라서 `/srv/app/config.yaml`을 읽으려면 마지막 파일의 read 권한만이 아니라 중간 디렉터리들을 traverse할 권한도 필요하다.

### Credential은 단순히 사용자 이름 하나가 아니다

프로세스는 사용자 ID와 group 정보를 가진다. Supplementary group, capability, ACL 같은 추가 메커니즘도 접근 decision에 영향을 줄 수 있으므로 `owner/group/other bit만 보면 모든 permission을 설명할 수 있다`고 일반화하면 안 된다.

### 권한은 네임스페이스 visibility와 다른 문제다

경로를 알고 있거나 네임스페이스 안에서 객체를 볼 수 있다고 실제 접근가 허용되는 것은 아니다. 네임스페이스는 무엇을 보느냐를, 권한은 그 자원에 어떤 연산을 할 수 있느냐를 다룬다.

이 Concept의 핵심은 **프로세스 credential과 객체 권한을 비교해 자원 접근를 제한하며, 디렉터리 traversal과 파일 content 권한의 의미가 서로 다르다는 것**이다.

### 권한 bit의 의미

| 대상 | read | write | execute |
| --- | --- | --- | --- |
| 일반 파일 | 내용 읽기 | 내용 변경 | 실행 가능 여부 |
| 디렉터리 | entry 목록 조회 | entry 생성·삭제 | 경로 탐색(search, traversal) |
