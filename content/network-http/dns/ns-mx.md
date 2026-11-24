---
kind: concept
contentKey: network-http.core.dns.ns-mx
topicContentKey: network-http.core.dns
slug: ns-mx
title: "NS·MX 레코드"
summary: "NS 레코드의 영역 위임 대상과 MX 레코드의 메일 수신 대상을 구분하고, MX가 없을 때의 SMTP 암묵적 MX 규칙과 Null MX를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc5321"
    title: "Simple Mail Transfer Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SMTP 송신자가 MX를 선택하는 규칙과 MX가 없을 때 주소 레코드로 이어지는 암묵적 MX 처리를 확인한다."
    displayOrder: 2
  - url: "https://www.rfc-editor.org/rfc/rfc7505"
    title: "A 'Null MX' No Service Resource Record for Domains That Accept No Mail"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "메일을 받지 않는 도메인이 `MX 0 .`으로 이를 명시하는 Null MX 규칙을 확인한다."
    displayOrder: 3
---
# NS·MX 레코드

NS와 MX는 모두 다른 서버의 DNS 이름을 담을 수 있지만 역할은 다릅니다. NS는 DNS 영역을 담당하는 네임 서버를 나타내고 MX는 해당 도메인의 메일을 수신할 메일 교환기를 나타냅니다.

### NS: DNS 영역의 관리 책임

상위 zone에 등록된 NS 레코드는 하위 영역의 권한 서버를 안내합니다. zone 자체에도 권한 서버 집합을 나타내는 NS 레코드가 존재합니다.

```text
example.com. NS ns1.example.net.
```

리졸버가 실제로 해당 서버에 접근하려면 그 서버의 IP 주소가 필요합니다. 필요한 주소를 별도로 해석하거나 위임 과정에서 제공되는 주소 정보를 이용할 수 있습니다.

### MX: 메일 수신 대상

MX는 메일 교환기의 이름과 선호도 값을 포함합니다. 낮은 값이 우선이며 값이 같은 여러 대상도 구성할 수 있습니다.

```text
example.com. MX 10 mail1.example.com.
example.com. MX 20 mail2.example.com.
```

SMTP 송신자는 MX 대상을 선택하여 주소를 해석하고 SMTP 연결을 시도합니다. MX 자체에는 IP 주소나 SMTP 포트가 들어 있지 않습니다.

### MX가 없는 경우와 Null MX

RFC 5321의 SMTP 규칙에서는 이름이 존재하지만 MX 레코드가 없으면 도메인 자체를 선호도 0의 암묵적 MX처럼 취급합니다. 명시된 MX가 존재하는 경우 이 대체 규칙을 적용하지 않습니다. DNS 조회 자체의 일시적 실패도 단순히 MX가 없는 상황과 구분해야 합니다.

```text
example.com. MX 0 .
```

RFC 7505의 Null MX는 메일 수신 서비스를 제공하지 않는다는 명시적 신호입니다. 다른 MX와 함께 게시하지 않습니다.

| DNS 상태 | SMTP 송신 측의 의미 |
| --- | --- |
| 일반 MX 존재 | 명시된 대상과 선호도에 따라 전달 시도 |
| MX 없음 | 도메인 자체를 암묵적 MX로 취급 |
| MX 0 . | 메일 수신 서비스 없음 |

NS가 정상이어도 MX 또는 SMTP 연결이 실패할 수 있으므로 실제 서비스까지 별도로 조사해야 합니다.
