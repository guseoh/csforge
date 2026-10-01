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

NS와 MX는 모두 다른 서버 이름을 가리킬 수 있지만 **해결하려는 문제가 다르다.** NS 레코드는 DNS 영역(DNS zone)의 권한 위임과 관련되고, MX 레코드는 특정 도메인으로 들어오는 메일을 어느 메일 서버가 받을지 나타낸다.

### NS: 이 DNS 영역을 어느 서버가 담당하는가

상위 DNS 영역이 하위 영역을 위임할 때 NS 레코드는 하위 영역을 담당하는 권한 네임 서버의 이름을 알려 준다. 재귀 리졸버는 이 정보를 이용해 다음 DNS 관리 경계로 이동한다.

```text
example.com. NS ns1.example.net.
```

NS가 가리키는 값은 DNS 서버의 **이름**이다. 실제 통신을 하려면 필요한 경우 그 이름의 A·AAAA 주소도 알아야 한다.

### MX: 이 도메인의 메일을 어느 서버가 받을 것인가

MX 레코드는 메일 교환기(mail exchanger)의 이름과 우선순위 값을 제공한다. 일반적으로 더 낮은 우선순위 값이 먼저 선택된다.

```text
example.com. MX 10 mail1.example.com.
example.com. MX 20 mail2.example.com.
```

메일 송신자는 선택한 메일 서버 이름의 A·AAAA 레코드를 다시 조회해 실제 네트워크 주소를 얻고 SMTP 연결을 시도한다. MX 레코드 안에 서버 IP 주소나 SMTP 포트가 직접 들어가는 것은 아니다.

### MX가 없다고 메일 전달이 곧바로 불가능한 것은 아니다

SMTP에는 중요한 예외가 있다. 도메인에 **MX 레코드가 하나도 없으면**, 송신자는 그 도메인 자체를 우선순위 0의 암묵적 MX(implicit MX)처럼 취급하고 해당 이름의 주소 레코드로 직접 전달을 시도할 수 있다.

```text
example.com. A 203.0.113.10
# MX 없음

SMTP 송신 측
→ example.com 자체를 암묵적 MX로 취급
→ example.com의 A/AAAA 조회
→ 얻은 주소로 메일 전달 시도
```

반대로 MX 레코드가 하나 이상 존재한다면 명시된 MX 대상을 따라야 하며, 단순히 도메인 자신의 A·AAAA로 되돌아가는 이 대체 규칙을 적용하면 안 된다.

따라서 `웹용 A/AAAA는 정상인데 MX가 없다`는 사실만으로 메일 실패 원인을 확정할 수 없다. 실제로는 암묵적 MX 규칙에 따라 도메인 주소로 SMTP 연결이 가능한지까지 확인해야 한다.

### 메일을 받지 않는 도메인은 Null MX로 의도를 명시할 수 있다

도메인이 메일을 전혀 받지 않을 의도라면 MX를 그냥 비워 두는 것보다 RFC 7505의 Null MX를 사용할 수 있다.

```text
example.com. MX 0 .
```

이 표현은 `MX가 없어서 암묵적 MX 대체 규칙을 시도해야 하는 상태`와 다르다. Null MX는 **이 도메인이 메일 수신 서비스를 제공하지 않는다는 명시적인 신호**다.

| DNS 상태 | SMTP 송신 측의 의미 |
| --- | --- |
| MX 하나 이상 존재 | 우선순위에 따라 명시된 MX 대상을 선택 |
| MX 없음 | 도메인 자체를 암묵적 MX로 보고 A/AAAA 조회 가능 |
| `MX 0 .` | 메일을 받지 않는 도메인임을 명시 |

따라서 `NS가 정상이다`라는 사실만으로 `메일 수신 설정도 정상이다`라고 볼 수 없고, 웹 주소 A·AAAA의 정상 여부만으로 메일 전달 결과를 단정해서도 안 된다.

핵심은 **NS는 DNS 영역의 권한 위임을 나타내고, MX는 메일 전달 대상을 나타내며, MX가 없을 때와 Null MX가 있을 때의 SMTP 의미까지 구분해야 한다는 점**이다.
