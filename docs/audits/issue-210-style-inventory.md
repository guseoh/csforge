# Issue #210 — 스타일 소유권·충돌 인벤토리

기준: `refactor` / `ed1786e6`, Issue #210, `DESIGN.md`.
이 문서는 실제 CSS import 순서와 선언 비교를 기록한다. **같은 selector가 여러 파일에 있다는 사실만으로 시각적 결함을 판정하지 않는다.**

## 현재 로드 경계

`frontend/src/main.tsx`에서 CSS 33개가 아래 순서로 import된다.

```text
styles.css
app-update.css
search.css
dashboard.css
learning.css
concept.css
quiz.css
wrong-note.css
review.css
import.css
learning-detail.css
learning-workspace.css
concept-reading-guide.css
quiz-setup-guide.css
quiz-session-focus.css
daily-loop-guide.css
search-guide.css
learning-content.css
auth.css
ui-refresh.css
foundation.css
header-search.css
home.css
concept-reader.css
density.css
step5-corrections.css
step6-learning-area.css
step6-qa-corrections.css
step7-quiz.css
step7-result-width.css
step8-review.css
step8-wrong-note-alignment.css
markdown-renderer.css
```

CSS import 순서와 selector specificity가 모두 cascade에 영향을 준다. 후순위 파일이 선순위 전체를 대체한다고 가정하면 안 된다.

## 영역별 소유권 / 확인 결과

| 대상 | 스타일 소유권 | 실제 관측 / 결정 |
| --- | --- | --- |
| 공통 색상·타이포·상태 토큰 | `foundation.css`, 밀도만 `density.css` | `styles.css`, `ui-refresh.css`에도 공통 스타일이 남아 있지만, `foundation.css`에서 밝기별 semantic token을 다시 적용한다. 전면 삭제 보류 |
| 헤더·검색·도구/계정 팝오버 | `header-search.css` (+ density 크기 조정) | 좁은 화면에서 헤더에 테마 버튼 3개와 검색/메뉴가 공존하여 가로 폭을 압박한다. 680px 이하에서 동일 ThemeControl을 도구 팝오버 내부에 노출 |
| 학습 경로·개념/레일 | `learning*.css`, `concept*.css`, `step6*.css` | 이전 QA 보정이 위치/독서 폭을 유지한다. 본 Issue에서 무차별 통합하지 않음 |
| Quiz·Result | `quiz*.css`, `step7*.css` | 결과 페이지의 문서 폭과 Concept 문서 폭을 의도적으로 분리한다. 보존 |
| 오답·복습 | `wrong-note.css`, `review.css`, `step8*.css` | `!important`로 남은 예외는 대상별 시각 QA 전 제거하지 않음 |
| Markdown 코드·표·이미지 | `markdown-renderer.css` (최후 import) | 공용 renderer가 code/table/image를 소유한다. 기존 초기 스타일과 겹치더라도 마지막 전용 레이어를 유지 |
| PWA 업데이트 안내 | `app-update.css`, 업데이트 차단 정책 `lib/app-update-safety.ts` | 일반 문서 흐름의 배너로, fixed overlay가 아님. 좁은 폭에서 텍스트·버튼 줄바꿈 보강 |
| 인증·Import·검색 | `auth.css`, `import.css`, `search.css`와 각 guide CSS | route 전용 스타일 유지 |

### 충돌 후보와 판정

- `.topbar`, `.topbar-inner`, `.search-palette-trigger`: `styles.css` → `ui-refresh.css` → `header-search.css` → `density.css` 및 `step6-qa-corrections.css` 순으로 재정의. **크기·헤더 밀도 조정은 의도적**이나 모바일 컨트롤 조합은 협소. 이번 변경은 좁은 헤더의 실제 경쟁을 줄임.
- `.skeleton-block`: `ui-refresh.css`에 고정 색상 `#1b2732`가 있지만, 이후 `foundation.css`가 `--skeleton-start/middle`로 덮어씀. **현재 최종 결과의 색상 버그로 단정할 근거 없음**.
- `.error-state` / `.route-state-error`: 이전 레이어의 어두운 배경 리터럴은 `foundation.css`에서 `--state-error-*` 토큰으로 대체됨. **이전 선언만 보고 수정하지 않음**.
- ThemeControl: `ThemeProvider`와 `lib/theme-preference.ts`는 storage 적용/시스템 fallback을 담당하고, `index.html` 초기 스크립트는 명시적 테마를 hydration 전에 적용. 이번 변경에서도 그대로 보존.

## 변경 파일과 사유

- `components/UtilityMenu.tsx`, `header-search.css`: 680px 이하 헤더의 3버튼 테마 경쟁 제거. 도구 팝오버에서 system/light/dark 그대로 제공, 44px 터치 타깃.
- `router.tsx`: Route 이동·팝오버 전환 시 모바일 탐색 메뉴 닫기, Escape 시 트리거로 focus 복귀.
- `app-update.css`: 업데이트 배너를 정상 흐름 안에서 wrap하고 모바일 액션을 44px 터치 영역으로 유지.
- `components/UtilityMenu.test.tsx`: 도구 메뉴에서 세 테마 옵션과 펼침 상태의 마크업 회귀 방지.

삭제한 CSS 파일은 **0개**다. 파일 수 기준 일괄 정리를 하지 않는다.

## 검증 게이트 (증거가 없는 항목은 PASS로 기록하지 않는다)

- [ ] CI: frontend lint / test / build
- [ ] 실제 Chromium: 라이트·다크·시스템(light OS/dark OS)와 저장 후 reload 시 초기 깜빡임
- [ ] 375 / 768 / 1280 / 1600px 및 200% zoom: 헤더/팝오버, rail, code/table overflow, sticky 충돌 비교 screenshot
- [ ] 키보드 Tab, Enter, Escape, outside click, focus 복귀 및 touch target 실측
- [ ] button/input/chip, card/toast/dialog, selected/disabled/error/success/warning 대비 확인
- [ ] PWA update: quiz pending/failed, import applying, note draft 회복 및 배너가 작성물을 덮지 않는지 브라우저 확인

스크린샷·수동 Chromium 검증 완료 전에는 Issue #210의 전체 완료로 표시하지 않는다.
