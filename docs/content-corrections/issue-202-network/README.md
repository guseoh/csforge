# Issue #202 — Network & HTTP 교정 1차 checkpoint (P0/P1)

기준 `main`: `392ffccf90b733dfe191e222b2af15b407e42033`.
이 문서는 **Draft PR의 진행 중인 검토 기록**으로, #202 전체 작업 완료나 병합 승인이 아니다.

## 감사 범위와 중복 제거

[Wave 3 Network 정밀 감사](../../content-audit/learning-experience-2026/wave-3/network-http.json): **15 Topic · 127 Concept · 381 Question** 전체 검토 기록을 상속한다. [전체 발견](../../content-audit/learning-experience-2026/wave-3-findings.json) 중 #202 연결 **W3-NET 29건(P0 4, P1 5, P2 20)** 및 [계승 발견](../../content-audit/learning-experience-2026/wave-3-carried-findings.json) **LEX-001 P1 1건**을 추적한다. 따라서 P0 4 / P1 6 / P2 20, 총 **30개 원본 finding ID**이며 다른 후속 Issue의 동일 교정을 중복 집계하지 않는다.

Network & HTTP 교정 1차는 **P0 4 + P1 6 = 10개** 발견을 최소 보강한다.

| 원본 ID | 수정 대상 | 기존 오류/빠진 전제와 최소 변경 |
| --- | --- | --- |
| W3-NET-026 (P0) | `http-cache.last-modified.q1` | RFC 9110 조건부 strong validator 가능성 인정 |
| W3-NET-021 (P0) | `http-methods.patch.q3` | strong ETag/If-Match의 중복 변경 방지 효과와 412 원인 불명 구별 |
| W3-NET-025 (P0) | `http-versions.quic.q1` | QUIC 구현은 userspace 전용이 아님 |
| W3-NET-003 (P0) | `ip-routing.ipv4-address` | Linux 특정 local IP bind와 NIC 수신 제한 분리 |
| W3-NET-009 (P1) | `dns.negative-cache.q2` | 동일 조회 QNAME 유지 + 권한 DNS 데이터 수정 조건 명시 |
| W3-NET-027 (P1) | `http-cache.if-none-match.q3` | ETag 문자열 충돌과 실제 다른 사용자 표현의 잘못된 재사용 구분 |
| W3-NET-018 (P1) | `http-message.content-negotiation.q3` | origin의 서로 다른 ko/en 표현 + CDN hit 조건 명시 |
| W3-NET-020 (P1) | `http-message.content-length-transfer` 본문과 q2 | CL+TE 요청은 서버 응답 후 연결 close 필수, 중개자 전달 시 CL 제거 |
| W3-NET-011 (P1) | `tls.pki.q3` | trust anchor 자체가 없는 상황을 명시 |
| LEX-001 (P1) | `http-state-intermediary.trusted-proxy-boundary.q1` | HTML 태그의 무관한 오답을 실제 forwarding 신뢰 경계 오해로 보강 |

수정하는 모든 기존 Question은 `contentKey/kind/questionType/difficulty/status/correctChoiceKey/conceptKeys`를 유지한다. `choices[3]`의 **오답 내용·rationale**만 바꾸는 경우에도 정답 C는 보존한다. Concept 2건은 본문만 변경하고 YAML frontmatter / URL·Reference는 유지한다.

## 원문 직접 대조

- [RFC 9110 §8.8.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.2.2): Last-Modified 기본 implicitly weak 및 강한 검증을 추론할 수 있는 조건.
- [RFC 5789 §2](https://www.rfc-editor.org/rfc/rfc5789.html#section-2): conditional PATCH와 strong ETag/If-Match, idempotent하게 사용할 수 있는 경우.
- [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000.html): QUIC 전송 프로토콜 계약, 구현을 반드시 사용자 공간에 두는 제약은 없음.
- [Microsoft MsQuic Platforms](https://github.com/microsoft/msquic/blob/main/docs/Platforms.md): Windows 커널 드라이버 `msquic.sys` 실재.
- [Linux kernel ip-sysctl](https://docs.kernel.org/networking/ip-sysctl.html): IP 주소는 interface 전용이 아닌 host-local 주소 개념, ARP 주소 응답 동작; 수신 인터페이스 제한은 별도 조건에 의존.
- [RFC 2308 §5](https://www.rfc-editor.org/rfc/rfc2308.html#section-5): NXDOMAIN(QNAME,QCLASS), NODATA(QNAME,QTYPE,QCLASS) 부정 캐시 범위.
- [RFC 9112 §6.1, §6.3](https://www.rfc-editor.org/rfc/rfc9112.html): CL+TE 동시 요청 처리/연결 종료 및 중개자 전달 프레이밍.
- [RFC 5280 §6.1](https://www.rfc-editor.org/rfc/rfc5280.html#section-6.1): PKI 검증의 신뢰 기준점(trust anchor)과 target leaf의 분리.

## 검증 경계 및 다음 게이트

1. 기존 10개 발견의 사전/사후 문구를 원문과 비교했다. 변경 JSON 파일을 각각 다시 파싱하고 key/유형/정답/연결/순서 불변을 확인했다. 전송 후 GitHub에서 같은 내용으로 readback 성공.
2. Network **P2 20건** 중 현재 이미 해결된 것(#222 R2 cookie Reference 등)을 별도 확인해 KEEP / MINIMAL FIX / DEFER로 구분한다. 동일 finding을 중복 교정하지 않는다.
3. 최신 branch 전체 Network 127 Concept / 381 Question / 모든 Reference 재검사 후 Preview/Apply/exact reimport idempotency를 **격리 PostgreSQL**에서 수행해야 한다. CI만으로 역사적 변경분 Import를 입증하지 않는다.
4. 시각화/Reader 모바일·라이트/다크 및 Quiz/Wrong Note 학습 이력 보존·Human Usage Check 필요.
5. Database 38/75 및 DSA 84개 Concept 전수 리뷰·변경까지 수행하고 Issue #202 전체가 완료된 뒤 종료. 그 전까지 이 PR/Issue를 완료로 판정하지 않는다.
6. 사용자 명시 승인 없이 PR merge 및 Production DB import를 수행하지 않는다.
