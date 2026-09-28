---
kind: concept
contentKey: network-http.core.dns.iterative-resolution
topicContentKey: network-http.core.dns
slug: iterative-resolution
title: "반복 조회 과정"
summary: "재귀 리졸버가 상위 DNS 서버의 위임 정보를 따라 더 구체적인 권한 서버로 이동해 최종 응답을 찾는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 반복 조회 과정

재귀 리졸버가 캐시에 필요한 응답을 가지고 있지 않으면 DNS 계층을 따라 권한 서버를 찾아갈 수 있다. 이때 상위 DNS 서버가 최종 레코드를 직접 주는 대신 **다음에 질의할 권한 서버를 가리키는 위임 정보(referral)**를 돌려주고, 리졸버가 그 안내를 따라 다음 서버에 다시 질의하는 과정을 반복 조회라고 이해할 수 있다.

`www.example.com`을 찾는 흐름을 단순화하면 다음과 같다.

```text
재귀 리졸버 → 루트 서버
             ← .com 권한 서버로 가는 위임 정보

재귀 리졸버 → .com TLD 서버
             ← example.com 권한 서버로 가는 위임 정보

재귀 리졸버 → example.com 권한 서버
             ← 최종 A/AAAA 등 응답
```

루트 서버가 모든 호스트 주소를 직접 가지고 있는 것이 아니라 **더 구체적인 관리 경계로 가는 길을 알려 준다**는 점이 핵심이다.

### 캐시가 있으면 루트부터 매번 다시 시작하지 않는다

리졸버가 `.com` 위임 정보나 `example.com` 권한 서버 정보를 이미 캐시하고 있다면 중간 단계를 건너뛸 수 있다. 최종 A·AAAA 응답 자체가 아직 유효하면 권한 서버 질의도 필요하지 않다.

그래서 같은 이름을 조회하더라도 캐시 상태에 따라 실제 DNS 질의 횟수와 지연 시간이 달라진다.

### CNAME이 나오면 다른 이름을 추가로 해석해야 할 수 있다

최종 권한 응답에 CNAME 별칭이 포함되면 그 대상 이름의 레코드를 다시 찾아야 할 수 있다. 따라서 `도메인 하나 조회 = DNS 요청 한 번`이라고 일반화하면 안 된다.

반복 조회의 핵심은 **재귀 리졸버가 위임 정보를 따라 DNS 이름 공간의 관리 경계를 이동하면서 필요한 권한 응답을 찾고, 캐시가 있으면 그 일부 단계를 생략한다는 점**이다.
