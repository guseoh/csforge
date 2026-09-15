---
kind: concept
contentKey: infrastructure.core.reliability.storage-models
topicContentKey: infrastructure.core.reliability
slug: storage-models
title: "Object·Block·File Storage 선택"
summary: "object·block·file storage의 접근 방식과 공유 모델을 구분하고 workload의 I/O 형태·지연 시간·durability 요구에 맞춰 선택한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/storage-services.html"
    title: "AWS Whitepaper: Storage Services Overview"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "object·block·file storage capability 비교 참고"
  - url: "https://csrc.nist.gov/pubs/sp/800/145/final"
    title: "NIST SP 800-145: Cloud Computing Definition"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "network storage와 on-demand resource context 확인"
---
# Object·Block·File Storage 선택

"파일을 저장한다"는 요구만으로 storage를 고를 수는 없습니다. Database처럼 작은 block을 자주 수정하는 workload인지, 큰 artifact를 key로 저장하는지, 여러 machine이 같은 directory namespace를 공유해야 하는지에 따라 필요한 모델이 달라집니다.

| 모델 | 접근 방식 | 대표적인 사용 |
| --- | --- | --- |
| object | object key + metadata | 업로드 파일, media, backup artifact |
| block | machine에 block device로 제공 | database volume, filesystem 기반 workload |
| file | directory/file namespace 공유 | 여러 host가 함께 쓰는 shared file tree |

### Storage 모델은 application이 보는 인터페이스가 다르다

Object storage는 보통 파일시스템 block을 임의 위치에서 수정하는 방식보다 object 전체를 key로 읽고 쓰는 모델에 가깝습니다. Block storage는 OS가 block device로 다루며 그 위에 filesystem이나 database storage engine을 둘 수 있습니다. File storage는 여러 client가 directory와 file namespace를 공유하는 데 유리합니다.

그래서 PostgreSQL data directory를 object storage의 object처럼 단순 치환하거나, 대용량 binary를 항상 DB row 안에 저장하는 식으로 서로 다른 접근 모델을 섞으면 성능과 운영 특성이 달라질 수 있습니다.

### Metadata와 binary body를 분리할 수도 있다

사용자가 올린 파일이라면 ownership, status, content type 같은 metadata는 PostgreSQL에서 관리하고 실제 큰 body는 object storage에 둘 수 있습니다.

```text
PostgreSQL
- file_id
- owner_id
- status
- object_key

Object Storage
- actual binary body
```

이 구조에서는 두 저장소의 lifecycle과 삭제 정책을 함께 관리해야 하지만 각 저장소가 잘하는 역할을 나눌 수 있습니다.

### Durable하다는 것과 복구 가능하다는 것은 다르다

Storage 서비스가 내부적으로 데이터를 복제한다고 해서 사용자의 실수로 삭제한 object나 잘못 덮어쓴 data를 원하는 시점으로 되돌릴 수 있다는 뜻은 아닙니다. Versioning, backup, retention과 restore는 별도의 복구 설계입니다.

Storage를 선택할 때는 서비스 이름보다 **어떤 단위로 읽고 쓰는지, 여러 실행 instance가 공유해야 하는지, 데이터가 실행 환경과 독립적으로 얼마나 오래 살아야 하는지**를 먼저 봅니다.
