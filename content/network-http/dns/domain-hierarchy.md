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

DNS 이름 공간은 점으로 구분된 레이블을 계층적으로 연결한 구조입니다. 완전한 도메인 이름인 www.example.com.을 오른쪽부터 읽으면 루트, 최상위 도메인(com), example, www 순서로 관리 구조를 살펴볼 수 있습니다. 끝의 점은 DNS 루트를 나타냅니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "도메인 계층 구조",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "domain-hierarchy"
}
```

### 관리 책임을 나누는 위임

DNS는 전체 이름 공간을 한 서버가 관리하지 않습니다. DNS zone을 단위로 관리 권한을 나누고 상위 영역의 NS 레코드를 통해 하위 영역의 권한 서버를 안내합니다. 루트 서버는 모든 호스트 IP를 보관하는 대신 최상위 도메인 서버로 이어지는 정보를 제공합니다.

도메인 이름의 계층과 실제 zone 경계는 구분해야 합니다. dev.example.com이 example.com의 하위 이름이라고 해도 별도 zone으로 위임되어 다른 운영 주체가 관리할 수 있습니다. 모든 하위 도메인에 별도의 권한 서버가 필요한 것은 아닙니다.

### 백엔드 운영에서의 의미

개발 환경용 서브도메인을 별도 DNS 서비스에 위임했다면 부모 영역과 자식 영역의 NS 구성이 일치하는지 확인해야 합니다. 레코드를 수정했는데 조회 결과가 바뀌지 않는다면 실제로 해당 이름에 대한 권한이 있는 zone을 수정했는지부터 확인합니다.
