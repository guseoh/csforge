---
kind: concept
contentKey: network-http.core.http-methods.post
topicContentKey: network-http.core.http-methods
slug: post
title: "POST와 서버 측 처리"
summary: "POST가 요청 콘텐츠를 대상 자원이 정의한 고유한 의미에 따라 처리하도록 요청하는 메서드이며, 메서드 자체는 멱등하지 않다는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# POST와 서버 측 처리

POST는 대상 리소스가 정의한 방식으로 요청 콘텐츠를 처리하도록 요청합니다. 리소스 생성뿐 아니라 폼 제출, 명령 실행, 데이터 처리 및 비동기 작업 접수에도 사용할 수 있습니다.

| 요청 | 가능한 결과 |
| --- | --- |
| POST /orders | 201과 생성된 주문 Location |
| POST /search | 200과 검색 결과 |
| POST /reports | 202와 작업 상태 정보 |

### 반복 요청의 효과

POST는 HTTP 메서드 자체가 멱등하다고 정의되지 않습니다. 결제 요청의 응답이 유실되었을 때 새 요청을 보내면 중복 청구될 수 있습니다.

서비스는 인증 주체·연산 범위·요청 지문에 안정적인 멱등성 키를 묶어 저장하고 동시 요청을 원자적으로 제어할 수 있습니다. 외부 결제 효과는 제공자의 멱등성 계약과 결과 대사도 필요합니다. 이런 업무 보장은 POST 자체의 표준 의미를 변경하지 않습니다.

PUT은 클라이언트가 특정 대상 URI의 원하는 상태를 지정하는 반면 POST는 대상이 요청 콘텐츠를 어떻게 처리할지 맡긴다는 차이가 있습니다.
