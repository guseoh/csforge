---
kind: concept
contentKey: infrastructure.core.network.load-balancing-ingress
topicContentKey: infrastructure.core.network
slug: load-balancing-ingress
title: "외부 요청의 진입과 부하 분산"
summary: "외부 요청이 부하 분산 장치·Ingress·Service를 거쳐 준비된 애플리케이션 인스턴스로 전달되는 흐름과 상태 신호가 트래픽 경로에 미치는 영향을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://kubernetes.io/docs/concepts/services-networking/ingress/"
    title: "Kubernetes Documentation: Ingress"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Ingress의 host·path routing 추상화와 현재 API의 개발 상태를 확인한다."
    displayOrder: 1
    relationNote: "외부 HTTP 접근과 경로 규칙의 플랫폼 추상화 확인"
  - url: "https://kubernetes.io/docs/concepts/services-networking/service/"
    title: "Kubernetes Documentation: Services"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Service가 안정된 주소를 제공하고 backend Pod로 트래픽을 전달하는 방식을 확인한다."
    displayOrder: 2
    relationNote: "안정적인 서비스 주소와 백엔드 Pod 경로 설정 확인"
  - url: "https://kubernetes.io/docs/concepts/services-networking/gateway/"
    title: "Kubernetes Documentation: Gateway API"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Ingress보다 확장 가능한 Kubernetes Gateway API의 routing model과 역할을 확인한다."
    displayOrder: 3
    relationNote: "새 경로 기능이 필요한 Kubernetes 환경에서 Gateway API를 검토하는 기준 확인"
---
# 외부 요청의 진입과 부하 분산

애플리케이션 인스턴스가 여러 개라면 클라이언트가 각 인스턴스 주소를 직접 알 필요는 없습니다. 앞단의 부하 분산 장치나 Ingress가 안정적인 진입점을 제공하고, 경로 규칙에 따라 실제 백엔드로 트래픽을 전달할 수 있습니다.

```text
클라이언트
   │ HTTPS
   ▼
부하 분산 장치 / Ingress
   │ host/path 기반 경로 규칙
   ▼
Service / 백엔드 집합
   ├─ 인스턴스 A
   ├─ 인스턴스 B
   └─ 인스턴스 C
```

Kubernetes Ingress API는 안정적이지만 새 기능 개발은 동결(frozen)된 상태이며, 새 기능이 필요하면 Gateway API를 우선 검토하도록 Kubernetes 프로젝트가 안내합니다. Ingress나 Gateway 구현은 별도 컨트롤러가 맡으므로 실제 사용 기능과 지원 범위는 클러스터의 구현체에서 확인해야 합니다.

### TLS를 어디서 종료할지도 요청 경로의 일부다

외부 HTTPS를 부하 분산 장치에서 종료한 뒤 내부 서비스로 HTTP를 보낼지, 다시 TLS로 암호화할지는 네트워크 경계와 신뢰 모델에 따라 정합니다. 외부 인증서가 정상이어도 내부 구간까지 암호화된다는 뜻은 아니므로, 각 구간의 암호화 요구와 인증서 관리 책임을 구분해야 합니다.

### 살아 있는 것과 요청을 받을 준비가 된 것은 다르다

프로세스가 실행 중이어도 시작 시 마이그레이션을 수행 중이거나 필수 의존성 연결이 끝나지 않았다면 실제 요청을 받으면 안 될 수 있습니다. Readiness 신호는 이런 인스턴스를 트래픽 대상에서 제외하는 데 사용할 수 있습니다.

반면 liveness는 프로세스를 다시 시작해야 할 정도로 회복 불가능한 상태인지 판단하는 신호입니다. Readiness 실패를 곧바로 재시작 사유로 사용하면 일시적인 의존성 장애 때 불필요한 재시작이 반복될 수 있습니다.

```text
프로세스 실행 중
  ├─ 준비됨     → 트래픽 수신 가능
  └─ 준비 안 됨 → 트래픽 대상에서 제외
```

### 배포 중에도 상태 확인이 트래픽 전환을 결정한다

새 버전을 배포할 때 이전·새 인스턴스가 잠시 함께 존재할 수 있습니다. 새 인스턴스가 실제로 준비되기 전에 트래픽을 보내면 배포가 곧 사용자 오류가 됩니다. 반대로 종료 중인 인스턴스에서는 새로운 트래픽을 끊고 처리 중인 요청을 마칠 시간을 줄 수 있어야 합니다.

### 로컬 상태는 여러 인스턴스와 충돌할 수 있다

세션이나 임시 상태를 한 인스턴스 메모리에만 두면 다음 요청이 다른 인스턴스로 이동했을 때 상태를 찾지 못할 수 있습니다. 고정 세션(sticky routing)을 사용할 수도 있지만 인스턴스 장애와 확장 제약이 생깁니다. 필요하다면 공유 상태 저장소 또는 무상태(stateless) 계약을 검토합니다.

부하 분산의 핵심은 단순히 요청을 균등하게 나누는 것이 아니라 **현재 요청을 받아도 되는 백엔드만 트래픽 집합에 포함시키고, 배포·장애·종료 중에도 그 집합을 안전하게 바꾸는 것**입니다.
