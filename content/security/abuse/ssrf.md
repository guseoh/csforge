---
kind: concept
contentKey: security.core.abuse.ssrf
topicContentKey: security.core.abuse
slug: ssrf
title: "SSRF와 서버 outbound trust boundary"
summary: "사용자가 제공한 URL을 서버가 대신 요청할 때 공격자가 localhost·private network·cloud metadata 같은 내부 목적지에 접근시키는 SSRF 흐름과 destination allowlist·redirect·DNS 검증을 이해한다."
level: 3
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: SSRF Prevention"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: allowlist, IP/domain validation, network-layer restriction 방어 확인
---
# SSRF와 서버 outbound trust boundary

이미지 미리보기 API가 사용자가 보낸 URL을 서버가 다운로드한다고 해 봅시다.

```http
POST /preview
{
  "url": "http://example.com/image.png"
}
```

공격자가 URL을 `http://127.0.0.1:8080/admin`이나 cloud metadata endpoint로 바꾸면 **외부 사용자가 직접 갈 수 없는 network 위치를 서버 권한으로 요청**하게 만들 수 있습니다.

```text
Attacker
   │ URL=http://internal-service/admin
   ▼
Public Backend
   │ outbound request
   ▼
Private Network / Metadata / localhost
```

### 문자열 prefix 검사만으로 부족할 수 있다

`url.startsWith("https://trusted.example")` 같은 검사는 URL parser ambiguity, userinfo, subdomain 등을 놓칠 수 있습니다. URL을 정상적으로 parse한 뒤 scheme, normalized host, port를 정책과 비교합니다.

### DNS resolution과 redirect도 경계다

처음에는 public IP를 반환한 domain이 이후 private IP로 resolve되는 DNS rebinding, 허용 URL이 302 redirect로 internal URL을 가리키는 경우도 고려해야 합니다. Redirect를 자동 follow할지, 각 hop destination을 다시 검증할지 결정합니다.

### network egress restriction을 함께 둔다

Application validation만으로 모든 URL parser/network edge case를 완전히 막기 어렵기 때문에 backend network 자체가 metadata/private admin subnet에 불필요하게 접근하지 못하도록 egress policy를 제한하는 defense-in-depth가 강력합니다.

### URL fetch 기능이 정말 필요한지도 먼저 묻는다

사용자가 파일을 직접 upload하게 할 수 있는데 arbitrary URL fetch를 추가하면 outbound attack surface가 커집니다. 제품 가치가 명확한 기능만 열고 가능한 destination 범위를 좁힙니다.

SSRF의 본질은 URL validation 문제가 아니라 **공격자가 서버의 network 위치와 credential을 프록시처럼 이용할 수 있게 되는 trust-boundary 전환**입니다.
