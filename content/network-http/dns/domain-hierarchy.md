---
kind: concept
contentKey: network-http.core.dns.domain-hierarchy
topicContentKey: network-http.core.dns
slug: domain-hierarchy
title: "도메인 계층 구조"
summary: "DNS 이름 공간이 루트부터 TLD·하위 도메인으로 계층화되고 zone과 위임으로 관리 책임이 나뉘는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 도메인 계층 구조

DNS 이름 공간(namespace)은 점(`.`)으로 구분된 **레이블(label)을 계층적으로 연결한 구조**다. 완전한 도메인 이름은 오른쪽에서 왼쪽으로 루트, 최상위 도메인(TLD), 그 아래 도메인과 호스트 이름으로 이어진다.

예를 들어 `www.example.com.`은 다음처럼 볼 수 있다.

```text
루트(.)
 └─ com
     └─ example
         └─ www
```

### 하나의 DNS 서버가 전체 이름 공간을 관리하지 않는다

DNS는 이름 공간을 zone 단위로 나누고 **위임(delegation)**으로 관리 책임을 분산한다. 상위 zone은 NS 레코드를 이용해 하위 zone을 어느 권한 서버가 담당하는지 알려 줄 수 있고, 하위 권한 서버는 자신이 맡은 zone의 레코드에 답한다.

이 구조 덕분에 루트 서버가 전 세계 모든 호스트 레코드를 직접 가지고 있을 필요가 없다.

### 도메인 계층과 zone 경계는 항상 같지 않다

`dev.example.com`이 `example.com` 아래에 있다는 사실만으로 두 이름이 반드시 같은 zone에서 관리된다고 볼 수는 없다. `dev.example.com`을 별도 zone으로 위임하면 DNS 이름 계층에는 포함되지만 권한 관리 경계는 분리된다.

따라서 장애나 설정 문제를 조사할 때는 문자열의 도메인 계층뿐 아니라 **어디에서 zone이 나뉘고 어느 권한 서버로 위임됐는지** 확인해야 한다.

DNS 계층 구조의 핵심은 **하나의 거대한 이름 목록을 한 서버가 관리하는 것이 아니라, 계층적인 이름 공간을 zone과 위임으로 나눠 여러 권한 서버가 분산 관리한다는 점**이다.
