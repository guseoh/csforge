# Network & HTTP G2 — 127개 Concept 시각화 재평가 (소스 기반 1차 감사)

> 상태: **소스 기반 분류 완료 / 실제 Reader 전수 시각 QA 미실행 / 전체 G2 구현 미완료**.
> 기준: `viz/network-g2` 시작점 `refactor@997393f8`; 비교 `main@425872f7` (2026-11-15).
> 이 파일은 Network 전용 감사 기록이며 다른 학습 영역·공통 렌더러의 변경을 승인하지 않습니다.

## 1. 근거와 중복 방지

- 현행 `content/curriculum/network-http.yaml`: **127 Concept = DIAGRAM 53 + TEXT 58 + NONE 16**, 15 Topic.
- 기존 `docs/content-audit/issue-277/network-http.json`: **127/127 시각화 필요성/학습 질문/표현 목표**, 당시 분류 REQUIRED 55, RECOMMENDED 44, NONE 28.
- `docs/content-audit/learning-experience-2026/wave-3/network-http.json`: Concept·Question 품질 리뷰, `wave-3/visualization-reference-followups.md`에서 근거 추가 후보 확인.
- 병합된 [PR #298](https://github.com/guseoh/csforge/pull/298): `main`에서 Curriculum DIAGRAM 53/53 구현, 49개 `network-area` + 4개 기존/전용 도식. TEXT인 `transport-establishment`에 별도 추가 도식도 있음.
- G1의 49개 콘텐츠 지정 사례는 6개 레이아웃(stack/path/compare/branch/matrix/sequence)을 공유하며, `NetworkAreaVisualization.tsx`는 긴 레이블을 **최대 3줄로 잘라** 화면에서 텍스트가 누락될 수 있습니다. 실제 손실·레이아웃 깨짐은 브라우저 검증 전까지 *잠재적 결함*입니다.
- **중요한 브랜치 차이:** 최신 `refactor`에는 PR #298의 49개 `network-area` 선언과 전용 Network 렌더러·스키마·계약이 없으며, `main`과 히스토리가 divergence 상태입니다. `refactor`에 G1을 임의 재구축하거나 공유 `LearningVisualization.tsx`, 파서, 공통 CSS, backend import allowlist를 변경하면 이번 작업의 file ownership 경계를 위반합니다. G1의 refactor 선반영은 별도 통합 결정이 필요합니다.

## 2. 이번 G2 분류의 의미

- **KEEP:** 기존 G1 도식을 유지할 후보이거나 TEXT/NONE의 이미지 생략을 유지. 이는 실제 브라우저 통과 판정이 아닙니다.
- **POLISH:** 현재 사실 모델은 유용하지만 문장/버튼/상태 표현/라벨 가독성을 정밀 개선.
- **REWORK:** 값·헤더·바이트 범위·시간·경계가 공간적으로 드러나도록 구조를 변경.
- **REBUILD:** G1의 표현 방식 자체가 학습 목표에 부적합해 처음부터 다른 배치로 제작.
- **ADD:** 기존 TEXT/NONE의 학습목표를 검토해 새 시각화를 제안. 일괄 이미지 추가 정책이 아닙니다.

**집계:** KEEP 91 / REBUILD 2 / REWORK 13 / POLISH 16 / ADD 5 = 127개. 이 중 KEEP에는 **그림을 만들지 않는 TEXT/NONE 유지 대상**도 포함됩니다. 아래 판단은 소스 수준의 G2 개선 우선순위이며, 정식 완료는 실제 렌더링·RFC 의미 검증 뒤 확정합니다.

## 3. 127개 Concept 전체 매핑

| No. | Topic | Concept slug | Curriculum | 이전 #277 need | G2 1차 판단 | 변경 이유·검증 초점 |
| ---: | --- | --- | --- | --- | --- | --- |
| 001 | layering | `why-layering` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 002 | layering | `link-network-transport-application` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 003 | layering | `encapsulation` | DIAGRAM | REQUIRED | **REBUILD** | 상자 나열을 버리고 HTTP 데이터 ⊂ TCP 세그먼트 ⊂ IP 패킷 ⊂ 링크 프레임의 실제 헤더/페이로드 경계로 재구성 |
| 004 | layering | `decapsulation` | DIAGRAM | REQUIRED | **REBUILD** | 계층 나열 대신 헤더 제거·검사와 상위 데이터 전달의 역방향 포함 구조로 교체 |
| 005 | layering | `frame-packet-segment-message` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 006 | layering | `mtu` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 007 | local-delivery | `mac-address` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 008 | local-delivery | `switch-forwarding` | DIAGRAM | REQUIRED | **REWORK** | 입력 포트에서 source MAC 학습 → FDB 표 갱신 → destination lookup → 포트 선택을 실제 구조로 표시 |
| 009 | local-delivery | `broadcast-domain` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 010 | local-delivery | `arp` | DIAGRAM | REQUIRED | **REWORK** | 브로드캐스트 요청과 대상만 응답하는 단말의 역할 및 IP↔MAC 매핑을 별도 레인에 배치 |
| 011 | local-delivery | `ipv6-ndp` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 012 | local-delivery | `default-gateway` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 013 | ip-routing | `ipv4-address` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 014 | ip-routing | `prefix-subnet` | DIAGRAM | REQUIRED | **REWORK** | CIDR /24 비트 경계·네트워크 범위와 마스크를 도식에 직접 표시 |
| 015 | ip-routing | `private-public-ip` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 016 | ip-routing | `routing-table` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 017 | ip-routing | `longest-prefix-match` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 018 | ip-routing | `router-forwarding` | DIAGRAM | REQUIRED | **REWORK** | 라우팅 결정 전후의 IP 패킷/홉별 링크 프레임 변화를 분리 |
| 019 | ip-routing | `ttl-hop-limit` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 020 | ip-routing | `icmp` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 021 | ip-routing | `ipv6-basics` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 022 | port-nat | `transport-port` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 023 | port-nat | `socket-endpoint` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 024 | port-nat | `connection-tuple` | DIAGRAM | REQUIRED | **POLISH** | 긴 IPv4:포트 문자열의 표 셀 잘림 검사 |
| 025 | port-nat | `nat` | DIAGRAM | REQUIRED | **REWORK** | 동일 목적지와 변환 전후 source IP/port를 패킷 헤더 형태로 비교 |
| 026 | port-nat | `pat` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 027 | port-nat | `nat-mapping` | DIAGRAM | REQUIRED | **REWORK** | 매핑 표의 내부/외부 종단점과 시간 경과·만료 상태를 직접 보여줌 |
| 028 | port-nat | `inbound-reachability` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 029 | port-nat | `nat-vs-firewall` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 030 | dns | `domain-hierarchy` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 031 | dns | `stub-recursive-resolver` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 032 | dns | `authoritative-server` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 033 | dns | `iterative-resolution` | DIAGRAM | REQUIRED | **POLISH** | 재귀 vs 반복 조회의 역할과 캐시 적중/위임 생략을 명시 |
| 034 | dns | `a-aaaa` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 035 | dns | `cname` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 036 | dns | `ns-mx` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 037 | dns | `dns-ttl-cache` | TEXT | REQUIRED | **ADD** | DNS 응답 TTL 경과·캐시 적중·재질의의 시점과 보장 경계를 시간축으로 |
| 038 | dns | `negative-cache` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 039 | dns | `dns-failure` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 040 | tcp | `tcp-byte-stream` | TEXT | REQUIRED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 041 | tcp | `three-way-handshake` | DIAGRAM | REQUIRED | **POLISH** | #517: 단계 버튼 약 34px 높이, 13px 글꼴, 좌우 10px 패딩, 8px 간격; 단계별 상태/키보드 유지 |
| 042 | tcp | `sequence-number` | TEXT | RECOMMENDED | **ADD** | #513: 1000–1499 / 1500–1999 누락 / 2000–2499 선도착; ACK 1500→2500 바이트 범위 SVG (독립 구현 우선) |
| 043 | tcp | `acknowledgement` | DIAGRAM | REQUIRED | **REWORK** | 수신 바이트 연속 범위·1500부터 누락·후속 선도착·누적 ACK를 실제 위치로 매핑 |
| 044 | tcp | `retransmission` | TEXT | REQUIRED | **ADD** | 송신/손실/타임아웃 또는 dupACK/SACK 보조 신호와 재전송 시간선을 구분 |
| 045 | tcp | `rto` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 046 | tcp | `sliding-window` | DIAGRAM | REQUIRED | **POLISH** | byte seq·누적 ACK·rwnd/cwnd 가정과 선택 상태의 일치를 재확인 |
| 047 | tcp | `flow-control` | TEXT | REQUIRED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 048 | tcp | `congestion-control` | DIAGRAM | REQUIRED | **POLISH** | rwnd와 cwnd의 측정/결정 주체를 정확히 구분, 텍스트를 좁힘 |
| 049 | tcp | `connection-teardown` | DIAGRAM | REQUIRED | **POLISH** | FIN 송신/수신 시간·CLOSE-WAIT·TIME-WAIT와 단계 컨트롤을 확인 |
| 050 | tcp | `time-wait` | TEXT | REQUIRED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 051 | tcp | `tcp-head-of-line` | DIAGRAM | REQUIRED | **REWORK** | 미도착 바이트와 뒤쪽 도착 바이트의 가시적 연속 구간/전달 대기 표시 |
| 052 | udp | `udp-datagram` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 053 | udp | `delivery-order-guarantee` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 054 | udp | `checksum` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 055 | udp | `udp-use-case` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 056 | udp | `application-reliability` | DIAGRAM | REQUIRED | **POLISH** | UDP 고유 ACK가 아닌 상위 프로토콜 ACK임을 시퀀스 레이블에 강조 |
| 057 | tls | `tls-purpose` | NONE | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 058 | tls | `certificate` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 059 | tls | `pki` | DIAGRAM | REQUIRED | **REWORK** | 서버 leaf → intermediate CA → 로컬 trust anchor 경로에서 서명/체인 검증과 hostname 검증을 구분 |
| 060 | tls | `hostname-verification` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 061 | tls | `tls-handshake` | DIAGRAM | REQUIRED | **POLISH** | TLS 1.3 0-RTT 제외·CertificateVerify/Finished 순서 확인과 길이 검증 |
| 062 | tls | `key-agreement` | TEXT | REQUIRED | **ADD** | 키 공유 입력과 양끝 도출 공유 비밀을 실제 키 전달로 오해하지 않게 비교 |
| 063 | tls | `symmetric-session-key` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 064 | tls | `tls-termination` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 065 | request-journey | `url-components` | DIAGRAM | RECOMMENDED | **POLISH** | fragment 비전송 경계와 긴 URL 헤더/데이터 레이블 줄바꿈 검사 |
| 066 | request-journey | `origin` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 067 | request-journey | `dns-to-route` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 068 | request-journey | `transport-establishment` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 069 | request-journey | `tls-before-http` | DIAGRAM | REQUIRED | **POLISH** | TCP/TLS와 QUIC/TLS 1.3 연결 모델을 구분 |
| 070 | request-journey | `http-request-delivery` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 071 | request-journey | `host-authority` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 072 | request-journey | `proxy-gateway-path` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 073 | http-message | `request-message` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 074 | http-message | `response-message` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 075 | http-message | `header-body` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 076 | http-message | `representation` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 077 | http-message | `media-type` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 078 | http-message | `content-type` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 079 | http-message | `accept` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 080 | http-message | `content-negotiation` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 081 | http-message | `content-length-transfer` | TEXT | REQUIRED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 082 | http-methods | `safe-method` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 083 | http-methods | `idempotent-method` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 084 | http-methods | `get-head` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 085 | http-methods | `post` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 086 | http-methods | `put` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 087 | http-methods | `patch` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 088 | http-methods | `delete` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 089 | http-methods | `protocol-idempotency-boundary` | DIAGRAM | REQUIRED | **POLISH** | 메서드 효과/업무 중복 제어의 보장 층위 시각적 구분 |
| 090 | http-status | `status-class` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 091 | http-status | `200-201-202-204` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 092 | http-status | `redirect-status` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 093 | http-status | `400-401-403-404` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 094 | http-status | `409-412` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 095 | http-status | `415-422` | NONE | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 096 | http-status | `429` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 097 | http-status | `500-502-503-504` | DIAGRAM | RECOMMENDED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 098 | http-versions | `http10-connection` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 099 | http-versions | `http11-persistent` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 100 | http-versions | `keep-alive` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 101 | http-versions | `http11-pipelining` | DIAGRAM | REQUIRED | **POLISH** | 요청 파이프라인과 응답 순서 제약을 두 축으로 명확히 배치 |
| 102 | http-versions | `http2-stream` | DIAGRAM | REQUIRED | **REWORK** | 스트림 ID 목록 표 대신 한 HTTP/2 연결의 프레임 교차 전송을 시간선으로 구성 |
| 103 | http-versions | `http2-multiplexing` | TEXT | REQUIRED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 104 | http-versions | `header-compression` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 105 | http-versions | `quic` | DIAGRAM | REQUIRED | **POLISH** | 스트림 독립 순서와 연결 단위 혼잡 공유가 동시에 보이도록 설명 |
| 106 | http-versions | `http3` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 107 | http-versions | `transport-head-of-line` | DIAGRAM | REQUIRED | **REWORK** | TCP 공통 seq gap vs QUIC 스트림별 offset gap, 전달 가능 범위 두 패널 대비 |
| 108 | http-cache | `freshness` | TEXT | REQUIRED | **ADD** | Date/Age/max-age에서 freshness lifetime 대비 current age를 조건부 상태선으로 |
| 109 | http-cache | `cache-control` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 110 | http-cache | `expires` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 111 | http-cache | `etag` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 112 | http-cache | `last-modified` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 113 | http-cache | `if-none-match` | DIAGRAM | REQUIRED | **POLISH** | weak comparison, 200/304 조건과 412 예외의 경계 표기 |
| 114 | http-cache | `if-modified-since` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 115 | http-cache | `304` | DIAGRAM | REQUIRED | **POLISH** | 재검증 뒤 기존 본문/메타데이터 갱신 전후 상태 정렬 |
| 116 | http-cache | `private-shared-cache` | TEXT | REQUIRED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 117 | http-cache | `intermediary-cache` | DIAGRAM | REQUIRED | **POLISH** | fresh/stale 재검증과 공유 캐시 자격 조건을 분리 |
| 118 | http-state-intermediary | `cookie` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 119 | http-state-intermediary | `set-cookie` | TEXT | NONE | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 120 | http-state-intermediary | `cookie-scope` | DIAGRAM | REQUIRED | **REWORK** | Domain/Path/Secure/SameSite는 단일 순차 경로가 아닌 독립 조건으로 배열 |
| 121 | http-state-intermediary | `proxy` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 122 | http-state-intermediary | `reverse-proxy` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |
| 123 | http-state-intermediary | `gateway` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 124 | http-state-intermediary | `forwarded-header` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 125 | http-state-intermediary | `x-forwarded` | TEXT | RECOMMENDED | **KEEP** | 기존 설명·표·코드가 목표를 전달할 수 있어 추가 이미지 제작을 보류; 기존 #277 및 Wave 3 원문 감사 근거를 재사용 |
| 126 | http-state-intermediary | `trusted-proxy-boundary` | DIAGRAM | REQUIRED | **REWORK** | spoofed 헤더 → edge 정리/재작성 → trusted hops → 백엔드 검증의 신뢰 경계를 네트워크 홉으로 표시 |
| 127 | http-state-intermediary | `cdn-http-intermediary` | DIAGRAM | REQUIRED | **KEEP** | G1 정적/단계 도식의 학습 목표를 유지하되 실제 Reader/테마 QA 통과는 아직 미확인 |

## 4. #517 / #513의 구체적인 검토

- **Concept #517 = `tcp.three-way-handshake`**. 기존 N-01 TCP 도식은 `main`의 `TcpHandshakeEditorial.tsx` + `tcp-handshake-editorial.css`에 있습니다. 단계 이동·초기화 버튼 축소 요청: 높이 약 **34px**, 본문 글꼴 **13px**, 좌우 패딩 **10px**, 간격 **8px**, 단계 표기 **13px**. 공통 `diagram-controls`는 손대지 않고 Network 전용 클래스 내 CSS만 적용해야 합니다. 그러나 기준 `refactor`에 그 네트워크 전용 컴포넌트가 없으므로 아직 수정 **BLOCKED**.
- **Concept #513 = `tcp.sequence-number`**. Curriculum은 TEXT이고, 원래는 ASCII 설명 두 개입니다. 이 개념 자체의 데이터 바이트 위치·중간 누락·누적 ACK 변화가 한눈에 보이도록 **독립적 SVG** 후보로 분류합니다. G1의 `tcp.acknowledgement` 및 `tcp.sliding-window`와 중복하지 않도록 **각 세그먼트가 점유하는 500B 범위**에 학습 책임을 한정합니다.

## 5. G2 승인 경계와 최종 QA 조건

1. 사용자 요청대로 변경은 `content/network-http/**`, `frontend/public/learning/network-http/**`, 필요 시 Network 전용 컴포넌트·테스트·CSS 및 이 Network 전용 감사 문서만 사용합니다. 다른 LearningArea와 공통 컴포넌트/스키마/API/DB는 수정하지 않습니다.
2. G1 구현 선반영이 필요한 모든 KEEP/POLISH/REWORK/REBUILD에 대해서는 **별도 승인된 통합 브랜치/PR을 통해 refactor와 G1을 먼저 정합화**하거나, 현재 file ownership 범위 안에서 실효성 있는 독립 SVG만 구현합니다. 공통 코드를 이 브랜치에서 우회 수정하지 않습니다.
3. 127개 원문 연결 확인, 53개 G1 선언과 49개 example mapping, 신규 ADD 중복 판단을 자동 검증합니다. 신규/변경 SVG는 XML·viewBox·title/desc·외부 리소스·레이블 잘림 검사와 RFC 공식 문서 의미 검증을 별도 시행합니다.
4. **실제 Reader**에서 라이트·다크 각각 1280/1440 폭, 단계형 전 상태, 버튼 포커스/키보드, 스크롤·텍스트 겹침을 확인합니다. 정적 PNG 검사만으로 Reader QA라고 하지 않습니다.
5. 해당 브랜치의 frontend test/lint/build, 콘텐츠 import Preview, 격리 PostgreSQL Apply→2회차 UNCHANGED, 학습 이력 보존 검증을 수행한 뒤에만 전체 G2 QA 통과를 선언합니다. 실제 실행하지 못했다면 명시적으로 미검증입니다.
6. 최종 PR의 base는 `refactor`, 브랜치 `viz/network-g2`; 자동 병합 금지. **현재 이 감사만으로 G2 완료·배포 승인하지 않습니다.**


## 6. G2 구현·검증 기록 (2026-11-15)

- **구현:** `content/network-http/tcp/sequence-number.md`에 기존 ASCII 2개를 대체하는 Network 전용 이미지 참조를 추가했고, `frontend/public/learning/network-http/tcp-sequence-number.svg`를 신규 작성했습니다. `contentKey`, 기존 RFC reference, Topic, Level, Question은 그대로입니다.
- **의미 모델:** 1000~1499 500B 수신 + 1500~1999 500B 누락 + 2000~2499 500B 선도착 → 누적 ACK 1500. 누락된 범위 수신 후 1000~2499 연속 → 누적 ACK 2500. SYN/FIN과 SACK 제외. RFC 9293과 대조했습니다.
- **정적 검사 PASS:** SVG XML parse, 양수 `viewBox`, `title`/`desc`, 외부 리소스/스크립트 없음, 3개 바이트 범위와 2개 ACK 수치 확인. CairoSVG로 900px·1280px 폭의 PNG 생성 및 글자 표시 확인. **실제 앱 테마/Reader QA는 미완료**입니다.
- **미수정:** #517 버튼은 `refactor`에서 Network 전용 `TcpHandshakeEditorial.tsx`/CSS가 부재하여 이 브랜치에서 공통 컴포넌트 `StepDiagram.tsx`/공통 스타일을 변경하지 않았습니다.
- **미검증:** 기존 G1 53개에 대한 전체 렌더링·의미 QA, Vitest/lint/build, 실제 importer Preview/Apply/UNCHANGED 및 데이터 이력 보존. G1 부재 때문에 PASS로 판정하지 않았습니다.
- **범위 확인:** `refactor` 대비 변경 경로는 위 2개 Network 파일과 이 Network 전용 감사 문서뿐입니다. 다른 영역, 공통 컴포넌트, 백엔드/계약은 수정하지 않았습니다.

## 주요 기술 근거

- [RFC 9293 §3.4 Sequence Numbers](https://www.rfc-editor.org/rfc/rfc9293.html#section-3.4) — TCP는 바이트 시퀀스, 누적 ACK는 다음 예상 바이트.
- [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000.html) — QUIC의 연결 및 스트림별 전송.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) — HTTP 의미론·메서드 효과·중개자.
- [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) — 캐시 신선도 및 재검증.


## 7. G2 재개 (2026-11-25)

- G1 PR #303이 반영된 refactor `8f01a8ba`를 병합했습니다. 기존 G2 세 파일의 공통 조상 대비 refactor blob 변경 여부를 먼저 비교하여 충돌이 없음을 확인했습니다. 기존 #513 SVG 및 Markdown을 보존합니다.
- #517 TCP Handshake 전용 CSS에서 버튼 최소 높이 34px, 글꼴 13px, 좌우 패딩 10px, gap 8px, 단계 표기 13px를 적용했습니다. 공통 DiagramControls와 다른 영역 스타일은 변경하지 않았습니다.
- 기존 Network Reader Chromium QA에 #517 버튼 크기 검사를 추가했습니다. CI 및 실제 렌더링 결과는 미확인입니다. 36개 G2 개선 후보 전체 구현 완료를 의미하지 않으며, #513 실제 Reader 검증도 별도입니다.


## 8. G2 구조 개선 배치 1 (2026-11-25)

- REBUILD 2개: encapsulation/decapsulation의 동일 데이터 바이트 위치와 추가·제거되는 헤더 경계를 정렬했습니다.
- REWORK 5개: prefix-subnet의 /24 비트 경계, acknowledgement의 누적 ACK 1500→2500, tcp-head-of-line의 순서 전달 대기, http2-stream의 프레임 교차 전송, cookie-scope의 독립 전송 조건을 구현했습니다.
- 49개 예시 ID/53개 DIAGRAM fence/공통 스키마는 유지합니다. Network 내부 고정 타입과 전용 React SVG만 변경했습니다. #513과 #517을 합쳐 36개 초기 개선 후보 중 9개 소스 구현(아직 승인 아님), 27개 후속 검토/구현 대상입니다.
- RFC 1122 §1.3.3, RFC 4632 §3.1, RFC 9113 §§4.3, 5를 대조했습니다. HTTP/2 예시는 각 HEADERS가 END_HEADERS로 종료되고 프레임이 같은 방향에서 전송되는 조건입니다.
- Vitest 핵심 레이블과 신규 구조 회귀 테스트 및 7개 변경 도식의 전체 테마/폭 스크린샷 수집을 추가했습니다. CI/실제 스크린샷 시각 검수 및 전체 G2 승인은 미완료입니다.

- #513 정적 SVG까지 실제 Reader(합성 API 응답) 4개 조건·확대/ESC/포커스 및 격리 Import 54개 변경 범위로 검증 대상을 확장했습니다. 신규 7개 도식은 SVG viewBox 밖 레이블 검사도 추가했습니다. 실행 결과와 실제 픽셀 감사 미확인.


## 9. G2 구조 개선 배치 2 및 Chromium 환경 교정 (2026-11-25)

- 8개 REWORK 추가: switch-forwarding, arp, router-forwarding, nat, nat-mapping, pki, transport-head-of-line, trusted-proxy-boundary. 실제 포트/FDB·링크 브로드캐스트·패킷 헤더·NAPT 테이블·인증서 경로·스트림별 offset·프록시 신뢰 경계를 별도 공간으로 표현합니다.
- 기존 49개 고정 예시 ID와 Markdown fence 계약 유지. Network 전용 renderer/type/test 변경만 수행했습니다. 기존 9개를 포함하여 초기 36개 개선 후보 중 17개 소스 구현, 19개 후속 검토 대상입니다. 코드/시각 QA 통과를 의미하지 않습니다.
- 공식 참고: RFC 1812, RFC 3022, RFC 9525, RFC 9000 및 기존 Concept Reference. 실제 렌더링·픽셀 검수는 미완료입니다.
- 이전 #45432415050은 frontend/backend SUCCESS 이후 Chromium 설치에서 Ubuntu 26.04와 Playwright 1.56.1 비호환으로 실패했습니다. QA runner를 ubuntu-24.04로 고정했습니다. 제품 의존성 변경 없음.
