---
kind: concept
contentKey: network-http.core.ip-routing.private-public-ip
topicContentKey: network-http.core.ip-routing
slug: private-public-ip
title: "Private·Public IP"
summary: "routable address와 private address의 reachability 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1918"
    title: "Address Allocation for Private Internets"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "private·public address와 NAT 경계를 확인한다."
    displayOrder: 1
---
# Private·Public IP

Private IPv4 address는 조직 내부에서 반복해서 사용할 수 있도록 예약된 address range다. 대표적으로 RFC 1918이 정의한 범위는 public Internet의 global routing 대상으로 사용하지 않는다. 그래서 서로 다른 private network에서 같은 address를 동시에 사용할 수 있다.

Public address는 global Internet routing에 사용할 수 있는 address space에 속한다. 하지만 public address를 가진다는 사실만으로 특정 service가 실제로 reachable하다는 뜻은 아니다. Reachability에는 route, endpoint와 정책 같은 다른 조건도 필요하다.

### Private address도 network 안에서는 직접 route될 수 있다

`private = 통신 불가`가 아니다. 같은 private network나 서로 route가 구성된 private networks 사이에서는 NAT 없이 직접 통신할 수 있다. Public Internet 경계를 넘어갈 때 private address를 그대로 global route할 수 없기 때문에 NAT, proxy나 다른 explicit boundary가 사용될 수 있다.

### Address scope와 access policy는 다른 문제다

Private address라는 이유로 자동으로 trusted하거나, public address라는 이유로 자동으로 허용되는 것은 아니다. Private/public 구분은 **address의 routing scope**에 관한 것이며 traffic 허용 정책은 별도의 책임이다.

핵심은 private IPv4 address가 여러 내부 network에서 재사용 가능한 non-global address이고, public address는 global routing에 사용할 수 있는 address라는 점이다.
