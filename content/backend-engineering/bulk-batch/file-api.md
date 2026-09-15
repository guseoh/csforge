---
kind: concept
contentKey: backend.core.bulk-batch.file-api
topicContentKey: backend.core.bulk-batch
slug: file-api
title: "파일 업로드와 처리 경계"
summary: "파일 업로드를 단순 요청 필드가 아니라 크기·임시 저장·형식 검증·처리 시간이라는 별도 자원 경계로 보고 업로드 완료와 업무 처리 완료를 구분한다."
level: 3
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

파일 업로드는 문자열 field 하나를 더 받는 문제와 다릅니다. 요청 하나가 큰 body를 오래 전송하고, 서버는 임시 저장 공간과 parser CPU·메모리를 사용하며, 후처리가 길다면 HTTP worker까지 오래 점유할 수 있습니다. 그래서 **전송을 받는 단계와 파일 내용을 업무 데이터로 적용하는 단계를 분리해서 생각**하는 편이 좋습니다.

```text
Client
  │ multipart/form-data
  ▼
HTTP upload boundary
  │ 크기 / 필수 part / media type 확인
  ▼
Temporary storage
  │
  ▼
Parse / Validate
  │
  ├─ 오류 → 적용하지 않고 오류 보고 + 임시 자원 정리
  └─ 성공 → domain/canonical apply
```

업로드 요청이 성공했다는 것은 파일 bytes를 서버가 받았다는 뜻이지, 내부 데이터가 유효하거나 업무 반영이 끝났다는 뜻은 아닙니다.

### 파일 크기 제한은 자원 보호 계약이다

제한 없는 multipart upload를 허용하면 요청 몇 개만으로도 memory나 임시 disk를 고갈시킬 수 있습니다. 서버와 reverse proxy의 최대 body 크기, 임시 저장 공간, 동시에 처리할 수 있는 업로드 수를 함께 고려해야 합니다.

큰 파일을 메모리 byte array 하나로 항상 올리는 대신 streaming 또는 임시 파일 저장을 사용할 수 있지만, 어떤 방식이 실제로 사용되는지는 framework/server 설정을 확인해야 합니다.

### 파일 이름을 서버 경로로 신뢰하지 않는다

사용자가 보낸 `filename`은 표시용 metadata로 취급하고 저장 위치와 실제 저장 이름은 서버가 결정하는 편이 안전합니다.

```java
Path temp = Files.createTempFile("catalog-", ".upload");
```

원본 이름을 그대로 경로와 결합하면 `../` 같은 path traversal, 운영체제 예약 이름, 충돌 문제가 생길 수 있습니다. 사용자는 콘텐츠를 제공하지만 **서버 filesystem namespace를 결정해서는 안 됩니다.**

### 전송 형식과 실제 내용 형식을 따로 검증한다

`Content-Type: text/csv`라고 적혀 있다고 실제 파일이 올바른 CSV라는 보장은 없습니다. JSON이라면 schema, CSV라면 header·column 수·encoding, 이미지라면 실제 decode 가능 여부처럼 parser가 사용할 계약을 확인해야 합니다.

검증되지 않은 파일을 canonical data에 바로 적용하기보다 Preview/Validate 단계에서 전체 오류를 확인하고 적용 여부를 분리할 수 있습니다. CSForge content import의 `Preview → Apply` 흐름도 같은 이유를 가집니다.

### 처리가 길면 업로드와 완료 응답을 분리할 수 있다

수초~수분이 걸리는 변환 작업을 하나의 HTTP request에서 끝까지 기다리게 할 필요는 없습니다.

```text
POST upload
   ↓
202 + processingId
   ↓
background processing
   ↓
GET status / result
```

비동기 처리가 항상 필요한 것은 아닙니다. 파일 크기와 실제 처리 시간을 측정한 뒤 동기 요청의 timeout·worker 점유가 문제가 될 때 분리합니다.

파일 API의 핵심은 multipart 문법보다 **외부에서 들어오는 큰 입력이 사용할 수 있는 자원과 적용 시점을 명확한 경계로 제한하는 것**입니다.
