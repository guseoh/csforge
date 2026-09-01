---
kind: concept
contentKey: network-http.core.http-cache.last-modified
topicContentKey: network-http.core.http-cache
slug: last-modified
title: "Last-Modified"
summary: "수정 시각 validator의 정밀도와 clock 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Last-Modified

`Last-Modified`는 selected representation이 마지막으로 변경된 시각을 HTTP-date로 나타낸다. client는 이 값을 `If-Modified-Since`에 복사해 conditional GET/HEAD를 보내고, server가 그 시각 이후 representation을 바꾸지 않았다고 판단하면 body 없이 304를 반환할 수 있다. 파일의 mtime, DB의 `updatedAt`, 배포 시각은 서로 다른 값일 수 있으므로 무엇을 representation의 변경으로 볼지 먼저 정해야 한다.

HTTP-date가 표현하는 정밀도는 보통 초 단위이고, origin clock이 조정되거나 여러 origin의 시계가 다르면 실제 변경 순서를 정확히 반영하지 못할 수 있다. 같은 초 안에 두 번 변경된 representation이 같은 timestamp를 가질 수 있으므로 `Last-Modified`는 ETag보다 약한 validator가 될 수 있다. server가 더 정확한 ETag를 제공하고 요청에 두 validator가 함께 있으면 ETag 조건이 우선되는 규칙도 지켜야 한다.

`Last-Modified`는 response가 언제나 실제 파일의 저장 완료 시각을 증명한다는 header가 아니다. copy·restore·timezone 변환으로 mtime 의미가 달라질 수 있고, clock이 미래의 날짜를 만들 수도 있다. 따라서 cache가 이 값을 이용해 body를 생략하는 것과 애플리케이션이 데이터의 업무상 최신성을 판단하는 것은 분리한다.

### Backend 연결

DB content의 `updatedAt`과 export file mtime을 혼동하지 않고, 둘 중 어떤 값이 HTTP representation의 변경을 나타내는지 endpoint contract에 명시한다. 초 단위 반올림으로 두 update가 같은 시각이 될 수 있는 API에는 ETag를 함께 제공하고, 조건부 304가 permission check나 tenant 선택보다 먼저 실행되지 않도록 resource 조회·권한 검사를 분리하지 않는다.
