---
kind: concept
contentKey: infrastructure.core.reliability.storage-models
topicContentKey: infrastructure.core.reliability
slug: storage-models
title: "객체·블록·파일 저장소 선택"
summary: "객체·블록·파일 저장소의 접근 방식과 공유 모델을 구분하고 입출력 형태·지연 시간·내구성 요구에 따라 선택한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/storage-services.html"
    title: "AWS Whitepaper: Storage Services Overview"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "S3 object, EBS block volume과 EFS shared file system의 접근·공유 모델을 비교한다."
    displayOrder: 1
    relationNote: "객체·블록·파일 저장소의 기능 차이 비교 참고"
---
# 객체·블록·파일 저장소 선택

"파일을 저장한다"는 요구만으로 저장소를 고를 수는 없습니다. 데이터베이스처럼 작은 블록을 자주 수정하는 작업인지, 큰 파일을 키로 저장하는지, 여러 머신이 같은 디렉터리 이름 공간을 공유해야 하는지에 따라 필요한 모델이 달라집니다.

| 모델 | 접근 방식 | 대표적인 사용 |
| --- | --- | --- |
| 객체(object) | 객체 키 + 메타데이터 | 업로드 파일, 미디어, 백업 파일 |
| 블록(block) | 머신에 블록 장치로 제공 | 데이터베이스 볼륨, 파일시스템 기반 작업 |
| 파일(file) | 디렉터리/파일 이름 공간 공유 | 여러 호스트가 함께 쓰는 공유 파일 트리 |

### 저장 모델은 애플리케이션이 보는 인터페이스가 다르다

객체 저장소는 보통 파일시스템 블록을 임의 위치에서 수정하는 방식보다 객체 전체를 키로 읽고 쓰는 모델에 가깝습니다. 블록 저장소는 OS가 블록 장치로 다루며 그 위에 파일시스템이나 데이터베이스 저장 엔진을 둘 수 있습니다. 파일 저장소는 여러 클라이언트가 디렉터리와 파일 이름 공간을 공유하는 데 유리합니다.

그래서 PostgreSQL 데이터 디렉터리를 객체 저장소의 객체처럼 단순 치환하거나, 대용량 바이너리를 항상 DB 행 안에 저장하는 식으로 서로 다른 접근 모델을 섞으면 성능과 운영 특성이 달라질 수 있습니다.

### 메타데이터와 파일 본문을 분리할 수도 있다

사용자가 올린 파일이라면 소유자, 상태, 콘텐츠 유형 같은 메타데이터는 PostgreSQL에서 관리하고 실제 큰 본문은 객체 저장소에 둘 수 있습니다.

```text
PostgreSQL
- file_id
- owner_id
- status
- object_key

객체 저장소
- 실제 바이너리 본문
```

이 구조에서는 두 저장소의 수명 주기와 삭제 정책을 함께 관리해야 하지만 각 저장소가 잘하는 역할을 나눌 수 있습니다.

### 두 저장소에 나눠 쓰면 원자성도 따로 설계한다

객체 저장소 업로드와 DB 트랜잭션은 하나의 원자적 트랜잭션이 아닙니다. 파일 본문 저장은 성공했지만 메타데이터 저장이 실패하면 DB에서 참조하지 않는 고아 객체(orphan object)가 남을 수 있습니다.

```text
객체 업로드 성공
        │
DB 메타데이터 저장 실패
        │
        └─ 참조되지 않는 객체가 남음
```

이런 경계에서는 업로드 상태를 `PENDING → COMPLETE`처럼 명시적으로 관리하거나, 일정 시간 참조되지 않은 객체를 찾아 정리하는 재조정(reconciliation) 작업을 둘 수 있습니다. 중요한 점은 두 저장소가 항상 함께 성공한다고 가정하지 않고, 한쪽만 성공한 상태도 정상적인 실패 경로로 설계하는 것입니다.

### 내구성이 높다는 것과 복구 가능하다는 것은 다르다

저장소 서비스가 내부적으로 데이터를 복제한다고 해서 사용자의 실수로 삭제한 객체나 잘못 덮어쓴 데이터를 원하는 시점으로 되돌릴 수 있다는 뜻은 아닙니다. 버전 관리, 백업, 보존 정책과 복구는 별도의 설계입니다.

저장소를 선택할 때는 서비스 이름보다 **어떤 단위로 읽고 쓰는지, 여러 실행 인스턴스가 공유해야 하는지, 데이터가 실행 환경과 독립적으로 얼마나 오래 살아야 하는지**를 먼저 봅니다.
