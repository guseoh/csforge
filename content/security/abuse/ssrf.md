---
kind: concept
contentKey: security.core.abuse.ssrf
topicContentKey: security.core.abuse
slug: ssrf
title: "서버 측 요청 위조(SSRF)와 외부 요청의 신뢰 경계"
summary: "사용자가 제공한 URL을 서버가 대신 요청할 때 내부망이나 메타데이터 서비스로 연결될 수 있는 SSRF 흐름과 URL·DNS·리다이렉트·실제 연결 목적지의 검증을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: SSRF Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "허용 목록·IP 및 도메인 검증·네트워크 계층 제한 확인"
---
# 서버 측 요청 위조(SSRF)와 외부 요청의 신뢰 경계

이미지 미리보기 API가 사용자가 보낸 URL을 서버가 다운로드한다고 해 봅시다.

```http
POST /preview
{
  "url": "http://example.com/image.png"
}
```

공격자가 URL을 `http://127.0.0.1:8080/admin`이나 클라우드 메타데이터 엔드포인트로 바꾸면 **외부 사용자가 직접 갈 수 없는 네트워크 위치를 서버 권한으로 요청**하게 만들 수 있습니다.

```text
공격자
   │ URL=http://internal-service/admin
   ▼
공개 백엔드
   │ 외부로 나가는 요청
   ▼
내부망 / 메타데이터 서비스 / localhost
```

### 문자열 접두부 검사만으로는 부족하다

`url.startsWith("https://trusted.example")` 같은 검사는 URL 파서가 해석하는 사용자 정보 구간이나 하위 도메인을 놓칠 수 있습니다. URL을 파싱한 뒤 스킴·정규화한 호스트·포트를 허용 목록과 비교합니다.

### DNS 조회와 리다이렉트도 검증한다

처음에는 공인 IP를 반환한 도메인이 나중에 사설 IP를 반환하는 DNS 재바인딩이나, 허용된 URL이 내부 주소로 리다이렉트되는 경우도 고려해야 합니다. A·AAAA 조회 결과를 검사한 뒤 실제 연결이 다른 주소로 바뀌지 않도록 검증된 주소에 연결을 묶어야 합니다. 리다이렉트는 기본적으로 끄거나, 각 이동 단계의 URL과 DNS 조회 결과를 다시 검증합니다.

### 서버의 외부 연결도 제한한다

애플리케이션의 URL 검증만으로 모든 우회 사례를 막기는 어렵습니다. 백엔드 서버가 메타데이터 서비스나 내부 관리자망에 불필요하게 연결하지 못하도록 네트워크 송신 정책도 제한합니다.

### 서버가 URL을 가져오는 기능이 필요한지 먼저 따진다

사용자가 파일을 직접 업로드해도 되는 상황에서 임의 URL을 서버가 가져오는 기능을 추가하면 외부 요청의 공격 표면이 커집니다. 기능이 꼭 필요할 때만 열고 연결 가능한 목적지를 좁힙니다.

SSRF는 공격자가 **서버의 네트워크 위치와 자격 증명을 이용해 원래 접근할 수 없는 목적지에 요청**하게 만드는 문제입니다. 따라서 문자열뿐 아니라 실제 연결 목적지까지 확인해야 합니다.
