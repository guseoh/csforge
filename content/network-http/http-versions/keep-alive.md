---
kind: concept
contentKey: network-http.core.http-versions.keep-alive
topicContentKey: network-http.core.http-versions
slug: keep-alive
title: "Keep-Alive"
summary: "idle connection 유지가 handshake 비용과 resource 점유를 바꾸는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# Keep-Alive

keep-alive는 connection을 response 뒤에도 유지해 다음 request가 같은 transport를 재사용하게 한다. handshake, TLS, congestion warm-up을 줄일 수 있지만 server socket, memory, NAT mapping을 idle 동안 점유한다.

client와 server 중 어느 쪽도 언제든 connection을 닫을 수 있으므로 pooled connection은 stale 상태를 처리해야 한다. keep-alive duration을 너무 길게 두면 resource exhaustion, 너무 짧게 두면 reconnect 비용이 커진다.

### Backend 연결

HTTP client의 idle eviction, max lifetime, validation과 load balancer timeout을 정렬한다. pool에서 꺼낸 뒤 첫 write 실패를 적절한 request만 재시도한다.
