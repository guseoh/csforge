---
kind: concept
contentKey: network-http.core.tcp.time-wait
topicContentKey: network-http.core.tcp
slug: time-wait
title: "TIME_WAIT"
summary: "지연 segment와 마지막 ACK 재전송을 처리하기 위해 기다리는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 110
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TIME_WAIT

보통 TCP의 active closer는 close handshake 뒤 TIME_WAIT에 머문다. 이 상태는 지연된 segment가 같은 local/remote tuple을 재사용한 새 connection state와 섞이지 않게 하고, peer가 마지막 ACK를 받지 못해 FIN을 재전송했을 때 다시 ACK할 수 있는 시간을 남긴다. 표준 설명의 2MSL 개념처럼 일정 기간 유지되는 correctness state이지 단순한 memory leak가 아니다.

짧은 connection을 대량으로 만들면 active closer 쪽에 TIME_WAIT socket과 ephemeral port 사용이 누적되어 새 connect가 실패할 수 있다. server가 항상 TIME_WAIT를 만드는 것도 아니고, socket option으로 무리하게 tuple을 재사용하면 늦은 segment 오인이나 protocol violation 위험이 있으므로 원인과 안전한 reuse 조건을 확인해야 한다.

keep-alive와 connection reuse는 handshake뿐 아니라 TIME_WAIT pressure도 줄인다. load test에서 TIME_WAIT 수가 많다고 kernel timeout을 무조건 줄이지 말고, 어느 쪽이 active close를 수행했는지, 실제 ephemeral port/NAT port exhaustion인지, connection pool과 peer idle timeout이 어떤지 먼저 확인한다.
