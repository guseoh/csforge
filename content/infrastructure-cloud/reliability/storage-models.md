---
kind: concept
contentKey: infrastructure.core.reliability.storage-models
topicContentKey: infrastructure.core.reliability
slug: storage-models
title: "object·block·file storage"
summary: "access pattern·latency·durability·sharing 요구에 따라 storage model을 선택한다"
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
# object·block·file storage

“파일을 저장한다”는 요구도 access pattern과 consistency, latency, sharing 방식에 따라 storage 선택이 달라집니다.

| 모델 | 접근 의미 | 적합한 예 |
| --- | --- | --- |
| object | key와 metadata를 가진 큰 immutable-ish object | upload, backup, media |
| block | machine이 block device처럼 mount/read/write | DB data volume |
| file | directory·file 공유 namespace | shared document/file tree |

### application state와 artifact를 분리한다

PostgreSQL data directory를 object storage처럼 다루거나, 사용자가 올린 큰 파일을 DB row에 무조건 넣으면 latency·backup·transaction 비용이 커질 수 있습니다. 반대로 metadata와 ownership은 DB에 두고 binary body는 object storage에 두는 혼합 설계를 사용할 수 있습니다.

### durability와 availability는 같은 말이 아니다

storage가 여러 replica를 가져도 잘못 삭제한 데이터는 복구되지 않을 수 있습니다. versioning, backup, lifecycle, access policy와 restore test를 별도로 둡니다.

### 문제를 풀 때 확인할 것

1. random block I/O인지 large object transfer인지 봅니다.
2. shared namespace와 single-writer 요구를 확인합니다.
3. metadata·ownership·body의 source를 분리합니다.
4. durability, latency, consistency와 비용을 비교합니다.
5. 삭제·복구·retention 정책을 테스트합니다.

### 면접에서 설명한다면

Block은 DB처럼 block I/O가 필요한 workload, file은 directory namespace 공유, object는 key 기반 대용량 artifact에 자연스럽습니다. storage 선택은 종류 이름보다 access pattern·latency·durability·sharing 요구로 결정하며 metadata와 binary body를 다른 저장소에 둘 수도 있습니다.

