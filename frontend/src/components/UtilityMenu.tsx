import { Link } from '@tanstack/react-router'

type UtilityMenuProps = {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function UtilityMenu({ open, onToggle, onClose }: UtilityMenuProps) {
  return (
    <div className="utility-menu" data-header-popover="utility">
      <button
        className="utility-menu-trigger"
        id="utility-menu-trigger"
        type="button"
        aria-label="도구 메뉴"
        title="도구"
        aria-expanded={open}
        aria-controls="utility-menu-panel"
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      <div className="utility-menu-panel" id="utility-menu-panel" hidden={!open}>
        <Link className="utility-menu-link" to="/settings/import" onClick={onClose}>콘텐츠 가져오기</Link>
      </div>
    </div>
  )
}
