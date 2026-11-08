# Network & HTTP 127/383 최종 품질 감사 — 승인 게이트 (2026-11-09)

> **결론: NOT APPROVED / 작업 미완료.** 전체 Concept·Question을 구조적으로 확인했으나, Issue #278의 문체·깊이·문항별 기술 정확성 최종 승인 및 Production 동기화가 완료되지 않았다.

## 검토 근거와 완료/비완료의 차이

- Source: [`guseoh/csforge` main `425872f7`](https://github.com/guseoh/csforge/commit/425872f7c64cbddf214954e102f2e419adab229f), [Issue #278](https://github.com/guseoh/csforge/issues/278), [Curriculum](../../../content/curriculum/network-http.yaml), [이전 감사](network-full-area-review.md)
- **127개 Markdown을 직접 읽고** 합쇼체 사용, 내부 흐름/경계 설명, 예제·Markdown/Reference·도식 위치를 검토. **383개 Question JSON 전수 구조 검사**와 254개 서술·시나리오 답안의 위험/중복 진단. 이것만으로 **각 답변 문장 전부가 독립 RFC 조항으로 증명된 것은 아님**.
- 기존 PR #298은 Network DIAGRAM **53/53** 구현, 15개 Question 교정, 격리 Import/reimport 및 Reader QA를 통과하고 [main에 병합](https://github.com/guseoh/csforge/pull/298)했다. 본 감사는 해당 성과를 유지하며 **새로 최종 승인하지 않은 범위**를 식별한다.

## Topic별 127 Concept 감사

| Topic | Concept | 문체·설명 기준 판정 |
| --- | ---: | --- |
| DNS | 10 | BLOCKED — 합쇼체로 개별 편집·교정 필요 |
| HTTP Cache | 10 | BLOCKED — 합쇼체와 캐시 적용 예시·검증자 설명 |
| HTTP Message | 9 | BLOCKED — 합쇼체와 본문/프레이밍 심화 불균형 |
| HTTP Methods | 8 | BLOCKED — 합쇼체와 안전성·멱등성 업무 경계 |
| HTTP State & Intermediary | 10 | BLOCKED — 합쇼체와 프록시 신뢰 경계 |
| HTTP Status | 8 | BLOCKED — 합쇼체와 대표 API 오류 예시 |
| HTTP Versions | 10 | BLOCKED — 합쇼체와 짧은 HTTP/1.0/HTTP2 stream/HPACK/QUIC 본문 |
| IP & Routing | 9 | BLOCKED — 합쇼체와 주소·라우팅 실제 예시 |
| Layering | 6 | BLOCKED — 합쇼체와 계층 책임 |
| Local Delivery | 6 | BLOCKED — 합쇼체와 ARP/NDP·스위칭 |
| Port & NAT | 8 | BLOCKED — 합쇼체와 매핑 상태·접근 가능성 |
| Request Journey | 8 | BLOCKED — 합쇼체와 HTTP/2·3 분기 |
| TCP | 12 | BLOCKED — 대부분 서술체, handshake는 합쇼체와 혼용 |
| TLS | 8 | BLOCKED — 합쇼체, 버전·종단점 보장 경계 |
| UDP | 5 | BLOCKED — 합쇼체, 체크섬·신뢰성 구분 |
| **합계** | **127** | **전체 영역이 Issue #278 최종 문체 승인에 미달** |

실제 본문 대부분은 `~이다/~한다/~있다`인데 Issue #278의 합의된 계약은 `~입니다/~합니다`이다. 이것은 곧바로 기술적 오류 127건을 의미하지 않는다. **단순 정규식 어미 치환은 금지**하며 문단·코드·도식·프로토콜 전문을 보존하면서 Concept별 수정/검수한다.

본문 보강 우선 후보: `http-versions/http10-connection.md`, `http-versions/header-compression.md`, `http-versions/http2-stream.md`, `http-versions/quic.md`, `http-state-intermediary/gateway.md`, `http-status/200-201-202-204.md` (길이만이 아니라 문제 상황·실행 흐름·비교 예시의 충분성을 따져야 함).

## 383개 Question 검토

- 129 MULTIPLE_CHOICE / 127 DESCRIPTIVE / 127 SCENARIO, EASY 126 / MEDIUM 213 / HARD 44. 고유 `contentKey`, normalized question stem, Concept 연결, 객관식 4개 선택지·단일 정답 키 등 **구조적 이상 0건**.
- **33개 객관식 선택지 해설**은 25자 미만. 이는 *오답 해설 품질 재검토 후보*이지 33개 기술 오류 확정이 아니다. 예: `http-cache.if-none-match.q1`, `http-versions.http2-multiplexing.q1`, `udp.delivery-order-guarantee.q1`.
- **22개 시나리오형 질문**은 64자 이하의 짧은 지시형 문구. 설명형 질문과 차별되는 입력 조건·관찰 결과·선택/복구 판단을 추가할지 검토. 예: `http-versions.http11-persistent.q3`, `http-methods.patch.q3`, `http-status.409-412.q3`.
- **3개 서술형 모범답안**은 130자 미만: `dns.stub-recursive-resolver.q2`, `http-status.200-201-202-204.q2`, `port-nat.connection-tuple.q2`. **8개 HARD 답안**은 200자 미만. 길이로 오답을 확정하지 않으며 *난이도에 맞는 인과관계·근거·대안 설명* 여부를 검수한다.
- `SHORT_ANSWER` 0개는 분포 개선 후보이나 기존 학습 이력/채점 형식 호환성 검토 없이 변경하지 않는다. 개방형 답안 **254개를 문장별 공식 규격에 일대일 대조한 최종 승인 근거는 아직 없음**.

## 58개 Canonical Reference — 접근성과 의미 적합성은 다른 검사

- 이전 [Issue #277 manifest](../issue-277/network-http.json)는 56개 고유 URL. 실제 Concept Markdown에서 추가로 [Toss HTTP Cache](https://toss.tech/article/smart-web-service-cache) 및 [Kakao Wcache](https://tech.kakao.com/posts/345) **2개**를 확인해 현재 **58개 고유 URL** 대상으로 직접 조회했다.
- **54개 URL은 웹 페이지/문서를 열 수 있었고**, **4개(`RFC 4861`, `RFC 6454`, `RFC 7239`, `RFC 9520`)는 RFC Editor의 HTTP 429 rate limit으로 직접 조회 판정 보류**. 429를 404로 분류하거나 죽은 링크라고 추정하지 않는다. `RFC 9520`은 다른 공식 HTML 경로에서, `RFC 7239`은 공식 §8.1 HTML 경로에서 별도 확인했다.
- Toss 기술 글은 본문을 읽을 수 있었으며 Kakao 글은 제목·URL 존재를 확인했지만 웹 조회 환경에서 본문이 JavaScript 전용이었다. 이 2개를 기존 manifest와 대조해 재분류해야 한다.
- 직접 접근과 RFC 제목 확인은 **개별 Concept의 모든 보장/예외 주장에 맞는 절이 올바르게 인용됐다는 보증이 아니다**. 127개 Concept-Reference-주장 매칭은 별도의 세밀한 검증이 남아 있다.
- 주요 공식 근거 확인: [RFC 9520](https://www.rfc-editor.org/rfc/rfc9520.html) DNS failure caching, [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) Cache-Control·Set-Cookie, [RFC 9113](https://www.rfc-editor.org/rfc/rfc9113.html) flow control, [RFC 9846](https://www.rfc-editor.org/rfc/rfc9846) TLS KeyShare.

## 이 감사에서 직접 교정한 기술 명세

`dns/negative-cache.md`와 `dns/dns-failure.md`의 RFC 9520 설명을 보강했다. 기존 내용은 DNS SERVFAIL/timeout을 "짧게 기억할 수 있다"고만 적어 **실패 캐싱의 MUST와 재시도 상한을 명시하지 않았다**. RFC 9520 §3.1의 같은 서버·전송 방식으로 최대 두 번 재시도(총 세 질의), §3.2의 **실패 캐시 최소 1초 / 최대 5분**을 기술했다. 이는 RFC 2308의 권한 있는 NXDOMAIN/NODATA 부정 응답 캐시와 다르다. 내용·Question의 stable key, 기존 Reference 메타데이터 및 개인 학습 이력은 변경하지 않았다.

## 병합 후 Production 동기화 실패 — 별도 P0 차단 항목

- [main Repository Validation #42494810524](https://github.com/guseoh/csforge/actions/runs/42494810524) **SUCCESS**: Backend tests/build/Frontend/Compose, Cloud Run backend deployment & readiness.
- [Production content synchronization #42495542007](https://github.com/guseoh/csforge/actions/runs/42495542007) **FAILED** at 동일 main SHA `425872f7`. 기본 `APPLY` Cloud Run execution `csforge-content-sync-9ckzq`는 성공, 뒤이어 `ALL_CONCEPTS` execution `csforge-content-sync-8z57t`가 실패. GitHub Job 로그는 외부 Job 실패만 보여 주며 **애플리케이션 에러 원인은 미확인**이다.
- 따라서 실제 운영 DB의 소스 SHA 정합성·Concept 반영 완결성·개인 이력에 대한 영향은 **미검증**. 정확한 Cloud Run execution 내부 로그, read-only DB/digest 비교를 확인하기 전 **쓰기 재실행 금지**. 현재 연결된 Neon 권한에서 기존 프로젝트가 조회되지 않아 DB 확인 불가했다.

## 승인 전 추가 작업 — 순서

1. **P0**: 실패한 Cloud Run execution `csforge-content-sync-8z57t`의 내부 오류·partial apply·개인 이력 검증 및 안전한 복구 계획 수립.
2. **P1**: 15 Topic / 127 Concept를 자연스러운 합쇼체와 학습 예시로 편집, Concept별 독립 Reviewer sign-off. 53 DIAGRAM 변경이 있으면 Reader dark/light/desktop 검사 반복.
3. **P1**: Question 전체 383개의 정답·선택지·해설·중복·난도·Concept 목표 검수 확정. 33 짧은 rationale과 22 시나리오 우선 처리, **254 모범답안별 주장 독립 표준 대조**.
4. **P1**: 최신 58 Reference의 URL 연결 및 Concept별 주장 대응을 확인하고 기존 manifest를 갱신.
5. **P1**: 전체 Canonical Import Preview ERROR=0 → Apply → 재import UNCHANGED와 protected personal-history snapshot 확인. Network 최종 완료 판정 후에도 Java Issue #278 범위는 독립적으로 남는다.

**검토 결과: Network 전체 콘텐츠 최종 승인 보류**. 이 감사 PR은 발견한 게이트와 좁은 기술 보강을 기록할 뿐, 완료/운영 반영을 주장하지 않는다. Production sync 실패 원인과 포괄적 콘텐츠 정합성 문제가 남아 있으므로 자동 병합은 금지한다.
