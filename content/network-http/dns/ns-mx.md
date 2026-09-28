---
kind: concept
contentKey: network-http.core.dns.ns-mx
topicContentKey: network-http.core.dns
slug: ns-mx
title: "NS·MX 레코드"
summary: "NS 레코드의 zone 위임 대상과 MX 레코드의 메일 수신 대상을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NS와 MX 레코드가 각각 어떤 이름을 가리키고 DNS에서 어떤 역할을 하는지 확인한다."
    displayOrder: 1
---
# NS·MX 레코드

NS와 MX는 모두 다른 서버 이름을 가리킬 수 있지만 **해결하려는 문제가 다르다.** NS 레코드는 DNS zone의 권한 위임과 관련되고, MX 레코드는 특정 도메인으로 들어오는 메일을 어느 메일 서버가 받을지 나타낸다.

### NS: 이 zone을 어느 DNS 서버가 담당하는가

상위 zone이 하위 zone을 위임할 때 NS 레코드는 하위 zone을 담당하는 권한 네임 서버의 이름을 알려 준다. 재귀 리졸버는 이 정보를 이용해 다음 DNS 관리 경계로 이동한다.

```text
example.com. NS ns1.example.net.
```

NS가 가리키는 값은 DNS 서버의 **이름**이다. 실제 통신을 하려면 필요한 경우 그 이름의 A·AAAA 주소도 알아야 한다.

### MX: 이 도메인의 메일을 어느 서버가 받을 것인가

MX 레코드는 메일 교환기(mail exchanger)의 이름과 우선순위 값을 제공한다. 일반적으로 더 낮은 preference 값이 우선된다.

```text
example.com. MX 10 mail1.example.com.
example.com. MX 20 mail2.example.com.
```

메일 송신자는 선택한 메일 서버 이름의 A·AAAA 레코드를 다시 조회해 실제 네트워크 주소를 얻고 SMTP 연결을 시도한다.

따라서 `NS가 정상이다`라는 사실만으로 `메일 수신 설정도 정상이다`라고 볼 수 없다. 웹 주소 A·AAAA와 메일 MX 역시 서로 다른 DNS 데이터다.

NS와 MX의 핵심은 **NS는 DNS zone의 권한 서버 위임을, MX는 메일 전달 대상을 표현하며 둘 다 최종 네트워크 주소가 아니라 서버 이름을 연결한다는 점**이다.
