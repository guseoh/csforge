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

PATCH는 대상 자원 전체를 새로운 표현으로 대체하는 대신, 요청에 담긴 **변경 문서(patch document)의 지시를 현재 자원에 적용해 수정해 달라**고 요청하는 메서드다. 어떤 필드를 교체·추가·삭제할지와 `null`, 배열 같은 값의 의미는 사용하는 변경 문서 형식이 정의한다.

PUT과 비교하면 차이가 더 선명하다.

```text
PUT
→ 대상 자원이 어떤 상태가 되어야 하는지 표현

PATCH
→ 현재 상태에 어떤 변경을 적용할지 표현
```

### 하나의 변경 문서는 원자적으로 적용해야 한다

RFC 5789는 서버가 하나의 PATCH 요청에 담긴 변경 집합 전체를 원자적으로 적용하도록 요구한다. 적용 중간의 일부 변경 상태를 다른 요청에 노출해서는 안 되고, 전체 변경을 성공적으로 적용할 수 없다면 일부만 남겨서는 안 된다.

이 원자성(atomicity)은 **해당 대상 자원에 하나의 PATCH 문서를 적용하는 HTTP 계약**이다. 외부 결제 서비스나 여러 독립 데이터 저장소를 자동으로 하나의 분산 트랜잭션으로 묶는다는 뜻은 아니다.

### PATCH 자체는 멱등 메서드가 아니다

| 변경 문서의 의도 | 같은 문서를 반복 적용했을 때 | 멱등성이 달라지는 이유 |
| --- | --- | --- |
| 이름을 Mina로 교체 | 이미 Mina이면 같은 값을 유지 | 원하는 상태를 지정하므로 멱등적으로 설계 가능 |
| 카운터를 1 증가 | 요청마다 값이 더 커짐 | 현재 값에 누적 연산을 적용 |
| 목록 끝에 항목 추가 | 같은 항목이 중복될 수 있음 | 적용 횟수만큼 상태가 바뀔 수 있음 |

`이름을 X로 교체`처럼 반복해도 같은 결과가 되는 변경 문서를 만들 수 있지만, `카운터를 1 증가`나 `배열 끝에 항목 추가` 같은 연산은 반복할수록 효과가 누적될 수 있다. 그래서 PATCH 메서드 자체는 안전하거나(safe) 멱등하다고 정의되지 않는다.

### 오래된 상태를 기준으로 변경하지 않게 전제조건을 사용할 수 있다

현재 자원 버전을 기준으로 변경을 적용해야 한다면 ETag와 `If-Match` 같은 전제조건(precondition)을 함께 사용해 오래된 기준 상태에 PATCH가 잘못 적용되는 것을 막을 수 있다.

```text
클라이언트가 읽은 ETag: "v7"
      ↓
PATCH + If-Match: "v7"
      ↓
현재 서버 ETag도 "v7"
→ 변경 적용 가능

현재 서버 ETag가 "v8"
→ 전제조건 실패, 오래된 상태 기준 변경 방지
```

핵심은 **PATCH의 반복 안전성이 메서드 이름만으로 결정되는 것이 아니라 변경 형식, 적용 연산, 현재 자원 상태에 대한 전제조건을 함께 봐야 한다는 점**이다.
