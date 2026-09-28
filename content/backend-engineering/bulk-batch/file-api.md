---
kind: concept
contentKey: backend.core.bulk-batch.file-api
topicContentKey: backend.core.bulk-batch
slug: file-api
title: "파일 업로드와 처리 경계"
summary: "파일 업로드를 단순 요청 필드가 아니라 크기·임시 저장·형식·접근 권한·처리 시간이라는 별도 자원 경계로 보고 업로드 완료와 업무 처리 완료를 구분한다."
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

파일 업로드는 문자열 필드 하나를 더 받는 문제와 다릅니다. 요청 하나가 큰 본문을 오래 전송하고, 서버는 임시 저장 공간과 파서의 CPU·메모리를 사용하며, 후처리가 길다면 HTTP 작업 스레드까지 오래 점유할 수 있습니다. 그래서 **전송을 받는 단계와 파일 내용을 업무 데이터로 적용하는 단계를 분리해서 생각**하는 편이 좋습니다.

```text
클라이언트
  │ multipart/form-data
  ▼
HTTP 업로드 경계
  │ 크기 / 필수 part / media type / 접근 권한 확인
  ▼
임시 저장소
  │ 서버가 저장 위치와 식별자를 소유
  ▼
파싱 / 검증
  │
  ├─ 오류 → 적용하지 않고 오류 보고 + 임시 자원 정리
  └─ 성공 → 도메인·canonical 데이터에 적용
```

업로드 요청이 성공했다는 것은 파일 바이트를 서버가 받았다는 뜻이지, 내부 데이터가 유효하거나 업무 반영이 끝났다는 뜻은 아닙니다.

### 파일 크기 제한은 자원 보호 계약이다

제한 없는 multipart 업로드를 허용하면 요청 몇 개만으로도 메모리나 임시 디스크를 고갈시킬 수 있습니다. 서버와 reverse proxy의 최대 본문 크기, 임시 저장 공간, 동시에 처리할 수 있는 업로드 수를 함께 고려해야 합니다.

큰 파일을 메모리 byte array 하나로 항상 올리는 대신 streaming 또는 임시 파일 저장을 사용할 수 있지만, 어떤 방식이 실제로 사용되는지는 프레임워크와 서버 설정을 확인해야 합니다.

### 파일 이름을 서버 경로로 신뢰하지 않는다

사용자가 보낸 `filename`은 표시용 메타데이터로 취급하고 저장 위치와 실제 저장 이름은 서버가 결정하는 편이 안전합니다.

```java
Path temp = Files.createTempFile("catalog-", ".upload");
```

원본 이름을 그대로 경로와 결합하면 `../` 같은 path traversal, 운영체제 예약 이름, 충돌 문제가 생길 수 있습니다. 사용자는 콘텐츠를 제공하지만 **서버 파일시스템의 이름 공간을 결정해서는 안 됩니다.**

### 업로드 권한과 처리 결과 접근 권한도 별도 경계다

파일 형식이 올바르다고 그 사용자가 해당 대상에 업로드할 권한까지 생기는 것은 아닙니다. 예를 들어 특정 프로젝트의 대량 import 파일이라면 업로드 시점에 그 프로젝트를 수정할 권한을 확인하고, 비동기 처리로 분리했다면 `processingId`로 상태나 결과를 조회할 때도 같은 소유권·권한 경계를 다시 적용해야 합니다.

```text
파일 내용 검증 성공
      ≠
업로드 대상 수정 권한 보유
      ≠
다른 사용자의 처리 결과 조회 권한
```

임시 파일 경로나 처리 식별자가 알려졌다는 사실을 접근 권한으로 사용해서는 안 됩니다. 파일 저장과 처리 API는 **내용 검증과 인가를 서로 다른 책임으로 두되 둘 다 통과해야 업무 적용이 가능하도록** 설계합니다.

### 전송 형식과 실제 내용 형식을 따로 검증한다

`Content-Type: text/csv`라고 적혀 있다고 실제 파일이 올바른 CSV라는 보장은 없습니다. JSON이라면 스키마, CSV라면 header·column 수·encoding, 이미지라면 실제 decode 가능 여부처럼 파서가 사용할 계약을 확인해야 합니다.

검증되지 않은 파일을 canonical data에 바로 적용하기보다 Preview/Validate 단계에서 전체 오류를 확인하고 적용 여부를 분리할 수 있습니다. CSForge content import의 `Preview → Apply` 흐름도 같은 이유를 가집니다.

### 처리가 길면 업로드와 완료 응답을 분리할 수 있다

수초~수분이 걸리는 변환 작업을 하나의 HTTP 요청에서 끝까지 기다리게 할 필요는 없습니다.

```text
POST upload
   ↓
202 + processingId
   ↓
백그라운드 처리
   ↓
GET status / result
```

비동기 처리가 항상 필요한 것은 아닙니다. 파일 크기와 실제 처리 시간을 측정한 뒤 동기 요청의 timeout·작업 스레드 점유가 문제가 될 때 분리합니다.

파일 API의 핵심은 multipart 문법보다 **외부에서 들어오는 큰 입력이 사용할 수 있는 자원, 접근 권한, 실제 업무 적용 시점을 명확한 경계로 제한하는 것**입니다.
