---
kind: concept
contentKey: security.core.abuse.file-path
topicContentKey: security.core.abuse
slug: file-path
title: "File upload와 path traversal 경계"
summary: "사용자 파일명·extension·Content-Type을 신뢰하지 않고 생성된 storage key, size/type validation, web root 분리와 다운로드 authorization을 적용하며 `../` 경로 탈출을 막는 원리를 이해한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: File Upload"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: extension/type/size/storage/name/download authorization 방어 확인
  - url: "https://owasp.org/www-community/attacks/Path_Traversal"
    title: "OWASP: Path Traversal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: ../ 경로 조작과 base directory escape 위험 확인
---
# File upload와 path traversal 경계

사용자가 `../../config/application.yml`이라는 파일명을 upload하면 서버가 그대로 저장 경로에 붙이는 순간 단순 파일 기능이 filesystem write primitive로 바뀔 수 있습니다.

```java
Path target = uploadRoot.resolve(originalFilename); // 위험할 수 있음
```

```text
uploadRoot = /app/uploads
filename   = ../../config/secret.yml

resolve 결과가 base 밖으로 탈출할 수 있음
```

### 저장 이름과 사용자 표시 이름을 분리한다

```text
originalName: "resume.pdf"   ← 화면 표시 metadata
storageKey  : UUID/random     ← 실제 저장 key
```

실제 filesystem/object storage 경로는 서버가 생성하고 사용자가 준 이름은 metadata로 취급합니다.

### Content-Type header만 신뢰하지 않는다

공격자는 `Content-Type: image/png`을 직접 보낼 수 있습니다. 확장자 allowlist, 실제 file signature/type 검사, size limit, 필요한 경우 malware scanning을 조합합니다. 이미지 처리 library 자체의 취약점도 attack surface가 될 수 있습니다.

### web root 밖에 저장한다

Upload한 HTML/SVG/script가 web server에서 같은 origin executable content로 직접 제공되면 stored XSS 등으로 이어질 수 있습니다. 별도 object storage/domain, download handler, `Content-Disposition` 정책을 검토합니다.

### download에도 authorization이 필요하다

Storage key가 random이어도 다른 사용자의 private file을 알게 되면 다운로드할 수 있는 구조라면 BOLA가 남습니다.

```text
GET /files/{id}
   │
   ├─ file 존재?
   └─ current principal canRead(file)?
```

### path normalization만으로 끝내지 않는다

`normalize()`한 최종 path가 허용한 base directory 아래인지 확인하고 symlink 같은 filesystem 특성도 threat model에 따라 고려합니다. 가장 안전한 방식은 애초에 user input을 path component로 사용하지 않는 것입니다.

File security는 확장자 필터 하나가 아니라 **upload input, storage path, content interpretation, download permission의 네 경계를 모두 보호하는 문제**입니다.
