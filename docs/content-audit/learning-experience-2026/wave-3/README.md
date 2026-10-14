# Wave 3 — 전체 콘텐츠 의미 감사

2026-10-13, 기준선 `efe73a15da14c996bd08344181d4d6f87073803d`. 네 Area의 **49 Topic·369 Concept·1,188 Question 전체**를 직접 읽었다. 자동 추출과 검증은 누락·중복·낡은 근거를 찾는 도구이며 의미 판정을 생성하지 않는다. 감사 완료는 콘텐츠 수정 완료가 아니고, Wave 3 완료는 Issue #200 전체 감사 완료가 아니다.

| Area | Topic | C 검토 | C KEEP / 보강 | Q 검토 | Q KEEP / 보강 | 새 P0 / P1 / P2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Computer Architecture | 10 | 61/61 | 54 / 7 | 183/183 | 176 / 7 | 2 / 5 / 3 |
| DSA | 12 | 84/84 | 72 / 12 | 293/293 | 271 / 22 | 9 / 9 / 8 |
| Operating Systems | 12 | 97/97 | 83 / 14 | 331/331 | 305 / 26 | 15 / 8 / 12 |
| Network & HTTP | 15 | 127/127 | 105 / 22 | 381/381 | 360 / 21 | 4 / 5 / 20 |
| 합계 | 49 | 369/369 | 314 / 55 | 1,188/1,188 | 1,112 / 76 | 30 / 27 / 43 |

`CURRENT_VERIFIED`는 현재 canonical item의 전체 의미를 검토한 **근거 수준**이고, `KEEP`/`TARGETED_ENHANCE`는 **품질 판정**이다. 100개 새 발견 그룹과 기존 발견 4개 재확인을 분리한다. 기존 발견은 P1 1·P2 3이며 새 심각도에 합산하지 않는다. Wave 3의 품질 및 item 의미 검토 NEEDS_REVIEW는 0이고, REWRITE_REQUIRED는 0이다. 발견은 필요한 전제·답·해설·짧은 흐름·Reference·일부 기존 SVG의 정밀 보강으로 해결할 범위다.

심각도는 `content/AGENTS.md` §13 기준을 적용했다. 명백한 사실 오류·복수 정답·정확한 답의 채점 거절은 P0, 핵심 설명 공백·누락된 전제로 인한 실질적 모호성은 P1, 추가 출처·선택 보강·사소한 문체는 P2다. 일부 초안 기록의 낮은 심각도는 최종 검토에서 이 기준에 맞췄다. 기존 Wave 1·2의 발견이나 심각도는 변경하지 않았다.

## 개별 검토 근거

| 수기 ledger | 범위 |
| --- | --- |
| [computer-architecture.json](computer-architecture.json) | CPU/ISA·datapath·pipeline·cache·memory·주소 변환·TLB·다중 코어·I/O·성능 |
| [dsa.json](dsa.json) | 복잡도·순차 구조·stack/queue·hash·tree·정렬/탐색·recursion·graph/path·DP·greedy·선택 |
| [operating-systems.json](operating-systems.json) | process/thread·scheduling·kernel 경계·race/synchronization·deadlock·VM·filesystem·I/O·IPC·isolation |
| [network-http.json](network-http.json) | 계층·L2/IP/NAT·DNS·TCP/UDP/TLS·요청 여정·HTTP message/method/status/version/cache·cookie/proxy |
| [새 발견 원문](../wave-3-findings.md), [JSON](../wave-3-findings.json) | 정확한 contentKey·파일·인용·원문 line·hash·문제·최소 수정·후속 Issue |
| [기존 발견 계승](../wave-3-carried-findings.json) | LEX-001의 proxy 문항, LEX-003 order, LEX-004 DP trace, LEX-005 TLB 전제 |
| [누적 집계](../wave-3-summary.json) | Area별 item 판정, 전체 evidence/quality, Wave 및 누적 완료 |

Concept의 수기 row는 목표/Level/깊이, 정확성/동작/상태/코드/가독성/오해, 시각화, Reference, 연결 Question 검토를 각각 기록한다. Question row는 정답과 **모든** 선택지/rationale·acceptedAnswers·modelAnswer·explanation, 모호성/난이도/중복/연결을 기록한다. `sourceHashes`는 읽은 canonical item을 고정하고 판정 점수를 만들지 않는다. 단독 출제에서 이전 문항의 입력을 암묵적으로 참조하는 경우도 발견으로 남겼다.

네 Area의 `topics/` 기록 49개는 Topic별 checkpoint다. Area ledger의 Topic coverage·개별 rows·발견과 대조한다. 같은 Area의 여러 Topic에 걸친 발견은 연결된 모든 항목으로 추적한다. Area 결과가 최종 인벤토리 입력이며 조립은 수기 판정과 pinned hash를 복사한다. 아직 읽지 않은 항목을 완료로 채우는 코드는 없다.

## 주요 발견

- CA: 호출 frame의 SP 변화 설명 누락, 정상 메모리 읽기 전제와 fault 답변의 충돌, 분기 penalty 해설의 1.2/2.4 계산 오류, 하드웨어 walker 모델의 구현 범위, 초기값 없는 lost-update 문제.
- DSA: Kruskal 단일 선택형의 복수 답, 닫힌 구간 scheduling의 잘못된 최대 개수, lower-bound unknown 영역과 가능한 답 경계 혼동, `O(n)`만으로 tight `Theta(n log n)` 단정, hash resize 충돌 최악 비용, 입력 없는 BST/traversal/전처리 문항, parent 배열이 없어도 가능한 경로 복원.
- OS: 한국어·정상 API·순서 없는 set의 정확한 답을 거절하는 acceptedAnswers, zswap 반례로 두 답이 성립하는 page-fault 문항, O_NONBLOCK을 regular file까지 일반화, buffered write/flush와 syscall의 순서 혼동, pipe buffer 소진 전 EOF 단정, local IPC에도 가능한 reset/timeout, SMT·namespace의 누락된 조건.
- Network: local-IP bind와 수신 interface 제한 혼동, 조건부 PATCH가 중복 효과도 막을 수 있는 경계, Last-Modified의 strong 추론 조건을 배제한 rationale, ETag 동일·Accept-Language 차이만으로 캐시 오류를 확정하는 불충분한 전제, QUIC 사용자 공간 실행 일반화, TLS trust anchor와 server leaf 인증서 혼동.

각 요약은 연결된 발견의 정확한 전제와 출처 범위 안에서 읽어야 한다. 기존 충분한 본문을 광범위하게 재작성하거나 새 문항·그림·학습 목표를 추가할 근거가 아니다.

## 누적 진행과 남은 범위

Wave 1·2·3 누적 전수 완료는 **14/15 Area·116/134 Topic·576/721 Concept(79.89%)·1,684/2,525 Question(66.69%)**다. Java 18 Topic·145 Concept·841 Question의 새로운 전수 감사는 남아 있다. 그중 초기 직접 샘플 4 Concept·25 Question은 CURRENT_PARTIAL이며 미검토 근거는 **141 Concept·816 Question NEEDS_REVIEW**다. 품질 미확정은 **143 Concept·816 Question**으로, 부분 검토만 있는 Concept 2개도 포함한다. 이 두 집계를 혼동하지 않는다.

초기 `review-notes.json`의 원래 근거는 `priorSampleReview`로 보존하며 과거 PASS는 PRIOR_REVIEWED다. 직접 읽지 않은 Java를 자동 KEEP으로 승격하지 않았다. 기존 trusted-proxy Concept의 초기 보강 판정은 연결 문항 결함 때문이었고, 이번에는 본문을 전수 검토해 KEEP·문항 TARGETED_ENHANCE로 구분했다. 기존 발견 자체는 계승한다.

## Reference 및 시각화 한계

Wave 3 Reference는 **445 관계**, 관련 내용 대조 CURRENT_VERIFIED **299 관계**, NEEDS_REVIEW **146 관계**다. URL의 도구 접근·자료 전체·특정 Concept의 relation 범위는 다르다. UMD/Princeton 접근 제한, OSTEP의 미확인 relation, 회사 블로그의 본문 미노출, 쿠키 문서 최종 공표 등이 남아 있다. 이는 canonical item 의미 검토 미완료 수와 별도다. 299는 문서 전체/모든 anchor 검증 수가 아니다.

공식 대체 자료나 교육 모델의 직접 계산으로 확인한 KEEP에는 `supportingEvidence`로 정확한 근거·범위를 명시했다. 확인하지 못한 원래 Reference는 여전히 NEEDS_REVIEW다. 증거 수준을 올리려고 원래 URL의 접근 실패를 삭제하거나 전체 자료를 PASS하지 않았다. 관련 절의 검색 반환만 읽은 경우도 그렇게 한정한다.

`NONE/TEXT/DIAGRAM`을 본문과 대조하며 ASCII·상태 표·timeline의 실제 설명력을 인정했다. Wave 3에 연결된 OS **33개 SVG의 전체 소스·label·좌표·연결 의미**를 읽고 hash를 고정했다. pixel/render/Reader dark/light/mobile QA 완료는 아니다. 초기 전체 자산 60개는 Java 27·OS 33이며 Java의 array-covariance.svg 하나는 미연결이다. 새 이미지나 기존 자산 수정은 없다.

[도식·Reference·후속 최소 범위](visualization-reference-followups.md)에서 실제 보여 줄 상태·흐름과 남은 접근 확인을 구분한다. 검토 결과는 ChatGPT의 최종 콘텐츠 품질 검토 이후 #201/#202의 후속 작업에 활용한다. 이번 PR은 병합하지 않는다.
