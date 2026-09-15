---
kind: concept
contentKey: network-http.core.http-methods.patch
topicContentKey: network-http.core.http-methods
slug: patch
title: "PATCH와 Partial Modification"
summary: "PATCH가 patch document의 지시에 따라 target resource를 부분 변경하고, method 자체는 idempotent하지 않다는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc5789"
    title: "PATCH Method for HTTP"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "PATCH partial update와 반복 안전성 조건을 확인한다."
    displayOrder: 1
---
# PATCH와 Partial Modification

PATCH는 target resource 전체를 새로운 representation으로 대체하는 대신, request에 담긴 **patch document의 지시를 현재 resource에 적용해 수정해 달라**고 요청하는 method다. 어떤 field를 replace·add·remove할지와 null, array 같은 값의 의미는 사용하는 patch document format이 정의한다.

PUT과 비교하면 차이가 더 선명하다. PUT content는 target resource의 원하는 상태를 표현하는 반면, PATCH content는 현재 상태에 적용할 변경 instructions를 표현한다.

### 하나의 PATCH document는 원자적으로 적용해야 한다

RFC 5789는 server가 patch document에 포함된 변경 집합 전체를 원자적으로 적용하도록 요구한다. 적용 중간의 일부 변경 상태를 다른 request에 노출해서는 안 되고, 전체 patch를 성공적으로 적용할 수 없다면 일부만 남겨서는 안 된다.

이 atomicity는 해당 PATCH operation의 resource 변경에 관한 HTTP extension contract다. 외부 service나 여러 독립 storage를 자동으로 하나의 distributed transaction으로 묶는다는 뜻은 아니다.

### PATCH 자체는 idempotent method가 아니다

`name을 X로 replace`처럼 반복해도 같은 결과가 되는 patch document를 만들 수 있지만, `counter를 1 증가`나 `배열에 항목 추가` 같은 operation은 반복할수록 effect가 누적될 수 있다. 그래서 PATCH method 자체는 safe하거나 idempotent하다고 정의되지 않는다.

현재 resource version을 기준으로 patch를 적용해야 한다면 ETag와 `If-Match` 같은 precondition을 함께 사용해 stale state에 잘못된 patch가 적용되는 것을 막을 수 있다. 즉 PATCH의 반복 안전성은 **patch format과 operation semantics, 현재 resource 상태에 대한 조건**을 함께 봐야 한다.
