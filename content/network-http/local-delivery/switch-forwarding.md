---
kind: concept
contentKey: network-http.core.local-delivery.switch-forwarding
topicContentKey: network-http.core.local-delivery
slug: switch-forwarding
title: "Switch Forwarding"
summary: "switch가 MAC learning table로 local frame을 전달하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# Switch Forwarding

switch는 들어온 frame의 source MAC을 port와 학습하고 destination MAC table을 사용해 특정 port로 전달한다. 목적지를 모르면 같은 broadcast domain으로 flood할 수 있고, table entry가 만료되면 다시 학습한다.

switch forwarding은 IP routing과 다르다. switch는 local frame을 처리하고 router는 IP prefix와 next hop을 바꾸며 다른 network로 넘긴다.

### Backend 연결

같은 subnet의 서비스 통신이 “router를 거치지 않는다”는 사실과 service mesh·proxy 경로는 별도다. 장애를 볼 때 physical/virtual switch와 application intermediary를 구분한다.

