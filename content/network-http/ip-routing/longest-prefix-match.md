---
kind: concept
contentKey: network-http.core.ip-routing.longest-prefix-match
topicContentKey: network-http.core.ip-routing
slug: longest-prefix-match
title: "최장 접두사 일치(Longest-Prefix Match)"
summary: "목적지에 여러 경로가 일치할 때 가장 긴 prefix, 즉 가장 구체적인 경로를 우선하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "여러 경로가 목적지와 일치할 때 더 구체적인 경로를 선택하는 IPv4 전달 규칙을 확인한다."
    displayOrder: 1
---
# 최장 접두사 일치(Longest-Prefix Match)

하나의 목적지 IP 주소는 라우팅 테이블의 여러 prefix에 동시에 포함될 수 있다. 이때 **일치하는 비트 수가 가장 많은 경로, 즉 prefix 길이가 가장 긴 경로를 우선**하는 것이 최장 접두사 일치(Longest-Prefix Match)다.

```text
0.0.0.0/0       → gateway A
10.0.0.0/8      → gateway B
10.1.2.0/24     → interface C
```

목적지가 `10.1.2.30`이면 세 경로가 모두 일치하지만 `/24`가 가장 긴 prefix이므로 `10.1.2.0/24` 경로가 우선한다.

### 더 긴 prefix는 더 좁고 구체적인 주소 범위를 뜻한다

`10.0.0.0/8`은 매우 넓은 범위를 포함하고 `10.1.2.0/24`는 그 안의 일부만 포함한다. 따라서 목적지가 `/24`에 속한다면 넓은 `/8`보다 이 목적지에 대한 더 구체적인 의도를 표현한 경로로 볼 수 있다.

이 원리 덕분에 기본 경로를 유지하면서 특정 네트워크만 VPN·전용선·다른 게이트웨이로 보내는 식의 경로 구성이 가능하다.

### `가장 가까운 라우터`나 `가장 빠른 경로`를 직접 고르는 규칙은 아니다

최장 접두사 일치는 목적지 주소와 prefix의 **비트 일치 길이**를 비교한다. 물리 거리나 지연 시간이 가장 작은 경로를 측정해 고르는 알고리즘이 아니다.

같은 prefix 길이를 가진 후보가 여러 개라면 metric, 라우팅 프로토콜의 선호도, ECMP, 정책 라우팅 같은 추가 기준이 적용될 수 있다. 따라서 최장 접두사 일치는 중요한 1차 경로 선택 기준이지만 전체 라우팅 정책을 혼자 설명하지는 않는다.

핵심은 **넓은 경로보다 목적지와 더 구체적으로 일치하는 긴 prefix 경로가 우선한다는 점**이다.
