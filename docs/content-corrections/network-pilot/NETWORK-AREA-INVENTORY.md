# Network & HTTP 도식화 전체 현황 — source inventory (2026-11-08)

이 문서는 content/curriculum/network-http.yaml의 실제 127개 Concept를 분류하고, 53개 DIAGRAM 지정 대상의 시각화 선언 유무를 Markdown에서 직접 검사한 결과를 기록한다. Issue #278의 모든 콘텐츠 정확성·Question·Reference 전수 검토를 대체하지 않는다.

- 전체 127개: DIAGRAM 53, TEXT 58, NONE 16 (현재 Curriculum 기준).
- PR #298 확장 구현에서 DIAGRAM 대상 53개 전체에 단일 Reader 시각화 선언이 연결되었다. 기존 4개 + 새 고정 예제 49개이며, 전체 CI/Chromium 최종 결과는 해당 PR HEAD의 GitHub Actions를 확인한다.
- N-02 transport-establishment는 Curriculum상 TEXT이지만 사용자 승인 사양에 따라 HTTP/TCP 시각화가 추가된 별도 사례다. 분류 정합성 재검토는 Curriculum Foundation에서 처리한다.
- “도식 선언 있음”은 브라우저 품질·프로토콜 정확성·Production Import 성공의 증거가 아니다.
- 53개에 대해 원본 Markdown의 선언·이미지·ASCII 사례를 확인했으며, 임의로 모든 TEXT 또는 NONE 개념에 그림을 강제하지 않는다.

| Topic | Concept key | 표시 상태 |
| --- | --- | --- |
| layering | [network-http.core.layering.link-network-transport-application](../../../content/network-http/layering/link-network-transport-application.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| layering | [network-http.core.layering.encapsulation](../../../content/network-http/layering/encapsulation.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| layering | [network-http.core.layering.decapsulation](../../../content/network-http/layering/decapsulation.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| local-delivery | [network-http.core.local-delivery.switch-forwarding](../../../content/network-http/local-delivery/switch-forwarding.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| local-delivery | [network-http.core.local-delivery.broadcast-domain](../../../content/network-http/local-delivery/broadcast-domain.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| local-delivery | [network-http.core.local-delivery.arp](../../../content/network-http/local-delivery/arp.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| local-delivery | [network-http.core.local-delivery.default-gateway](../../../content/network-http/local-delivery/default-gateway.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| ip-routing | [network-http.core.ip-routing.prefix-subnet](../../../content/network-http/ip-routing/prefix-subnet.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| ip-routing | [network-http.core.ip-routing.routing-table](../../../content/network-http/ip-routing/routing-table.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| ip-routing | [network-http.core.ip-routing.router-forwarding](../../../content/network-http/ip-routing/router-forwarding.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| port-nat | [network-http.core.port-nat.connection-tuple](../../../content/network-http/port-nat/connection-tuple.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| port-nat | [network-http.core.port-nat.nat](../../../content/network-http/port-nat/nat.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| port-nat | [network-http.core.port-nat.nat-mapping](../../../content/network-http/port-nat/nat-mapping.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| dns | [network-http.core.dns.domain-hierarchy](../../../content/network-http/dns/domain-hierarchy.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| dns | [network-http.core.dns.iterative-resolution](../../../content/network-http/dns/iterative-resolution.md) | N-01~05 구현, QA 통과 |
| dns | [network-http.core.dns.cname](../../../content/network-http/dns/cname.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| dns | [network-http.core.dns.dns-failure](../../../content/network-http/dns/dns-failure.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| tcp | [network-http.core.tcp.three-way-handshake](../../../content/network-http/tcp/three-way-handshake.md) | N-01~05 구현, QA 통과 |
| tcp | [network-http.core.tcp.acknowledgement](../../../content/network-http/tcp/acknowledgement.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| tcp | [network-http.core.tcp.sliding-window](../../../content/network-http/tcp/sliding-window.md) | N-01~05 구현, QA 통과 |
| tcp | [network-http.core.tcp.congestion-control](../../../content/network-http/tcp/congestion-control.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| tcp | [network-http.core.tcp.connection-teardown](../../../content/network-http/tcp/connection-teardown.md) | N-01~05 구현, QA 통과 |
| tcp | [network-http.core.tcp.tcp-head-of-line](../../../content/network-http/tcp/tcp-head-of-line.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| udp | [network-http.core.udp.delivery-order-guarantee](../../../content/network-http/udp/delivery-order-guarantee.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| udp | [network-http.core.udp.application-reliability](../../../content/network-http/udp/application-reliability.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| tls | [network-http.core.tls.pki](../../../content/network-http/tls/pki.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| tls | [network-http.core.tls.tls-handshake](../../../content/network-http/tls/tls-handshake.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| tls | [network-http.core.tls.tls-termination](../../../content/network-http/tls/tls-termination.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| request-journey | [network-http.core.request-journey.url-components](../../../content/network-http/request-journey/url-components.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| request-journey | [network-http.core.request-journey.dns-to-route](../../../content/network-http/request-journey/dns-to-route.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| request-journey | [network-http.core.request-journey.tls-before-http](../../../content/network-http/request-journey/tls-before-http.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| request-journey | [network-http.core.request-journey.http-request-delivery](../../../content/network-http/request-journey/http-request-delivery.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| request-journey | [network-http.core.request-journey.proxy-gateway-path](../../../content/network-http/request-journey/proxy-gateway-path.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-message | [network-http.core.http-message.header-body](../../../content/network-http/http-message/header-body.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-message | [network-http.core.http-message.content-negotiation](../../../content/network-http/http-message/content-negotiation.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-methods | [network-http.core.http-methods.put](../../../content/network-http/http-methods/put.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-methods | [network-http.core.http-methods.protocol-idempotency-boundary](../../../content/network-http/http-methods/protocol-idempotency-boundary.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-status | [network-http.core.http-status.redirect-status](../../../content/network-http/http-status/redirect-status.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-status | [network-http.core.http-status.429](../../../content/network-http/http-status/429.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-status | [network-http.core.http-status.500-502-503-504](../../../content/network-http/http-status/500-502-503-504.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-versions | [network-http.core.http-versions.http11-persistent](../../../content/network-http/http-versions/http11-persistent.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-versions | [network-http.core.http-versions.http11-pipelining](../../../content/network-http/http-versions/http11-pipelining.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-versions | [network-http.core.http-versions.http2-stream](../../../content/network-http/http-versions/http2-stream.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-versions | [network-http.core.http-versions.quic](../../../content/network-http/http-versions/quic.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-versions | [network-http.core.http-versions.transport-head-of-line](../../../content/network-http/http-versions/transport-head-of-line.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-cache | [network-http.core.http-cache.if-none-match](../../../content/network-http/http-cache/if-none-match.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-cache | [network-http.core.http-cache.304](../../../content/network-http/http-cache/304.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-cache | [network-http.core.http-cache.intermediary-cache](../../../content/network-http/http-cache/intermediary-cache.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-state-intermediary | [network-http.core.http-state-intermediary.cookie-scope](../../../content/network-http/http-state-intermediary/cookie-scope.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-state-intermediary | [network-http.core.http-state-intermediary.proxy](../../../content/network-http/http-state-intermediary/proxy.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-state-intermediary | [network-http.core.http-state-intermediary.reverse-proxy](../../../content/network-http/http-state-intermediary/reverse-proxy.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-state-intermediary | [network-http.core.http-state-intermediary.trusted-proxy-boundary](../../../content/network-http/http-state-intermediary/trusted-proxy-boundary.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |
| http-state-intermediary | [network-http.core.http-state-intermediary.cdn-http-intermediary](../../../content/network-http/http-state-intermediary/cdn-http-intermediary.md) | 신규 `network-area` 도식 구현 · 최종 통합 QA 대상 |

## 일괄 실행 정책

남은 49개는 단일 개념씩 사용자에게 승인받지 않고, 실제 콘텐츠의 학습 목적과 프로토콜 의미를 확인한 후 Topic 묶음으로 처리한다. 추상 그래프 템플릿을 기계적으로 반복하거나 DIAGRAM 지정 개수만 맞추지 않는다.

1. 계층·LAN·IP/라우팅·NAT: 캡슐화/역캡슐화, 스위치·ARP·게이트웨이, 라우팅, 변환 전후 대응
2. DNS·TCP·UDP: 권한 경계·캐시, ACK/재전송/혼잡/차단, UDP 신뢰성 책임
3. TLS·URL·요청 전달: TLS 인증/종단, 요청 전달 경로와 실패 경계
4. HTTP 의미론·상태·버전: 메시지 구조, status, HTTP/1.1과 HTTP/2·QUIC 경계
5. 캐시·쿠키·프록시: 조건부 요청, 캐시 재사용, 신뢰 프록시 경계

각 묶음은 RFC/공식 문서 검증 → 작성 → Java/JS 콘텐츠 계약 테스트 → Chromium 라이트/다크 데스크톱 QA → 전체 Concept/Question 검수 → 격리 Import 검증의 단계를 따른다. 운영 데이터·개인 이력은 테스트용으로 사용하지 않는다. Issue #278의 Network 전체 리뷰 계약과 연결한다.

PR #298은 53개 DIAGRAM 지정 Concept의 도식 구현을 모두 포함한다. 자동화된 렌더링 검증 결과와 실제 Reader·격리 Import 검증 결과는 최신 PR HEAD를 기준으로 별도 판정하며, 병합·Production 쓰기는 자동으로 진행하지 않는다.

## 49개 일괄 구현 검증 경계

- 구현 모델은 `network-area-link-routing.ts`(13개), `network-area-protocol.ts`(11개), `network-area-http-semantics.ts`(12개), `network-area-http-transport.ts`(13개)로 나뉜다.
- 각 고정 예제는 단일 학습 목표와 가정, 모델에 맞춘 6종 정적 표현(stack/path/compare/branch/matrix/sequence) 중 하나를 사용한다. 임의 그래프 데이터·좌표·HTML·SVG는 canonical 콘텐츠에서 받을 수 없다.
- 53개 DIAGRAM Concept의 Markdown 모두 정확히 1개 `csforge-viz`를 포함하도록 검증한다. 신규 49개의 기존 `contentKey`·문항·reference·기타 frontmatter는 보존한다.
- 단순 ASCII 도식으로 표기된 첫 부분은 Reader 도식 선언으로 교체하고, 고유 예제 문자열 등 유용한 기존 본문 데이터는 남긴다.
- **통합 QA 한 번에 실행:** Java+Zod 공유 계약 및 프런트엔드 전체 검사, 5개 Pilot 브라우저 QA, 49개 신규 도식의 다크/라이트 × 1280/1440 총 196개 시각 검사와 텍스트 잘림 검사. QA 실패 시 해당 문제를 수정 후 전체 QA를 다시 실행한다.
- 127개 Concept/Question 원문 전체 기술·난이도·Reference 검토, 실제 격리 Import Apply/2회 UNCHANGED, 운영 Reader DB 동기화는 이 시각화 구현 범위와 별도 검증 관문이다.
