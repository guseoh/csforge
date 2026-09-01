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

PATCH는 target resource 전체를 새 representation으로 바꾸는 대신, request content에 담긴 patch document의 semantics에 따라 partial modification을 적용하도록 한다. `replace`, `add`, `remove`의 의미와 path, 생략된 field·null·배열 동작을 format별로 정의해야 하며, patch는 resource에 부분적으로 적용된 뒤 중간 상태를 외부에 노출하지 않도록 원자적으로 처리하는 것이 중요하다.

PATCH method 자체는 자동으로 idempotent가 아니다. 절대값을 `replace`하는 patch는 반복해도 같은 상태가 될 수 있지만, `increment`나 append operation은 반복할 때 effect가 누적된다. version precondition, ETag·`If-Match` 또는 operation ID/deduplication으로 stale update와 retry 중복을 제어하는지는 application contract가 결정한다.

CSForge의 partial concept metadata update에는 allowed field 목록과 optimistic version을 둔다. retry 가능한 PATCH는 operation key와 payload fingerprint를 저장해 같은 변경을 두 번 적용하지 않으며, validation 실패·version conflict와 성공 response를 구분한다.

