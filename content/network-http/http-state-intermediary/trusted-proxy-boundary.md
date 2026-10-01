---
kind: concept
contentKey: network-http.core.http-state-intermediary.trusted-proxy-boundary
topicContentKey: network-http.core.http-state-intermediary
slug: trusted-proxy-boundary
title: "신뢰하는 프록시 경계"
summary: "백엔드가 전달 메타데이터를 신뢰할 수 있는 프록시를 실제 연결 상대와 경로 정책으로 제한하는 경계를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7239"
    title: "Forwarded HTTP Extension"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "forwarded identity와 trusted intermediary 경계를 확인한다."
    displayOrder: 1
---
# 신뢰하는 프록시 경계

`Forwarded`와 `X-Forwarded-*` 필드는 프록시가 관찰한 요청 메타데이터를 전달하지만 누가 값을 작성했는지 증명하지는 못한다. 외부 클라이언트도 임의의 전달 필드를 보낼 수 있으므로 백엔드가 모든 값을 그대로 믿으면 주소·스킴·호스트가 위조될 수 있다.

신뢰 프록시 경계는 **어느 중개자가 전달 값을 정리하고 추가했다고 믿을지** 정하는 정책이다. 흔한 구성에서는 외부 요청이 신뢰 경계에 도달할 때 기존 전달 필드를 제거하거나 규칙에 따라 다시 쓴다. 백엔드는 실제 연결 상대가 허용된 프록시인지 확인한 뒤 해당 메타데이터를 사용한다.

```text
신뢰되지 않은 클라이언트
          ↓
신뢰 경계 프록시
  - 외부에서 온 전달 정보 정리
  - 관찰한 메타데이터 추가
          ↓
백엔드
  - 허용된 출처가 보낸 값만 해석
```

프록시가 추가되거나 배치 순서가 바뀌면 어느 구간의 값이 원래 클라이언트를 나타내는지도 달라질 수 있다. 그러므로 ‘첫 번째 IP’ 또는 ‘마지막 IP’를 모든 환경에서 무조건 신뢰하는 규칙은 안전하지 않다.

신뢰된 프록시가 전달한 클라이언트 주소는 네트워크에서 관찰한 값이지 애플리케이션 사용자 신원이나 접근 권한을 대신하지 않는다. **전달 메타데이터의 신뢰는 프록시 배치에 대한 계약이며 사용자 인증과 권한 확인은 별도로 수행해야 한다.**
