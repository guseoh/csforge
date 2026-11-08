# Network & HTTP — 전체 Concept·Question 품질 감사 체크포인트

- 기준일: 2026-11-08
- 범위: [Issue #278](https://github.com/guseoh/csforge/issues/278)의 Network & HTTP. Java는 독립 검토 범위
- 작업 PR: [#298](https://github.com/guseoh/csforge/pull/298)
- 상태: **검토와 국소 교정 진행 중**. 본문·문항·Reference 모두 최종 승인했다고 간주하지 않음

## 검토 범위

Network의 Concept Markdown **127개**와 Question JSON **383개**(15개 Topic 묶음)의 실제 내용을 대상으로 검토했다. 127개 Concept의 핵심 설명, 내부 동작, 계층별 보장 경계, 코드·예시, 도식과 Reference 선언을 읽고, 383개 Question의 고유 키, Concept 연결, 형식·난도, 답변 및 explanation 존재 여부를 확인했다. 객관식 129개의 **모든 질문·선택지·정답 키**를 직접 대조했고, HARD 질문 44개와 각 영역의 서술·시나리오 예시를 기술적으로 검토했다. **전체 254개 서술·시나리오 모범답안의 독립 표준 대조를 완료했다고 주장하지 않는다.**

| Topic | Concept | Question |
| --- | ---: | ---: |
| DNS | 10 | 30 |
| HTTP Cache | 10 | 31 |
| HTTP Message | 9 | 27 |
| HTTP Methods | 8 | 24 |
| HTTP State & Intermediary | 10 | 30 |
| HTTP Status | 8 | 25 |
| HTTP Versions | 10 | 30 |
| IP & Routing | 9 | 27 |
| Layering | 6 | 18 |
| Local Delivery | 6 | 18 |
| Port & NAT | 8 | 24 |
| Request Journey | 8 | 24 |
| TCP | 12 | 36 |
| TLS | 8 | 24 |
| UDP | 5 | 15 |
| **합계** | **127** | **383** |

질문 분포는 객관식(MULTIPLE_CHOICE) 129개, 서술형(DESCRIPTIVE) 127개, 시나리오형(SCENARIO) 127개, 단답형(SHORT_ANSWER) **0개**다. 지금은 기존 개인 풀이 기록과 채점 계약을 보호하기 위해 유형을 무작정 변경하지 않는다.

## 발견·수정한 항목

1. **확정 기술 오류(높음): ECDHE 공통 비밀 계산.** `content/network-http/tls/key-agreement.md`의 `a + B`, `b + A`는 TLS의 ECDHE 동작을 잘못 그린 것이다. 간소화된 타원곡선 표기 `A = a·G`, `B = b·G`, `a·B = b·A = ab·G`로 고쳤다. 실제 공통 비밀 처리 규칙은 그룹별 표준에 따른다고 명시했다. [RFC 8446](https://www.rfc-editor.org/rfc/rfc8446), [현행 RFC 9846](https://www.rfc-editor.org/rfc/rfc9846)의 키 합의 설명과 대조하고 회귀 검사를 추가했다.
2. **학습 목표 중복(중간):** `dns.authoritative-server.q3`가 `dns-ttl-cache.q3`와 동일한 캐시 지연만 설명하던 문제를 권한 서버 NS별 응답 불일치, SOA serial과 영역 동기화 진단으로 바꿨다.
3. **시나리오 정보 부족(중간):** `safe-method.q3`에 링크 프리뷰의 위험한 GET을, `flow-control.q3`에 수신 윈도 0 vs 혼잡 윈도 여유를, `key-agreement.q3`에 중간자의 독립 ECDHE 연결 두 개를 명시해 단순 정의 반복에서 인과관계 검증 문제로 다듬었다.
4. **선택지 해설 빈약(낮음):** `expires.q1`, `304.q1`, `x-forwarded.q1`의 선택지 해설이 정답 문구만 반복하거나 너무 짧았으므로 RFC 캐시 우선순위, 304 본문 부재, 전달 헤더의 책임을 각각 구체적으로 썼다.

수정된 **10개 고유 Question의 contentKey, QuestionType, difficulty, 정답 키와 Concept 연결**은 유지했다(첫 배치 7개 + 추가 3개). Canonical Markdown/JSON 소스 외의 개인 데이터나 운영 DB는 수정하지 않았다.

### 2026-11-08 추가 심화 감사 배치

- **최신 TLS 1.3 표준 반영:** [RFC 9846 §4.3.8](https://www.rfc-editor.org/info/rfc9846/)을 직접 읽어 서로 다른 연결에서 클라이언트·서버가 KeyShare를 재사용하지 않아야 하는 **송신 MUST NOT**과, 이전 RFC 8446 구현과의 상호운용성을 위해 상대 재사용을 수신 시 허용해야 하는 **수신 MUST permit**을 구분해 `tls/key-agreement.md` 본문과 테스트에 추가했다. 이는 PSK 세션 재개와 별개다.
- **완전성 판정 오류 가능성 교정:** `tcp.connection-teardown.q3`를 `Content-Length: 1000`, 수신 600바이트, TCP FIN이라는 **검증 가능한 입력**으로 구체화했다. [RFC 9112 §8](https://www.rfc-editor.org/rfc/rfc9112.html)에서 길이 미달은 반드시 미완성 응답으로 기록하도록 요구한다. 길이가 명시되지 않은 close-delimited 응답의 예외를 모범답안과 Concept 본문에서 구분하고 RFC 9112를 관련 Reference에 추가했다. 초안의 잘못된 §6.3 링크 설명도 §8로 고쳤다.
- **중복 학습 목표 해소:** 254개 서술·시나리오 답안의 어휘 중첩과 질문 목표를 비교해 위험한 유사 답안 3쌍을 추렸다. `http-message.representation.q3`는 언어·캐시 구분의 반복 대신 **하나의 논리적 주문 리소스와 HTML/JSON 표현의 차이**를 묻도록 변경했다. `http-versions.http2-multiplexing.q3`는 이미 있는 TCP HOL 설명을 반복하지 않고 [RFC 9113 §5.2·§6.9.1](https://www.rfc-editor.org/rfc/rfc9113.html)에 근거해 **스트림 vs 연결 흐름 제어 윈도** 및 DATA 프레임 처리로 변경했다. `http-cache.intermediary-cache.q3`(지역별 stale)와 `cdn-http-intermediary.q3`(개인 응답 혼입)는 상태 전파와 보안 누출이라는 **서로 다른 실패 계약**을 검증하므로 둘 다 유지했다.
- **Cookie Reference 현재성:** 2026-11-08에 [6265bis 초안](https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html)의 인터넷 초안 상태(2026-11-02 갱신, 2027-05-06 만료)를 확인했다. `cookie`, `set-cookie`, `cookie-scope`의 `2026-10-17 현재`라는 오래된 확인 문구를 없애고, 읽는 시점에 재확인할 초안이라는 성격을 명시했다. 확정 표준이 아닌 문서를 새 RFC로 오인하지 않는다.
- **URL 실제 조회 범위:** RFC 9110·9111·9112·9113·9846, IETF 6265bis 초안 및 Cisco LAN Switching 안내 문서는 실제 페이지를 열어 근거를 확인했다. 구형 DNS/NAT 관련 주요 RFC도 일부 직접 확인했지만 다량 페이지 접근 중 RFC Editor가 HTTP 429를 반환한 사례가 있으므로 **원래의 56개 URL 목록 및 최신 127 Concept 전부에 대해 접근성 검증이 끝났다는 의미가 아니다**.


## 기술적 검토의 구분

- DNS/IP: DNS 권한 위임과 각 층의 캐시, NXDOMAIN·NODATA, longest prefix match, ARP·NDP, MAC과 IP의 전달 범위, NAT·방화벽 경계
- TCP/UDP: 바이트 스트림과 메시지 경계, 재전송·ACK와 애플리케이션 커밋의 차이, 흐름 제어(rwnd)·혼잡 제어(cwnd), FIN/TIME_WAIT, 체크섬
- TLS: (EC)DHE·PSK의 키 합의, CertificateVerify/인증서/호스트 이름, TLS 종료와 신뢰 프록시, QUIC/TLS 1.3과 조기 데이터
- HTTP: 메서드 safety/idempotency, ETag와 조건부 요청, Cache-Control·Vary·304, Content-Length/Transfer-Encoding 프레이밍, HTTP/2 스트림과 TCP HOL

검토 근거(공식 1차 자료): [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9111 HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111), [RFC 9112 HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112), [RFC 8446 TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446), [RFC 9846 TLS 1.3](https://www.rfc-editor.org/rfc/rfc9846).

## 검증과 미완료 항목

- `NetworkContentAuditContractTest`: 127 Concept 및 383 Question 키·문항 형식·Concept 연결·선택지·정답 매칭의 구조적 회귀 방지와 ECDHE 스칼라 곱셈을 검사한다. **이 테스트가 문항 모범답안의 기술적 정합성을 자동 증명하는 것은 아니다.**
- 기존 `NetworkDiagramFullPackIntegrationTest`: 53개 도식 변경의 격리 PostgreSQL Apply/재import, 이력 보존과 Concept HTTP 조회는 이미 성공한 검증이다. 학습 콘텐츠의 모든 모범답안 검수와는 다른 경계다.
- **남음:** 127 Concept의 모든 Reference URL 현재 접근성·해당 주장과의 일대일 대조; 254개 서술·시나리오 모범답안 가운데 기초 어휘/중복 검사와 고위험 사례 표준 대조만 이행한 상태이므로 **각 항목의 최종 독립 기술 검증·난도 최종 승인**; SHORT_ANSWER 분포 개선 여부 판단; 실제 Production 콘텐츠 동기화.
- **정책:** 이 체크포인트만으로 Issue #278 또는 PR #298을 완료·병합 처리하지 않는다. 운영 DB 쓰기·배포·자동 병합 금지.
