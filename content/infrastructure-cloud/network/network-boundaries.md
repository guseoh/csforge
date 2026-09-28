---
kind: concept
contentKey: infrastructure.core.network.network-boundaries
topicContentKey: infrastructure.core.network
slug: network-boundaries
title: "네트워크 경계와 접근 제어"
summary: "VPC·서브넷·경로와 자원 수준의 보안 규칙이 트래픽 경로를 제한하는 방식을 이해하고 인바운드와 아웃바운드를 함께 설계한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html"
    title: "Amazon VPC Documentation: How Amazon VPC works"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "VPC·서브넷·라우팅 테이블이 자원 간 경로와 인터넷 연결을 구성하는 방식을 확인한다."
    displayOrder: 1
    relationNote: "VPC·서브넷·라우팅 테이블과 인터넷 연결의 AWS 경계 확인"
  - url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html"
    title: "Amazon VPC Documentation: Security Groups"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "보안 그룹의 stateful 인바운드·아웃바운드 허용 규칙과 자원 연결 방식을 확인한다."
    displayOrder: 2
    relationNote: "자원 수준 인바운드·아웃바운드 허용 규칙과 stateful 보안 그룹 동작 확인"
  - url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
    title: "Kubernetes Documentation: Network Policies"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Pod 단위 인바운드·아웃바운드 격리와 default-deny 정책의 적용 범위를 확인한다."
    displayOrder: 3
    relationNote: "Pod 인바운드·아웃바운드 정책과 기본 차단 경계 확인"
---
# 네트워크 경계와 접근 제어

애플리케이션이 인터넷에서 직접 도달 가능한지, 부하 분산 장치를 통해서만 접근 가능한지, DB가 내부 전용 경로에만 있는지는 **실제 경로와 보안 규칙**이 결정합니다.

```text
인터넷
   │ HTTPS
   ▼
외부 공개 부하 분산 장치
   │ 애플리케이션 포트
   ▼
내부 애플리케이션 네트워크
   │ DB 포트만 허용
   ▼
내부 데이터베이스
```

AWS에서는 VPC·서브넷·라우팅 테이블이 트래픽 경로를 만들고 보안 그룹이 자원 수준에서 허용할 인바운드·아웃바운드 트래픽을 제한합니다. Kubernetes NetworkPolicy는 Pod 간 트래픽을 제한하는 별도 계층입니다. 다만 NetworkPolicy 객체만 만든다고 차단이 보장되지는 않습니다. 클러스터의 CNI·네트워크 플러그인이 해당 정책을 구현하는지 확인해야 실제 트래픽에 적용됩니다.

### Public/Private라는 이름보다 실제 경로를 본다

서브넷 이름에 `public`이 붙었다고 그 안의 모든 자원이 자동으로 인터넷에 공개되는 것은 아닙니다. Internet Gateway로 향하는 경로, 자원 주소, 보안 규칙 등이 함께 맞아야 실제 외부 진입 경로가 만들어집니다.

반대로 private subnet도 외부로 나가는 경로가 전혀 없다는 뜻은 아닙니다. NAT나 private endpoint 같은 별도 경로를 통해 필요한 외부 의존성에 접근할 수 있습니다.

### 인바운드뿐 아니라 아웃바운드도 경계다

외부에서 애플리케이션으로 들어오는 포트만 제한해도 애플리케이션이 내부·외부 모든 목적지로 자유롭게 나갈 수 있다면 자격 증명 탈취나 SSRF 이후 피해 범위가 커질 수 있습니다.

```text
인바운드
클라이언트 → 애플리케이션

아웃바운드
애플리케이션 → DB / 외부 API / DNS / 관측 시스템
```

따라서 실제 워크로드에 필요한 출발지, 목적지, 포트와 경로를 기준으로 양쪽 방향을 설계합니다. 사용자가 입력한 URL을 서버가 대신 호출하는 기능처럼 외부 목적지가 동적으로 바뀌는 경우에도 애플리케이션 인증만으로는 충분하지 않습니다. 인프라 계층에서는 내부 주소 대역이나 허용되지 않은 목적지로 나가는 요청을 제한하는 아웃바운드 경계를 함께 둬야 합니다.

네트워크 보안은 애플리케이션 인가를 대신하지 않습니다. 애플리케이션 서버가 DB에 연결할 수 있다는 사실은 사용자가 다른 사람의 주문을 읽어도 된다는 뜻이 아닙니다. **네트워크 도달 가능성과 사용자·자원 권한은 서로 다른 방어 층**입니다.
