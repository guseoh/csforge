---
kind: concept
contentKey: network-http.core.port-nat.pat
topicContentKey: network-http.core.port-nat
slug: pat
title: "주소·포트 변환(PAT)"
summary: "IP 주소와 전송 포트를 함께 변환해 여러 내부 연결이 하나의 공인 IP를 공유하는 방식과 포트 자원 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "전통적인 IPv4 NAT/NAPT의 주소·포트 변환과 상태 관리 규칙을 확인한다."
    displayOrder: 1
---
# 주소·포트 변환(PAT)

PAT 또는 NAPT는 IP 주소와 TCP·UDP 포트를 함께 변환하여 여러 내부 흐름이 외부 주소를 공유할 수 있게 합니다.

```text
10.0.0.5:40000 → 203.0.113.9:62001
10.0.0.6:40000 → 203.0.113.9:62002
```

같은 외부 목적지로 연결한다고 가정하면 위 변환 포트는 응답을 각 내부 흐름으로 구분하는 역할을 합니다. 실제 매핑 키 및 포트 재사용 범위는 NAT 구현과 정책에 따라 다릅니다.

### 포트 자원과 연결 수

변환 포트는 유한합니다. 동시 연결이 많고 매핑이 오래 유지되면 새 흐름에 필요한 변환 자원이 부족할 수 있습니다. 그러나 공인 IP당 정확히 65536개 연결만 가능하다고 단정할 수는 없습니다. 예약 포트, 목적지별 재사용 정책, TCP·UDP 구분 및 장비 제한이 영향을 줍니다.

백엔드의 외부 호출이 갑자기 실패한다면 커넥션 풀, NAT 포트 사용량, 매핑 수명 및 연결 오류를 함께 조사합니다.
