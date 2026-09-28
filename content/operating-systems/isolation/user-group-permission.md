---
kind: concept
contentKey: operating-systems.core.isolation.user-group-permission
topicContentKey: operating-systems.core.isolation
slug: user-group-permission
title: "사용자·그룹·권한(User, Group, and Permission)"
summary: "소유자·그룹·권한 비트와 프로세스 자격 정보가 자원 접근을 제한하는 과정을 설명한다."
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
# 사용자·그룹·권한(User, Group, and Permission)

Unix 계열 운영체제는 프로세스가 가진 자격 정보(credential)와 파일 시스템 객체의 권한을 비교해 접근을 허용하거나 거부한다. 기본 권한 비트는 소유자(owner), 그룹(group), 그 외 사용자(other)에 대해 읽기·쓰기·실행 권한을 표현하며, 실제 판정에는 프로세스의 유효 사용자·그룹 정보가 사용된다.

### 일반 파일과 디렉터리에서 권한의 의미가 다르다

일반 파일에서 읽기 권한은 내용 읽기, 쓰기 권한은 내용 변경, 실행 권한은 실행 가능 여부와 연결된다. 디렉터리에서는 읽기 권한이 엔트리 목록 조회, 쓰기 권한이 엔트리 생성·삭제 같은 이름 공간 변경, 실행 권한이 경로 요소를 통과해 탐색할 수 있는 권한과 연결된다.

따라서 `/srv/app/config.yaml`을 읽으려면 마지막 파일의 읽기 권한만 보는 것이 아니라 **중간 디렉터리들을 통과할 수 있는 탐색 권한**도 필요하다.

### 프로세스 자격 정보는 단순한 사용자 이름 하나가 아니다

프로세스는 사용자 ID와 그룹 정보를 가진다. 보조 그룹(supplementary group), capability, ACL 같은 추가 메커니즘도 접근 판정에 영향을 줄 수 있으므로 **소유자/그룹/그 외 사용자 비트만 보면 모든 권한을 설명할 수 있다**고 일반화하면 안 된다.

### 권한은 네임스페이스에서 보이는지와 다른 문제다

경로를 알고 있거나 네임스페이스 안에서 객체를 볼 수 있다고 실제 접근이 허용되는 것은 아니다. 네임스페이스는 무엇이 보이는지를, 권한은 그 자원에 어떤 연산을 수행할 수 있는지를 다룬다.

이 Concept의 핵심은 **프로세스 자격 정보와 객체 권한을 비교해 자원 접근을 제한하며, 디렉터리 탐색 권한과 파일 내용 권한의 의미가 서로 다르다는 것**이다.

| 대상 | 읽기(read) | 쓰기(write) | 실행(execute) |
| --- | --- | --- | --- |
| 일반 파일 | 내용 읽기 | 내용 변경 | 실행 가능 여부 |
| 디렉터리 | 엔트리 목록 조회 | 엔트리 생성·삭제 | 경로 탐색(search, traversal) |
