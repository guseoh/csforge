# Issue #206 — Infrastructure failure domain Content Pack 검토

## 범위와 학습 목표

- 기준 `main a0bb36fdc00bbc8228220cbbbcafa3c785929df1`; 기존 Infrastructure 3 Topics / 9 Concepts / 27 Questions와 Curriculum의 학습 목표, 각 문항 유형·정답·해설을 대조했다.
- 기존 `execution-models`, `resource-boundaries`, `configuration-secrets`, `network-boundaries`, `load-balancing-ingress`, `dns-tls`, `storage-models`, `backup-restore`, `iac-rollout`은 **KEEP**. DNS/TLS 프로토콜 재설명, 이론적인 분산 합의, SaaS 플랫폼 기술 나열은 제외한다.
- 독립 공백: 동일 AZ·공통 DB/스토리지에 따른 **상관 장애(failure domain)**와 한 영역이 손실됐을 때의 **잔여 처리 용량·데이터 복구 계약**.
- 신규 `infrastructure.core.reliability.failure-domains`, Level 2 / CORE / order 40 / visualization **DIAGRAM** (본문 ASCII의 정상·AZ 실패 시각/의존성 지도), 기존 reliability Topic에 배치.
- 신규 Question 3개: MC/EASY 정답 **B**, SCENARIO/MEDIUM 2×100=200 req/s vs 220 req/s (초과 20 req/s라는 단순 상한), DESCRIPTIVE/HARD App·LB·DB·Storage RPO/RTO/복구 trade-off. 기존 키·유형·정답·관계는 유지.

## Reference와 기술 정확성

- [AWS Well-Architected REL10-BP01 원문](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html) · [한국어](https://docs.aws.amazon.com/ko_kr/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html): 컴퓨팅/저장소의 다중 AZ 배치는 서비스·설정별로 구분해야 하며 App만 분산해도 공통 데이터 의존성은 남음.
- 숫자 예시는 DB/네트워크가 충분하고 인스턴스별 성공 처리량을 유지한다는 **가정 아래의 산술**이다. 실제 SLO 보장이라고 주장하지 않음.
- DB failover, storage durability, RPO/RTO는 개별 서비스 구성·복제/커밋 정책에 의존하며, 장애 복구 시간과 데이터 손실을 자동으로 0이라고 주장하지 않음.
- 신규 외부 asset 없음. 기존 텍스트 기반 다이어그램은 정상/장애/복구와 자원 경계를 나타낸다. 새 ALT/theme/mobile 시각적 검증은 비적용. Human Usage Check는 사용자 지침에 따라 **생략했으며 수행한 것으로 표시하지 않는다**.

## 독립 PostgreSQL Import QA

- [Actions #39552718201](https://github.com/guseoh/csforge/actions/runs/39552718201) **SUCCESS**. 독립 PostgreSQL 16 / Java 25 Spring Boot LOCAL 모드, 원래 3,388 canonical items bootstrap 후 신규 MD + 기존 Topic Question JSON을 실제 Multipart Preview/Apply.
- **4 CREATED + 9 기존 Question UNCHANGED**, ERROR 0. 동일 파일 exact reimport **13 UNCHANGED / 0 UPDATED**, 기존 Concept/Question ID 및 10개 개인·오답·복습·Question 관계 테이블 digest 보존. 실제 MC 정답 채점 확인.
- 개발 런타임이나 Redis/Kafka/인프라 설정 변경 없음. 테스트 전용 `CanonicalInventory`는 873 source files / 724 Concepts / 2,534 Questions / 3,392 items를 기대한다. Production DB 변경 없음.
- 검증 전용 Actions YAML은 성공 후 PR에서 제거. 증거는 해당 Actions 실행과 이 문서로 유지.

## 완료 게이트

- [x] 기존 Area 전체 학습 목표/문항 리뷰 및 개선 범위 확정
- [x] 공식 문서 대조 / 계산·실패 반례 / ASCII 도식
- [x] 실제 격리 Import Preview/Apply·exact replay·개인/history 보존
- [ ] QA YAML 제거 후 최종 HEAD Repository Validation / 리뷰 스레드·base drift / squash merge
