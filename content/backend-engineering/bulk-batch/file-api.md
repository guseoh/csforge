---
kind: concept
contentKey: backend.core.bulk-batch.file-api
topicContentKey: backend.core.bulk-batch
slug: file-api
title: "파일 업로드와 처리 경계"
summary: "파일을 HTTP 요청의 부가 데이터가 아니라 크기·형식·저장 위치·처리 시간이라는 별도 실패 경계를 가진 입력으로 다룬다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc7578"
    title: "RFC 7578 - multipart/form-data"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "multipart/form-data 전송 형식을 확인한다."
---
# 파일 업로드와 처리 경계

파일 업로드는 문자열 필드 하나를 더 받는 문제처럼 보이지만, 실제 서버에서는 메모리·디스크·네트워크·처리 시간이 동시에 걸린다. 작은 JSON 요청과 같은 방식으로 다루면 요청 하나가 큰 파일을 들고 worker를 오래 점유하거나, 검증 전에 임시 파일을 과도하게 만들거나, 파일 이름을 그대로 경로에 사용해 보안 문제까지 만들 수 있다.

### 업로드와 처리는 같은 일이 아니다

HTTP multipart 요청을 받는 단계와 파일 내용을 업무 데이터로 해석하는 단계는 분리하는 편이 안전하다.

```text
Client
  │ multipart/form-data
  ▼
HTTP boundary
  │ 크기 / content-type / 필수 part 확인
  ▼
Temporary storage
  │
  ▼
Parse / Validate
  │
  ├─ 실패 → 오류 보고 + 임시 자원 정리
  └─ 성공 → canonical storage / domain 처리
```

업로드가 성공했다는 것은 네트워크 전송이 끝났다는 뜻일 뿐, 파일 내용이 유효하다는 뜻은 아니다. CSV라면 헤더와 열 수, JSON이라면 schema, 이미지라면 실제 포맷과 크기 등을 별도로 검증해야 한다.

### 파일 이름은 식별자이지 경로가 아니다

사용자가 보낸 `filename`을 서버 경로로 그대로 이어 붙이면 `../` 같은 경로 조작이나 운영체제별 예약 문자가 문제가 된다. 저장 이름은 서버가 생성하고 원래 파일 이름은 표시용 metadata로만 취급하는 편이 안전하다.

```java
Path temp = Files.createTempFile("catalog-", ".upload");
```

중요한 것은 API 이름이 아니라 **누가 저장 위치를 결정하는가**다. 사용자는 콘텐츠를 제공하지만 서버의 파일시스템 경계를 결정해서는 안 된다.

### 실무에서 확인할 것

| 항목             | 확인 이유                         |
| ---------------- | --------------------------------- |
| 최대 업로드 크기 | 메모리·디스크 고갈 방지           |
| 임시 저장 위치   | 장애 시 정리와 용량 관리          |
| 허용 포맷        | parser 공격면과 처리 계약 축소    |
| 파일명 처리      | path traversal 방지               |
| 처리 시간        | 동기 요청으로 끝낼 수 있는지 판단 |

파일이 크거나 후처리가 길다면 업로드 완료와 실제 처리 완료를 같은 HTTP 요청에서 기다리게 할 필요가 없다. 이 경우에는 업로드 결과를 식별자로 반환하고 이후 상태를 조회하거나 비동기 처리하는 구조를 검토한다.
