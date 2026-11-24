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

애플리케이션이 도메인 이름을 해석할 때 일반적으로 루트 DNS부터 직접 탐색하지는 않습니다. 가까운 스텁 리졸버(stub resolver)에 요청을 전달하고, 스텁은 설정된 재귀 리졸버(recursive resolver)를 통해 답을 얻습니다.

### 스텁 리졸버

스텁은 애플리케이션 가까이에서 이름 해석 요청을 받아 설정된 DNS 서비스에 전달하고 응답을 돌려주는 역할을 합니다. 운영체제의 이름 해석 기능은 hosts 파일이나 별도 캐시를 이용할 수도 있습니다. 따라서 애플리케이션의 이름 해석 호출이 항상 실제 DNS 패킷을 발생시키는 것은 아닙니다.

### 재귀 리졸버

재귀 리졸버는 요청에 대한 최종 응답이나 오류를 제공하기 위해 유효한 캐시를 확인하고 필요한 조회를 수행합니다. 직접 반복 조회를 수행하거나 설정에 따라 다른 리졸버로 포워딩할 수도 있습니다.

```text
애플리케이션
   ↓
스텁 리졸버 / OS·런타임 상태
   ↓
재귀 리졸버
   ├─ 캐시 적중 → 저장된 응답 반환
   └─ 캐시 미스 → 필요한 DNS 조회 → 응답 반환
```

### 장애 분석

권한 DNS에 새 주소를 등록했는데 특정 Java 애플리케이션만 이전 주소로 접속한다면 권한 서버의 답, 재귀 리졸버의 캐시, OS의 이름 해석 결과, JVM의 캐시를 순서대로 확인합니다. 기존 커넥션 풀의 연결 재사용도 별도 원인입니다.

스텁과 재귀 리졸버의 책임을 구분하면 애플리케이션 호출 한 번이 여러 DNS 질의로 이어지거나 캐시 적중으로 네트워크 요청 없이 끝나는 이유를 설명할 수 있습니다.
