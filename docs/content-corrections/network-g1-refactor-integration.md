# Network G1 → refactor 의존성 통합

## 범위와 기준

- 기준: `refactor` `997393f8663c080dee4cf76818d0aa7ec7db855d`
- 이식 출처: PR #298가 병합된 `main` `425872f7c64cbddf214954e102f2e419adab229f`
- 별도 G2 보존 대상: `viz/network-g2` (`1dc5215aaf349df231e686024b0308245f20bd70`)
- 의도: G2에서 53개 도식을 다시 만드는 대신, 기존 G1 실행 의존성만 `refactor`에 가져온다.

## 포함한 변경

1. Curriculum DIAGRAM 53개 Concept에 연결된 Markdown (기존 선언과 정확한 원문을 PR #298 기준으로 유지), 그리고 별도 TEXT pilot `transport-establishment`.
2. Network 전용 renderer/model: `network-area` 49개, `network-core` 4개, TCP handshake editorial, sliding-window.
3. 도식 연결을 위해 필요한 최소 공유 진입점: Reader 렌더 분기, TypeScript Zod 스키마, `StepDiagram`의 TCP delegation, Backend Import allowlist, 공용 positive/negative case 계약.
4. Network 전용 CSS, SSR 단위 테스트, 격리 PostgreSQL Import 통합 테스트, 53개 Reader 브라우저 QA 스크립트와 전용 CI workflow.
5. 기존 `docs/content-corrections/network-pilot/NETWORK-AREA-INVENTORY.md`를 그대로 가져와 대상 매핑 기준으로 사용한다.

## 의도적으로 제외

- `main`의 다른 Java/Heap preview, 스킬 시안, 문서, 워크플로, 기타 학습 영역의 내용.
- 도식 기능 이식과 무관한 Network Question 수정과 전체 본문 품질 재작성.
- G2의 #517 크기 개선, #513 후속 개선, G2 전수 감사 변경, 운영 동기화·배포.
- `main` 전체 merge 및 `refactor` history 대체.

## 완료 조건과 검증 상태

- [ ] PR에서 frontend lint / test / build 통과
- [ ] Backend 테스트 및 실제 격리 PostgreSQL Import → 재적용 UNCHANGED·개인 이력 보존 통과
- [ ] 53개 canonical DIAGRAM 전부 TypeScript/Backend에서 유효하고 Reader에 fallback 없이 표시됨
- [ ] Chromium Guest/Owner Reader와 light/dark 스크린샷·전역 overflow 검증
- [ ] PR의 파일 변경 범위에서 다른 영역 수정이 없는지 확인
- [ ] 승인 전 병합 없음; G2 브랜치는 현재 커밋 그대로 보존

**주의:** 이식한 과거의 CI 기록은 현재 `refactor`의 통합 검증을 대체하지 않는다. 체크 결과 확인 전에는 위 항목을 PASS로 기록하지 않는다. G1이 검증·병합된 다음에만 G2를 최신 `refactor` 위로 재기준화한다.
