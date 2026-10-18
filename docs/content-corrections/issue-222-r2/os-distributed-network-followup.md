# Issue #222 R2 — OS 2관계 원문 검증 / Distributed 2·Network 1 접근 경계 재검토

- 검토일: 2026-10-19
- 기준: `main 2d63e679e7fbdbbd68be8d1291e464634ca441c6` / [Issue #222](https://github.com/guseoh/csforge/issues/222) / [현재 감사 집계](../issue-222-postmerge/README.md)
- 범위: **원래 canonical Reference URL × Concept의 관계 단위** 5건. 접속 실패를 URL 파손이나 기술 오류로 단정하지 않는다.
- 검증 상태: 실제 원문 성공 **2건** → [verified-relations.json](verified-relations.json)에 개별 KEEP 추가. 다른 **3건은 원래 링크의 본문 접근 미확인**으로 유지하며, 검색 발췌/저자본의 실재를 원래 URL 접근 확인으로 바꿔 기록하지 않는다.

## 1. DIRECT_CONTENT_VERIFIED / KEEP 2건 — RISC-V Privileged Architecture

원래 링크 [RISC-V Privileged Architecture Introduction](https://docs.riscv.org/reference/isa/priv/priv-intro.html)을 직접 열었을 때 **latest version 안내를 거쳐** 실제 [2026-01-20 버전의 공식 Introduction 본문](https://docs.riscv.org/reference/isa/v20260120/priv/priv-intro.html)을 열어 읽을 수 있었다.

- **Privilege Levels**: User/Application (U), Supervisor (S), Machine (M); mode마다 허용되지 않은 연산이 exception을 일으키고 보통 trap을 통해 처리됨. Table 1·2와 U-mode의 supervisor call/timer interrupt 설명을 확인.
- **범위 제한**: M-mode가 유일한 필수 권한 수준이므로 모든 RISC-V 하드웨어가 U/S/M 세 모드를 구현한다는 설명은 피한다. PMP·상세 가상메모리 R/W/X 변환은 이 Introduction 하나만으로 검증한 것이 아니며, OS 일반 계약과 특정 ISA 규칙을 분리한다.

| 원래 (contentKey, URL) 관계 | 판정 | Concept의 내용 중 실제 원문으로 확인한 부분 |
| --- | --- | --- |
| `operating-systems.core.kernel-boundary.user-kernel-mode` + [priv-intro](https://docs.riscv.org/reference/isa/priv/priv-intro.html) | **KEEP / DIRECT_CONTENT_VERIFIED** | 사용자 코드/OS 권한 경계, 통제된 trap 진입, 권한 수준/문맥 전환 비동일성(후자는 Concept 자체의 일반 OS 설명으로 구분) |
| `operating-systems.core.kernel-boundary.privilege-protection` + [priv-intro](https://docs.riscv.org/reference/isa/priv/priv-intro.html) | **KEEP / DIRECT_CONTENT_VERIFIED** | 권한 수준별 허용 연산·CSR 접근 경계, 금지된 연산의 exception. 메모리 page mapping 권한 상세는 별도 계약 |

**결론:** 기존 title/URL/global metadata/relationNote를 바꿀 필요가 없어 canonical 수정 0. 원문 내용에 따라 2개를 독립 VERIFIED 집계에 추가할 수 있다. 공유 URL 2관계 각각의 적용범위를 별도로 판단했다.

## 2. Distributed Systems 원래 2관계 — 논문의 실재 및 작성자 원고는 확인, 원 URL 접근은 보류

### 2-1. `distributed.core.coordination.saga-compensation`

- canonical: [Princeton TR-070-87 / SAGAS](https://www.cs.princeton.edu/research/techreps/598)
- 원 URL 직접 조회는 **403**. 원 대학 검색/기술보고서 메타데이터에는 보고서 번호 **TR-070-87**, 저자 Garcia-Molina/Salem, 1987년, 긴 트랜잭션을 단계와 보상 동작으로 나누는 공식 Abstract를 확인.
- 별도 [Princeton 1987년 기술보고서 원문 PDF](https://www.cs.princeton.edu/techreports/1987/070.pdf)도 검색 인덱스에서 제목/Abstract가 보이지만 이번 원문 PDF 직접 열기는 403. **두 주소의 전문을 직접 읽었다는 판정은 금지**.
- Concept은 Saga를 자동 물리적 DB rollback으로 오해하지 않고 보상/격리 문제/업무 트랜잭션을 구분하고 있으며, 제공된 Abstract와 주제는 부합. 그러나 Intro/compensation 세부 절 전문·Reader 접근 경로는 여전히 **ACCESS_BLOCKED / ABSTRACT_INDEXED_ONLY**.

### 2-2. `distributed.core.coordination.cap-tradeoffs`

- canonical: [ACM 10.1145/564585.564601](https://dl.acm.org/doi/10.1145/564585.564601), Gilbert/Lynch, 2002.
- ACM canonical URL 직접 조회는 **403**. 별도로 **실제 저자 소속 MIT CSAIL의 13쪽 [Brewer6.pdf](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer6.pdf) 원문을 직접 열고 3·4쪽을 렌더링하여 검사**. `§2.1 Atomic Data Objects`, `§2.2 Available Data Objects`, `§2.3 Partition Tolerance`, `§3.1 Impossibility Result`와 Theorem 1에서 선형화 가능성, 실패하지 않은 노드의 요청 종료(시간 상한 없음), 네트워크의 임의 메시지 손실을 확인.
- Concept의 “정상 노드의 요청이 결국 응답”, “분할 중 linearizability와 availability를 함께 항상 보장할 수 없음”은 이 저자 원고와 정합. **저자 원고 직접 검증은 완료**, 그러나 `dl.acm.org` canonical URL 자체는 접근 불가하므로 현재 `DIRECT_CONTENT_VERIFIED`로 해당 원 URL을 마킹하지 않고 **AUTHOR_MANUSCRIPT_DIRECT / ACM_ACCESS_BLOCKED**로 분리해 둔다.
- 추후 Reader에서 DOI 본문 접근성 문제가 재현되면 접근 가능한 공식 저자 원고 링크를 추가하는 최소 UX 교정을 검토. DOI가 잘못되거나 논문이 존재하지 않는다는 결론 아님.

## 3. Network & HTTP 1관계 — Kakao Wcache

- canonical: `network-http.core.http-cache.intermediary-cache` + [카카오 Wcache Part 1](https://tech.kakao.com/posts/345)
- 원 URL을 직접 열었을 때 **제목·작성자·메뉴 shell만 보이고 본문은 누락**. 그러나 동 URL에 대한 **검색 인덱스의 긴 원문 발췌**에서는 원글의 `저장 구조`, `Wcache의 분산 구성` 절과 `consistent hashing`, hot item 집중·이중 계층 SSD/HDD 캐시 설명을 확인할 수 있었다.
- 이는 현행 `relationNote`의 **“공유 캐시의 적중률, 인기 항목, 계층 분리”**와 잘 대응한다. 하지만 검색 발췌만으로는 실재 Reader가 본문을 읽을 수 있는지, 사이트 스크립트 상태에 따라 글이 노출되는지, 2017년 성능 수치가 지금도 해당하는지 확인할 수 없다.
- **판정: `INDEXED_EXCERPT_ONLY / ORIGINAL_ARTICLE_SHELL`**, 원본 2017년 카카오 사례로써 추천 이유를 유지하고 `RFC 9111`을 HTTP 프로토콜 보장 근거로 우선시. 확정 오류 0, canonical 교정 0.

## 4. 최종 분류 및 다음 차수

| 구분 | 이번 대상 | 직접 원문 확인에 따른 신규 KEEP | 보류 |
| --- | ---: | ---: | ---: |
| Operating Systems, RISC-V | 2 | **2** | 0 |
| Distributed Systems, Princeton/ACM | 2 | 0 | 2 |
| Network & HTTP, Kakao | 1 | 0 | 1 |
| **합계** | **5** | **2** | **3** |

독립 R2 원문 검증 집계는 **15→17**, 비Java 역사적 미확정 후보는 **133→131**이 될 수 있다(현행 canonical 15 Area/721 Concept/1,042 관계/622 URL 불변). 실제 `reconcile.py` 재실행과 최종 CI로 확인해야 한다.

다음 우선순위는 **Operating Systems의 나머지 14관계**로, JEP 491·D2 다수·Kakao io_uring의 접근 경계를 개별 검증한다. UMD 44와 DSA 70은 기존 전수 inventory를 유지하면서 직접 열 수 있는 원문 확보 시에만 VERIFIED 판정을 늘린다. 기존 Wave 감사 파일과 canonical Markdown/Question/Import를 변경하지 않는다.
