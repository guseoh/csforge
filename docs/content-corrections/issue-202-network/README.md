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


## P2 후속 20건 처리 결과 (2026-10-20)

- 현재 사용자 승인 범위는 **Issue #202 다음 실행 단계**. 기존 P0/P1 10건에 이어 [Wave3 findings](../../content-audit/learning-experience-2026/wave-3-findings.json) 중 P2 20건의 최신 main과 연관 canonical을 다시 대조했다.
- **MINIMAL_FIX 19 / ALREADY_RESOLVED 1 / DEFER 0**. 다른 Area나 Issue 범위로 전가하지 않고 기존 판정 ID와 연결한다.
- W3-NET-029는 #222 R2 PR #229에서 **정식 RFC 6265 + 공식 6265bis Internet-Draft**로 바뀐 3개 Reference를 재사용한다. RFC10025를 현재 본문에 다시 추가하거나 출판됐다고 단정하지 않는다.
- 새 Concept/Question, 영역 이동, SVG, 원래 Question 정답 키·Concept 연결, 기존 contentKey 변경 없음. 1차 P0/P1과 합쳐 현재 변경된 것은 **21개 Question / 19개 Concept**, 소스 파일 **29개** 및 감사 문서 1개다.

| Finding | 판정 | 교정·유지 근거 |
| --- | --- | --- |
| W3-NET-028 | MINIMAL_FIX | 중개 캐시 신선도·no-cache·Vary 근접 오답 |
| W3-NET-015 | MINIMAL_FIX | HTTP/1.1 request-line과 HTTP/2·3 의사 헤더 구별 |
| W3-NET-016 | MINIMAL_FIX | origin-form request-target / Host authority 구별 |
| W3-NET-017 | MINIMAL_FIX | HTTP 응답·콘텐츠 협상 근접 오답 |
| W3-NET-019 | MINIMAL_FIX | Accept 미충족 시 406 또는 협상 필드 무시 가능 |
| W3-NET-029 | ALREADY_RESOLVED | Issue #222/PR #229의 정식 RFC 6265 + 미발행 6265bis 초안 연결 유지, 중복 편집 없음 |
| W3-NET-022 | MINIMAL_FIX | HTTP/1.1 모든 요청 Host 필수·누락/중복/invalid 400 |
| W3-NET-023 | MINIMAL_FIX | 위반한 새 스트림 ID는 connection PROTOCOL_ERROR 필수 |
| W3-NET-024 | MINIMAL_FIX | QPACK 공식 RFC 9204 §2.1.2 직접 자료 |
| W3-NET-004 | MINIMAL_FIX | CIDR/최장 일치의 RFC 4632 직접 근거 |
| W3-NET-005 | MINIMAL_FIX | IPv6 Hop Limit의 RFC 8200 직접 근거 |
| W3-NET-001 | MINIMAL_FIX | Cisco MAC 학습·전달/VLAN 공식 자료 2개 Concept 공유 |
| W3-NET-002 | MINIMAL_FIX | 같은 물리 스위치·IP prefix 혼동 distractor |
| W3-NET-006 | MINIMAL_FIX | PAT 공통 destination/public IP와 출발지 포트만 다른 4-tuple |
| W3-NET-007 | MINIMAL_FIX | outbound 매핑과 임의 inbound 수신의 혼동 distractor |
| W3-NET-008 | MINIMAL_FIX | failover state loss 후 재연결 vs 계획된 draining 분리 |
| W3-NET-013 | MINIMAL_FIX | No route to host 로컬/원격 ICMP 원인 구별 |
| W3-NET-014 | MINIMAL_FIX | DNS→라우팅·QUIC transport·TLS over QUIC 직접 원문 |
| W3-NET-012 | MINIMAL_FIX | RFC 8446 → RFC 9846 최신 기본 규격 7 TLS+1 journey 관계, PKI/Forwarded 원문 |
| W3-NET-010 | MINIMAL_FIX | IPv6 UDP checksum RFC 8200 §8.1 직접 원문 |

### P2 Reference 보강 및 주의점

- [RFC 9846](https://www.rfc-editor.org/rfc/rfc9846.html) (2026-07, TLS 1.3, **RFC 8446 obsoletes**)을 TLS 7개 Concept 및 request-journey 1개에 추가했다. 8446은 버전 경계가 적힌 역사적 기본 참고로 보존한다. **동일 URL의 global 메타데이터를 전 8관계에서 동일하게 유지**했다.
- [RFC 9204 §2.1.2](https://www.rfc-editor.org/rfc/rfc9204.html#section-2.1.2), [RFC 9000 §2](https://www.rfc-editor.org/rfc/rfc9000.html#section-2), [RFC 9001 §4](https://www.rfc-editor.org/rfc/rfc9001.html#section-4)를 직접 QPACK/QUIC 경계에 연결한다. QPACK의 Required Insert Count가 미도착일 때는 특정 스트림 디코딩이 막히고 table 갱신 뒤 풀린다.
- [RFC 4632 §3](https://www.rfc-editor.org/rfc/rfc4632.html#section-3), [RFC 8200 §3/8.1](https://www.rfc-editor.org/rfc/rfc8200.html), [RFC 1122 §3.3.1](https://www.rfc-editor.org/rfc/rfc1122.html#section-3.3.1)을 prefix, IPv6 Hop Limit/UDP checksum, 호스트 라우팅에 배치.
- [Cisco LAN switching 공식 문서](https://www.cisco.com/c/en/us/support/docs/lan-switching/ethernet/12006-chapter22.html)는 MAC 학습·unknown unicast·VLAN별 broadcast domain을 직접 설명하므로 switch-forwarding과 broadcast-domain의 기존 RFC 826 (ARP)와 함께 보조 자료로 추가했다.
- [RFC 5280 §6.1](https://www.rfc-editor.org/rfc/rfc5280.html#section-6.1)과 [RFC 7239 §8.1](https://www.rfc-editor.org/rfc/rfc7239.html#section-8.1)은 각각 PKI 경로 및 TLS 종료 후 전달 헤더 신뢰의 구별에 활용한다.
- 기존 전역 URL을 새로운 title/metadata와 다르게 재정의하지 않는다. 기존 Reference의 title/type/language/recommendation은 유지했고, RFC 8446의 대체 관계는 Concept별 **relationNote**로 표현했다.

### 검증 체크포인트 및 명확한 한계

- `main 392ffccf90b733dfe191e222b2af15b407e42033`에서 분기. 모든 수정은 `content/network-http/**` 및 이 README 안에 국한한다.
- Network 질문 JSON **15개** 직접 파싱: **381 Question 전부** key 중복·필수 필드·MULTIPLE_CHOICE 단일 정답 key 및 choice rationale, SHORT_ANSWER acceptedAnswers 존재 검사를 통과함. **21개 변경 Question**은 main과 동일 순서/유형/난도/status/정답 key/Concept 관계를 파일별 비교하여 불변 확인함.
- 변경된 Concept MD **19개**는 각 Reference URL의 중복·displayOrder 중복과 기본 속성을 확인하고, 동일 URL의 새로운 관계 메타데이터가 일치하도록 작성. Network Concept MD는 전체 파일 트리에서 **127개**를 확인. (이는 전체 127 본문을 현재 턴에서 새로 수기 재검토했다는 의미가 아님. 기존 Wave3 전수 감사 + 변경 부분의 재검토 결과다.)
- [Repository Validation](https://github.com/guseoh/csforge/actions) 은 **최신 PR HEAD 완료 결과를 별도로 확인해야 함**. 중간 커밋에서 CI가 성공해도 최신 결과를 대체하지 않는다.
- 아직 **격리 PostgreSQL에서 이전 canonical 상태→수정 pack 실제 Preview/Apply→동일 pack reimport UNCHANGED + personal/history digest 불변**을 재현하지 않았다. 기존 bootstrap CI 통과와 이 실험을 구별한다.
- Reader/Quiz/Reference의 실제 브라우저 휴먼 사용성, 내용/Reference 전역 관계 병합 충돌·길이 경계 검증, 사용자 승인 후 merge 등 남은 완료 게이트가 있다. Production DB 미변경.

### #202 전체 남은 범위

Network slice 최종 import·Reader QA 이후 Database **38 Concept / 75 Question**, DSA **84 Concept 및 전체 Question**를 차례대로 진행한다. 이 기록이나 Draft PR #253을 #202 완료 판정으로 사용하지 않는다.


## Network historical Import / Reader·Quiz 자동 QA (2026-10-20)

### 검증한 버전과 결과

- 이전 canonical: `main 392ffccf90b733dfe191e222b2af15b407e42033` (실제 Git archive snapshot).
- 교정본 및 전용 검증 HEAD: `8d87ce9b2cdc2a55a94e6499c3d98901b6ccce0c`.
- [Network correction PostgreSQL regression #39412871720](https://github.com/guseoh/csforge/actions/runs/39412871720): **SUCCESS**, `network-historical-import` 및 `reader-quiz-browser` 모두 **SUCCESS**.
- 검증 산출물: Actions artifact `network-correction-regression-test-results` (JUnit XML), `network-reader-quiz-light-dark-mobile-desktop` (스크린샷 16장).

### 격리 PostgreSQL 실제 검증

1. Testcontainers PostgreSQL 16.4에 **교정된 canonical 전체 3,380개**를 bootstrap했다. 오류 0.
2. git archive로 고정된 이전 `main` Network source를 사용해 **19 Concept Markdown + 10 Question JSON 파일**을 과거 상태로 되돌렸다. 실제 복원 대상 **40개** (19 Concept + 21 Question), Preview/Apply 성공.
3. 변경된 Concept/Question을 참조하는 개인 노트와 풀이 Attempt, QuizSession, WrongNote, ReviewSchedule, ReviewHistory를 직접 구성하고, `concept_progress`를 포함한 personal/history 테이블 및 전체 Concept/Question ID를 기록했다.
4. 해당 29개 파일의 교정본을 다시 Preview/Apply하여 **40 UPDATED / 0 ERROR / 0 FAILED**로 복원했다.
5. 같은 교정 파일을 다시 적용했을 때 추가 UPDATE **0**, 정식 bootstrap의 전체 **3,380 UNCHANGED**, 오류/실패 0을 확인했다.
6. Import 전후 개인/history 테이블 레코드 전체 내용 및 Concept/Question ID 불변, canonical Reference 관계 총량 복귀, 중복 관계 0, Reader 조회에서 RFC 9846 연결을 확인했다.
7. 이력 테스트는 **격리 컨테이너**만 사용했으며 Production DB에 쓰지 않았다.

### Chromium Reader/Quiz QA

실제 프런트엔드 Vite 라우트에서 API fixture로 **PR의 교정된 Markdown·JSON**을 표시한 자동화 브라우저 검증이다.

- Reader: TLS 핸드셰이크 / Content-Length·Transfer-Encoding / QPACK 헤더 압축 각 1개, `375px`/ `1280px` × `light`/`dark` = 12개.
- Quiz: 실제 교정된 `last-modified.q1` 객관식에서 선택 후 `negative-cache.q2` 서술형으로 이동·답변하는 동작을 각 화면 조건에서 확인 = 4개.
- 텍스트 노출, RFC 9846 Reference 링크, 테마 반영, 가로 오버플로, 선택지·답안 조작 및 브라우저 런타임 오류를 검사. 스크린샷 16장 확보.
- 이 검증은 실제 컴포넌트/라우트를 실행했지만 **백엔드 API는 fixture**이며 Production 사용자 세션의 수동 Human Usage Check를 대체하지 않는다.

### 검증 범위 및 후속 Gate

- 콘텐츠는 기존 Wave 3 Area 전체 수기 감사 결과 + 최신 변경 부분/Reference 점검에 의거한다. 이번 검증만으로 127 Concept/381 Question 전부를 새로 독립 수기 재채점했다고 주장하지 않는다.
- 원본 Source를 복제한 일회성 테스트·워크플로·스크립트는 성공 후 PR에서 제거한다. 실행 이력·artifact·이 문서의 근거는 남긴다.
- 최종 경량화 HEAD Repository Validation 재확인, PR review/branch drift 확인, 사용자 실제 사용성 점검 및 별도 merge 승인 필요.
- #202의 Database 38 Concept/75 Question, DSA 84 Concept/전체 연계 문항은 별도 Area Slice로 남는다. #202는 계속 Open.
