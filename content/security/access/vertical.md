---
kind: concept
contentKey: security.core.access.vertical
topicContentKey: security.core.access
slug: vertical
title: "수직 권한 상승"
summary: "일반 사용자가 관리자 기능을 직접 호출할 때 생기는 수직 권한 상승과, 서버에서 기능별 권한을 검사하는 방법을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    title: "OWASP Cheat Sheet: Authorization"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "최소 권한과 권한 검증 원칙 확인"
---
# 수직 권한 상승

수평 권한 상승이 “같은 등급 사용자끼리 남의 리소스 접근”이라면 수직 권한 상승은 **낮은 권한 사용자가 더 높은 역할의 기능을 수행**하는 문제입니다.

```text
일반 사용자(USER)
   │ POST /admin/products/17/delete
   ▼
컨트롤러
   │ 관리자 인가 누락
   ▼
상품 삭제됨
```

프론트엔드에서 관리자 메뉴를 숨겨도 공격자는 엔드포인트 URL을 직접 호출할 수 있습니다. 화면 표시 여부는 인가 경계가 아닙니다.

### route-level rule로 큰 경계를 막는다

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
);
```

이런 포괄적인 규칙은 관리자 경로 전체의 기본 경계를 만들기 좋습니다.

### 중요한 유스케이스는 메서드에서도 보호할 수 있다

```java
@PreAuthorize("hasRole('ADMIN')")
public void publishCanonicalContent(...) { ... }
```

컨트롤러 외의 호출자가 서비스를 사용할 수 있거나 유스케이스 자체가 높은 권한을 요구한다면 메서드 보안을 추가할 수 있습니다. 다만 모든 계층에 애너테이션을 중복해 정책의 위치를 불분명하게 만들지 않습니다.

### 역할 hierarchy를 과도하게 단순화하지 않는다

관리자가 모든 데이터에 접근할 수 있어야 하는지, 고객 지원 담당자는 환불 없이 조회만 할 수 있어야 하는지처럼 권한을 기능 단위로 나눌 필요가 있습니다.

```text
ROLE_SUPPORT
  ├─ ORDER_READ
  └─ MEMBER_READ

ROLE_ADMIN
  ├─ ORDER_READ
  ├─ MEMBER_READ
  └─ CATALOG_WRITE
```

수직 권한 상승 방어의 핵심은 역할 이름이 아닙니다. **서버가 고권한 작업에 명시적 권한을 요구하고, 허용 규칙이 없으면 거부하는가**입니다.
