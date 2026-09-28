---
kind: concept
contentKey: security.core.abuse.file-path
topicContentKey: security.core.abuse
slug: file-path
title: "파일 업로드와 경로 순회(path traversal) 경계"
summary: "사용자가 보낸 파일 이름을 저장 경로로 신뢰하지 않고, 서버가 생성한 저장 키와 파일 형식·크기 검사, 다운로드 인가로 경로 순회와 악성 파일 제공을 막는 방법을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: File Upload"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "확장자·유형·크기·저장 위치·이름·다운로드 인가 방어 확인"
  - url: "https://owasp.org/www-community/attacks/Path_Traversal"
    title: "OWASP: Path Traversal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "`../` 경로 조작으로 기준 디렉터리를 벗어나는 위험 확인"
---
# 파일 업로드와 경로 순회(path traversal) 경계

사용자가 `../../config/application.yml`이라는 파일 이름을 보내고 서버가 이를 저장 경로에 그대로 붙이면, 파일 업로드 기능으로 허용 범위 밖의 파일을 쓸 수 있습니다.

```java
Path target = uploadRoot.resolve(originalFilename); // 위험할 수 있음
```

```text
uploadRoot = /app/uploads
filename   = ../../config/secret.yml

resolve 결과가 기준 디렉터리 밖으로 벗어남할 수 있음
```

### 저장 이름과 사용자 표시 이름을 분리한다

```text
originalName: "resume.pdf"   ← 화면에 표시할 메타데이터
storageKey  : UUID/무작위 값     ← 실제 저장 키
```

실제 파일·객체 저장소 경로는 서버가 생성하고, 사용자가 준 이름은 화면에 표시할 정보로만 취급합니다.

### Content-Type 헤더만 신뢰하지 않는다

공격자는 `Content-Type: image/png` 헤더를 직접 보낼 수 있습니다. 허용 확장자, 실제 파일 형식과 크기를 검사하고 필요하면 악성 코드 검사도 적용합니다. 이미지를 처리하는 라이브러리 자체의 취약점도 공격 표면이 될 수 있습니다.

### 웹에서 직접 접근할 수 없는 곳에 저장한다

업로드한 HTML·SVG·스크립트가 서비스와 같은 출처에서 실행 가능한 콘텐츠로 제공되면 저장형 XSS가 발생할 수 있습니다. 별도 저장소나 도메인에서 제공하고 다운로드 핸들러와 `Content-Disposition` 설정을 검토합니다.

### 다운로드에도 인가가 필요하다

저장 키가 무작위여도 다른 사용자의 비공개 파일 주소를 알게 되면 다운로드할 수 있는 구조라면 BOLA가 남습니다.

```text
GET /files/{id}
   │
   ├─ 파일 존재?
   └─ 현재 인증 주체 canRead(파일)?
```

### 경로 정규화만으로 끝내지 않는다

`normalize()`한 최종 경로가 허용된 기본 디렉터리 아래인지 확인하고, 심볼릭 링크를 통한 우회도 위협 모델에 따라 고려합니다. 가능하면 사용자 입력을 실제 저장 경로의 구성 요소로 사용하지 않습니다.

안전한 파일 처리는 확장자 검사만으로 끝나지 않습니다. **업로드 입력, 저장 경로, 파일 내용의 해석, 다운로드 권한**을 각각 확인해야 합니다.
