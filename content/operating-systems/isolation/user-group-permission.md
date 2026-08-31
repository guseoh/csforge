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
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process isolation과 namespace 경계를 확인한다."
    displayOrder: 1
---
# User, Group and Permission

OS는 process의 effective user·group과 resource의 owner·permission을 비교해 접근을 허용하거나 거부한다. read, write, execute를 분리하고 directory permission은 파일 내용과 다른 lookup 의미를 가진다.

process가 root인지 여부만으로 모든 접근을 설명하지 않고 supplementary group, capability, ACL, mount 옵션을 함께 본다. 권한 변경과 file creation의 umask도 lifecycle에 영향을 준다.

### Backend 연결

컨테이너에서 application user와 volume owner가 다르면 같은 경로가 읽기·쓰기 실패를 낼 수 있다. 권한을 넓히기 전에 실제 UID/GID와 필요한 작업을 확인한다.

