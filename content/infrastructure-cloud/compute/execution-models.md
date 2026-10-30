---
kind: concept
contentKey: infrastructure.core.compute.execution-models
topicContentKey: infrastructure.core.compute
slug: execution-models
title: "VM·컨테이너·서버리스의 실행 책임"
summary: "VM·컨테이너·서버리스가 애플리케이션 실행 환경과 호스트 관리 책임을 나누는 방식을 이해하고, 실행 단위와 영구 데이터의 수명 주기를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://csrc.nist.gov/pubs/sp/800/145/final"
    title: "NIST SP 800-145: Cloud Computing Definition"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "클라우드 컴퓨팅의 핵심 특성, IaaS·PaaS·SaaS 서비스 모델과 배포 모델을 확인한다."
    displayOrder: 1
    relationNote: "온디맨드 공유 컴퓨팅 자원과 클라우드 서비스 모델 확인"
  - url: "https://docs.docker.com/get-started/docker-overview/"
    title: "Docker Documentation: What is Docker?"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "이미지, 컨테이너와 실행 수명 주기를 설명하는 기본 문서를 확인한다."
    displayOrder: 2
    relationNote: "이미지와 컨테이너 실행 모델 확인"
  - url: "https://docs.docker.com/engine/storage/"
    title: "Docker Documentation: Storage"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "컨테이너 쓰기 계층과 컨테이너 수명에 독립적인 volume·mount 저장 방식을 확인한다."
    displayOrder: 3
    relationNote: "컨테이너 쓰기 계층과 영구 저장소의 수명 주기 차이 확인"
---
# VM·컨테이너·서버리스의 실행 책임

같은 Spring Boot 애플리케이션도 어디에서 실행하느냐에 따라 우리가 직접 관리해야 하는 범위가 달라집니다. VM은 게스트 OS까지 하나의 실행 환경으로 다루고, 컨테이너는 호스트 커널을 공유하면서 이미지와 프로세스 실행 단위를 격리합니다. 서버리스는 호스트와 실행 환경 관리의 더 많은 부분을 클라우드 사업자가 맡습니다.

```text
VM
애플리케이션 → 게스트 OS → 하이퍼바이저 → 호스트

컨테이너
애플리케이션 → 이미지/컨테이너 프로세스 → 호스트 커널

서버리스
함수/애플리케이션 단위 → 관리형 실행 환경 → 클라우드 사업자 인프라
```

### 추상화가 높아져도 운영 책임이 사라지지는 않는다

VM을 직접 운영하면 OS 패치, 실행 환경 설치, 처리 용량과 프로세스 수명 주기까지 더 많이 관리합니다. 컨테이너 플랫폼은 배치와 재시작을 자동화할 수 있지만 이미지, 자원 요청·제한, 상태 확인 신호와 배포 설정은 여전히 애플리케이션 운영 계약입니다.

서버리스도 호스트를 직접 관리하지 않을 뿐 실행 시간 제한, 동시 실행 수, 권한, 콜드 스타트(cold start)와 비용 같은 새로운 제약을 갖습니다. 따라서 "서버리스는 운영이 없다"고 이해하면 안 됩니다.

### 실행 단위와 데이터 수명은 따로 본다

컨테이너 이미지는 재현 가능한 배포 산출물(artifact)이고, 실행 중인 컨테이너는 그 이미지를 바탕으로 만들어진 실행 인스턴스입니다. 컨테이너가 제거되어 새 인스턴스가 만들어질 때 쓰기 계층의 데이터가 그대로 유지된다고 가정할 수 없습니다.

```text
이미지 ─▶ 컨테이너 A ─X
   └──▶ 컨테이너 B

A의 로컬 쓰기 상태
→ B에 자동 승계된다고 가정하지 않음
```

재생성 이후에도 남아야 하는 주문 데이터나 업로드 파일은 데이터베이스, 볼륨, 객체 저장소처럼 실행 인스턴스와 분리된 영구 저장소에 둬야 합니다.

VM·컨테이너·서버리스를 비교할 때 핵심은 기술 이름보다 **누가 호스트와 실행 환경의 수명 주기를 관리하는지, 실행 인스턴스가 사라질 때 어떤 상태까지 함께 사라지는지**를 구분하는 것입니다.
