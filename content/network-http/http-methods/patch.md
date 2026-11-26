---
kind: concept
contentKey: network-http.core.http-methods.patch
topicContentKey: network-http.core.http-methods
slug: patch
title: "PATCH와 부분 변경"
summary: "PATCH가 변경 문서(patch document)의 지시에 따라 대상 자원을 부분 변경하고, 메서드 자체는 멱등하지 않다는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc5789"
    title: "PATCH Method for HTTP"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "PATCH의 부분 변경 의미, 변경 문서 전체의 원자적 적용, 반복 실행 안전성의 경계를 확인한다."
    displayOrder: 1
---
# PATCH와 부분 변경

PATCH는 대상 자원의 현재 상태에 변경 문서의 지시를 적용하도록 요청합니다. 변경 형식이 필드 교체·삭제·배열 처리 및 null의 의미를 정의합니다. 예를 들어 JSON Patch와 JSON Merge Patch의 계약은 서로 다릅니다.

### 원자성

RFC 5789는 하나의 PATCH에 포함된 변경 집합 전체를 원자적으로 적용하도록 요구합니다. 중간의 부분 적용 상태를 노출하거나 실패한 변경 집합의 일부를 남겨서는 안 됩니다. 외부 시스템까지 자동으로 하나의 DB 트랜잭션으로 처리한다는 뜻은 아닙니다.

| 변경 | 반복 효과 |
| --- | --- |
| 이름을 Mina로 교체 | 동일 상태 유지 가능 |
| 카운터 1 증가 | 증가 누적 |
| 배열 끝에 요소 추가 | 중복 추가 가능 |

PATCH는 메서드 자체가 멱등하다고 정의되지 않습니다. 개별 변경 연산은 멱등하게 설계할 수 있습니다.

### 동시 수정

클라이언트가 강한 ETag "v7"을 읽었다면 If-Match: "v7"으로 전제조건을 지정할 수 있습니다. 현재 표현이 "v8"이라면 일반적으로 412를 반환하며 변경하지 않습니다. 검사와 변경은 원자적으로 처리해야 합니다. 재시도에서 412가 반환됐다는 사실만으로 최초 요청의 성공 여부는 확정할 수 없습니다.
