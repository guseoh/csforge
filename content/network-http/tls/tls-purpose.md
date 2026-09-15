---
kind: concept
contentKey: network-http.core.tls.tls-purpose
topicContentKey: network-http.core.tls
slug: tls-purpose
title: "TLS가 보호하는 것"
summary: "TLS가 endpoint 사이에서 confidentiality·integrity·peer authentication을 제공하는 목적과 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# TLS가 보호하는 것

network path에는 client와 server 사이의 packet을 관찰하거나 변조할 수 있는 여러 중간 지점이 존재한다. HTTP를 평문으로 주고받으면 중간에서 요청과 응답 내용을 읽거나 수정할 수 있고, client는 자신이 의도한 server와 통신하고 있는지도 별도로 확인하기 어렵다.

TLS는 두 TLS endpoint가 handshake를 거쳐 암호화된 channel을 만들도록 한다. 일반적인 certificate 기반 HTTPS에서는 이 channel이 세 가지 중요한 목표를 가진다. 전송 내용을 제3자가 읽기 어렵게 하는 **confidentiality**, 전송 중 data가 바뀌었는지 검출하는 **integrity**, 그리고 client가 certificate와 service identity를 검증해 의도한 server와 연결되었는지 확인하는 **authentication**이다.

### TLS의 보호 범위는 endpoint 사이의 channel이다

TLS가 보호하는 대상은 encryption이 적용되는 두 endpoint 사이의 traffic이다. reverse proxy에서 TLS가 종료되면 client와 proxy 사이 channel은 보호되지만, proxy가 복호화한 이후 backend까지의 구간은 별도의 connection이다. 그 구간을 다시 TLS로 보호할지는 별도 설계다.

또한 TLS가 성공했다고 HTTP 요청의 권한이 허용된 것은 아니다. TLS server authentication은 `이 endpoint가 기대한 service identity인가`를 확인하는 문제이고, 로그인한 사용자가 특정 API를 호출할 수 있는지는 application authorization의 문제다.

따라서 HTTPS를 이해할 때는 `암호화되어 있다`는 한 문장보다 **어느 두 endpoint 사이가 보호되는지, 상대 identity가 어떻게 검증되는지, TLS 이후 application이 어떤 권한 검사를 추가하는지**를 구분해야 한다.
