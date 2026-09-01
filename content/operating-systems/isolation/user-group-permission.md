---
kind: concept
contentKey: operating-systems.core.isolation.user-group-permission
topicContentKey: operating-systems.core.isolation
slug: user-group-permission
title: "User, Group and Permission"
summary: "파일과 process 접근을 user·group permission으로 제한하는 모델을 설명한다."
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
# User, Group and Permission

OS는 process가 가진 credential과 pathname을 따라가며 만나는 각 object의 permission을 비교해 접근을 허용하거나 거부한다. Unix-like 모델에서는 effective user ID와 supplementary group을 기준으로 owner·group·other의 read/write/execute bit를 선택한다. 여기서 `execute`는 regular file을 실행하는 의미일 뿐 아니라 directory에서는 그 안의 이름을 traverse/search할 수 있는 권한이라는 점이 중요하다.

예를 들어 `/srv/app/config.yaml`을 읽으려면 `/srv`와 `/srv/app`을 통과할 search 권한이 먼저 필요하고, 마지막 file의 read 권한이 있어야 한다. directory의 read는 entry 목록을 볼 수 있는지, write는 entry 생성·삭제·이름 변경이 가능한지를 제한하므로 file content permission과 같은 의미로 읽으면 안 된다. 실패는 path 중간 component의 부재, non-directory component, permission denial 등 서로 다른 원인으로 나타날 수 있다.

### Credential과 기본 mode는 더 넓은 정책의 일부다

process가 `root`인지 하나만으로 모든 접근을 설명할 수 없다. supplementary group, capability, ACL, filesystem mount option과 user namespace가 최종 판단에 영향을 줄 수 있고, privilege가 있는 process도 capability나 다른 kernel policy에 의해 제한될 수 있다. file을 새로 만들 때는 process의 umask가 요청한 기본 mode에서 일부 권한을 제거하므로 생성 시점과 이후 `chmod` 상태를 분리해 본다.

permission은 path를 아는지와도 다르다. path를 추측할 수 있어도 search/read 권한이 없으면 접근할 수 없고, 반대로 넓은 directory 권한과 writable file이 결합하면 의도하지 않은 이름 교체나 content 변조가 가능하다. 이 Topic에서는 OS permission 판정 mechanics를 다루며 구체적인 authentication/authorization 정책은 Security 영역에 둔다.

컨테이너에서 application user와 volume owner가 다르면 같은 path가 읽기·쓰기 실패를 낼 수 있다. 권한을 넓히기 전에 실제 UID/GID, supplementary group, mount와 필요한 operation을 확인하고 least privilege 범위 안에서 원인을 수정한다.

