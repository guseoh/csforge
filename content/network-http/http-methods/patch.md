---
kind: concept
contentKey: network-http.core.http-methods.patch
topicContentKey: network-http.core.http-methods
slug: patch
title: "PATCH"
summary: "부분 변경 PATCH의 semantics와 반복 안전성 조건을 설명한다."
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
# PATCH

PATCH는 target resource 전체를 새 representation으로 바꾸는 대신, request content에 담긴 patch document의 semantics에 따라 partial modification을 적용하도록 요청한다. `replace`, `add`, `remove`의 의미와 path, 생략된 field·null·배열 동작은 사용하는 patch document format이 정의한다.

RFC 5789에서 server는 **patch document의 전체 변경 집합을 원자적으로 적용해야 하며, 일부만 적용된 중간 상태를 다른 요청에 노출해서는 안 된다.** 전체 patch를 성공적으로 적용할 수 없다면 그 patch document의 변경을 일부만 남겨서는 안 된다. 이 atomicity는 PATCH method의 적용 단위에 대한 protocol contract이고, DB transaction이나 외부 API까지 자동으로 하나의 분산 transaction으로 묶어 준다는 뜻은 아니다.

PATCH method 자체는 safe하거나 idempotent하다고 정의되지 않는다. 절대값 `replace`처럼 동일 patch를 반복해도 같은 effect가 되는 사용 방식은 만들 수 있지만, increment나 append처럼 현재 상태에 누적하는 operation은 재시도 때 effect가 반복될 수 있다. stale base에서 patch가 충돌할 수 있는 경우 strong ETag와 `If-Match` 같은 conditional request를 사용하고, logical operation 자체의 중복 방지는 operation ID/deduplication 같은 application contract로 보완한다.

CSForge의 partial concept metadata update에는 allowed field 목록과 optimistic version을 둔다. retry 가능한 PATCH라면 patch document의 idempotency 특성, version precondition과 operation identity를 함께 정의하고 validation failure·precondition failure·성공 결과를 구분한다.
