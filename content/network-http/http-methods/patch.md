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

PATCH는 target resource에 partial modification을 적용하도록 한다. operation 문서가 replace, add, remove 같은 구체적인 semantics를 가져야 하며, 어떤 필드가 생략되었는지와 null의 의미를 구분한다.

PATCH는 method 자체가 자동으로 idempotent인 것이 아니다. 같은 patch를 반복해도 state가 같은지, version precondition이나 operation ID로 중복을 막는지 application contract가 결정한다.

### Backend 연결

partial concept metadata update에는 optimistic version과 allowed field 목록을 둔다. retry 가능한 PATCH라면 operation key를 저장해 같은 변경을 두 번 적용하지 않는다.

