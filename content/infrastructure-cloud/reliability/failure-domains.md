---
kind: concept
contentKey: infrastructure.core.reliability.failure-domains
topicContentKey: infrastructure.core.reliability
slug: failure-domains
title: "장애 영역과 가용성 배치"
summary: "인스턴스·가용 영역·공유 DB 의존성이 만드는 장애 범위를 추적하고 한 영역 손실 뒤 남는 처리 용량과 복구 조건을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html"
    title: "AWS Well-Architected Framework: REL10-BP01 Deploy the workload to multiple locations"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "AZ 물리적 격리, 컴퓨팅·데이터 계층 전체의 다중 AZ 배치 및 공통 장애점 확인"
  - url: "https://docs.aws.amazon.com/ko_kr/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html"
    title: "AWS Well-Architected Framework: REL10-BP01 워크로드를 여러 위치에 배포"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 2
    relationNote: "가용 영역 분산 시 컴퓨팅·데이터 서비스의 배치·페일오버 조건 검증"
---
# 장애 영역과 가용성 배치

인스턴스를 세 대 실행한다고 서비스 장애를 세 대로 분리할 수 있는 것은 아닙니다. 세 대가 모두 하나의 가용 영역(Availability Zone, AZ)에 있다면 같은 전원·네트워크 장애로 동시에 멈출 수 있고, 서로 다른 AZ에 있더라도 모두 같은 단일 DB 인스턴스에 의존한다면 **DB 하나의 장애가 전체 API의 장애**가 될 수 있습니다. 중요한 것은 복제본 수보다 **어떤 자원을 함께 잃는지(failure domain)**를 실제 요청 경로로 추적하는 일입니다.

```text
                   외부 클라이언트
                          │
                  다중 AZ 진입점/LB
                   ┌──────┴──────┐
              AZ A │             │ AZ B
             App A1, A2          App B1, B2
                   └──────┬──────┘
                          │
                    기준 데이터베이스
               ┌──────────┴──────────┐
          기본 인스턴스(AZ A)    대기 인스턴스(AZ B)
               └── 복제·전환 계약 ────┘
```

이 그림은 **장애 분석을 위한 예시**입니다. 모든 관리형 DB가 기본적으로 다중 AZ 복제·자동 승격을 제공한다는 뜻이 아닙니다. 실제 데이터베이스 엔진·서비스 유형·옵션에 따라 복제 방식과 전환 시간이 다르며, LB도 현재 구성에서 서로 다른 영역에 배치되었는지 확인해야 합니다.

### 어느 경계까지 살아남아야 하는가

한 프로세스의 종료, 노드 장애, AZ의 네트워크 단절, 리전 수준 장애는 영향 범위가 다릅니다. 예를 들어 App A1만 종료되면 A2와 B 인스턴스가 준비 상태일 때 트래픽을 받을 수 있습니다. 그러나 AZ A 자체가 사용 불가능하면 A1·A2뿐 아니라 그 AZ에만 존재하는 볼륨과 DB 기본 인스턴스도 영향을 받을 수 있습니다.

```text
T0: AZ A + AZ B 모두 동작
T1: AZ A 전체 장애
    ├─ App A1/A2: 응답 불가
    ├─ AZ A 전용 블록 볼륨: 다른 AZ에서 즉시 사용 가능하다고 가정 금지
    ├─ DB 기본 인스턴스: 다른 AZ로 전환 필요할 수 있음
    └─ App B1/B2: 살아 있어도 DB 연결 재수립 전까지 일부 요청 실패 가능
T2: LB 상태 확인 → 정상 App만 라우팅
T3: DB 전환·연결 복구 → 업무 읽기/쓰기 재개
```

멀티 AZ는 각 영역의 독립성을 높일 수 있지만, 같은 인증 시스템·단일 Secret 서비스·공통 외부 API·공유 DB를 모두 사용한다면 그 서비스가 여전히 **공통 의존성**입니다. DB의 복제 또는 대기 인스턴스를 실제로 마련했는지, 현재 복구 작업에 제어 영역(control plane) 호출이 필요한지, 권한과 설정이 준비돼 있는지를 확인해야 합니다.

### 남은 영역이 수요를 감당할 수 있는가

정상 상태의 총 처리량으로만 인스턴스 수를 정하면 장애 직후 살아남은 영역이 포화될 수 있습니다. 각 App의 **측정된 정상 처리 용량이 초당 성공 요청 100건**이고 AZ A·B에 각각 두 대를 배치했다고 가정하겠습니다.

| 상황 | 준비된 App | 단순 계산상 상한 |
| --- | --- | --- |
| 평상시 | A 2대 + B 2대 | 400건/초 |
| AZ A 전체 장애 | B 2대 | 200건/초 |
| 장애 중 유입 220건/초 | B 2대 | **20건/초 초과** |

200건/초는 DB·네트워크가 충분하고 부하가 균등하며 인스턴스당 100건/초를 유지한다는 **단순 가정의 상한**일 뿐 실제 SLO 충족 처리량이라는 보장이 아닙니다. 장애 뒤에는 DB failover, 연결 재시도, 캐시 미스 때문에 실제 성능이 더 낮아질 수 있습니다. 이를 대비하려면 평상시 여유 용량, 장애 영역을 대체할 배치 제약, 새 인스턴스 준비 시간, 최대 DB 연결 수와 유입 제어 정책을 같이 검증해야 합니다.

### 가용성과 데이터 복구 목표는 분리한다

AZ 장애 시 LB가 살아 있는 App을 선택한다고 해서 PostgreSQL의 마지막 커밋이 새 DB 인스턴스에 모두 남아 있다는 의미는 아닙니다. 동기/비동기 복제, 쓰기 승인 시점, 장애 전환 방식에 따라 **RPO(허용 손실량)**가 달라질 수 있고, DB 승격·연결 복구·애플리케이션 준비 상태가 **RTO(허용 중단 시간)**에 영향을 줍니다. 특정 서비스에서 데이터 손실이 없다고 주장하려면 해당 복제·커밋 설정의 보장까지 검토해야 합니다.

또한 서버를 서로 다른 AZ에 배치했더라도 실제 부하 테스트나 장애 주입 없이 “단일 AZ 장애에 완전히 내성이 있다”고 단정할 수 없습니다. 인스턴스·LB·DB·스토리지·자격 증명·상위 API를 포함한 의존성 지도를 만들고, **AZ 한 곳을 제거하는 가상 시나리오**에서 어느 단계가 먼저 실패하고 얼마나 빨리 정상화되는지 확인해야 합니다. 실제 Production AZ를 강제로 종료하는 실험이 필수라는 뜻은 아닙니다.

운영 설계의 목표는 무조건 여러 리전·클러스터를 추가하는 것이 아닙니다. 목표 RPO/RTO와 예상 장애 범위를 먼저 정하고, 그 목표를 충족하기에 필요한 **최소한의 독립된 장애 영역, 남는 처리 용량과 데이터 복구 계약**을 선택하는 것입니다.
