# Issue #222 R2 — OS Reference 학습 범위 최소 정정

[감사 PR #238](https://github.com/guseoh/csforge/pull/238)에 기술한 OS 미확정 14관계 중 **두 개만** 출처의 실제 검색 색인 내용에 맞춰 Reader 안내 문구를 제한한다.

- `operating-systems.core.io.async-io`: Kakao `posts/680`은 io_uring의 실제 운영 도입/성능 실측을 확정한 기사가 아니라, 제출/완료 큐·SQPOLL·Go 런타임 제약을 **검토하고 도입 보류**한 사례다. `recommendation` 과장 수정 및 Concept 전용 `relationNote` 추가.
- `operating-systems.core.isolation.cgroup`: NAVER D2 `7248350`은 **cgroups v1** memory.limit_in_bytes·memory.soft_limit_in_bytes 예제. Java/Spring의 Linux 현행 `memory.max` 등 v2 의미를 보증하는 자료로 쓰지 않도록 `relationNote`만 추가.
- Concept 본문·Question·key·URL·displayOrder·기존 Reference 관계는 불변. `reference` 글로벌 메타데이터 충돌 없이 import해야 함. 원본 직접 본문 검증 성공을 의미하지 않으므로 역사적 OS 14 후보는 그대로 남긴다.
- 검증: Backend Repository Validation + Testcontainers old-to-new Preview/Apply 2 UPDATED, canonical exact import 3,380 UNCHANGED, global Reference ID·개인노트/quiz/오답 history 보존, Reader Human Usage 375/768/1280px light/dark 표시.
- Production Apply/배포는 직접 수행하지 않는다.
