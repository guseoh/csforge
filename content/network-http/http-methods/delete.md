---
kind: concept
contentKey: network-http.core.http-methods.delete
topicContentKey: network-http.core.http-methods
slug: delete
title: "DELETE와 삭제 의미"
summary: "DELETE가 대상 URI와 현재 기능 사이의 연결을 제거하도록 요청하는 멱등 의미와 물리 데이터 삭제의 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# DELETE와 삭제 의미

DELETE는 대상 URI와 원본 서버에서 현재 제공하는 기능 사이의 연결을 제거하도록 요청합니다. HTTP가 DB 행이나 파일의 물리적 삭제를 강제하지는 않습니다.

서버는 자원의 계약에 따라 물리 삭제, 소프트 삭제, 보관 또는 tombstone을 사용할 수 있습니다. 실제 삭제가 완료됐다면 204 또는 결과 표현을 포함한 200, 처리를 접수했지만 완료되지 않았다면 202가 적절할 수 있습니다.

### 멱등성

첫 DELETE에서 204가 반환되고 반복 DELETE에서는 404가 반환될 수 있습니다. 응답이 달라도 URI의 현재 기능을 제거하려는 의도된 효과가 누적되지 않으면 멱등 의미와 모순되지 않습니다.

멱등한 삭제 메서드라도 알림, 이벤트 발행, 외부 저장소 정리 같은 추가 효과의 중복 제어는 별도로 설계해야 합니다. 비동기 삭제가 접수된 경우 클라이언트는 최종 상태를 별도 작업 조회 계약으로 확인할 수 있습니다.
