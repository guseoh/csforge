# Issue #222 R2 · Security Reference 교정 — 검토 기록

기준 main: `2862a92d9208153678f3b618df90fafe37cb2e09` / 대상 `security.core.auth-architecture.user-details`.

## 기존 감사와 원문 확인

- Wave 2 [Reference 후속](../../content-audit/learning-experience-2026/wave-2/visualization-reference-followups.md)에서 지적: 제목이 `UserDetailsService`인데 URL은 `.../user-details.html`.
- 이전 URL의 공식 Spring Security 페이지 제목은 **UserDetails**. credential management, credentials erasure 등의 모델 정보에 중점을 둔다. 해당 Concept의 **UserDetailsService 조회 책임**과 직접 일치하지 않는다.
- 실제 해당 공식 문서는 `https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html`. UserDetailsService가 DaoAuthenticationProvider용 계정 데이터 조회를 수행한다고 명시한다.
- 기존 다른 Reference인 Password Storage 문서를 보존한다. 관계 note에 **조회와 검증의 책임 경계**를 정확히 명시한다.

## 변경 범위 및 금지

- `content/security/auth-architecture/user-details.md`의 URL 1개/그 관계의 relationNote만 교정. `title: Spring Security Reference: UserDetailsService` 그대로 유지.
- Concept 본문·identity·Question·기타 Reference 무변경. 새 URL이 기존 다른 Concept에서도 사용되는지 전역 Reference metadata와 함께 검사.
- 외부 자료 전체를 다시 검수했다고 주장하지 않는다. 미검증 링크를 자동으로 오류 처리하지 않는다.

## 병합 전 게이트

15Area 전체 metadata와 relation 중복 검증 → 격리 PostgreSQL Preview/Apply/exact reimport → 이력 및 identity 보존 → 비운영 Reader 실제 표시·링크 QA. **Draft / 미병합 / Production DB Import 및 배포 금지.**
