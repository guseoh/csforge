---
kind: concept
contentKey: network-http.core.dns.stub-recursive-resolver
topicContentKey: network-http.core.dns
slug: stub-recursive-resolver
title: "스텁 리졸버와 재귀 리졸버"
summary: "애플리케이션 가까이에서 질의를 전달하는 스텁 리졸버와 캐시·위임 탐색으로 최종 DNS 응답을 찾는 재귀 리졸버를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 스텁 리졸버와 재귀 리졸버

애플리케이션이 도메인 이름을 해석할 때 루트 서버부터 최종 권한 서버까지 직접 모두 질의하는 경우는 일반적이지 않다. 보통 애플리케이션 가까이의 **스텁 리졸버(stub resolver)**가 설정된 **재귀 리졸버(recursive resolver)**에 질의를 맡기고, 재귀 리졸버가 캐시와 DNS 위임 구조를 이용해 최종 응답을 찾아 준다.

### 스텁 리졸버: 애플리케이션과 DNS 서비스 사이의 가까운 창구

스텁 리졸버는 애플리케이션이 요청한 이름과 레코드 유형을 DNS 질의로 만들어 재귀 리졸버에 보내고 결과를 돌려준다. 운영체제나 언어 런타임이 별도 DNS 캐시·주소 선택 정책을 가지고 있다면 이 경로에 추가 상태가 생길 수 있다.

### 재귀 리졸버: 캐시를 확인하고 필요한 조회를 대신 수행한다

재귀 리졸버는 먼저 자신이 가진 캐시를 확인한다. 아직 유효한 응답이 있으면 바로 반환하고, 없으면 루트·TLD·권한 서버의 위임 정보를 따라 필요한 질의를 수행한다. 얻은 결과는 TTL 범위 안에서 캐시에 저장해 다음 요청에 재사용할 수 있다.

```text
애플리케이션
   ↓
스텁 리졸버 / OS·런타임 상태
   ↓
재귀 리졸버
   ├─ 캐시 적중 → 저장된 DNS 응답 반환
   └─ 캐시 미스 → 위임을 따라 권한 서버 조회 → 응답 반환
```

### 같은 이름을 물어도 어디의 캐시를 보는지에 따라 결과가 다를 수 있다

권한 서버에는 새 주소가 반영됐는데 특정 애플리케이션만 예전 주소를 본다면 무작정 DNS 전체를 장애로 판단하지 말고 `권한 서버 → 재귀 리졸버 → OS/스텁 → 애플리케이션 런타임` 순서로 값을 비교해야 한다.

스텁과 재귀 리졸버를 구분하면 **애플리케이션에서 DNS 조회를 한 번 호출했어도 실제 네트워크에서는 여러 질의가 발생할 수 있고, 반대로 캐시가 있으면 네트워크 질의 없이 끝날 수도 있는 이유**를 이해할 수 있다.
