---
kind: concept
contentKey: infrastructure.core.compute.configuration-secrets
topicContentKey: infrastructure.core.compute
slug: configuration-secrets
title: "실행 설정과 Secret 관리"
summary: "동일한 컨테이너 이미지를 실행 환경별 설정과 분리하고, 비밀 정보의 접근 권한·노출·교체 경계를 설계한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kubernetes.io/docs/concepts/configuration/secret/"
    title: "Kubernetes Documentation: Secrets"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Kubernetes Secret의 기본 저장·주입 동작과 암호화·RBAC·접근 제한 주의사항을 확인한다."
    displayOrder: 1
    relationNote: "Secret 객체의 사용과 보안 주의사항 확인"
  - url: "https://12factor.net/config"
    title: "The Twelve-Factor App: Config"
    referenceType: OTHER
    language: en
    depth: section
    recommendation: "배포마다 달라지는 설정을 코드·이미지와 분리하는 원칙을 참고한다."
    displayOrder: 2
    relationNote: "배포 환경별 설정 분리 원칙 참고"
---
# 실행 설정과 Secret 관리

같은 애플리케이션 이미지를 로컬·스테이징·운영 환경에서 재사용하려면 DB 접속 주소, 기능 플래그, 시간 제한처럼 환경에 따라 달라지는 값을 이미지 밖에서 공급해야 합니다.

```text
버전이 고정된 이미지
    + 실행 환경 설정
    + Secret 참조
          │
          ▼
      실행 프로세스
```

이 구조는 환경마다 이미지를 다시 만드는 대신 **배포 산출물과 환경 입력을 분리**합니다.

### Secret은 일반 설정과 노출 비용이 다르다

DB 암호, API 토큰, 개인 키(private key)는 일반 접속 주소나 기능 플래그처럼 공개되어서는 안 됩니다. 저장소나 이미지 계층에 비밀 정보를 넣으면 빌드 캐시와 레지스트리에 값이 복제될 수 있고, 자격 증명을 바꿀 때 이미지까지 다시 만들어야 합니다.

Kubernetes Secret도 기본 설정에서는 etcd에 암호화되지 않은 채 저장되며 manifest의 base64 인코딩은 암호화가 아닙니다. 사용한다면 저장 시 암호화를 켜고 RBAC를 최소 권한으로 제한하며, 가능하면 필요한 컨테이너에만 값을 전달해야 합니다.

Secret은 필요한 워크로드 식별자만 접근할 수 있게 하고 로그, 메트릭, 장애 덤프, 진단 엔드포인트에 값이 노출되지 않게 해야 합니다.

### 교체(rotation)는 새 값을 저장하는 것보다 길다

자격 증명을 새 값으로 바꿨더라도 실행 중인 애플리케이션이 이전 값을 계속 들고 있을 수 있습니다.

```text
새 자격 증명 발급
    │
    ├─ Secret 저장소 갱신
    ├─ 프로세스가 새 값을 다시 읽거나 재시작
    ├─ 새 연결 확인
    └─ 이전 자격 증명 폐기
```

이 순서가 맞지 않으면 새 Secret은 존재하지만 애플리케이션은 여전히 이전 연결을 사용하거나, 이전 자격 증명을 너무 빨리 폐기해 장애가 날 수 있습니다.

환경 변수, 마운트된 파일, Secret Manager SDK는 갱신 방식이 서로 다르므로 현재 실행 환경이 값을 다시 읽는 시점과 방법을 확인해야 합니다.

실행 설정을 분리하는 핵심은 파일 위치가 아니라 **이미지를 환경과 독립적인 배포 산출물로 유지하면서, 민감한 값은 최소 권한과 안전한 교체 수명 주기 안에서 공급하는 것**입니다.
