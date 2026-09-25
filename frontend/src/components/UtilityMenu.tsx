import { Link } from '@tanstack/react-router'
export function UtilityMenu() {
  return (
    <details className="utility-menu">
      <summary className="utility-menu-trigger" aria-label="도구 메뉴" title="도구">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </summary>
      <div className="utility-menu-panel">
        <Link className="utility-menu-link" to="/settings/import">콘텐츠 가져오기</Link>
      </div>
    </details>
  )
}
