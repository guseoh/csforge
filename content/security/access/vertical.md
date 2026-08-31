---
kind: concept
contentKey: security.core.access.vertical
topicContentKey: security.core.access
slug: vertical
title: "Vertical privilege escalation"
summary: "낮은 권한 principal이 관리자·운영자용 action을 직접 호출할 때 서버가 role/authority policy를 빠뜨려 높은 privilege operation을 실행하는 수직 권한 상승을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: least privilege와 permission validation 원칙 확인
---
# Vertical privilege escalation

수평 권한 상승이 “같은 등급 사용자끼리 남의 resource 접근”이라면 수직 권한 상승은 **낮은 privilege 사용자가 더 높은 역할의 기능을 수행**하는 문제입니다.

```text
member USER
   │ POST /admin/products/17/delete
   ▼
Controller
   │ admin authorization 누락
   ▼
Product deleted
```

프론트엔드에서 admin menu를 숨겨도 endpoint URL을 직접 호출하면 됩니다. UI visibility는 authorization boundary가 아닙니다.

### route-level rule로 큰 경계를 막는다

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
);
```

이런 coarse-grained rule은 admin route 전체의 기본 경계를 만들기 좋습니다.

### method-level rule로 중요한 use-case를 다시 보호할 수 있다

```java
@PreAuthorize("hasRole('ADMIN')")
public void publishCanonicalContent(...) { ... }
```

Controller 외의 다른 caller가 service를 호출할 가능성이 있거나 use-case 자체가 privileged operation이라면 method security를 추가할 수 있습니다. 다만 모든 layer에 annotation을 중복해 policy source가 어디인지 알 수 없게 만들지 않습니다.

### role hierarchy를 과도하게 단순화하지 않는다

ADMIN이면 모든 데이터에 무조건 접근할 수 있어야 하는지, SUPPORT는 refund는 못 하고 조회만 해야 하는지처럼 authority를 기능 단위로 나눌 필요가 있을 수 있습니다.

```text
ROLE_SUPPORT
  ├─ ORDER_READ
  └─ MEMBER_READ

ROLE_ADMIN
  ├─ ORDER_READ
  ├─ MEMBER_READ
  └─ CATALOG_WRITE
```

Vertical escalation 방어의 핵심은 role 이름 자체가 아니라 **고권한 operation이 서버에서 명시적 permission을 요구하고 default deny로 보호되는가**입니다.
